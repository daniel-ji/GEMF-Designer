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
                step: 0,
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

    parseGraphvizSVG = (nodes, links) => {
        const graph = document.getElementById("graph0");

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
            setTimeout(() => this.updateGraphData(data), 100);
        } else {
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
                <a href="https://github.com/daniel-ji/GEMF-State-Visualization-Tool" target="_blank" rel="noreferrer">
                    <button className="btn btn-outline-dark p-0 github-button"><img src={githubIcon} alt="" /></button>
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
