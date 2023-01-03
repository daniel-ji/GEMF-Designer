/**
 * STR entry (for created STR entries) component. Part of Form component.  
 */
import React, { Component } from 'react'
import { LINK_SHORT_NAME } from '../../Constants'

export class STREntry extends Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
            STRName: this.props.entry.name,
            oldSTRName: this.props.entry.name
        }
    }

    /**
     * Toggle editable state of STR entry.
     */
    toggleEditSTRName = () => {
        this.setState(prevState => {
            if (prevState.edit) {
                return {edit: false, STRName: this.state.oldSTRName}
            } else {
                return {edit: true}
            }
        })
    }

    /**
     * Edit STR name.
     * 
     * @param {*} e event 
     */
    editSTRName = (e) => {
        this.setState({STRName: e.target.value})
    }

    /**
     * Set STR name, after editing has been completed.
     */
    setSTRName = () => {
        const data = Object.assign({}, this.props.data);
        const STR = data.STRData.find(entry => entry.id === this.props.entry.id);
        STR.name = this.state.STRName;
        this.props.setGraphData(data);
        this.setState({edit: false})
    }

    /**
     * Toggle entry visibility. 
     */
    toggleShowEntry = () => {
        this.setState({show: !this.state.show})
    }

    /**
     * Prompt delete for STR entry.
     * 
     * @param {*} id id of entry
     */
    deletePrompt = (id) => {
        this.props.deletePrompt(() => this.props.deleteSTR(id));
    } 

    render() {
        const data = this.props.data;
        const entry = this.props.entry;

        return (
            <div key={entry.id}>
                <div className="d-flex flex-wrap justify-content-between mt-4 w-100">
                    <div style={{width: this.state.edit ? "60%" : "70%"}}>
                        {this.state.edit ?
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="STR Name"
                            value={this.state.STRName} onChange={this.editSTRName} />
                        </div>
                        :
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        onClick={this.toggleShowEntry}
                        >
                            STR {entry.template ? 'Import' : 'Template'}: {entry.name}
                            &nbsp;<i className={`bi bi-caret-${this.state.show ? 'up' : 'down'}-fill`} />
                        </button>}
                    </div>
                    {this.state.edit && 
                    <button 
                    className="btn btn-success p-0 mb-3 finish-edit-btn"
                    style={{minWidth: "10%"}}
                    onClick={this.setSTRName}>
                        <i className="bi bi-check-square" />
                    </button>
                    }
                    <button 
                    className={`btn btn-${this.state.edit ? 'danger' : 'warning'} p-0 mb-3`} 
                    style={{minWidth: "10%"}}
                    onClick={this.toggleEditSTRName}>
                        <i className={`bi bi-${this.state.edit ? 'x-square' : 'pencil'}`} />
                    </button>
                    <button 
                    className="btn btn-danger p-0 mb-3" 
                    style={{minWidth: "10%"}}
                    onClick={() => this.deletePrompt(entry.id)}>
                        <i className="bi bi-trash" />
                    </button>
                </div>
                {this.state.show &&
                <div 
                className="str-collapse-container"
                id={"collapseWidth-" + entry.id}>
                    <div className={`card card-body d-flex w-100 str-collapse ${this.state.show ? "link-show" : ""}`}>
                        <div>
                            <h6 className="mb-3">Imported Nodes: </h6>
                            <ul className="list-group">
                                {entry.nodes.map(nodeID => {
                                    const node = data.nodes.find(node => node.id === nodeID);
                                    if (node !== undefined) {
                                        return <li key={node.id} className="list-group-item">{node.name}</li>;
                                    }
                                    return "";
                                })}
                            </ul>
                        </div>
                        <div>
                            <h6 className="my-3">Imported Links: </h6>
                            <ul className="list-group">
                                {entry.links.map(linkID => {
                                    const link = data.links.find(link => link.id === linkID);
                                    if (link !== undefined) {
                                        return <li key={link.id} className="list-group-item">{LINK_SHORT_NAME(link, data)}</li>;
                                    }
                                    return "";
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

export default STREntry