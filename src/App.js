import React, {Component} from 'react';

import GraphComponent from './components/Graph';
import Form from './components/Form';

import './App.css';
import githubIcon from './images/githubicon.png';

export class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
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

    incrementStep = () => {
        this.setState(prevState => 
            ({globals: {
                ...prevState.globals, 
                step: prevState.globals.step + 1
            }}))
    }

    updateGraphData = (data) => {
        this.setState(prevState => ({globals: {
            ...prevState.globals,
            data
        }}))
    }

    setForceCollideRadius = (radius) => {
        this.setState(prevState => 
            ({globals: {
                ...prevState.globals, 
                forceCollideRadius: radius
            }}))
    }

    render() {        
        return (
        <div className="App">
            <div id="graphIndicator" onMouseDown={this.indicatorFadeOut} onTouchStart={this.indicatorFadeOut} style={this.state.indicatorStyle}>
                <p className="noselect">Click and Drag Graph to Interact</p>
            </div>
            <div id="graphCover">
                <h1 className="noselect">Graph View </h1>
                <p className="noselect">
                    Legend:<br/>
                    <span style={{color: "green"}}>Green</span> Links: Node-based Transition<br/>
                    <span style={{color: "red"}}>Red</span> Links: Edge-based Transition
                </p>
                <a href="https://github.com/spis2022/GEMF-State-Visualization-Tool" target="_blank" rel="noreferrer"><button className="btn btn-outline-dark p-0"><img src={githubIcon} alt="" /></button></a>
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
