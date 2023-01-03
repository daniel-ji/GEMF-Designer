/**
 * STR entry (for created STR entries) component. Part of Form component.  
 */
import React, { Component } from 'react'
import { LINK_NAME_FROM_NAMES } from '../../Constants';

export class STRTemplate extends Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
            parsedSTR: this.props.template.STRText.split(/\r?\n/).map(row => row.split(/\t/)),
            newNodes: undefined,
        }
    }

    componentDidMount() {
        const newNodes = new Set();
        const parsedSTR = this.state.parsedSTR;

        for (let i = 0; i < parsedSTR.length; i++) {
            if (parsedSTR[i].length !== 4) {
                continue;
            }
            
            for (let j = 0; j < parsedSTR[i].length - 1; j++) {
                newNodes.add(parsedSTR[i][j]);
            }
        }
        newNodes.delete('None')
        this.setState({newNodes: Array.from(newNodes)})
    }

    toggleTemplate = () => {
        if (this.props.template.imported) {
            this.props.deleteSTR(this.props.template.id);
        } else {
            this.props.processSTR(this.props.template.STRText, this.props.template.name, true, () => {                
                const data = Object.assign({}, this.props.data);
                const template = data.STRTemplates.find(template => template.id === this.props.template.id);
                template.imported = !template.imported;
                this.props.setGraphData(data);
            });
        }
    }

    /**
     * Toggle entry visibility. 
     */
    toggleShowEntry = () => {
        this.setState({show: !this.state.show})
    }

    render() {
        return (
            <div key={this.props.template.id}>
                <div className="d-flex flex-wrap justify-content-between mt-4 w-100">
                    <div style={{width: "80%"}}>
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        onClick={this.toggleShowEntry}
                        >
                            {this.props.template.name}
                        </button>
                    </div>
                    <button 
                    className={`btn btn-${this.props.template.imported ? 'success': 'secondary'} p-0 mb-3`} 
                    style={{minWidth: "10%"}}
                    onClick={this.toggleTemplate}>
                        <i className="bi bi-check-square" />
                    </button>
                </div>
                {this.state.show &&
                <div 
                className="str-collapse-container"
                id={"collapseWidth-" + this.props.template.id}>
                    <div className={`card card-body d-flex w-100 str-collapse ${this.state.show ? "link-show" : ""}`}>
                        <div>
                            <h6 className="mb-3">Imported Nodes: </h6>
                            <ul className="list-group">
                                {this.state.newNodes.map(nodeName => {
                                    return <li key={nodeName} className="list-group-item">{nodeName}</li>;
                                })}
                            </ul>
                        </div>
                        <div>
                            <h6 className="my-3">Imported Links: </h6>
                            <ul className="list-group">
                                {this.state.parsedSTR.map(link => {
                                        return (link.length === 4 ?
                                        <li key={link} className="list-group-item">{LINK_NAME_FROM_NAMES(link)}</li> : '');
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

export default STRTemplate