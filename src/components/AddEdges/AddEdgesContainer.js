/**
 * Edge input container component. Part of Form component.  
 */
import React, { Component } from 'react'

import AddEdgesEntry from './AddEdgesEntry'

export class AddEdgesContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // existing edges 
            edgeEntries: [],
            mounted: false,
        }
    }

    /**
     * Validates input and creates edge on graph based on provided values. 
     */
    addEdge = () => {
        const data = Object.assign({}, this.props.globals.data);
        const selectSource = document.getElementById("selectSource");
        const selectTarget = document.getElementById("selectTarget");
        const selectInducer = document.getElementById("selectInducer");
        const rateInput = document.getElementById("rateInput");

        const sourceID = parseInt(document.getElementById("selectSource").value);
        const targetID = parseInt(document.getElementById("selectTarget").value);
        const inducerID = parseInt(document.getElementById("selectInducer").value);
        
        // ensure valid edge-based transition
        let valid = true;
        let errors = [];
        
        // can't be link to self
        if (selectSource.value === selectTarget.value) {
            valid = false;
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
            valid = false;
            rateInput.className += " border border-danger";
            errors.push("Invalid rate.");
        } else {
            rateInput.classList.remove("border");
            rateInput.classList.remove("border-danger");
        }

        const linkExists = data.links.find(link => 
            link.source.id === sourceID
            && link.target.id === targetID
            && link.inducer === (inducerID === -1 ? undefined : inducerID)
        ) !== undefined

        // if edge-based link doesn't exist already 
        if (valid && !linkExists) {
            // add link 
            const newLink = {
                id: sourceID + "-" + targetID + 
                (inducerID === -1 ? "" : "-" + inducerID),
                source: sourceID,
                target: targetID,
                inducer: inducerID === -1 ? undefined : inducerID,
                rate: rateInput.value,
            }
            newLink.shortName = this.createShortName(newLink);
            data.links.push(newLink)

            this.props.setGraphData(data);

            // create new entry based off link 
            this.props.setFormError("");
            this.createEdgeEntry([data.links[data.links.length - 1]])
        } else {
            // show error
            if (linkExists) {
                errors.push("Link already exists.");
            }
            this.props.setFormError(errors);
        }
    }

    /**
     * Create shortened name from link object.
     * @param {*} link link object 
     * @returns shortened name
     */
    createShortName = (link) => {
        const data = this.props.globals.data;
        return (
        data.nodes.find(node => node.id === (link.source?.id ?? link.source)).name[0] + "-" + 
        data.nodes.find(node => node.id === (link.target?.id ?? link.target)).name[0] +
        (link.inducer !== undefined ? (", " + data.nodes.find(node => node.id === (link.inducer?.id ?? link.inducer)).name[0]) : "") + 
        " : " + parseFloat(parseFloat(link.rate).toFixed(3)))
    }

    /**
     * Delete link (edge) from both graph data and form component. 
     * @param {*} id id of link to delete
     */
    deleteEdgeEntry = (id) => {
        const newData = Object.assign({}, this.props.globals.data);
        newData.links = newData.links.filter(l => l.id !== id);
        this.props.setGraphData(newData);
        this.setState({
            edgeEntries: this.state.edgeEntries.filter(element => element.key !== id),
        })
    }
    
    setLink = (values, id) => {
        const data = Object.assign({}, this.props.globals.data);
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
            console.log(values.inducer);
            link.inducer = values.inducer === -1 ? undefined : values.inducer;
        }

        link.shortName = this.createShortName(link);
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
                key={link.id}
                data={this.props.globals.data} 
                link={link}
                deleteEdgeEntry={this.deleteEdgeEntry}
                setLink={this.setLink}
                />)
        ]})
    }

    /**
     * Create entries for all pre-existing edge.
     */
    componentDidMount() {
        this.createEdgeEntry(this.props.globals.data.links);
    }

    render() {
        const data = this.props.globals.data;

        return (
            <div id="add-edges-container" className="form-step">
                <p>Select Source Node</p>
                <select
                className="form-select main-node-select"
                aria-label="Select Source Node"
                id="selectSource">
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-source-" + node.id}>{node.name}</option>
                        )
                    })}
                </select>
                <p>Select Target Node</p>
                <select
                className="form-select main-node-select"
                aria-label="Select Target Node"
                id="selectTarget">
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-target-" + node.id}>{node.name}</option>
                        )
                    })}
                </select>
                <p>Select Inducer Node</p>
                <select
                className="form-select main-node-select"
                aria-label="Select Inducer Node"
                id="selectInducer">
                    <option key={-1} value={-1} id={"select-inducer-none"}>None</option>
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-inducer-" + node.id}>{node.name}</option>
                        )
                    })}
                </select> 
                <div className="d-flex justify-content-between mb-3">
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
                {this.state.edgeEntries}
            </div>
        )
    }
}

export default AddEdgesContainer