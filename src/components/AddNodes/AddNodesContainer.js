import React, { Component } from 'react'

import AddNodesInput from './AddNodesInput'

export class AddNodesContainer extends Component {
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
                <AddNodesInput
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
            <AddNodesInput
            key={data.nodes.length + 1}
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
                <AddNodesInput
                    key={this.props.globals.data.nodes.length + 1}
                    globals={this.props.globals}
                    inputCounter={this.props.globals.data.nodes.length + 1} 
                    setForceCollideRadius={this.props.setForceCollideRadius} 
                    updateGraphData={this.props.updateGraphData}
                    createNewInput={this.createNewInput}
                />
            ]})
        )
    }

    render() {
        return (
            <div id="add-nodes-container" className="form-step">
                {this.state.nodeInputs}
                <div className="w-100">
                    <label htmlFor="formFile" className="form-label"><h4>Upload Existing State Transition Rates File</h4></label>
                    <input type="file" id="formFile" className="form-control" accept=".tsv,.csv,.txt" onChange={this.props.processSTR}/>
                </div>
            </div>
        )
    }
}

export default AddNodesContainer