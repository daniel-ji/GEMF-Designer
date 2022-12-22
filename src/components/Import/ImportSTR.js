/**
 * Import existing STR file from user. Part of Form component.  
 */
import React, { Component } from 'react'
import Sortable from 'sortablejs';

import STREntry from './STREntry';
import { UPDATE_DATA_ORDER } from '../../Constants';

export class ImportSTR extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            sortable: undefined
        }
    }

    componentDidMount() {
        this.setState({sortable: new Sortable(document.getElementById('strEntries'), {
            onUpdate: (e) => {
                this.props.setGraphData(UPDATE_DATA_ORDER(e, this.props.data, 'STRData'), () => {
                    console.log(this.props.data);
                });
            }
        })})
    }

    render() {
        return (
            <div id="import-str-container" className="form-step">
                <div className="w-100">
                    <input type="file" id="formFile" className="form-control" accept=".tsv,.csv,.txt" onChange={this.props.processSTR}/>
                    <div id="strEntries">
                        {this.props.data.STRData.map(entry => 
                            <STREntry
                            key={entry.id}
                            data={this.props.data}
                            id={entry.id}
                            nodes={entry.nodes}
                            links={entry.links}
                            name={entry.name}
                            deleteSTR={this.props.deleteSTR}
                            deletePrompt={this.props.deletePrompt}
                            />
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default ImportSTR