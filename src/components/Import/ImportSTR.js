/**
 * Import existing STR file from user. Part of Form component.  
 */
import React, { Component } from 'react'
import Sortable from 'sortablejs';

import STREntry from './STREntry';
import STRTemplate from './STRTemplate';
import { UPDATE_DATA_ORDER } from '../../Constants';

export class ImportSTR extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            sortableEntry: undefined,
            showTemplates: false,
        }
    }

    componentDidMount() {
        this.setState({sortable: new Sortable(document.getElementById('strEntries'), {
            onUpdate: (e) => {
                this.props.setGraphData(UPDATE_DATA_ORDER(e, this.props.data, 'STRData'));
            }
        })})
    }

    toggleShowTemplates = () => {
        this.setState(prevState => {return {showTemplates: !prevState.showTemplates}})
    }

    render() {
        return (
            <div id="import-str-container" className="form-step">
                <div className="w-100">
                    <input type="file" id="STRFileUpload" className="form-control" accept=".tsv,.csv,.txt" onChange={this.props.processSTRUpload}/>
                    <div id="strEntries">
                        {this.props.data.STRData.map(entry => 
                            <STREntry
                            key={entry.id}
                            data={this.props.data}
                            entry={entry}
                            deleteSTR={this.props.deleteSTR}
                            deletePrompt={this.props.deletePrompt}
                            />
                        )}
                    </div>
                    <div className="btn btn-primary d-flex mt-5 mb-5 align-items-end justify-content-center" 
                    id="str-templates-open" 
                    onClick={this.toggleShowTemplates}>
                        <h4 className="mb-0">STR Template List &nbsp;</h4>
                        <h5 className="mb-0"><i className="bi bi-caret-down-fill" /></h5>
                    </div>
                    {this.state.showTemplates &&
                        <div id="strTemplates">
                        {this.props.data.STRTemplates.map(template =>
                            <STRTemplate 
                            processSTR={this.props.processSTR}
                            deleteSTR={this.props.deleteSTR}
                            key={template.id}
                            template={template}
                            imported={template.imported}
                            data={this.props.data}
                            setGraphData={this.props.setGraphData}
                            />
                        )}    
                    </div>
                    }
                </div>
            </div>
        )
    }
}

export default ImportSTR