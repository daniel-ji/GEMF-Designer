/**
 * Edge input entry (for created edges) component. Part of Form component.  
 */
import React, { Component } from 'react'

export class AddEdgesEntry extends Component {
    constructor(props) {
        super(props)

        this.state = {
            edit: false,
            show: false,
            sourceID: this.props.link.source.id ?? this.props.link.source,
            targetID: this.props.link.target.id ?? this.props.link.target,
            inducerID: this.props.link.inducer === undefined ? -1 : 
                (this.props.link.inducer.id ?? this.props.link.inducer),
            rate: this.props.link.rate,
            entryHeight: 0,
        }
    }

    setSourceID = (e) => {
        this.setState({sourceID: parseInt(e.target.value)})
        this.props.setLink({source: parseInt(e.target.value)}, this.props.link.id);
    }

    setTargetID = (e) => {
        this.setState({targetID: parseInt(e.target.value)})
        this.props.setLink({target: parseInt(e.target.value)}, this.props.link.id);
    }

    setInducerID = (e) => {
        this.setState({inducerID: parseInt(e.target.value)})
        this.props.setLink({inducer: parseInt(e.target.value)}, this.props.link.id);
    }

    /**
     * Sets the rate of the entry and updates graph data.
     * @param {*} e event
     */
    setRate = (e) => {
        this.setState({rate: parseFloat(e.target.value)})
        this.props.setLink({rate: parseFloat(e.target.value)}, this.props.link.id);
    }

    /**
     * Toggles visibility of entry. 
     */
    // TODO: Make cancel if hiding entry.
    toggleShowEntry = () => {
        this.setState(prevState => {return {show: !prevState.show}})
    }

    /**
     * Toggles entry edit status and also shows if switching to editing.
     */
    toggleEditEntry = () => {
        this.setState(prevState => {return {
            edit: !prevState.edit, 
            show: prevState.edit ? prevState.show : true
        }})
    }

    componentDidMount() {
        this.setState({entryHeight: 
            document.getElementById("collapseWidth-" + this.props.link.id).
                getBoundingClientRect().height});
    }

    render() {
        const data = this.props.data;
        const link = this.props.link;

        return (
            <div key={link.id}>
                <div className="d-flex flex-wrap justify-content-between mt-4 w-100">
                    <div style={{width: "70%"}}>
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        onClick={this.toggleShowEntry}
                        >
                            State Transition Edge {link.shortName}
                        </button>
                    </div>
                    <button 
                    className="btn btn-warning p-0 mb-3" 
                    style={{minWidth: "10%"}}
                    onClick={this.toggleEditEntry}>
                        <i className={`bi ${this.state.edit ? "bi-x-square" : "bi-pencil"}`} />
                    </button>
                    <button 
                    className="btn btn-danger p-0 mb-3" 
                    style={{minWidth: "10%"}}
                    onClick={() => this.props.deleteEdgeEntry(link.id)}>
                        <i className="bi bi-trash" />
                    </button>
                </div>
                <div 
                className="link-collapse-container"
                id={"collapseWidth-" + link.id}>
                    <div className={`card card-body w-100 link-collapse ${this.state.show ? "link-show" : ""}`}
                        // TODO: get rid of component-load in transition (currently transition is just set to 0 as temp fix)  
                        style={{marginTop: this.state.show ? "0" : "-" + this.state.entryHeight + "px"}}>
                        <p className="mb-1">Source: </p>
                        <select
                        className="form-select mb-2"
                        aria-label="Source Node"
                        id="sourceNode"
                        style={{width: "30%"}}
                        value={this.state.sourceID}
                        onChange={this.setSourceID}
                        disabled={!this.state.edit}>
                            {data.nodes.map(node => {
                                return (
                                    <option key={node.id} value={node.id} id={"source-node-" + node.id}>{node.name}</option>
                                )
                            })}
                        </select> 

                        <p className="mb-1">Target: </p>
                        <select
                        className="form-select mb-2"
                        aria-label="Target Node"
                        id="targetNode"
                        style={{width: "30%"}}
                        value={this.state.targetID}
                        onChange={this.setTargetID}
                        disabled={!this.state.edit}>
                            {data.nodes.map(node => {
                                return (
                                    <option key={node.id} value={node.id} id={"target-node-" + node.id}>{node.name}</option>
                                )
                            })}
                        </select> 

                        <p className="mb-1">Inducer: </p>
                        <select
                        className="form-select mb-2"
                        aria-label="Inducer Node"
                        id="inducerNode"
                        style={{width: "25%"}}
                        value={this.state.inducerID}
                        onChange={this.setInducerID}
                        disabled={!this.state.edit}>
                            <option key={-1} value={-1} id={"inducer-node-none"}>None</option>
                            {data.nodes.map(node => {
                                return (
                                    <option key={node.id} value={node.id} id={"inducer-node-" + node.id}>{node.name}</option>
                                )
                            })}
                        </select> 

                        <p className="mb-1">Rate: </p>
                        <input 
                        type="number" 
                        className="form-control mb-2"
                        disabled={!this.state.edit}
                        readOnly={!this.state.edit}
                        onChange={(e) => this.setRate(e)}
                        style={{width: "20%"}}
                        value={this.state.rate}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default AddEdgesEntry