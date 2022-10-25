import React, {Component} from 'react';

import GraphComponent from './components/Graph';
import Form from './components/Form';

import './App.scss';
import {WIDTH_RATIO} from './Constants';
import githubIcon from './images/githubicon.png';

import Graphviz from 'graphviz-react';

export class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // global variables
            globals: {
                NODE_RADIUS: 12,
                ARROW_SIZE: 4,
                data: {
                    nodes: [],
                    links: [],
                    linkCounter: {},
                },
                step: 1,
            },
            indicatorStyle: {},
            strGraphviz: undefined,
        }

        this.state.globals.forceCollideRadius = this.state.globals.NODE_RADIUS / 2
    }

    indicatorFadeOut = () => {
        if (Object.keys(this.state.indicatorStyle).length === 0) {
            this.setState({indicatorStyle: {opacity: 0}});
            setTimeout(() => {
                this.setState({indicatorStyle: {display: "none"}});
            }, 500)
        }
    }

    incrementStep = (amount = 1) => {
        this.setState(prevState => 
            ({globals: {
                ...prevState.globals, 
                step: prevState.globals.step + amount
            }}))
    }

    updateGraphData = (data, callback) => {
        this.setState(prevState => ({globals: {
            ...prevState.globals,
            data
        }}), callback)
    }

    setForceCollideRadius = (radius) => {
        this.setState(prevState => 
            ({globals: {
                ...prevState.globals, 
                forceCollideRadius: radius
            }}))
    }

    processSTR = (e) => {
        const reader = new FileReader();
        const nodes = [];
        const edges = [];

        // TODO: validate str file
        reader.onload = (e) => {
            
            let nodeID = Math.max(...this.state.globals.data.nodes.map(node => parseInt(node.id)));

            // parse STR for both graphviz and force-graph use
            const parsedSTR = e.target.result.split(/\r?\n/).map(row => row.split(/\t/));
            const getNodeID = (i, j) => nodes.map(node => node.name).indexOf(parsedSTR[i][j]);

            for (let i = 0; i < parsedSTR.length; i++) {
                // TODO: more validation here? 
                if (parsedSTR[i].length === 4) {
                    for (let j = 0; j < parsedSTR[i].length; j++) {
                        const foundNode = nodes.map(node => node.name).indexOf(parsedSTR[i][j]) !== -1;
                        // source and target node
                        if (j <= 1 && !foundNode) {
                            nodes.push({
                                id: ++nodeID,
                                name: parsedSTR[i][j],
                            });
                        // inducer node
                        } else if (j === 2) {
                            if (parsedSTR[i][j] !== "None" && !foundNode) {
                                nodes.push({
                                    id: ++nodeID,
                                    name: parsedSTR[i][j],
                                });
                            }
                        }
                    }
                    if (parsedSTR[i][2] === "None") {
                        edges.push({
                            id: getNodeID(i, 0) + "-" + getNodeID(i, 1),
                            shortName: parsedSTR[i][0] + "-" + parsedSTR[i][1],
                            source: getNodeID(i, 0),
                            target: getNodeID(i, 1),
                            rate: parseInt(parsedSTR[i][3])
                        })
                    } else {
                        edges.push({
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
            for (const edge of edges) {
                dotContent += 
                    `${nodes[edge.source].name} -> ${nodes[edge.target].name} [label = "${(edge.inducer !== undefined ? nodes[edge.inducer].name + ", " : "") + edge.rate}"];\n`;
            }

            this.setState({strGraphviz: 
                <Graphviz 
                className="graphOverlay graphViz"
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
            }, () => this.parseGraphvizSVG());
        }
        reader.readAsText(e.target.files[0]);
    }

    parseGraphvizSVG = () => {
        const graph = document.getElementById("graph0");
    
        console.log(graph);

        if (graph !== null) {
            const data = Object.assign({}, this.state.globals.data);
            const graphDimensions = graph.getBoundingClientRect();
            const graphMiddleX = (graphDimensions.left + graphDimensions.right) / 2; 
            const graphMiddleY = (graphDimensions.top + graphDimensions.bottom) / 2; 
            
            for (const child of graph.children) {
                if (child.classList.contains("node")) {
                    const ellipse = child.querySelector('ellipse');
                    const rect = ellipse.getBoundingClientRect();
                    const normalizedX = (rect.left - graphMiddleX) / graphMiddleX;
                    const normalizedY = (rect.top - graphMiddleY) / graphMiddleY;
                    const normalizedR = rect.width / graphDimensions.width;
                    const scaleRatio = 1 / normalizedR * this.state.globals.NODE_RADIUS;
                    data.nodes.push({
                        // TODO: change to actual unique ID
                        id: child.getElementsByTagName('title')[0].innerHTML,
                        name: child.getElementsByTagName('title')[0].innerHTML,
                        x: normalizedX * scaleRatio,
                        y: normalizedY * scaleRatio,
                    })
                }
            }

            this.updateGraphData(data);
            console.log(data.nodes);
        } else {
            setTimeout(this.parseGraphvizSVG, 50);
        }
    }

    render() {        
        return (
        <div className="App">
            <div className="graphOverlay graphIndicator"
            onMouseDown={this.indicatorFadeOut}
            onTouchStart={this.indicatorFadeOut}
            style={this.state.indicatorStyle}>
                <p className="noselect">Click and Drag Graph to Interact</p>
            </div>
            {this.state.strGraphviz}
            <div id="graphCover">
                <h1 className="noselect">Graph View </h1>
                <p className="noselect">
                    Legend:<br/>
                    <span style={{color: "green"}}>Green</span> Links: Node-based Transition<br/>
                    <span style={{color: "red"}}>Red</span> Links: Edge-based Transition
                </p>
                <a href="https://github.com/daniel-ji/GEMF-State-Visualization-Tool" target="_blank" rel="noreferrer">
                    <button className="btn btn-outline-dark p-0 githubButton"><img src={githubIcon} alt="" /></button>
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
