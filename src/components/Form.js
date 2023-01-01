/**
 * Form component for tool, displays / handles all the user node / edge inputs. 
 */
import React, { Component } from 'react'

import AddNodesContainer from './AddNodes/AddNodesContainer';
import AddEdgesContainer from './AddEdges/AddEdgesContainer';
import GraphEntryContainer from './AddGraphs/GraphEntryContainer';
import Welcome from './Welcome';
import ImportSTR from './Import/ImportSTR';
import FinalData from './FinalData';
import { FORM_STEPS } from '../Constants';

import githubIcon from '../images/githubicon.png';

export class Form extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // form confirm modal for deleting entries 
            deletePrompt: false,
            deleteText: '',
            deleteCancelCallback: undefined,
            deleteConfirmCallback: undefined,
        }
    }

    /**
     * Handle back button press. 
     */
    handleBack = () => {
        switch (this.props.step) {
            case 3: 
                this.props.incrementStep(-1, true);
                this.props.setFormError("");
                break;
            case 4: 
                // prevent user from leaving half-finished links
                if (document.getElementsByClassName("finish-edit-btn").length > 0) {
                    this.props.setFormError("Please finish or cancel all link edits first.");
                } else {
                    this.props.setFormError("");
                    this.props.incrementStep(-1, true);
                }
                break;
            default: 
                this.props.incrementStep(-1);
                break;
        }
    }

    /**
     * Handle next button press.
     */
    handleNext = () => {
        switch (this.props.step) {
            case 0: 
                this.welcomePageNext();
                break;
            case 1: 
                this.selectGraphNext();
                break;
            case 2: 
                this.importSTRNext();
                break;
            case 3: 
                this.addNodesNext();
                break;
            case 4: 
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
     * Proceed from graph selection page.
     */
    selectGraphNext = () => {
        if (this.props.selectedGraph !== undefined) {
            this.props.incrementStep();
        } else {
            this.props.setFormError("Please select a graph to edit.");
        }
    }

    /**
     * Proceed from import page. 
     */
    importSTRNext = () => {
        if (this.props.formError === "") {
            this.props.incrementStep();
        } else {
            this.props.showFormError();
        }
    }

    /**
     * Proceed from node creation step, validates nodes. 
     */
    addNodesNext = () => {
        const data = this.props.data;
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
            this.props.setFormError("");
            this.props.incrementStep(1, true);
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
        if (document.getElementsByClassName("finish-edit-btn").length > 0) {
            this.props.setFormError("Please finish or cancel all link edits first.");
        } else {
            this.props.setFormError("");
            this.props.incrementStep(1, true);
        }
    }

    /**
     * Delete prompt shared across edges, nodes, and STR import entries.
     * 
     * @param {*} deleteConfirmCallback callback on confirm
     * @param {*} deleteCancelCallback callback on cancel
     */
    deletePrompt = (deleteConfirmCallback, deleteCancelCallback = () => {}, deleteText = 'Delete entry?') => {
        this.setState({deletePrompt: true, deleteCancelCallback, deleteConfirmCallback, deleteText})
    }

    /**
     * Handle delete prompt cancel input. 
     */
    deleteCancelCallback = () => {
        this.setState({deletePrompt: false});
        this.state.deleteCancelCallback();
    }

    /**
     * Handle delete prompt confirm input.
     */
    deleteConfirmCallback = () => {
        this.setState({deletePrompt: false});
        this.state.deleteConfirmCallback();
    }

    render() {
        return (
            <div id="form">
                {/** Switch for titles */}
                <h1 id="formTitle">{[
                    'GEMF Designer',
                    'Select Graph',
                    'Import STR Files (Optional)',
                    'Add States (Nodes)',
                    'Add Transitions (Edges)',
                    'Finalized Data'
                ][this.props.step]}</h1>
                {/** Switch for components */}
                {[
                    <Welcome />,
                    <GraphEntryContainer 
                    setGraph={this.props.setGraph}
                    selectedGraph={this.props.selectedGraph}
                    savedGraphs={this.props.savedGraphs}
                    deleteGraph={this.props.deleteGraph}
                    deletePrompt={this.deletePrompt}
                    db={this.props.db}
                    data={this.props.data}
                    setGraphData={this.props.setGraphData}
                    getSavedGraphs={this.props.getSavedGraphs}
                    setFormError={this.props.setFormError}
                    />,
                    <ImportSTR
                    processSTR={this.props.processSTR}
                    data={this.props.data}
                    deleteSTR={this.props.deleteSTR}
                    deletePrompt={this.deletePrompt}
                    setGraphData={this.props.setGraphData}
                    />,
                    <AddNodesContainer 
                    data={this.props.data} 
                    setNodeRadius={this.props.setNodeRadius}
                    setForceCollideRadius={this.props.setForceCollideRadius} 
                    setGraphData={this.props.setGraphData}
                    deletePrompt={this.deletePrompt}
                    />,
                    <AddEdgesContainer
                    data={this.props.data}
                    setLinkRadius={this.props.setLinkRadius}
                    setGraphData={this.props.setGraphData}
                    setFormError={this.props.setFormError}
                    formError={this.props.formError}
                    showFormError={this.props.showFormError}
                    deletePrompt={this.deletePrompt}
                    setNodesAutoSel={this.props.setNodesAutoSel}
                    />,
                    <FinalData
                    data={this.props.data}
                    setGraphData={this.props.setGraphData}
                    />
                ][this.props.step]}
                <div id="button-container" className={`mt-4 ${this.props.step === 0 ? "justify-content-end" : "justify-content-between"}`}>
                    {this.props.step !== 0 && <button onClick={this.handleBack} type="button" className="btn btn-secondary">Back</button>}
                    {this.props.step !== FORM_STEPS - 1 && <button onClick={this.handleNext} type="button" className="btn btn-success">Next</button>}
                </div>
                <button 
                    id="error-popup" 
                    className={`btn btn-danger ${(this.props.formErrorTrans || 
                        (this.props.formError === "" || this.props.formErrorHide)) ? "error-popup-hidden" : "error-popup-show"}`} 
                    onClick={this.props.hideFormError}>
                    {this.props.formError}
                </button>
                <div className={`form-error-prompt ${!this.state.deletePrompt ? "form-error-prompt-hidden" : ""}`}>
                    <div className="card">
                        <div className="card-body">
                            <p className="mx-3 my-0">{this.state.deleteText}</p> 
                            <div className="form-error-prompt-buttons">
                                <button className="btn btn-secondary me-3" onClick={this.deleteCancelCallback}>Cancel</button>
                                <button className="btn btn-danger" onClick={this.deleteConfirmCallback}>Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.step === 0 && 
                <a className="github-button" href="https://github.com/daniel-ji/GEMF-Designer" target="_blank" rel="noreferrer" aria-label="github repo link">
                    <button className="btn btn-outline-dark p-0" aria-label="github repo button"><img src={githubIcon} alt="" /></button>
                </a>}
            </div>
        )
    }
}

export default Form