import React, { Component, Fragment } from 'react'

import Step1Container from './Step1/Step1Container';
import Step2Container from './Step2/Step2Container';

export class Form extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }

    handleBack = () => {
        const step = this.props.globals.step;
        
        if (step === 2) {
            this.props.incrementStep(-1);
        } else if (step === 3) {
            this.step3Next();
        } else if (step === 4) {
            this.step4Next();
        }
    }

    handleNext = () => {
        const data = this.props.globals.data;
        const step = this.props.globals.step;

        if (step === 1) {
            this.step1Next();
        } else if (step === 2) {
            this.step2Next(data, step);
        } else if (step === 3) {
            this.step3Next();
        } else if (step === 4) {
            this.step4Next();
        }
    }

    // proceed from step 1, includes validation 
    step1Next = () => {
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
            const element = document.getElementById('s-1-input-' + data.nodes[i].id);
            element.classList.remove("border");
            element.classList.remove("border-danger");
        }

        // alert repeats
        const repeat = Array.from(badState);
        console.log(repeat);

        for (let i = 0; i < repeat.length; i++) {
            const element = document.getElementById('s-1-input-' + repeat[i]);
            element.className += " border border-danger"
        }

        // continuing to step 2
        if (repeat.length === 0 && data.nodes.length > 0) {
            this.props.incrementStep();
            // sorts the nodes alphabetically 
            data.nodes.sort((a, b) => a.name.localeCompare(b.name));
        }
    }


    step2Next = (data) => {
        data.links.sort((a, b) => {
            if (a.source.name !== b.source.name) {
                return a.source.name.localeCompare(b.source.name, undefined, { numeric: true })
            } else {
                return a.target.name.localeCompare(b.target.name, undefined, { numeric: true })
            }
        })
        this.props.updateGraphData(data, () => {
            this.props.incrementStep();
            if (data.links.filter(link => link.inducer === undefined).length === 0) {
                this.handleNext();
            } else {
                this.renderStep3();
            }
        });
    }

    step3Next = () => {

    }

    step4Next = () => {
        this.props.incrementStep();
        this.renderStep5();
    }

    render() {
        return (
            <div id="form">
                <h1 id="formTitle">{{
                    1: 'Form Input (Step 1)',
                    2: 'Form Input (Step 2)',
                    3: 'Form Input (Step 3)',
                    4: 'Form Input (Step 4)',
                    5: 'Finalized Data'
                }[this.props.globals.step]}</h1>
                <div id={`step${this.props.globals.step}-container`} className="step-containers">
                    {{
                        1: 
                        <Step1Container 
                            globals={this.props.globals} 
                            setForceCollideRadius={this.props.setForceCollideRadius} 
                            updateGraphData={this.props.updateGraphData}
                        />,
                        2:
                        <Step2Container 
                            globals={this.props.globals} 
                            updateGraphData={this.props.updateGraphData}
                        />
                    }[this.props.globals.step]}
                </div>
                <div id="button-container">
                    <button onClick={this.handleBack} type="button" className="btn btn-secondary">Back</button>
                    <button onClick={this.handleNext} type="button" className="btn btn-success">Next</button>
                </div>
            </div>
        )
    }
}

export default Form