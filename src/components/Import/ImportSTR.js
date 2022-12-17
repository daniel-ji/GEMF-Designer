/**
 * Import existing STR file from user. Part of Form component.  
 */
import React, { Component } from 'react'

import STREntry from './STREntry';

export class ImportSTR extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }

    render() {
        return (
            <div id="import-str-container" className="form-step">
                <div className="w-100">
                    <input type="file" id="formFile" className="form-control" accept=".tsv,.csv,.txt" onChange={this.props.processSTR}/>
                    {this.props.STRdata.map(entry => 
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
        )
    }
}

export default ImportSTR