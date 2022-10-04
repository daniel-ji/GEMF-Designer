import React, { Component } from 'react'

export class Form extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
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

    render() {
        return (
            <div id="form">
                <h1 id="formTitle">Data Input (Step 1)</h1>
                <div id={`step${this.props.globals.step}-container`} className="step-containers">
                    {this.props.globals.step === 1 ? <h3 className="title">Add Nodes</h3> : ''}
                    {this.props.globals.step === 2 ? <h3 className="title">Add Edges To Nodes</h3> : ''}
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