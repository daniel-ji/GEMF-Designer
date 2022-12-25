/**
 * Node input container component for creating nodes. Part of Form component.  
 */
import React, { Component } from 'react'
import Sortable from 'sortablejs'

import AddNodesInput from './AddNodesInput'
import { CREATE_ENTRY_ID, UPDATE_DATA_ORDER, NODE_SHAPES } from '../../Constants'

export class AddNodesContainer extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            // stores all the node input react elements
            nodeInputs: [],
            sortable: undefined,
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

    setDefaultShape = (shape) => {
        this.setState({nodeInputs: this.state.nodeInputs.filter((input, index) => {
            return index !== this.state.nodeInputs.length - 1
        })}, () => this.createNewInput())
        const data = Object.assign({}, this.props.data);
        data.defaultShape = shape;
        this.props.setGraphData(data);
    }

    render() {
        return (
            <div id="add-nodes-container" className="form-step">
                <div className="dropdown shapes-dropdown mb-4">
                    <div className="btn-group">
                        <button className="btn btn-outline-dark" type="button">
                            Default Shape: 
                        </button>
                        <button type="button" className="btn btn-outline-dark dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className={`bi bi-${this.props.data.defaultShape}`} />&nbsp;&nbsp;
                        </button>
                        <ul className="dropdown-menu">
                            {NODE_SHAPES.map(shape =>
                                <li><i className={`dropdown-item bi bi-${shape}`} onClick={() => this.setDefaultShape(shape)}/></li>
                            )}
                        </ul>
                    </div>
                </div>
                {this.state.nodeInputs}
            </div>
        )
    }
}

export default AddNodesContainer