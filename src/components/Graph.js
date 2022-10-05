import React, { Component } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {forceCollide} from 'd3-force';

export class Graph extends Component {
    constructor(props) {
        super(props)

        this.state = {     
        }

        this.ref = React.createRef();
    }

    componentDidMount() {
        this.ref.current.d3Force('charge', null)
        this.ref.current.d3Force('center', null)
        this.ref.current.d3Force('collide', forceCollide(this.props.globals.forceCollideRadius))
        this.ref.current.d3Force('link', null)
    }

    componentDidUpdate() {
        this.ref.current.d3Force('collide', forceCollide(this.props.globals.forceCollideRadius))
    }

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

    scaleTriangle = (link) => {
        const d = Math.sqrt((Math.pow(link.target.x - link.source.x, 2) + Math.pow(link.target.y - link.source.y, 2)))
        const d_y = link.target.y - link.source.y;
        const d_x = link.target.x - link.source.x;
        const y_i = ((this.props.globals.NODE_RADIUS * d_y) / d);
        const x_i = ((this.props.globals.NODE_RADIUS * d_x) / d);
        return [x_i + link.source.x, y_i + link.source.y, -x_i + link.target.x, -y_i + link.target.y];
    }

    drawArrow = (ctx, x1, y1, x2, y2, t = 0.9) => {
        const adx = x2 - x1;           // arrow dx
        const ady = y2 - y1;           // arrow dy
        const dist = Math.sqrt(adx * adx + ady * ady);
        const middleX = x2 - this.props.globals.ARROW_SIZE * adx / dist;  // shaft end x
        const middleY = y2 - this.props.globals.ARROW_SIZE * ady / dist; // shaft end y
        const tdx = x2 - middleX;      // tip dx
        const tdy = y2 - middleY;      // tip dy
        ctx.beginPath();
        ctx.moveTo(middleX + 0.5 * tdy, middleY - 0.5 * tdx);
        ctx.lineTo(middleX - 0.5 * tdy, middleY + 0.5 * tdx);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fill();
    };

    render() {
        return (
            <ForceGraph2D 
            ref={this.ref}
            id="graph" 
            graphData={this.props.globals.data}
            nodeVal={this.props.globals.NODE_RADIUS}
            nodeLabel=''
            nodeAutoColorBy='group'
            width={window.innerWidth >= 768 ? window.innerWidth * .6 : window.innerWidth}
            height={window.innerWidth >= 768 ? window.innerHeight : window.innerHeight * 0.6}
            maxZoom={5}
            minZoom={1}
            nodeCanvasObject={(node, ctx, globalScale) => {
                // draw label
                const label = node.name;
                const fontSize = 6;
                ctx.lineWidth = 1;
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `${fontSize}px Sans-Serif`
                ctx.fillText(label, node.x, node.y);
                // draw circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, this.props.globals.NODE_RADIUS, 0, 2 * Math.PI);
                ctx.stroke();
            }}
            onNodeHover={(node) => {
                if (node === null) {
                    document.body.style.cursor = "pointer";
                } else {
                    document.body.style.cursor = "grab";
                }
            }}
            linkCanvasObject={function (link, ctx, globalScale) {
                ctx.lineWidth = 1;
                const source = this.scaleTriangle(link);
                const dx = (source[2] - source[0]);
                const dy = (source[3] - source[1]);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const x99 = (source[2] - source[0]) * 0.99;
                const y99 = (source[3] - source[1]) * 0.99;
                const src = Math.min(link.source.id, link.target.id);
                const tgt = Math.max(link.source.id, link.target.id);
                const mx = (link.target.x + link.source.x) / 2
                const my = (link.target.y + link.source.y) / 2
                let fx = mx;
                let fy = my;
                if (this.props.globals.data.linkCounter[src + "-" + tgt] === 1) {
                    ctx.beginPath();
                    ctx.strokeStyle = "black";
                    ctx.moveTo(source[0], source[1]);
                    ctx.lineTo(source[2], source[3]);
                    ctx.stroke();
                    this.drawArrow(ctx, source[0], source[1], source[0] + x99, source[1] + y99, .9);
                } else {
                    const h = (Math.sqrt(dist) * 2 + (Math.floor((link.repeatCount + 1) / 2) - 1) * this.state.globals.NODE_RADIUS * 1.5) * (link.source.id === src ? 1 : -1) * (dy < 0 ? 1 : -1) * (link.repeatCount % 2 === 0 ? 1 : -1);
                    // perpendicular slope
                    const ps = - x99 / y99
                    const dfx = h / Math.sqrt(ps * ps + 1)
                    const dfy = dfx * ps
                    fx = dfx + mx;
                    fy = dfy + my;
                    const fitCircle = this.fitCircleToPoints(source[0], source[1], fx, fy, source[2], source[3]);
                    const ang1 = Math.atan2(source[1] - fitCircle.y, source[0] - fitCircle.x);
                    const ang2 = Math.atan2(source[3] - fitCircle.y, source[2] - fitCircle.x);
                    ctx.beginPath();
                    ctx.arc(fitCircle.x, fitCircle.y, fitCircle.radius, ang1, ang2, fitCircle.CCW);
                    ctx.strokeStyle = "black";
                    ctx.stroke();
    
                    const rdx = source[2] - fitCircle.x
                    const rdy = source[3] - fitCircle.y
                    // perp of rm
                    const prm = - rdx / rdy
                    let flip = 1;
                    if ((link.repeatCount % 2 === 0 && link.source.id === src) || (link.repeatCount % 2 === 1 && link.source.id === tgt)) {
                        flip = -1;
                    }
                    const arrdfx = - dist / Math.sqrt(prm * prm + 1) * (rdy > 0 ? -1 : 1) * flip;
                    const arrdfy = arrdfx * prm
                    const arrfx = arrdfx + source[2]
                    const arrfy = arrdfy + source[3]
                    this.drawArrow(ctx, arrfx, arrfy, source[2], source[3], .9);
                }
    
    
                // draw rate label circle
                ctx.beginPath();
                ctx.arc(fx, fy, this.props.globals.NODE_RADIUS * 0.5, 0, 2 * Math.PI);
                ctx.strokeStyle = link.inducer === undefined ? "green" : "red";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.fill();
                // // TODO: make global variable
                // // TODO: font-sizing so that the text fits in the circle
                ctx.fillStyle = "black";
                ctx.font = "bold 4px sans-serif";
                ctx.fillText((link.rate === undefined ? "" : link.rate) + (link.inducer === undefined ? "" : (", " + this.props.globals.data.nodes.find(node => node.id === link.inducer).name)), fx, fy);
            }}

            onMouseOver={() => {document.body.style.cursor = "pointer"}}
            onMouseLeave={() => {document.body.style.cursor = "default"}} />
        )
    }
}

export default Graph