import React, { Component, Fragment } from 'react'

import Step1Input from './Step1Input'

export class Step1Container extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            nodeInputs: []
        }
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.state.nodeInputs.length === 0) {
                this.createNewInput();
            }
        }, 100)
    }

    // creates a new input box for a new node
    createNewInput = () => {
        // increment (by 1) the amount of inputs we created
        this.setState(prevState => ({
            nodeInputs: [...this.state.nodeInputs, 
                <Step1Input
                    key={this.state.nodeInputs.length}
                    globals={this.props.globals}
                    inputCounter={this.state.nodeInputs.length} 
                    setForceCollideRadius={this.props.setForceCollideRadius} 
                    updateGraphData={this.props.updateGraphData}
                    createNewInput={this.createNewInput}
                />
            ]})
        )
    }

    render() {
        return (
            <Fragment>
                <h3 className="title">Add Nodes</h3>
                {this.state.nodeInputs}
            </Fragment>
        )
    }
}

export default Step1Container