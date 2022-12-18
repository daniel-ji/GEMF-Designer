import React, { Component } from 'react'
import { LINK_SHORT_NAME } from '../../Constants'

export class STREntry extends Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
            transition: "0s",
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
        this.props.deletePrompt(() => this.props.deleteGraphEntry(id));
    } 
    
    /**
     * Prevent transition from occuring on first render.
     */
    componentDidMount() {
        this.setState({entryHeight: 
            document.getElementById("collapseWidth-" + this.props.data.id)
                .getBoundingClientRect().height});
        setTimeout(() => this.setState({transition: "0.5s"}), 50);
    }

    render() {
        const data = this.props.data;

        return (
            <div key={data.id}>
                <div className="d-flex flex-wrap justify-content-between mt-3 w-100">
                    <div style={{width: "70%"}}>
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        onClick={this.toggleShowEntry}
                        >
                            Saved Graph : {data.name}
                        </button>
                    </div>
                    <button 
                    className="btn btn-danger p-0 mb-3" 
                    style={{minWidth: "10%"}}
                    onClick={() => this.deletePrompt(data.id)}>
                        <i className="bi bi-trash" />
                    </button>
                    <button 
                    className={`btn btn-${this.props.selected ? 'success' : 'secondary'} p-0 mb-3`}
                    style={{minWidth: "10%"}}
                    onClick={() => this.props.setGraph(data.id)}>
                        <i className="bi bi-check-square" />
                    </button>
                </div>
                <div 
                className="str-collapse-container"
                id={"collapseWidth-" + data.id}>
                    <div className="card card-body d-flex w-100 str-collapse"
                    style={{marginTop: this.state.show ? "0" : "-" + this.state.entryHeight + "px", transition: this.state.transition}}>
                        <div>
                            <h6 className="mb-3">Graph Nodes: </h6>
                            <ul className="list-group">
                                {data.nodes.length === 0 ? 
                                <li className="list-group-item">No Nodes</li> : 
                                data.nodes.map(node => {
                                    return <li key={node.id} className="list-group-item">{node.name}</li>;
                                })}
                            </ul>
                        </div>
                        <div>
                            <h6 className="my-3">Graph Links: </h6>
                            <ul className="list-group">
                                {data.links.length === 0 ? 
                                <li className="list-group-item">No Links</li> : 
                                data.links.map(link => {
                                    return <li key={link.id} className="list-group-item">{LINK_SHORT_NAME(link, data)}</li>;
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default STREntry