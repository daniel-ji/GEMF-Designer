import React, { Component } from 'react'
import { LINK_SHORT_NAME } from '../../Constants'

export class STREntry extends Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
        }
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

        return (
            <div key={this.props.id}>
                <div className="d-flex flex-wrap justify-content-between mt-4 w-100">
                    <div style={{width: "80%"}}>
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        onClick={this.toggleShowEntry}
                        >
                            STR Import: {this.props.name}
                        </button>
                    </div>
                    <button 
                    className="btn btn-danger p-0 mb-3" 
                    style={{minWidth: "10%"}}
                    onClick={() => this.deletePrompt(this.props.id)}>
                        <i className="bi bi-trash" />
                    </button>
                </div>
                {this.state.show &&
                <div 
                className="str-collapse-container"
                id={"collapseWidth-" + this.props.id}>
                    <div className={`card card-body d-flex w-100 str-collapse ${this.state.show ? "link-show" : ""}`}>
                        <div>
                            <h6 className="mb-3">Imported Nodes: </h6>
                            <ul className="list-group">
                                {this.props.nodes.map(nodeID => {
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
                                {this.props.links.map(linkID => {
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