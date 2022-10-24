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

    parseGraphVizSVG = () => {
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
                        // TODO: change to actual unique ID
                        id: child.getElementsByTagName('title')[0].innerHTML,
                        name: child.getElementsByTagName('title')[0].innerHTML,
                        x: normalizedX * scaleRatio,
                        y: normalizedY * scaleRatio,
                    })
                }
            }

            this.updateGraphData(data);
        }
    }

    processSTR = (e) => {
        const reader = new FileReader();
        const nodes = [];
        const edges = [];
        // TODO: validate str file
        reader.onload = (e) => {
            const parsedSTR = e.target.result.split(/\r?\n/).map(row => row.split(/\t/));
            for (let i = 0; i < parsedSTR.length; i++) {
                // TODO: more validation here? 
                if (parsedSTR[i].length === 4) {
                    for (let j = 0; j < parsedSTR[i].length; j++) {
                        const value = parsedSTR[i][j];
                        // source and target node
                        if (j <= 1 && nodes.indexOf(value) === -1) {
                            nodes.push(value);
                        // inducer node
                        } else if (j === 2) {
                            if (value !== "None" && nodes.indexOf(value) === -1) {
                                nodes.push(value);
                            }
                        }
                    }
                    if (parsedSTR[i][2] === "None") {
                        edges.push({
                            id: nodes.indexOf(parsedSTR[i][0]) + "-" + nodes.indexOf(parsedSTR[i][1]),
                            shortName: parsedSTR[i][0] + "-" + parsedSTR[i][1],
                            source: nodes.indexOf(parsedSTR[i][0]),
                            target: nodes.indexOf(parsedSTR[i][1]),
                            rate: parseInt(parsedSTR[i][3])
                        })
                    } else {
                        edges.push({
                            id: nodes.indexOf(parsedSTR[i][0]) + "-" + nodes.indexOf(parsedSTR[i][1]) + "-" + nodes.indexOf(parsedSTR[i][2]),
                            shortName: parsedSTR[i][0] + "-" + parsedSTR[i][1] + "-" + parsedSTR[i][2],
                            source: nodes.indexOf(parsedSTR[i][0]),
                            target: nodes.indexOf(parsedSTR[i][1]),
                            inducer: nodes.indexOf(parsedSTR[i][2]),
                            rate: parseInt(parsedSTR[i][3])
                        })
                    }
                }
            }
            console.log(nodes);
            console.log(edges);
        }
        reader.readAsText(e.target.files[0]);
    }

    componentDidMount() {
        this.parseGraphVizSVG();
    }

    render() {        
        return (
        <div className="App">
            {/* <div className="graphIndicator"
            onMouseDown={this.indicatorFadeOut}
            onTouchStart={this.indicatorFadeOut}
            style={this.state.indicatorStyle}>
                <p className="noselect">Click and Drag Graph to Interact</p>
            </div> */}
            <Graphviz 
            className="graphIndicator"
            options={{
                width: window.innerWidth * WIDTH_RATIO,
                height: window.innerHeight
            }}
            dot={`
            digraph finite_state_machine {
                fontname="Helvetica,Arial,sans-serif"
                node [fontname="Helvetica,Arial,sans-serif"]
                edge [fontname="Helvetica,Arial,sans-serif"]
                rankdir=LR;
                node [shape = circle];
                0 -> 2 [label = "SS(B)"];
                0 -> 1 [label = "SS(S)"];
                1 -> 3 [label = "S($end)"];
                2 -> 6 [label = "SS(b)"];
                2 -> 5 [label = "SS(a)"];
                2 -> 4 [label = "S(A)"];
                5 -> 7 [label = "S(b)"];
                5 -> 5 [label = "S(a)"];
                6 -> 6 [label = "S(b)"];
                6 -> 5 [label = "S(a)"];
                7 -> 8 [label = "S(b)"];
                7 -> 5 [label = "S(a)"];
                8 -> 6 [label = "S(b)"];
                8 -> 5 [label = "S(a)"];
            }`}/>
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
