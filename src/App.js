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

    parseGraphVizSVG() {
        const graph = document.getElementById("graph0");

        if (graph !== null) {
            const nodes = [];
            const edges = [];

            for (const child of graph.children) {
                if (child.classList.contains("node")) {
                    const ellipse = child.querySelector('ellipse');
                    const rect = ellipse.getBoundingClientRect();
                    nodes.push([rect.left, rect.top]);
                }
            }
    
            console.log(nodes);
        }
    }

    componentDidMount() {
        this.parseGraphVizSVG();
    }

    render() {        
        return (
        <div className="App">
            <div className="graphIndicator"
            onMouseDown={this.indicatorFadeOut}
            onTouchStart={this.indicatorFadeOut}
            style={this.state.indicatorStyle}>
                <p className="noselect">Click and Drag Graph to Interact</p>
            </div>
            {/* <Graphviz 
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
            }`}/> */}
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
            setForceCollideRadius={this.setForceCollideRadius} />
        </div>
        );
    }
}

export default App;
