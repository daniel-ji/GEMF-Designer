import React, { Component, Fragment } from 'react'

export class Step3Container extends Component {
    constructor(props) {
        super(props)

        this.state = {
            transitionInputs: [],
        }
    }

    renderTransitionInput = (index) => {
        const data = this.props.globals.data;
        const link = data.links[index];
        const key = link.source.id + "-" + link.target.id;

        return (
            <div key={key} id={"link-item-" + key}>
                <p>{"Link from " + link.source.name + " to " + link.target.name + ":"}</p>
                <div 
                className="input-group mb-3"
                id={"link-input-group-" + key}>
                    <input 
                    type="number"
                    className="form-control"
                    id={"link-input-" + key}
                    placeholder="Transition Rate"
                    aria-label="Transition Rate"
                    value={link.rate ?? ''}
                    onChange={(e) => {
                        const currData = Object.assign({}, this.props.globals.data);
                        currData.links[index].rate = e.target.value;
                        e.target.classList.remove("border");
                        e.target.classList.remove("border-danger");
                        this.props.updateGraphData(currData, () => {
                            this.renderStep3();
                        })
                    }}/>
                </div>
            </div>
        )
    }

    renderStep3 = () => {
        const data = this.props.globals.data;
        const transitionInputs = [];
        // loop through all data.links and create input fields for transition rates
        for (let i = 0; i < data.links.length; i++) {
            if (data.links[i].inducer === undefined) {
                transitionInputs.push(this.renderTransitionInput(i))
            }
        }

        this.setState({transitionInputs})
    }

    componentDidMount() {
        this.renderStep3();
    }

    render() {
        return (
            <Fragment>
                <h3 className="title">Add Edges To Nodes</h3>
                {this.state.transitionInputs}
            </Fragment>
        )
    }
}

export default Step3Container