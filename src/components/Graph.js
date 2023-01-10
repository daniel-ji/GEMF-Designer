/** 
 * Interactive graph component of tool. 
 */

import React, { Component } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {forceCollide} from 'd3-force';
import { saveAs } from 'file-saver';

import C2S from '../Canvas2SVG';

import { CSS_BREAKPOINT, GRAPHVIZ_PARSE_DELAY, NODE_TEXT_OVERFLOW, 
    RATE_TEXT_OVERFLOW, WIDTH_RATIO, GRID_GAP, ARROW_SIZE, TO_RAD} from '../Constants';

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
        this.ref.current.zoomToFit(0, 50);
    }

    /**
     * Update collision force on graph update. Also re-fit graph through 
     * zoom function on import if new STR has been imported / image is being downloaded / new graph is loaded in.
     */
    componentDidUpdate(prevProps, prevState) {
        this.ref.current.d3Force('collide', forceCollide(this.props.forceCollideRadius))
        
        if (prevProps.data.name !== this.props.data.name ||
            prevProps.data.STRData.length !== this.props.data.STRData.length || 
            prevProps.downloading) {
            setTimeout(() => {
                this.ref.current.zoomToFit(0, 50);
            }, prevProps.data.STRData.length === this.props.data.STRData.length ? 0 : 2 * GRAPHVIZ_PARSE_DELAY);
        }
        
        if (this.props.downloading && !prevProps.downloading) {
            this.downloadGraph(this.props.downloading);
        }
        
        if (prevProps.snapMode !== this.props.snapMode) {
            this.ref.current.d3ReheatSimulation();
        }

        window.onresize = (e) => {
            this.forceUpdate();
            this.ref.current.resumeAnimation();
        }
    }

    /**
     * Download graph in given file type. Utilizes Canvas.toBlob (built-in) for PNG
     * and canvasToSvg (external library) for SVG. SVG is flawed, just a PNG in svg. 
     * 
     * @param {*} fileType file type of image to download 
     */
    downloadGraph = (fileType) => {
        if (this.props.data.nodes.length === 0) {
            this.props.setModal('Nothing on graph to download.', undefined, undefined, 'Continue', 'primary')
            return;
        }
        
        const canvas = document.getElementsByClassName("force-graph-container")[0].firstChild;
        if (fileType === 'PNG') {
            setTimeout(() => {
                canvas.toBlob(blob => {saveAs(blob, `STR Graph ${this.props.data.name}.png`)})
            }, 1500)
        } else if (fileType === 'SVG') {
            // //Create a new mock canvas context. Pass in your desired width and height for your svg document.
            const width = this.ref.current.screen2GraphCoords(canvas.width, canvas.height).x  - this.ref.current.screen2GraphCoords(0, 0).x;
            const height = this.ref.current.screen2GraphCoords(canvas.width, canvas.height).y  - this.ref.current.screen2GraphCoords(0, 0).y;
            const ctx = new C2S(width, height);
            const nodes = JSON.parse(JSON.stringify(this.props.data.nodes));
            const links = JSON.parse(JSON.stringify(this.props.data.links))
            const leftX = this.ref.current.screen2GraphCoords(0, 0).x;
            const topY = this.ref.current.screen2GraphCoords(0, 0).y;

            for (const node of nodes) {
                node.x = node.x - leftX;
                node.y = node.y - topY;
                this.drawNode(node, ctx)
            }

            for (const link of links) {
                link.target.x = link.target.x - leftX;
                link.source.x = link.source.x - leftX;
                link.target.y = link.target.y - topY;
                link.source.y = link.source.y - topY;
                this.drawLink(link, ctx)
            }

            saveAs(new Blob([ctx.getSerializedSvg()], {type: 'image/svg+xml'}), `STR Graph ${this.props.data.name}.svg`)
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
        // distance between links
        const d = Math.sqrt((Math.pow(link.target.x - link.source.x, 2) + Math.pow(link.target.y - link.source.y, 2)))
        // y distance between links
        const tDY = link.target.y - link.source.y;
        // x distance between links
        const tDX = link.target.x - link.source.x;
        const aDY = Math.abs(tDY);
        const aDX = Math.abs(tDX);
        const scaleByShape = (shape, node) => {
            let dY = tDY;
            let dX = tDX;
            if (node === 'source') {
                dY *= -1;
                dX *= -1;
            }
            switch (shape) {
                case 'hexagon': 
                    return 1.06 * this.props.data.nodeRadius;
                case 'pentagon': 
                    return 1.09 * this.props.data.nodeRadius;
                case 'triangle': 
                    if (dY > 0 || aDY * Math.sqrt(3) <= aDX) {
                        return this.props.data.nodeRadius * 2 * d / (Math.sqrt(3) * dX * (dX < 0 ? -1 : 1) + dY);
                    } else {
                        return this.props.data.nodeRadius * Math.abs(d / aDY);
                    }
                case 'diamond':
                    return this.props.data.nodeRadius * Math.sqrt(2) * d / (aDX + aDY)
                case 'square':
                   return this.props.data.nodeRadius * Math.abs(d / (aDX > aDY ? aDX : aDY))
                case undefined: 
                case 'circle':
                default: 
                    return this.props.data.nodeRadius;
            }
        }

        const yIS = ((scaleByShape(link.source.shape, 'source') * tDY) / d);
        const yIT = ((scaleByShape(link.source.shape, 'target') * tDY) / d);
        const xIS = ((scaleByShape(link.target.shape, 'source') * tDX) / d);
        const xIT = ((scaleByShape(link.target.shape, 'target') * tDX) / d);
        return {
            sourceX: xIS + link.source.x, sourceY: yIS + link.source.y, 
            targetX: -xIT + link.target.x, targetY: -yIT + link.target.y
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
    drawArrow = (ctx, x1, y1, x2, y2, link, color) => {
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
        ctx.strokeStyle = color ?? ctx.strokeStyle;
        ctx.stroke();
        ctx.fillStyle = color ?? link.color;
        ctx.fill();
    };

    linkPointerAreaPaint = (link, color, ctx, globalScale) => {
        this.drawLink(link, ctx, globalScale, color);
    }

    /**
     * Draw links between nodes, both curved and straight.
     * @param {*} link link to draw
     * @param {*} ctx canvas to draw on
     * @param {*} globalScale zoom / scale of canvas 
     */
    drawLink = (link, ctx, globalScale, color) => {
        const data = this.props.data;
        // create array of edges that also link between source and target node (regardless of direction)
        const repeats = data.links.filter(
            e => (e.source.id === link.source.id && e.target.id === link.target.id) 
            || (e.source.id === link.target.id && e.target.id === link.source.id));
        // get count of which "repeat" this link is
        const repeatCount = repeats.findIndex(e => e.source.id === link.source.id && e.target.id === link.target.id && e.inducer === link.inducer) + 1;

        const scaledLink = this.scaleLinkToNodeRadius(link);
        const dx = (scaledLink.targetX - scaledLink.sourceX);
        const dy = (scaledLink.targetY - scaledLink.sourceY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        // to prevent arrow from protruding into node radius border
        const x99 = (scaledLink.targetX - scaledLink.sourceX) - dx / dist * 0.3;
        const y99 = (scaledLink.targetY - scaledLink.sourceY) - dy / dist * 0.3;
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
            ctx.strokeStyle = color ?? link.color;
            // add a bit of a stub for source if hexagon / pentagon since scaledLink is eyeballed  
            let stubX = 0;
            let stubY = 0;
            if (link.shape === 'hexagon' || link.shape === 'pentagon') {
                stubX = - dx / dist * this.props.data.nodeRadius * 0.25 * (scaledLink.targetX > scaledLink.sourceX);
                stubY = - dy / dist * this.props.data.nodeRadius * 0.25 * (scaledLink.targetY > scaledLink.sourceY);
            }
            ctx.moveTo(scaledLink.sourceX + stubX, scaledLink.sourceY + stubY);
            ctx.lineTo(scaledLink.targetX, scaledLink.targetY);
            ctx.stroke();
            this.drawArrow(ctx, scaledLink.sourceX, scaledLink.sourceY, scaledLink.sourceX + x99, scaledLink.sourceY + y99, link, color);
        // curved edge
        } else {
            // vertical height of edge based on distance and repeatedness of edge
            const h = (Math.sqrt(dist) * 2 + (Math.floor((repeatCount + 1) / 2) - 1) * this.props.data.nodeRadius * 1.5) 
            // determining whether or not the line should be flipped based on:
            // edge direction, edge y displacement, alternations of edges  
                * (link.source.id === src ? 1 : -1) * (dy < 0 ? 1 : -1) * (repeatCount % 2 === 0 ? 1 : -1);
            // perpendicular slope
            let dfx = 0;
            let dfy = 0;
            if (y99 === 0) {
                dfx = 0;
                dfy = h * (x99 > 0 ? -1 : 1);
            } else {
                const ps = - x99 / y99
                dfx = h / Math.sqrt(ps * ps + 1)
                dfy = dfx * ps
            }
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
            ctx.strokeStyle = color ?? link.color;
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
            this.drawArrow(ctx, arrfx, arrfy, scaledLink.targetX, scaledLink.targetY, link, color);
        }

        // draw rate label circle
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color ?? link.color;
        ctx.arc(arcMx, arcMy, this.props.data.linkRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = color ?? link.color;
        ctx.fillStyle = color ?? "white";
        ctx.fill();
        ctx.fillStyle = color ?? "black";
        let adjustedRateFontSize = this.props.data.linkRadius / 2;
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
        ctx.strokeStyle = node.color;
        ctx.beginPath();
        switch (node.shape) {
            case 'hexagon': 
                const hr = this.props.data.nodeRadius / Math.cos(TO_RAD(30));
                ctx.moveTo(node.x, node.y - hr);
                ctx.lineTo(node.x + hr * Math.sin(TO_RAD(60)), node.y - hr * Math.cos(TO_RAD(60)));
                ctx.lineTo(node.x + hr * Math.sin(TO_RAD(60)), node.y + hr * Math.cos(TO_RAD(60)));
                ctx.lineTo(node.x, node.y + hr);
                ctx.lineTo(node.x - hr * Math.sin(TO_RAD(60)), node.y + hr * Math.cos(TO_RAD(60)));
                ctx.lineTo(node.x - hr * Math.sin(TO_RAD(60)), node.y - hr * Math.cos(TO_RAD(60)));
                ctx.lineTo(node.x + 0.25, node.y - hr - 0.25);
                break;
            case 'pentagon':
                const pr = this.props.data.nodeRadius / Math.cos(TO_RAD(36))
                ctx.moveTo(node.x, node.y - pr);
                ctx.lineTo(node.x + pr *  Math.sin(TO_RAD(72)), node.y - pr *  Math.cos(TO_RAD(72)));
                ctx.lineTo(node.x + pr *  Math.sin(TO_RAD(36)), node.y + pr *  Math.cos(TO_RAD(36)));
                ctx.lineTo(node.x - pr *  Math.sin(TO_RAD(36)), node.y + pr *  Math.cos(TO_RAD(36)));
                ctx.lineTo(node.x - pr *  Math.sin(TO_RAD(72)), node.y - pr *  Math.cos(TO_RAD(72)))
                ctx.lineTo(node.x + 0.25, node.y - pr - 0.25);
                break;
            case 'triangle':
                ctx.moveTo(node.x, node.y - 2 * this.props.data.nodeRadius);
                ctx.lineTo(node.x + Math.sqrt(3) * this.props.data.nodeRadius, node.y + this.props.data.nodeRadius);
                ctx.lineTo(node.x - Math.sqrt(3) * this.props.data.nodeRadius, node.y + this.props.data.nodeRadius);
                ctx.lineTo(node.x + 0.25, node.y - 2 * this.props.data.nodeRadius - 0.25);
                break; 
            case 'diamond':
                ctx.moveTo(node.x, node.y - this.props.data.nodeRadius * Math.sqrt(2));
                ctx.lineTo(node.x + this.props.data.nodeRadius * Math.sqrt(2), node.y);
                ctx.lineTo(node.x, node.y + this.props.data.nodeRadius * Math.sqrt(2));
                ctx.lineTo(node.x - this.props.data.nodeRadius * Math.sqrt(2), node.y);
                ctx.lineTo(node.x + 0.25, node.y - this.props.data.nodeRadius * Math.sqrt(2) - 0.25);
                break; 
            case 'square':
                ctx.rect(node.x - this.props.data.nodeRadius, node.y - this.props.data.nodeRadius, this.props.data.nodeRadius * 2, this.props.data.nodeRadius * 2);
                break;
            case undefined:
            case 'circle':
            default:
                ctx.arc(node.x, node.y, this.props.data.nodeRadius, 0, 2 * Math.PI);              
                break;
        }
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.stroke();
        // draw label
        const label = node.name;
        let fontSizeAdjusted = this.props.data.nodeRadius / 2;
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
            const bh = 3 * Math.ceil(ctx.canvas.clientWidth / GRID_GAP) * GRID_GAP;
            const bw = 3 * Math.ceil(ctx.canvas.clientHeight / GRID_GAP) * GRID_GAP
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

    nodeDragEnd = (node, translate) => {
        if (this.props.snapMode) {
            node.fx = Math.round(node.x / GRID_GAP) * GRID_GAP;
            node.fy = Math.round(node.y / GRID_GAP) * GRID_GAP;
            node.x = Math.round(node.x / GRID_GAP) * GRID_GAP;
            node.y = Math.round(node.y / GRID_GAP) * GRID_GAP;
        }
    }

    render() {
        return (
            <ForceGraph2D 
            ref={this.ref}
            id="graph" 
            graphData={this.props.data}
            nodeRelSize={this.props.data.nodeRadius}
            nodeLabel=''
            nodeAutoColorBy='group'
            nodeCanvasObject={this.drawNode}
            onNodeClick={this.props.shortcutLink}
            // snap mode feature
            onNodeDragEnd={this.nodeDragEnd}
            linkCanvasObject={this.drawLink}
            linkPointerAreaPaint={this.linkPointerAreaPaint}
            onLinkClick={() => console.log('hit')}
            cooldownTime={1000}
            width={window.innerWidth >= CSS_BREAKPOINT ? window.innerWidth * WIDTH_RATIO : window.innerWidth}
            height={window.innerWidth >= CSS_BREAKPOINT ? window.innerHeight : window.innerHeight * WIDTH_RATIO}
            maxZoom={5}
            minZoom={1}
            onRenderFramePre={this.drawCanvas}
            />
            )
        }
    }
    
export default Graph