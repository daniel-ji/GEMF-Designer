import React, { Component } from 'react'

import AddNodesContainer from './AddNodes/AddNodesContainer';
import AddEdgesContainer from './AddEdgesContainer';
import Welcome from './Welcome';
import FinalData from './FinalData';

export class Form extends Component {
    constructor(props) {
        super(props)

        this.state = {
            step2OpenAccordions: new Set(),
            openedStep2: false,
        }
    }

    handleBack = () => {
        this.props.incrementStep(-1);
    }

    handleNext = () => {
        const step = this.props.globals.step;

        if (step === 0) {
            this.props.incrementStep();
        } else if (step === 1) {
            this.addNodesNext();
        } else if (step === 2) {
            this.addEdgesNext();
        }
    }

    // proceed from step 1, includes validation 
    addNodesNext = () => {
        const data = this.props.globals.data;
        // create empty set that will hold duplicate / empty nodes
        let badState = new Set();
        for (let i = 0; i < data.nodes.length; i++) {
            for (let j = i + 1; j < data.nodes.length; j++) {
                if (data.nodes[i].name === data.nodes[j].name) {
                    badState.add(data.nodes[i].id);
                    badState.add(data.nodes[j].id);
                }
            }
            if (data.nodes[i].name.length === 0) {
                badState.add(data.nodes[i].id);
            }
        }

        // alert repeats
        const repeat = Array.from(badState);

        for (let i = 0; i < repeat.length; i++) {
            const element = document.getElementById('s-1-input-' + repeat[i]);
            element.className += " border border-danger"
        }

        // continuing to step 2
        if (repeat.length === 0 && data.nodes.length > 0) {
            if (!this.state.openedStep2) {
                this.setState({openedStep2: true, step2OpenAccordions: new Set([data.nodes[0].id])})
            }
            this.props.incrementStep();
            // sorts the nodes alphabetically 
            // data.nodes.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    addEdgesNext = () => {
        this.props.incrementStep();
    }

    render() {
        return (
            <div id="form">
                <h1 id="formTitle">{[
                    'GEMF State Visualization Tool',
                    'Add States (Nodes)',
                    'Add Transitions (Edges)',
                    'Finalized Data'
                ][this.props.globals.step]}</h1>
                {{
                    0:
                    <Welcome />,
                    1: 
                    <AddNodesContainer 
                    globals={this.props.globals} 
                    setForceCollideRadius={this.props.setForceCollideRadius} 
                    updateGraphData={this.props.updateGraphData}
                    processSTR={this.props.processSTR}
                    />,
                    2: 
                    <AddEdgesContainer
                    globals={this.props.globals}
                    updateGraphData={this.props.updateGraphData}
                    />,
                    3:
                    <FinalData
                    globals={this.props.globals}
                    updateGraphData={this.props.updateGraphData}
                    />
                }[this.props.globals.step]}
                <div id="button-container">
                    <button onClick={this.handleBack} type="button" className="btn btn-secondary">Back</button>
                    <button onClick={this.handleNext} type="button" className="btn btn-success">Next</button>
                </div>
            </div>
        )
    }
}

export default Form