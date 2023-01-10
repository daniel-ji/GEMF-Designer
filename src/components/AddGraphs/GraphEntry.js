/**
 * Graph input entry (for created graphs) component. Part of Form component.  
 */
import React, { Component } from 'react'
import { LINK_SHORT_NAME } from '../../Constants'

export class GraphEntry extends Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
            edit: false,
            graphName: this.props.data.name,
            oldGraphName: this.props.data.name,
        }
    }

    /**
     * Toggle entry visibility. 
     */
    toggleShowEntry = () => {
        this.setState({show: !this.state.show})
    }

    /**
     * Toggle editable state of graph entry.
     */
    toggleEditGraphName = () => {
        this.setState(prevState => {
            if (prevState.edit) {
                return {edit: false, graphName: this.state.oldGraphName}
            } else {
                return {edit: true}
            }
        })
    }

    /**
     * Edit graph name.
     * 
     * @param {*} e event 
     */
    editGraphName = (e) => {
        this.setState({graphName: e.target.value})
    }

    /**
     * Set graph name, after editing has been completed.
     */
    setGraphName = () => {
        this.setState({edit: false, oldGraphName: this.state.graphName});
        const data = Object.assign({}, this.props.data);
        data.name = this.state.graphName;
        this.props.db.transaction('graphs', 'readwrite').objectStore('graphs')
        .put(data);
        this.props.setGraphData(data);
    }

    /**
     * Prompt delete for STR entry.
     * 
     * @param {*} id id of entry
     */
    deletePrompt = (id) => {
        this.props.deletePrompt(() => this.props.deleteGraphEntry(id));
    } 

    render() {
        const data = this.props.data;

        return (
            <div key={data.id}>
                <div className="d-flex flex-wrap justify-content-between mt-3 w-100">
                    <div style={{width: this.state.edit ? "50%" : "60%"}}>
                        {this.state.edit ?
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Graph Name" aria-label="Graph Name" 
                            value={this.state.graphName} onChange={this.editGraphName} />
                        </div>
                        :
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        onClick={this.toggleShowEntry}
                        >
                            Saved Graph: {this.state.graphName} &nbsp;
                            <i className={`bi bi-caret-${this.state.show ? 'up' : 'down'}-fill`} />
                        </button>}
                    </div>
                    {this.state.edit && 
                    <button 
                    className="btn btn-success p-0 mb-3"
                    style={{minWidth: "10%"}}
                    onClick={this.setGraphName}>
                        <i className="bi bi-check-square finish-edit-btn" />
                    </button>
                    }
                    <button 
                    className={`btn btn-${this.state.edit ? 'danger' : 'warning'} p-0 mb-3`} 
                    style={{minWidth: "10%"}}
                    onClick={this.toggleEditGraphName}>
                        <i className={`bi bi-${this.state.edit ? 'x-square' : 'pencil'}`} />
                    </button>
                    <button 
                    className="btn btn-danger p-0 mb-3" 
                    style={{minWidth: "10%"}}
                    onClick={() => this.deletePrompt(data.id)}>
                        <i className="bi bi-trash" />
                    </button>
                    <button 
                    className={`btn btn-${this.props.selected ? 'success' : 'secondary'} p-0 mb-3`}
                    style={{minWidth: "10%"}}
                    onClick={() => this.props.setGraph(this.props.selected ? undefined : data.id)}>
                        <i className="bi bi-check-square" />
                    </button>
                </div>
                {this.state.show && 
                <div 
                className="str-collapse-container"
                id={"collapseWidth-" + data.id}>
                    <div className="card card-body d-flex w-100 str-collapse">
                        <div>
                            {data.lastModified !== undefined && <h6>Last Modified: {new Date(data.lastModified).toLocaleString()}</h6>}
                            <h6 className="mb-3">Graph States: </h6>
                            <ul className="list-group">
                                {data.nodes.length === 0 ? 
                                <li className="list-group-item">No States</li> : 
                                data.nodes.map(node => {
                                    return <li key={node.id} className="list-group-item">{node.name}</li>;
                                })}
                            </ul>
                        </div>
                        <div>
                            <h6 className="my-3">Graph Transitions: </h6>
                            <ul className="list-group">
                                {data.links.length === 0 ? 
                                <li className="list-group-item">No Transitions</li> : 
                                data.links.map(link => {
                                    return <li key={link.id} className="list-group-item">{LINK_SHORT_NAME(link, data)}</li>;
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default GraphEntry