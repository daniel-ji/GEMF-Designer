/**
 * Edge input container component. Part of Form component.  
 */
import React, { Component } from 'react'

export class AddEdgesContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // existing edges 
            edgeEntries: []
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
            data.links.push({
                id: sourceID + "-" + targetID + 
                (inducerID === -1 ? "" : "-" + inducerID),
                shortName: 
                    selectSource.options[selectSource.selectedIndex].text[0] + "-" + 
                    selectTarget.options[selectTarget.selectedIndex].text[0] + 
                    (inducerID !== -1 ? ", " + selectInducer.options[selectInducer.selectedIndex].text[0] : ""),
                source: sourceID,
                target: targetID,
                inducer: inducerID === -1 ? undefined : inducerID,
                rate: rateInput.value,
            })

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
     * Delete link (edge) from both graph data and form component. 
     * @param {*} id id of link to delete
     */
    deleteEdgeEntry = (id) => {
        const newData = Object.assign({}, this.props.globals.data);
        newData.links = newData.links.filter(l => l.id !== id);
        this.props.setGraphData(newData);
        this.setState({edgeEntries: this.state.edgeEntries.filter(element => 
            element.key !== id
        )})
    }
    
    /**
     * Updates form component with provided links (edges).
     * @param {*} links links to update form with
     */
    createEdgeEntry = (links) => {
        const data = this.props.globals.data;
        this.setState({edgeEntries: [...this.state.edgeEntries,
            ...links.map(link =>
            <div key={link.id}>
                <div className="d-flex flex-wrap justify-content-between mt-4 w-100">
                    <div style={{width: "60%"}}>
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        data-bs-toggle="collapse"
                        data-bs-target={"#collapseWidth-" + link.id}
                        aria-controls={"collapseWidth-" + link.id}
                        aria-expanded="false">
                            State Transition Edge {link.shortName}
                        </button>
                    </div>
                    <button 
                    className="btn btn-danger p-0 mb-3" 
                    style={{width: "10%"}}
                    onClick={() => this.deleteEdgeEntry(link.id)}>
                        <i className="bi bi-trash" />
                    </button>
                </div>
                <div 
                className="collapse"
                id={"collapseWidth-" + link.id}>
                    <div className="card card-body w-100">
                        <p className="mb-1">Source: </p>
                        <input 
                        type="text" 
                        className="form-control mb-2"
                        disabled
                        readOnly
                        style={{width: "30%"}}
                        value={typeof link.source === 'number' ? 
                            data.nodes.find(n => n.id === link.source).name
                            : link.source.name}/>

                        <p className="mb-1">Target: </p>
                        <input 
                        type="text" 
                        className="form-control mb-2"
                        disabled
                        readOnly
                        style={{width: "30%"}}
                        value={typeof link.target === 'number' ? 
                            data.nodes.find(n => n.id === link.target).name
                            : link.target.name}/>

                        <p className="mb-1">Inducer: </p>
                        <input 
                        type="text" 
                        className="form-control mb-2"
                        disabled
                        readOnly
                        style={{width: "25%"}}
                        value={link.inducer === undefined ? "None" : data.nodes.find(n => n.id === link.inducer).name}/>

                        <p className="mb-1">Rate: </p>
                        <input 
                        type="text" 
                        className="form-control mb-2"
                        disabled
                        readOnly
                        style={{width: "20%"}}
                        value={link.rate}/>
                    </div>
                </div>
            </div>
            )
        ]})
    }

    componentDidMount() {
        this.createEdgeEntry(this.props.globals.data.links);
    }

    render() {
        const data = this.props.globals.data;

        return (
            <div id="add-edges-container" className="form-step">
                <p>Select Source Node</p>
                <select
                className="form-select"
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
                className="form-select"
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
                className="form-select"
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