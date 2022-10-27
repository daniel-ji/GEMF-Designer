import React, {Component} from 'react';

import GraphComponent from './components/Graph';
import Form from './components/Form';

import './App.scss';
import {WIDTH_RATIO, NODE_COLLIDE_RADIUS, NODE_RADIUS, ARROW_SIZE} from './Constants';
import githubIcon from './images/githubicon.png';

import Graphviz from 'graphviz-react';

export class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // global variables to be used across components
            globals: {
                NODE_RADIUS: NODE_RADIUS,
                ARROW_SIZE: ARROW_SIZE,
                data: {
                    nodes: [],
                    links: [],
                    linkCounter: {},
                },
                // form step counter
                step: 0,
            },
            // graph interaction indicator style
            indicatorStyle: {},
            // stores graphviz component (dot-engine based graph rendering of user-inputted existing STR)
            strGraphviz: undefined,
        }

        this.state.globals.forceCollideRadius = NODE_COLLIDE_RADIUS
    }

    /**
     * Fade out graph interaction indicator. 
     */
    indicatorFadeOut = () => {
        if (Object.keys(this.state.indicatorStyle).length === 0) {
            this.setState({indicatorStyle: {opacity: 0}});
            setTimeout(() => {
                this.setState({indicatorStyle: {display: "none"}});
            }, 500)
        }
    }

    /**
     * Increment form step, decrement by providing a negative value. 
     * 
     * @param {*} amount to increment step by 
     */
    incrementStep = (amount = 1) => {
        this.setState(prevState => 
            ({globals: {
                ...prevState.globals, 
                step: prevState.globals.step + amount
            }}))
    }

    /**
     * Update graph data. 
     * @param {*} data new data 
     * @param {*} callback callback function after update has finished
     */
    updateGraphData = (data, callback) => {
        this.setState(prevState => ({globals: {
            ...prevState.globals,
            data
        }}), callback)
    }

    /**
     * Update collision radius, used when generating new nodes to prevent overlapping. 
     * @param {*} radius collision radius 
     */
    setForceCollideRadius = (radius) => {
        this.setState(prevState => 
            ({globals: {
                ...prevState.globals, 
                forceCollideRadius: radius
            }}))
    }

    /**
     * Callback function for when user uploads existing STR file. 
     * Ensures file is in valid STR format and creates corresponding 
     * node and link object arrays for graphviz and force-graph use.
     * Generates graphviz svg visualization of nodes and edges as well.  
     * @param {*} e event that contains file contents
     */
    processSTR = (e) => {
        const reader = new FileReader();
        const nodes = [];
        const links = [];

        // TODO: validate str file
        reader.onload = (e) => {
            
            let nodeID = this.state.globals.data.nodes.length === 0 ? 
                0 : Math.max(...this.state.globals.data.nodes.map(node => parseInt(node.id))) + 1;

            // parse STR for both graphviz and force-graph use
            const parsedSTR = e.target.result.split(/\r?\n/).map(row => row.split(/\t/));
            const getNodeID = (i, j) => nodes.find(node => node.name === parsedSTR[i][j]).id;
            const getNode = (id) => nodes.find(node => node.id === id);

            for (let i = 0; i < parsedSTR.length; i++) {
                // TODO: more validation here? 
                // TODO: what if nodes have same name
                if (parsedSTR[i].length === 4) {
                    for (let j = 0; j < parsedSTR[i].length; j++) {
                        const foundNode = nodes.map(node => node.name).indexOf(parsedSTR[i][j]) !== -1;
                        // source and target node
                        if (j <= 1 && !foundNode) {
                            nodes.push({
                                id: nodeID++,
                                name: parsedSTR[i][j],
                            });
                        // inducer node
                        } else if (j === 2) {
                            if (parsedSTR[i][j] !== "None" && !foundNode) {
                                nodes.push({
                                    id: nodeID++,
                                    name: parsedSTR[i][j],
                                });
                            }
                        }
                    }
                    // add edge / node-based transition to links 
                    if (parsedSTR[i][2] === "None") {
                        links.push({
                            id: getNodeID(i, 0) + "-" + getNodeID(i, 1),
                            shortName: parsedSTR[i][0] + "-" + parsedSTR[i][1],
                            source: getNodeID(i, 0),
                            target: getNodeID(i, 1),
                            inducer: undefined,
                            rate: parseInt(parsedSTR[i][3])
                        })
                    } else {
                        links.push({
                            id: getNodeID(i, 0) + "-" + getNodeID(i, 1) + "-" 
                                + getNodeID(i, 2),
                            shortName: parsedSTR[i][0] + "-" + parsedSTR[i][1] + "-" + parsedSTR[i][2],
                            source: getNodeID(i, 0),
                            target: getNodeID(i, 1),
                            inducer: getNodeID(i, 2),
                            rate: parseInt(parsedSTR[i][3])
                        })
                    }
                }
            }

            // create graphviz 
            let dotContent = '';
            for (const link of links) {
                dotContent += 
                    `${getNode(link.source).name} -> ${getNode(link.target).name} [label = "${(link.inducer !== undefined ? getNode(link.inducer).name + ", " : "") + link.rate}"];\n`;
            }

            this.setState({strGraphviz: 
                <Graphviz 
                className="graph-overlay graph-viz"
                options={{
                    width: window.innerWidth * WIDTH_RATIO,
                    height: window.innerHeight
                }}
                dot={`digraph finite_state_machine {
                    fontname="Helvetica,Arial,sans-serif"
                    node [fontname="Helvetica,Arial,sans-serif"]
                    edge [fontname="Helvetica,Arial,sans-serif"]
                    rankdir=LR;
                    node [shape = circle];
                    ${dotContent}
                }`}/>
            }, () => setTimeout(() => this.parseGraphvizSVG(nodes, links), 250));
        }
        reader.readAsText(e.target.files[0]);
    }

    /**
     * Parses the created graphviz SVG to create corresponding visualization on 
     * actual force-graph interactive graph. Translates coordinates from the svg to
     * coordinates usable for the force-graph graph element. Utilizes the absolute position
     * of the svg element and interactive graph element through getBoundingClientRect(). 
     * @param {*} nodes 
     * @param {*} links 
     */
    parseGraphvizSVG = (nodes, links) => {
        const graph = document.getElementById("graph0");

        // in the case that rendering had not finished yet
        if (graph !== null) {
            const data = Object.assign({}, this.state.globals.data);
            const graphDimensions = graph.getBoundingClientRect();
            // change center of graph to simplify math later on for determining node coordinates 
            const graphMiddleX = (graphDimensions.left + graphDimensions.right) / 2; 
            const graphMiddleY = (graphDimensions.top + graphDimensions.bottom) / 2;

            for (const child of graph.children) {
                if (child.classList.contains("node")) {
                    // calculate node coordinate
                    const ellipse = child.querySelector('ellipse');
                    const rect = ellipse.getBoundingClientRect();
                    const normalizedX = (rect.left - graphMiddleX) / graphMiddleX;
                    const normalizedY = (rect.top - graphMiddleY) / graphMiddleY;
                    const normalizedR = rect.width / graphDimensions.width;
                    const scaleRatio = 1 / normalizedR * this.state.globals.NODE_RADIUS;
                    // add node with proper coordinate scaling
                    data.nodes.push({
                        id: nodes.find(node => node.name === child.getElementsByTagName('title')[0].innerHTML).id,
                        name: child.getElementsByTagName('title')[0].innerHTML,
                        fx: normalizedX * scaleRatio,
                        fy: normalizedY * scaleRatio,
                        x: normalizedX * scaleRatio,
                        y: normalizedY * scaleRatio,
                    })
                }
            }

            for (const link of links) {
                data.links.push(link);
            }

            this.updateGraphData(data);
        } else {
        // retry in 200ms if graph has not rendered yet
            setTimeout(() => this.parseGraphvizSVG(nodes, links), 200);
        }
    }

    render() {        
        return (
        <div className="App">
            <div className="graph-overlay graph-indicator"
            onMouseDown={this.indicatorFadeOut}
            onTouchStart={this.indicatorFadeOut}
            style={this.state.indicatorStyle}>
                <p className="noselect">Click and Drag Graph to Interact</p>
            </div>
            {this.state.strGraphviz}
            <div id="graph-cover">
                <h1 className="noselect">Graph View </h1>
                <p className="noselect">
                    Legend:<br/>
                    <span style={{color: "green"}}>Green</span> Links: Node-based Transition<br/>
                    <span style={{color: "red"}}>Red</span> Links: Edge-based Transition
                </p>
                <a href="https://github.com/daniel-ji/GEMF-State-Visualization-Tool" target="_blank" rel="noreferrer" aria-label="github repo link">
                    <button className="btn btn-outline-dark p-0 github-button" aria-label="github repo button"><img src={githubIcon} alt="" /></button>
                </a>
                <GraphComponent globals={this.state.globals}/> 
            </div>
            <Form
            globals={this.state.globals} 
            incrementStep={this.incrementStep}
            updateGraphData={this.updateGraphData}
            forceCollideRadius={this.state.forceCollideRadius}
            setForceCollideRadius={this.setForceCollideRadius} 
            processSTR={this.processSTR}/>
        </div>
        );
    }
}

export default App;
