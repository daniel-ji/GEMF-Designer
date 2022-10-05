import React, { Component, Fragment } from 'react'

import Step1Input from './Step1Input';
// TODO: Continue working on this

export class Form extends Component {
    constructor(props) {
        super(props)

        this.state = {
            inputCounter: 0,
            nodeInputs: [],
        }
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.state.inputCounter === 0) {
                this.createNewInput();
            }
        }, 100)
    }

    handleBack = () => {

    }

    handleNext = () => {
        const data = this.props.globals.data;
        const step = this.props.globals.step;

        const formTitle = document.getElementById("formTitle");
        if (step === 1) {
            this.step1Next();
        } else if (step === 2) {
            this.step2Next(data, step);
        } else if (step === 3) {
            this.step3Next();
        } else if (step === 4) {
            this.step4Next(formTitle);
        }
    }

    step1Next = () => {

    }

    step2Next = (data, step, formTitle) => {
        data.links.sort((a, b) => {
            if (a.source.name !== b.source.name) {
                return a.source.name.localeCompare(b.source.name, undefined, { numeric: true })
            } else {
                return a.target.name.localeCompare(b.target.name, undefined, { numeric: true })
            }
        })
        this.props.updateGraphData(data);
        this.props.incrementStep();
        const step2 = document.getElementById("step2-container");
        const step3 = document.getElementById("step3-container");
        step2.style.display = "none";
        step3.style.display = "flex";
        formTitle.innerHTML = "Data Input (Step 3)"
        console.log(data.links.filter(link => link.inducer === undefined));
        if (data.links.filter(link => link.inducer === undefined).length === 0) {
            console.log("hit")
            this.handleNext();
        } else {
            this.renderStep3();
        }
    }

    step3Next = () => {

    }

    step4Next = (formTitle) => {
        this.props.incrementStep();
        const step4 = document.getElementById("step4-container");
        const step5 = document.getElementById("step5-container");
        step4.style.display = "none";
        step5.style.display = "flex";
        formTitle.innerHTML = "Data (Step 5)";
        this.renderStep5();
    }

    // -------- STEP 1 --------


    // creates a new input box for a new node in step 1
    createNewInput = () => {
        // increment (by 1) the amount of inputs we created
        this.setState(prevState => ({
            nodeInputs: [...this.state.nodeInputs, 
                <Step1Input
                key={this.state.inputCounter}
                globals={this.props.globals}
                inputCounter={this.state.inputCounter} 
                setForceCollideRadius={this.props.setForceCollideRadius} 
                count={this.state.inputCounter}
                updateGraphData={this.props.updateGraphData}
                createNewInput={this.createNewInput}
                />
            ],
            inputCounter: prevState.inputCounter + 1})
        )
    }

    render() {
        return (
            <div id="form">
                <h1 id="formTitle">Data Input (Step 1)</h1>
                <div id={`step${this.props.globals.step}-container`} className="step-containers">
                    {
                        {
                            1: 
                            <Fragment>
                                <h3 className="title">Add Nodes</h3>
                                {this.state.nodeInputs}
                            </Fragment>,
                            2:
                            <Fragment>
                                <h3 className="title">Add Edges To Nodes</h3>
                            </Fragment>
                        }[this.props.globals.step]
                    }
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