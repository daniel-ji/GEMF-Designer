/**
 * Node input container component for creating nodes. Part of Form component.  
 */
import React, { Component } from 'react'

import AddNodesInput from './AddNodesInput'

export class AddNodesContainer extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            // stores all the node input react elements
            nodeInputs: []
        }
    }

    /**
     * Returns node input with corresponding key and value information. 
     * Built in correspondence with AddNodesInput component. 
     * 
     * @param {*} key unique ID of element, usually node.id value
     * @param {*} value optional value, usually for existing node inputs
     * @returns AddNodesInput component with corresponding values. 
     */
    nodeInput = (key, value = undefined) => {
        return (
            <AddNodesInput
                key={key}
                globals={this.props.globals}
                inputCounter={key}
                inputValue={value}
                setForceCollideRadius={this.props.setForceCollideRadius} 
                updateGraphData={this.props.updateGraphData}
                createNewInput={this.createNewInput}
            />
        )
    }

    /**
     * Creates a new input box for a new node.
     */
    createNewInput = () => {
        this.setState(prevState => ({
            nodeInputs: [...this.state.nodeInputs, 
                this.nodeInput(Math.floor(Math.random() * 1000000000))
            ]})
        )
    }

    /**
     * On mount, render all existing node inputs. 
     */
    componentDidMount() {
        const data = this.props.globals.data;
        this.setState({nodeInputs: [data.nodes.map(node => this.nodeInput(node.id, node.name)), 
            this.nodeInput(Math.floor(Math.random() * 1000000000))
        ]})
    }

    render() {
        return (
            <div id="add-nodes-container" className="form-step">
                {this.state.nodeInputs}
            </div>
        )
    }
}

export default AddNodesContainer