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
        this.loadInNodeInputs();

        this.setState({sortable: new Sortable(document.getElementById('node-inputs'), {
            onUpdate: (e) => {
                this.props.setGraphData(UPDATE_DATA_ORDER(e, this.props.data, 'nodes'));
            }
        })})
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data.nodes.length !== this.props.data.nodes.length ||
            prevProps.data.nodeRadius !== this.props.data.nodeRadius) {
            this.loadInNodeInputs();
        }
    }

    loadInNodeInputs = () => {
        const data = this.props.data;
        this.setState({nodeInputs: [data.nodes.map(node => this.nodeInput(node.id, node.name)), 
            this.nodeInput(CREATE_ENTRY_ID())
        ]}, () => {
            this.forceUpdate();
        })
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
                key={CREATE_ENTRY_ID()}
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

    /**
     * Sets default shape of nodes, does not change previous shapes. 
     * 
     * @param {*} shape new default shape
     */
    setDefaultShape = (shape) => {
        const data = Object.assign({}, this.props.data);
        data.defaultShape = shape;
        this.props.setGraphData(data);
        this.setState({nodeInputs: this.state.nodeInputs.filter((input, index) => {
            return index !== this.state.nodeInputs.length - 1
        })}, () => this.createNewInput())
    }

    /**
     * Confirm prompt for resetting all nodes' shapes.
     */
    resetShapePrompt = () => {
        this.props.deletePrompt(this.resetShape, () => {}, 'Revert ALL nodes\' shape to default?')
    }

    /**
     * Reset all nodes' shapes and update graph.
     */
    resetShape = () => {
        const data = Object.assign({}, this.props.data);
        for (const node of data.nodes) {
            node.shape = data.defaultShape;
        }
        this.props.setGraphData(data);
        this.loadInNodeInputs();
    }

    /**
     * Set default node color of graph.
     *  
     * @param {*} e color picker event 
     */
    setDefaultColor = (e) => {
        this.setState({nodeInputs: this.state.nodeInputs.filter((input, index) => {
            return index !== this.state.nodeInputs.length - 1
        })}, () => this.createNewInput())
        const data = Object.assign({}, this.props.data);
        data.defaultNodeColor = e.target.value;
        this.props.setGraphData(data);
    }

    /**
     * Confirm prompt for resetting all nodes' colors.
     */
    resetColorPrompt = () => {
        this.props.deletePrompt(this.resetColor, () => {}, 'Revert ALL nodes\' color to default?')
    }

    /**
     * Reset all nodes' colors and update graph data. 
     */
    resetColor = () => {
        const data = Object.assign({}, this.props.data);
        for (const node of data.nodes) {
            node.color = data.defaultNodeColor;
        }
        this.props.setGraphData(data);
        this.loadInNodeInputs();
    }

    render() {
        return (
            <div id="add-nodes-container" className="form-step">
                <p>Node size: {this.props.data.nodeRadius}</p>
                <input 
                type="range" 
                className="form-range mt-1 mb-4" 
                min="6" max="24" step="0.5" 
                value={this.props.data.nodeRadius}
                onChange={(e) => this.props.setNodeRadius(parseInt(e.target.value))}
                />
                <div className="d-flex justify-content-between">
                    <div className="dropdown shapes-dropdown mb-4">
                        <div className="btn-group me-3">
                            <button className="btn btn-outline-dark" type="button">
                                Default Shape: 
                            </button>
                            <button type="button" className="btn btn-outline-dark dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className={`bi bi-${this.props.data.defaultShape}`} />&nbsp;&nbsp;
                            </button>
                            <ul className="dropdown-menu">
                                {NODE_SHAPES.map(shape =>
                                    <li key={shape}><i className={`dropdown-item bi bi-${shape}`} onClick={() => this.setDefaultShape(shape)}/></li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <button className="btn btn-outline-danger mb-4 ms-3" type="button" onClick={this.resetShapePrompt}>
                        Reset States to Default Shape 
                    </button>
                </div>
                <div className="d-flex justify-content-between">
                    <div className="dropdown shapes-dropdown mb-5">
                        <div className="btn-group h-100 me-3">
                            <button className="btn btn-outline-dark" type="button">
                                Default Color: 
                            </button>
                            <input
                            type="color" 
                            className="form-control form-control-color node-default-color-edit node-color-edit"
                            id={"button-color-" + this.state.count}
                            value={this.props.data.defaultNodeColor}
                            onChange={this.setDefaultColor}
                            title="Choose default node color" 
                            />
                        </div>
                    </div>
                    <button className="btn btn-outline-danger mb-5 ms-3" type="button" onClick={this.resetColorPrompt}>
                        Reset States to Default Color
                    </button>
                </div>
                <div id="node-inputs">
                    {this.state.nodeInputs}
                </div>
            </div>
        )
    }
}

export default AddNodesContainer