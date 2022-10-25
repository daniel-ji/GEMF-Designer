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
            key={Math.max([...this.props.globals.data.nodes.map(node => node.id)]) + 1}
            globals={this.props.globals}
            inputCounter={Math.max([...this.props.globals.data.nodes.map(node => node.id)]) + 1} 
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
                    key={Math.max([...this.props.globals.data.nodes.map(node => node.id)]) + 1}
                    globals={this.props.globals}
                    inputCounter={Math.max([...this.props.globals.data.nodes.map(node => node.id)]) + 1} 
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
                <div className="nodeInputs mb-5 px-3">
                    {this.state.nodeInputs}
                </div>
                <div className="w-100">
                    <label htmlFor="formFile" className="form-label"><h3 className="title">Upload Existing State Transition Rates File</h3></label>
                    <input type="file" id="formFile" className="form-control" accept=".tsv,.csv,.txt" onChange={this.props.processSTR}/>
                </div>
            </Fragment>
        )
    }
}

export default Step1Container