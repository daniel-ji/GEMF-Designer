import React, { Component } from 'react'

import Step1Container from './Step1/Step1Container';
import Step2Container from './Step2/Step2Container';
import Step3Container from './Step3/Step3Container';
import Step4Container from './Step4/Step4Container';
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
        const data = this.props.globals.data;
        const step = this.props.globals.step;
        
        if (step === 2) {
            this.updateStep2Accordions();
            this.props.incrementStep(-1);
        } else if (step === 3) {
            this.props.incrementStep(-1);
        } else if (step === 4) {
            if (data.links.filter(link => link.inducer === undefined).length === 0) {
                this.props.incrementStep(-1);
            }
            this.props.incrementStep(-1);
        } else if (step === 5) {
            this.props.incrementStep(-1);
        }
    }

    handleNext = () => {
        const data = this.props.globals.data;
        const step = this.props.globals.step;

        if (step === 1) {
            this.step1Next();
        } else if (step === 2) {
            this.updateStep2Accordions();
            this.step2Next(data);
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
            data.nodes.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    updateStep2Accordions = () => {
        const accordions = document.getElementsByClassName("step2accordion-button");
        const openAccordions = new Set();

        for (const accordion of accordions) {
            if (!accordion.classList.contains("collapsed")) {
                openAccordions.add(parseInt(accordion.dataset.nodeId));
            }
        }

        this.setState({step2OpenAccordions: openAccordions});
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
                this.props.incrementStep();
            }
        });
    }

    step3Next = () => {
        const data = this.props.globals.data;
        // check inputs for blanks
        let valid = true;
        for (let i = 0; i < data.links.length; i++) {
            if (data.links[i].inducer === undefined) {
                const input = document.getElementById("link-input-" + data.links[i].source.id + "-" + data.links[i].target.id);
                if (data.links[i].rate === undefined || input.value.length === 0 || input.value < 0) {
                    if (data.links[i].rate === undefined) {
                        data.links[i].rate = undefined;
                    } else if (data.links[i].rate < 0) {
                    }
                    valid = false;
                    input.className += " border border-danger"
                }
            }
        }

        if (valid) {
            this.props.incrementStep();
        }
    }

    step4Next = () => {
        this.props.incrementStep();
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
                        processSTR={this.props.processSTR}
                        />,
                        2:
                        <Step2Container 
                        globals={this.props.globals} 
                        updateGraphData={this.props.updateGraphData}
                        openAccordions={this.state.step2OpenAccordions}
                        openedStep2={this.state.openedStep2}
                        />,
                        3: 
                        <Step3Container
                        globals={this.props.globals}
                        updateGraphData={this.props.updateGraphData}
                        />, 
                        4: 
                        <Step4Container
                        globals={this.props.globals}
                        updateGraphData={this.props.updateGraphData}
                        />,
                        5:
                        <FinalData
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