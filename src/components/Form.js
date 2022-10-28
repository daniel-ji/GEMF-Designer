/**
 * Form component for tool, displays / handles all the user node / edge inputs. 
 */
import React, { Component } from 'react'

import AddNodesContainer from './AddNodes/AddNodesContainer';
import AddEdgesContainer from './AddEdgesContainer';
import Welcome from './Welcome';
import ImportSTR from './ImportSTR';
import FinalData from './FinalData';

export class Form extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }

    /**
     * Handle back button press. 
     */
    handleBack = () => {
        this.props.incrementStep(-1);
    }

    /**
     * Handle next button press.
     */
    handleNext = () => {
        switch (this.props.globals.step) {
            case 0: 
                this.welcomePageNext();
                break;
            case 1: 
                this.importSTRNext();
                break;
            case 2: 
                this.addNodesNext();
                break;
            case 3: 
                this.addEdgesNext();
                break;
            default: 
                this.props.incrementStep();
                break;
        }
    }

    /**
     * Proceed from welcome page. 
     */
    welcomePageNext = () => {
        this.props.incrementStep();
    }
    
    /**
     * Proceed from import page. 
     */
    importSTRNext = () => {
        this.props.incrementStep();
    }

    /**
     * Proceed from node creation step, validates nodes. 
     */
    addNodesNext = () => {
        const data = this.props.globals.data;
        // create empty set that will hold duplicate / empty nodes
        let badNodes = new Set();
        for (let i = 0; i < data.nodes.length; i++) {
            for (let j = i + 1; j < data.nodes.length; j++) {
                if (data.nodes[i].name === data.nodes[j].name) {
                    badNodes.add(data.nodes[i].id);
                    badNodes.add(data.nodes[j].id);
                }
            }
            if (data.nodes[i].name.length === 0) {
                badNodes.add(data.nodes[i].id);
            }
        }

        // alert repeats
        for (const badState of Array.from(badNodes)) {
            const element = document.getElementById('s-1-input-' + badState);
            element.className += " border border-danger"
        }

        // continue to step 2 if nodes valid
        if (badNodes.keys.length === 0 && data.nodes.length > 0) {
            this.props.incrementStep();
        }
    }

    /**
     * Proceed from edge creation step.
     */
    addEdgesNext = () => {
        this.props.incrementStep();
    }

    render() {
        return (
            <div id="form">
                {/** Switch for titles */}
                <h1 id="formTitle">{[
                    'GEMF State Visualization Tool',
                    'Import STR File (Optional)',
                    'Add States (Nodes)',
                    'Add Transitions (Edges)',
                    'Finalized Data'
                ][this.props.globals.step]}</h1>
                {/** Switch for components */}
                {[
                    <Welcome />,
                    <ImportSTR
                    processSTR={this.props.processSTR}
                    />,
                    <AddNodesContainer 
                    globals={this.props.globals} 
                    setForceCollideRadius={this.props.setForceCollideRadius} 
                    updateGraphData={this.props.updateGraphData}
                    />,
                    <AddEdgesContainer
                    globals={this.props.globals}
                    updateGraphData={this.props.updateGraphData}
                    />,
                    <FinalData
                    globals={this.props.globals}
                    updateGraphData={this.props.updateGraphData}
                    />
                ][this.props.globals.step]}
                <div id="button-container">
                    <button onClick={this.handleBack} type="button" className="btn btn-secondary">Back</button>
                    <button onClick={this.handleNext} type="button" className="btn btn-success">Next</button>
                </div>
            </div>
        )
    }
}

export default Form