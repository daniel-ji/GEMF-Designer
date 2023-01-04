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
            // store old link data for cancel feature
            oldSourceID: undefined,
            oldTargetID: undefined,
            oldInducerID: undefined,
            oldRate: undefined,
            oldColor: undefined,
            sourceID: this.props.link.source.id ?? this.props.link.source,
            targetID: this.props.link.target.id ?? this.props.link.target,
            inducerID: this.props.link.inducer === undefined ? -1 : 
                (this.props.link.inducer.id ?? this.props.link.inducer),
            rate: this.props.link.rate,
            color: this.props.link.color,
            linkError: false,
            sourceError: false,
            targetError: false,
            rateError: false,
        }

        this.state.oldSourceID = this.state.sourceID;
        this.state.oldTargetID = this.state.targetID;
        this.state.oldInducerID = this.state.inducerID;
        this.state.oldRate = this.state.rate;
        this.state.oldColor = this.state.color;
    }

    /**
     * Setter for source ID of entry.
     * 
     * @param {*} e event 
     */
    setSourceID = (e) => {
        const parsedValue =  parseInt(e.target.value);
        this.setState({sourceID: parsedValue})
        this.props.setLink({source: parsedValue}, this.props.link.id);
    }

    /**
     * Setter for target ID of entry.
     * 
     * @param {*} e event
     */
    setTargetID = (e) => {
        const parsedValue =  parseInt(e.target.value);
        this.setState({targetID: parsedValue})
        this.props.setLink({target: parsedValue}, this.props.link.id);
    }

    /**
     * Setter for inducer ID of entry. 
     * 
     * @param {*} e event
     */
    setInducerID = (e) => {
        const parsedValue =  parseInt(e.target.value);
        this.setState({inducerID: parsedValue})
        this.props.setLink({inducer: parsedValue}, this.props.link.id);
    }

    /**
     * Setter for link color entry.
     * 
     * @param {*} e event
     */
    setColor = (e) => {
        this.setState({color: e.target.value});
        this.props.setLink({color: e.target.value}, this.props.link.id);
    }

    /**
     * Setter for rate of the entry.
     * 
     * @param {*} e event
     */
    setRate = (e) => {
        const parsedValue = parseFloat(e.target.value); 
        this.setState({rate: parsedValue})
        this.props.setLink({rate: parsedValue}, this.props.link.id);
    }

    /**
     * Check if link is valid given a changed value.
     * 
     * @param {*} changedProperty property changed 
     * @param {*} newValue  new value
     * @returns true or false given link validness
     */
    validLink = (changedProperty, newValue) => {
        let valid = true;
        let errorMsg = [];

        const newLink = {
            source: this.state.sourceID,
            target: this.state.targetID,
            inducer: this.state.inducerID,
            rate: this.state.rate
        };
        newLink[changedProperty] = newValue;
        
        const otherLinks = this.props.data.links.filter(link => link.id !== this.props.link.id);
        const linkExists = otherLinks.find(link => 
            (link.source.id ?? link.source) === newLink.source && 
            (link.target.id ?? link.target) === newLink.target &&
            (newLink.inducer === -1 ? (link.inducer === undefined) : 
                (link.inducer?.id ?? link.inducer === newLink.inducer))
        );

        if (linkExists) {
            this.setState({linkError: true});
            errorMsg.push("Link already exists.");
            valid = false;
        } else {
            this.setState({linkError: false});
        }
        
        if (newLink.source === newLink.target) {
            this.setState({sourceError: true, targetError: true});
            errorMsg.push("Cannot have self-loop.");
            valid = false;
        } else {
            this.setState({sourceError: false, targetError: false});
        }
        
        if (isNaN(newLink.rate) || newLink.rate < 0) {
            this.setState({rateError: true});
            errorMsg.push("Invalid transition rate.");
            valid = false;
        } else {
            this.setState({rateError: false});
        }

        if (errorMsg.length > 0) {
            this.props.setFormError(errorMsg, true);
        }
        return valid;
    }

    /**
     * Toggles visibility of entry. Also cancels edit if currently editing
     * and now hiding entry.
     */
    toggleShowEntry = () => {
        if (this.state.show && this.state.edit) {
            this.toggleEditEntry();
        }
        this.setState(prevState => {return {show: !prevState.show}})
    }

    /**
     * Toggles entry edit status and also shows if switching to editing.
     */
    toggleEditEntry = () => {
        this.setState(prevState => {return {
            edit: !prevState.edit, 
            show: prevState.edit ? prevState.show : true
        }}, () => {
            if (!this.state.edit) {
                this.props.setLink({
                    source: this.state.oldSourceID,
                    target: this.state.oldTargetID,
                    inducer: this.state.oldInducerID,
                    rate: this.state.oldRate,
                    color: this.state.oldColor
                }, this.props.link.id);
                this.setState({
                    sourceID: this.state.oldSourceID, 
                    targetID: this.state.oldTargetID, 
                    inducerID: this.state.oldInducerID,
                    rate: this.state.oldRate,
                    color: this.state.oldColor,
                    sourceError: false,
                    targetError: false,
                    rateError: false,
                    linkError: false
                })
            }
        })
    }
    
    /**
     * Handle entry finish button user input. 
     */
    finishEdit = () => {
        // only needs to check if new rate is invalid 
        // since other new values are checked automatically
        if (this.validLink('rate', this.state.rate)) {
            this.setState({
                edit: false,
                oldSourceID: this.state.sourceID, 
                oldTargetID: this.state.targetID, 
                oldInducerID: this.state.inducerID,
                oldRate: this.state.rate,
                oldColor: this.state.color
            })
        }
    }

    render() {
        const data = Object.assign({}, this.props.data);
        data.nodes = data.nodes.filter(node => node.knot === undefined);
        const link = this.props.link;

        return (
            <div key={link.id}>
                <div className="d-flex flex-wrap justify-content-between mt-4 w-100">
                    <div style={{width: (this.state.edit ? 60 : 70) + "%"}}>
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        onClick={this.toggleShowEntry}
                        >
                            Transition {link.shortName} &nbsp;<i className={`bi bi-caret-${this.state.show ? 'up' : 'down'}-fill`} />
                        </button>
                    </div>
                    {this.state.edit && 
                    <button 
                    className="btn btn-success p-0 mb-3 finish-edit-btn" 
                    style={{minWidth: "10%"}}
                    onClick={this.finishEdit}>
                        <i className="bi bi-check-square" />
                    </button>
                    }
                    <button 
                    className="btn btn-warning p-0 mb-3" 
                    style={{minWidth: "10%"}}
                    onClick={this.toggleEditEntry}>
                        <i className={`bi ${this.state.edit ? "bi-x-square" : "bi-pencil"}`} />
                    </button>
                    <button 
                    className="btn btn-danger p-0 mb-3" 
                    style={{minWidth: "10%"}}
                    onClick={() => this.props.deletePrompt(link.id)}>
                        <i className="bi bi-trash" />
                    </button>
                </div>
                {this.state.show &&
                <div 
                className="link-collapse-container"
                id={"collapseWidth-" + link.id}>
                    <div className={`card card-body w-100 link-collapse ${this.state.linkError ? "border-danger" : ""}`}>
                        <p className="mb-1">Source: </p>
                        <select
                        className={`form-select mb-2 ${this.state.sourceError ? "border-danger" : ""}`}
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
                        className={`form-select mb-2 ${this.state.targetError ? "border-danger" : ""}`}
                        aria-label="Target Node"
                        id="targetNode"
                        style={{width: "30%"}}
                        value={this.state.targetID}
                        onChange={this.setTargetID}
                        disabled={!this.state.edit}>
                            {data.nodes.map(node => {
                                return (
                                    node.knot !== undefined ? '' :
                                    <option key={node.id} value={node.id} id={"target-node-" + node.id}>{node.name}</option>
                                )
                            })}
                        </select> 

                        <p className="mb-1">Inducer: </p>
                        <select
                        className="form-select mb-2"
                        aria-label="Inducer Node"
                        id="inducerNode"
                        style={{width: "30%"}}
                        value={this.state.inducerID}
                        onChange={this.setInducerID}
                        disabled={!this.state.edit}>
                            <option key={-1} value={-1} id={"inducer-node-none"}>None</option>
                            {data.nodes.map(node => {
                                return (
                                    node.knot !== undefined ? '' :
                                    <option key={node.id} value={node.id} id={"inducer-node-" + node.id}>{node.name}</option>
                                )
                            })}
                        </select> 

                        <p className="mb-1">Rate: </p>
                        <input 
                        type="number" 
                        className={`form-control mb-2 ${this.state.rateError ? "border-danger" : ""}`}
                        disabled={!this.state.edit}
                        readOnly={!this.state.edit}
                        onChange={(e) => this.setRate(e)}
                        style={{width: "30%"}}
                        value={this.state.rate}/>
                        
                        <p className="mb-1">Color: </p>
                        <input
                        type="color" 
                        className="form-control form-control-color mb-2 edge-color-edit"
                        id={"button-color-" + this.state.count}
                        disabled={!this.state.edit}
                        readOnly={!this.state.edit}
                        value={this.state.color}
                        onChange={this.setColor}
                        style={{width: "15%"}}
                        title="Choose node color" />                        
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default AddEdgesEntry