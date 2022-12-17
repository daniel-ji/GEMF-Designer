import React, { Component } from 'react'

import GraphEntry from './GraphEntry';

export class GraphEntryContainer extends Component {
    render() {
        console.log(this.props.savedGraphs);
        return (
            <div className="form-step">
                <h4 className="w-100 mb-4 text-center">Create New Graph</h4>
                <div className="d-flex flex-wrap justify-content-between w-100 mb-3">
                    <div className="input-group mb-4" style={{width: '77.5%'}}>
                        <input type="text" className="form-control" placeholder="Graph Name" aria-label="Username" />
                    </div>
                    <button 
                    className="btn btn-success p-0 mb-4" 
                    style={{minWidth: "17.5%"}}
                    onClick={this.createGraph}>
                        Add
                    </button>
                </div>
                <h4 className="w-100 text-center">Select Saved Graphs</h4>
                {this.props.savedGraphs.map(entry => 
                    <GraphEntry
                    key={entry.id}
                    data={entry}
                    deleteGraph={this.props.deleteSTR}
                    deletePrompt={this.props.deletePrompt}
                    />
                )}
            </div>
        )
    }
}

export default GraphEntryContainer