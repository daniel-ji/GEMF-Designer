/**
 * Import existing STR file from user. Part of Form component.  
 */
import React, { Component } from 'react'

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
                    <label htmlFor="formFile" className="form-label"><h4>Upload Existing State Transition Rates File</h4></label>
                    <input type="file" id="formFile" className="form-control" accept=".tsv,.csv,.txt" onChange={this.props.processSTR}/>
                </div>
            </div>
        )
    }
}

export default ImportSTR