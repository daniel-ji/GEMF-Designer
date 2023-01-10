/**
 * Edge input container component. Part of Form component.  
 */
import React, { Component } from 'react'
import Sortable from 'sortablejs';

import AddEdgesEntry from './AddEdgesEntry'

import { CREATE_ENTRY_ID, LINK_NODE_SELECT_IDS, LINK_SHORT_NAME, UPDATE_DATA_DEL, UPDATE_DATA_ORDER } from '../../Constants';

export class AddEdgesContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // existing edges 
            edgeEntries: [],
            mounted: false,
            sortable: undefined,
        }
    }

    /**
     * Create entries for all pre-existing edge.
     */
    componentDidMount() {
        this.refreshEdges();

        this.setState({sortable: new Sortable(document.getElementById('linkEntries'), {
            onUpdate: (e) => {
                this.props.setGraphData(UPDATE_DATA_ORDER(e, this.props.data, 'links'));
            }
        })})
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data.links.length !== this.props.data.links.length) {
            this.refreshEdges();
        }
    }

    refreshEdges = () => {
        const data = Object.assign({}, this.props.data);
        for (const link of data.links) {
            link.shortName = LINK_SHORT_NAME(link, data);
        }

        this.props.setGraphData(data);
        this.setState({edgeEntries: []}, () => {
            this.createEdgeEntry(this.props.data.links);
        })
        this.props.setNodesAutoSel(0);
    }

    /**
     * Validates input and creates edge on graph based on provided values. 
     */
    addEdge = () => {
        const data = Object.assign({}, this.props.data);
        const selectSource = document.getElementById("selectSource");
        const selectTarget = document.getElementById("selectTarget");
        const rateInput = document.getElementById("rateInput");

        const sourceID = parseInt(document.getElementById("selectSource").value);
        const targetID = parseInt(document.getElementById("selectTarget").value);
        const inducerID = parseInt(document.getElementById("selectInducer").value);

        let errors = [];
        
        // can't be link to self
        if (selectSource.value === selectTarget.value) {
            selectSource.className += " border border-danger";
            selectTarget.className += " border border-danger";
            errors.push("Cannot have self-loop.")
        } else {
            selectSource.classList.remove("border");
            selectSource.classList.remove("border-danger");
            selectTarget.classList.remove("border");
            selectTarget.classList.remove("border-danger");
        }

        // has to have valid rate
        if (rateInput.value.length === 0 || parseInt(rateInput.value) < 0) {
            rateInput.className += " border border-danger";
            errors.push("Invalid rate.");
        } else {
            rateInput.classList.remove("border");
            rateInput.classList.remove("border-danger");
        }

        if (errors.length > 0) {
            this.props.setFormError(errors, true);
            return;
        }

        const linkExists = data.links.find(link => 
            link.source.id === sourceID
            && link.target.id === targetID
            && link.inducer === (inducerID === -1 ? undefined : inducerID)
        ) !== undefined

        // if edge-based link doesn't exist already 
        if (!linkExists) {
            // add link 
            const newLink = {
                id: sourceID + "-" + targetID + 
                (inducerID === -1 ? "" : "-" + inducerID),
                source: sourceID,
                target: targetID,
                inducer: inducerID === -1 ? undefined : inducerID,
                rate: rateInput.value,
                color: this.props.data.defaultEdgeColor,
                order: this.props.data.links.length
            }
            newLink.shortName = LINK_SHORT_NAME(newLink, data);
            data.links.push(newLink)

            this.props.setGraphData(data);

            // create new entry based off link 
            this.props.setFormError("");
            this.createEdgeEntry([data.links[data.links.length - 1]])
            this.props.setNodesAutoSel(0);
        } else {
            // show error
            this.props.setFormError("Link already exists.", true);
        }
    }

    /**
     * Prompt delete edge entry.
     * 
     * @param {*} id id to pass into actual delete function
     */
    deletePrompt = (id) => {
        this.props.deletePrompt(() => this.deleteEdgeEntry(id));
    }
    
    /**
     * Delete link (edge) from both graph data and form component. 
     * @param {*} id id of link to delete
     */
    deleteEdgeEntry = (id) => {
        const newData = Object.assign({}, this.props.data);
        UPDATE_DATA_DEL(newData.links.find(l => l.id === id).order, newData.links);
        newData.links = newData.links.filter(l => l.id !== id);
        this.props.setGraphData(newData);
        this.setState({
            edgeEntries: this.state.edgeEntries.filter(element => element.key !== id),
        })
    }

    deleteAllPrompt = () => {
        this.props.deletePrompt(() => this.deleteAllEdges(), () => {}, 'Delete ALL links?');
    }

    deleteAllEdges = () => {
        const newData = Object.assign({}, this.props.data);
        newData.links = [];
        this.props.setGraphData(newData);
        this.setState({edgeEntries: []})
    }
    
    /**
     * Set values of link as well as generate new link name.
     * Helper function for methods in AddEdgesEntry.js
     * See:
     * {@link AddEdgesEntry#setSourceID}
     * {@link AddEdgesEntry#setTargetID}
     * {@link AddEdgesEntry#setInducerID}
     * {@link AddEdgesEntry#setRate}
     * 
     * @param {*} values values to assign 
     * @param {*} id id of link to assign to
     */
    setLink = (values, id) => {
        const data = Object.assign({}, this.props.data);
        const link = data.links.find(link => link.id === id);
        
        if (values.rate !== undefined) {
            link.rate = parseFloat(values.rate);
        }

        if (values.source !== undefined) {
            link.source = values.source;
        }

        if (values.target !== undefined) {
            link.target = values.target;
        }

        if (values.inducer !== undefined) {
            link.inducer = values.inducer === -1 ? undefined : values.inducer;
        }

        if (values.color !== undefined) {
            link.color = values.color;
        }

        link.shortName = LINK_SHORT_NAME(link, data);
        this.props.setGraphData(data);
    } 
    
    /**
     * Updates form component with provided links (edges).
     * @param {*} links links to update form with
     */
    createEdgeEntry = (links) => {
        this.setState({
            edgeEntries: [...this.state.edgeEntries,
            ...links.map(link => 
                <AddEdgesEntry 
                id={link.id}
                key={CREATE_ENTRY_ID()}
                data={this.props.data} 
                link={link}
                deletePrompt={this.deletePrompt}
                setLink={this.setLink}
                setFormError={this.props.setFormError}
                />)
        ]})
    }

    /**
     * Set default link color of graph.
     *  
     * @param {*} e color picker event 
     */
    setDefaultColor = (e) => {
        const data = Object.assign({}, this.props.data);
        data.defaultEdgeColor = e.target.value;
        this.props.setGraphData(data);
    }

    /**
     * Confirm prompt for resetting all links' colors.
     */
    resetColorPrompt = () => {
        if (document.getElementsByClassName("finish-edit-btn").length > 0) {
            this.props.setFormError("Please finish or cancel all link edits first.");
        } else {
            this.props.deletePrompt(this.resetColor, () => {}, 'Revert ALL links\' color to default?')
        }
    }

    /**
     * Reset all links' colors and update graph data. 
     */
    resetColor = () => {
        const data = Object.assign({}, this.props.data);
        for (const link of data.links) {
            link.color = data.defaultEdgeColor;
        }
        this.props.setGraphData(data, () => {
            this.setState({edgeEntries: []}, () => {
                this.createEdgeEntry(data.links);
            })
        });
    }


    render() {
        const data = this.props.data;

        return (
            <div id="add-edges-container" className="form-step">
                <p>Link size: {this.props.data.linkRadius}</p>
                <input 
                type="range" 
                className="form-range mt-1 mb-4" 
                min="3" max="20" step="0.5" 
                value={this.props.data.linkRadius}
                onChange={(e) => this.props.setLinkRadius(e.target.value)}
                />
                <div className="d-flex justify-content-between">
                    <div className="dropdown shapes-dropdown mb-4">
                        <div className="btn-group h-100 me-3">
                            <button className="btn btn-outline-dark" type="button">
                                Default Color: 
                            </button>
                            <input
                            type="color" 
                            className="form-control form-control-color node-default-color-edit node-color-edit"
                            id={"button-color-" + this.state.count}
                            value={this.props.data.defaultEdgeColor}
                            onChange={this.setDefaultColor}
                            title="Choose default node color" 
                            />
                        </div>
                    </div>
                    <button className="btn btn-outline-danger mb-4 ms-3" type="button" onClick={this.resetColorPrompt}>
                        Reset Transitions to Default Color
                    </button>
                </div>
                <p>Select Source State</p>
                <select
                className="form-select main-node-select"
                aria-label="Select Source Node"
                id={LINK_NODE_SELECT_IDS[0]}>
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-source-" + node.id}>{node.name}</option>
                        )
                    })}
                </select>
                <p>Select Target State</p>
                <select
                className="form-select main-node-select"
                aria-label="Select Target State"
                id={LINK_NODE_SELECT_IDS[1]}>
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-target-" + node.id}>{node.name}</option>
                        )
                    })}
                </select>
                <p>Select Inducer State</p>
                <select
                className="form-select main-node-select"
                aria-label="Select Inducer State"
                id={LINK_NODE_SELECT_IDS[2]}>
                    <option key={-1} value={-1} id={"select-inducer-none"}>None</option>
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-inducer-" + node.id}>{node.name}</option>
                        )
                    })}
                </select> 
                <div className="d-flex justify-content-between mt-3 mb-3">
                    <div className="input-group" style={{width: "60%"}}>
                        <input
                        type="number"
                        className="form-control"
                        placeholder="Enter Trans. Rate"
                        aria-label="Enter Trans. Rate"
                        id="rateInput"/>
                    </div>
                    <button 
                    className="btn btn-success"
                    style={{width: "30%"}} 
                    onClick={this.addEdge}>Add</button>
                </div>
                <button className="btn btn-danger mt-4 mb-4" onClick={this.deleteAllPrompt}>Delete All Transitions</button>
                <div id="linkEntries">
                    {this.state.edgeEntries}
                </div>
            </div>
        )
    }
}

export default AddEdgesContainer