/**
 * Form component for tool, displays / handles all the user node / edge inputs. 
 */
import React, { Component } from 'react'

import AddNodesContainer from './AddNodes/AddNodesContainer';
import AddEdgesContainer from './AddEdges/AddEdgesContainer';
import Welcome from './Welcome';
import ImportSTR from './ImportSTR';
import FinalData from './FinalData';
import { FORM_STEPS } from '../Constants';

export class Form extends Component {
    constructor(props) {
        super(props)
    }

    /**
     * Handle back button press. 
     */
    handleBack = () => {
        this.props.setFormError("");
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
        this.props.setFormError("");
    }
    
    /**
     * Proceed from import page. 
     */
    importSTRNext = () => {
        this.props.incrementStep();
        this.props.setFormError("");
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
            
            // add / remove danger border from node entry
            const element = document.getElementById('s-1-input-' + data.nodes[i].id);
            if (badNodes.has(data.nodes[i].id)) {
                element.className += " border border-danger"
            } else {
                element.classList.remove("border", "border-danger");
            }
        }

        // continue to step 2 if nodes valid, give error messages otherwise
        if (badNodes.size === 0 && data.nodes.length > 0) {
            this.props.incrementStep();
            this.props.setFormError("");
        } else if (badNodes.size > 0) {
            this.props.setFormError("Nodes cannot have empty or duplicate names.");
        } else {
            this.props.setFormError("Please enter nodes.");
        }
    }

    /**
     * Proceed from edge creation step.
     */
    addEdgesNext = () => {
        this.props.incrementStep();
        this.props.setFormError("");
    }

    /**
     * Hide error button.
     */
    hideError = () => {
        this.props.setFormError("");
    }

    render() {
        return (
            <div id="form">
                {/** Switch for titles */}
                <h1 id="formTitle">{[
                    'GEMF Designer',
                    'Import STR Files (Optional)',
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
                    setGraphData={this.props.setGraphData}
                    />,
                    <AddEdgesContainer
                    globals={this.props.globals}
                    setGraphData={this.props.setGraphData}
                    setFormError={this.props.setFormError}
                    />,
                    <FinalData
                    globals={this.props.globals}
                    setGraphData={this.props.setGraphData}
                    />
                ][this.props.globals.step]}
                <div id="button-container" className={this.props.globals.step === 0 ? "justify-content-end" : "justify-content-between"}>
                    {this.props.globals.step !== 0 && <button onClick={this.handleBack} type="button" className="btn btn-secondary">Back</button>}
                    {this.props.globals.step !== FORM_STEPS - 1 && <button onClick={this.handleNext} type="button" className="btn btn-success">Next</button>}
                </div>
                <button 
                    id="error-popup" 
                    className={`btn btn-danger ${this.props.formError === "" || this.props.formErrorHide ? "error-popup-hidden" : "error-popup-show"}`} 
                    onClick={this.hideError}>
                    {this.props.formError}
                </button>
            </div>
        )
    }
}

export default Form