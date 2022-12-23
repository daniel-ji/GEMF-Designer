/**
 * Node input container component for creating nodes. Part of Form component.  
 */
import React, { Component } from 'react'
import Sortable from 'sortablejs'

import AddNodesInput from './AddNodesInput'
import { CREATE_ENTRY_ID, UPDATE_DATA_ORDER } from '../../Constants'

export class AddNodesContainer extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            // stores all the node input react elements
            nodeInputs: [],
            sortable: undefined
        }
    }

    /**
     * On mount, render all existing node inputs and set up Sortable.
     */
    componentDidMount() {
        const data = this.props.data;
        this.setState({nodeInputs: [data.nodes.map(node => this.nodeInput(node.id, node.name)), 
            this.nodeInput(CREATE_ENTRY_ID())
        ]})

        this.setState({sortable: new Sortable(document.getElementById('add-nodes-container'), {
            onUpdate: (e) => {
                this.props.setGraphData(UPDATE_DATA_ORDER(e, this.props.data, 'nodes'));
            }
        })})
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
                data={this.props.data}
                inputCounter={key}
                inputValue={value}
                setForceCollideRadius={this.props.setForceCollideRadius} 
                setGraphData={this.props.setGraphData}
                createNewInput={this.createNewInput}
                deletePrompt={this.props.deletePrompt}
            />
        )
    }

    /**
     * Creates a new input box for a new node.
     */
    createNewInput = () => {
        this.setState(prevState => ({
            nodeInputs: [...this.state.nodeInputs, 
                this.nodeInput(CREATE_ENTRY_ID())
            ]})
        )
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