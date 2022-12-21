/** 
 * Interactive graph component of tool. 
 */

import React, { Component } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {forceCollide} from 'd3-force';

import { CSS_BREAKPOINT, GRAPHVIZ_PARSE_DELAY, NODE_FONT_SIZE, NODE_TEXT_OVERFLOW, RATE_FONT_SIZE, 
    RATE_TEXT_OVERFLOW, WIDTH_RATIO, GRID_GAP, NODE_RADIUS, ARROW_SIZE} from '../Constants';

export class Graph extends Component {
    constructor(props) {
        super(props)

        this.ref = React.createRef();
    }

    /**
     * Configure graph forces, set collide back to default. 
     */
    componentDidMount() {
        this.ref.current.d3Force('charge', null)
        this.ref.current.d3Force('center', null)
        this.ref.current.d3Force('collide', forceCollide(this.props.forceCollideRadius))
        this.ref.current.d3Force('link', null)
        setTimeout(() => {
            this.ref.current.zoomToFit(0, 150);
        }, 500)
    }

    /**
     * Update collision force on graph update. Also re-fit graph through 
     * zoom function on import if new STR has been imported / image is being downloaded.
     */
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data.STRData.length !== this.props.data.STRData.length || prevProps.downloading) {
            setTimeout(() => {
                this.ref.current.zoomToFit(0, prevProps.downloading ? 50 : 150);
            }, prevProps.downloading ? 0 : 2 * GRAPHVIZ_PARSE_DELAY);
        }
        this.ref.current.d3Force('collide', forceCollide(this.props.forceCollideRadius))
        
        if (prevProps.snapMode !== this.props.snapMode) {
            this.ref.current.d3ReheatSimulation();
        }
    }

    /**
     * From: https://stackoverflow.com/questions/62550460/how-to-draw-a-curve-that-passes-three-points-in-canvas
     * Returns a circle fitted to three coordinates, for drawing curved edges on graph.
     * 
     * @param {*} x1 x coordinate of first point (source node)
     * @param {*} y1 y coordinate of first point 
     * @param {*} x2 x coordinate of second point (target node)
     * @param {*} y2 y coordinate of second point
     * @param {*} x3 x coordinate of third point (calculated to create arc)
     * @param {*} y3 y coordinate of third point
     * @returns object with x, y, and radius of circle, as well as if the arc is CCW 
     */
    fitCircleToPoints(x1, y1, x2, y2, x3, y3) {
        var x, y, u;
        const slopeA = (x2 - x1) / (y1 - y2); // slope of vector from point 1 to 2
        const slopeB = (x3 - x2) / (y2 - y3); // slope of vector from point 2 to 3
        if (slopeA === slopeB) { return } // Slopes are same thus 3 points form striaght line. No circle can fit.
        if (y1 === y2) {   // special case with points 1 and 2 have same y 
            x = ((x1 + x2) / 2);
            y = slopeB * x + (((y2 + y3) / 2) - slopeB * ((x2 + x3) / 2));
        } else
            if (y2 === y3) { // special case with points 2 and 3 have same y 
                x = ((x2 + x3) / 2);
                y = slopeA * x + (((y1 + y2) / 2) - slopeA * ((x1 + x2) / 2));
            } else {
                x = ((((y2 + y3) / 2) - slopeB * ((x2 + x3) / 2)) - (u = ((y1 + y2) / 2) - slopeA * ((x1 + x2) / 2))) / (slopeA - slopeB);
                y = slopeA * x + u;
            }

        return {
            x, y,
            radius: ((x1 - x) ** 2 + (y1 - y) ** 2) ** 0.5,
            CCW: ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) >= 0,
        };
    }

    /**
     * Return coordinates of where the edge should start and begin, factoring in the radius of a node.
     * Returned coordinates ensure that the edge is not going from the center of nodes but instead radius of node.  
     * @param {*} link link to scale
     * @returns object of start and end coordinates of scaled link
     */
    scaleLinkToNodeRadius = (link) => {
        const d = Math.sqrt((Math.pow(link.target.x - link.source.x, 2) + Math.pow(link.target.y - link.source.y, 2)))
        const d_y = link.target.y - link.source.y;
        const d_x = link.target.x - link.source.x;
        const y_i = ((NODE_RADIUS * d_y) / d);
        const x_i = ((NODE_RADIUS * d_x) / d);
        return {
            sourceX: x_i + link.source.x, sourceY: y_i + link.source.y, 
            targetX: -x_i + link.target.x, targetY: -y_i + link.target.y
        };
    }

    /**
     * Draw triangular arrow given link start and end points. 
     * @param {*} ctx canvas to draw on
     * @param {*} x1 start x coordinate
     * @param {*} y1 start y coordinate
     * @param {*} x2 end x coordinate (the end that the arrow gets drawn on)
     * @param {*} y2 end y coordinate (the end that the arrow gets drawn on)
     */
    drawArrow = (ctx, x1, y1, x2, y2, link) => {
        const adx = x2 - x1;           // arrow dx
        const ady = y2 - y1;           // arrow dy
        const dist = Math.sqrt(adx * adx + ady * ady);
        // base of arrow, scaled to arrow size, on link
        const tdx = ARROW_SIZE * adx / dist;      // arrow triangle dx
        const tdy = ARROW_SIZE * ady / dist;      // arrow triangle dy
        const arrowBaseX = x2 - tdx; 
        const arrowBaseY = y2 - tdy; 
        ctx.beginPath();
        // extrapolate arrow vertices from base and triangle dimensions 
        ctx.moveTo(arrowBaseX + 0.5 * tdy, arrowBaseY - 0.5 * tdx);
        ctx.lineTo(arrowBaseX - 0.5 * tdy, arrowBaseY + 0.5 * tdx);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = link.color;
        ctx.fill();
    };

    /**
     * Draw links between nodes, both curved and straight.
     * @param {*} link link to draw
     * @param {*} ctx canvas to draw on
     * @param {*} globalScale zoom / scale of canvas 
     */
    drawLinks = (link, ctx, globalScale) => {
        const data = this.props.data;
        // create array of edges that also link between source and target node (regardless of direction)
        const repeats = data.links.filter(
            e => (e.source.id === link.source.id && e.target.id === link.target.id) 
            || (e.source.id === link.target.id && e.target.id === link.source.id));
        // get count of which "repeat" this link is
        const repeatCount = repeats.findIndex(e => e === link) + 1;

        const scaledLink = this.scaleLinkToNodeRadius(link);
        const dx = (scaledLink.targetX - scaledLink.sourceX);
        const dy = (scaledLink.targetY - scaledLink.sourceY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        // to prevent arrow from protruding into node radius border
        const x99 = (scaledLink.targetX - scaledLink.sourceX) * 0.99;
        let y99 = (scaledLink.targetY - scaledLink.sourceY) * 0.99;
        // can't let y99 be near 0 or line doesn't get drawn
        if (Math.abs(y99) < 1) {
            y99 = y99 < 0 ? y99 - 0.5 : y99 + 0.5;
        }
        const src = Math.min(link.source.id, link.target.id);
        const tgt = Math.max(link.source.id, link.target.id);
        // middle point of link
        const mx = (link.target.x + link.source.x) / 2
        const my = (link.target.y + link.source.y) / 2
        // line / arc midpoint
        let arcMx = mx;
        let arcMy = my;
        // straight edge 
        if (repeats.length === 1) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = link.color;
            ctx.moveTo(scaledLink.sourceX, scaledLink.sourceY);
            ctx.lineTo(scaledLink.targetX, scaledLink.targetY);
            ctx.stroke();
            this.drawArrow(ctx, scaledLink.sourceX, scaledLink.sourceY, scaledLink.sourceX + x99, scaledLink.sourceY + y99, link);
        // curved edge
        } else {
            // vertical height of edge based on distance and repeatedness of edge
            const h = (Math.sqrt(dist) * 2 + (Math.floor((repeatCount + 1) / 2) - 1) * NODE_RADIUS * 1.5) 
            // determining whether or not the line should be flipped based on:
            // edge direction, edge y displacement, alternations of edges  
                * (link.source.id === src ? 1 : -1) * (dy < 0 ? 1 : -1) * (repeatCount % 2 === 0 ? 1 : -1);
            // perpendicular slope
            const ps = - x99 / y99
            const dfx = h / Math.sqrt(ps * ps + 1)
            const dfy = dfx * ps
            // determine arc midpoint
            arcMx = dfx + mx;
            arcMy = dfy + my;
            // use arc midpoint, source coord, and target coord to determine arc center coord / radius
            const fitCircle = this.fitCircleToPoints(scaledLink.sourceX, scaledLink.sourceY, arcMx, arcMy, scaledLink.targetX, scaledLink.targetY);
            // find start and stop angle to use in arc() method
            const ang1 = Math.atan2(scaledLink.sourceY - fitCircle.y, scaledLink.sourceX - fitCircle.x);
            const ang2 = Math.atan2(scaledLink.targetY - fitCircle.y, scaledLink.targetX - fitCircle.x);
            ctx.beginPath();
            ctx.lineWidth = 1;
            // draw arc
            ctx.strokeStyle = link.color;
            ctx.arc(fitCircle.x, fitCircle.y, fitCircle.radius, ang1, ang2, fitCircle.CCW);
            ctx.stroke();

            // find perpendicular of line to know how to angle arrow
            const rdx = scaledLink.targetX - fitCircle.x
            const rdy = scaledLink.targetY - fitCircle.y
            const prm = - rdx / rdy
            // determine if arrow needs to be flipped
            let flip = 1;
            if ((repeatCount % 2 === 0 && link.source.id === src) || (repeatCount % 2 === 1 && link.source.id === tgt)) {
                flip = -1;
            }
            // calculate out arrow coordinates 
            const arrdfx = - dist / Math.sqrt(prm * prm + 1) * (rdy > 0 ? -1 : 1) * flip;
            const arrdfy = arrdfx * prm
            const arrfx = arrdfx + scaledLink.targetX
            const arrfy = arrdfy + scaledLink.targetY
            this.drawArrow(ctx, arrfx, arrfy, scaledLink.targetX, scaledLink.targetY, link);
        }

        // draw rate label circle
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = link.color;
        ctx.arc(arcMx, arcMy, NODE_RADIUS * 0.75, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = link.color;
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.fillStyle = "black";
        let adjustedRateFontSize = RATE_FONT_SIZE;
        const rateText = (link.rate === undefined ? "" : link.rate) + (link.inducer === undefined ? "" : ("," + data.nodes.find(node => node.id === link.inducer).name));
        if (rateText.length > RATE_TEXT_OVERFLOW) {
            adjustedRateFontSize *= RATE_TEXT_OVERFLOW / rateText.length;
        }
        ctx.font = "bold " + adjustedRateFontSize + "px monospace";
        ctx.fillText(rateText, arcMx, arcMy);
    }

    /**
     * Draw node on graph. 
     * @param {*} node node to draw
     * @param {*} ctx canvas to draw on 
     * @param {*} globalScale zoom / scale of graph
     */
    drawNode = (node, ctx, globalScale) => {
        // draw circle
        ctx.strokeStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.stroke();
        // draw label
        const label = node.name;
        let fontSizeAdjusted = NODE_FONT_SIZE;
        ctx.lineWidth = 1;
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (label.length > NODE_TEXT_OVERFLOW) {
            fontSizeAdjusted *= NODE_TEXT_OVERFLOW / label.length;
        }
        ctx.font = `${fontSizeAdjusted}px monospace`
        ctx.fillText(label, node.x, node.y);
    }

    /**
     * Draws canvas.
     * @param {*} ctx canvas to draw on
     * @param {*} scale scale of canvas (zoom)
     */
    drawCanvas = (ctx, scale) => {
        if (this.props.snapMode) {
            const bh = Math.ceil(ctx.canvas.clientWidth / GRID_GAP) * GRID_GAP;
            const bw = Math.ceil(ctx.canvas.clientHeight / GRID_GAP) * GRID_GAP
            ctx.strokeStyle = "#b3b3b3";

            for (let x = -bw; x <= bw; x += GRID_GAP) {
                ctx.beginPath();
                ctx.moveTo(x, -bh);
                ctx.lineTo(x, bh);
                ctx.stroke();
            }
        
            for (let x = -bh; x <= bh; x += GRID_GAP) {
                ctx.beginPath();
                ctx.moveTo(-bw, x);
                ctx.lineTo(bw, x);
                ctx.stroke();
            }
        }
    }

    render() {
        return (
            <ForceGraph2D 
            ref={this.ref}
            id="graph" 
            graphData={this.props.data}
            nodeVal={NODE_RADIUS}
            nodeLabel=''
            nodeAutoColorBy='group'
            nodeCanvasObject={this.drawNode}
            // snap mode feature
            onNodeDragEnd={(node, translate) => {
                if (this.props.snapMode) {
                    node.fx = Math.round(node.x / GRID_GAP) * GRID_GAP;
                    node.fy = Math.round(node.y / GRID_GAP) * GRID_GAP;
                    node.x = Math.round(node.x / GRID_GAP) * GRID_GAP;
                    node.y = Math.round(node.y / GRID_GAP) * GRID_GAP;
                }
            }}
            onNodeHover={(node) => {document.body.style.cursor = (node === null ? "pointer" : "grab")}}
            linkCanvasObject={this.drawLinks}
            cooldownTime={1000}
            width={window.innerWidth >= CSS_BREAKPOINT ? window.innerWidth * WIDTH_RATIO : window.innerWidth}
            height={window.innerWidth >= CSS_BREAKPOINT ? window.innerHeight : window.innerHeight * WIDTH_RATIO}
            maxZoom={5}
            minZoom={1}
            onRenderFramePre={this.drawCanvas}
            onMouseOver={() => {document.body.style.cursor = "pointer"}}
            onMouseLeave={() => {document.body.style.cursor = "default"}}
            />
            )
        }
    }
    
export default Graph