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
        const data = this.props.globals.data;
        this.setState({nodeInputs: [data.nodes.map(node => {
            return (
                <Step1Input
                    key={node.id}
                    globals={this.props.globals}
                    inputCounter={node.id}
                    inputValue={node.name}
                    setForceCollideRadius={this.props.setForceCollideRadius} 
                    updateGraphData={this.props.updateGraphData}
                    createNewInput={this.createNewInput}
                />
            )
        }), 
            <Step1Input
            key={data.nodes.length}
            globals={this.props.globals}
            inputCounter={data.nodes.length + 1} 
            setForceCollideRadius={this.props.setForceCollideRadius} 
            updateGraphData={this.props.updateGraphData}
            createNewInput={this.createNewInput}
        />
        ]})
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