/**
 * Graph input container component. Part of Form component.  
 */
import React, { Component } from 'react'

import GraphEntry from './GraphEntry';
import { CREATE_ENTRY_ID } from '../../Constants';

export class GraphEntryContainer extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            newGraphName: '',
        }
    }

    /**
     * Update entries to ensure they contain any new graph edits.  
     */
    componentDidMount() {
        this.props.getSavedGraphs();
    }

    /**
     * Update graph name input value. 
     * 
     * @param {*} e input event
     */
    updateNewGraphName = (e) => {
        this.setState({newGraphName: e.target.value})
    }

    /**
     * Create new graph and update IndexedDB and components.
     */
    createGraph = () => {
        // ensure graph name doesn't exist already
        if (!this.props.savedGraphs.map(entry => entry.name).includes(this.state.newGraphName)) {
            const data = Object.assign({}, this.props.data);
            data.name = this.state.newGraphName;
            data.id = CREATE_ENTRY_ID();
            data.lastModified = new Date();
            this.setState({newGraphName: ''});
    
            // update graph data with new name and put data in IndexedDB
            this.props.setGraphData(data, () => {
                this.props.db.transaction('graphs', 'readwrite')
                .objectStore('graphs')
                .put(data).onsuccess = () => {
                    this.props.getSavedGraphs();
                }
            })
        } else {
            this.props.setFormError("Graph name already exists.", true);
        }
    }

    /**
     * Prompt delete graph entry.
     * 
     * @param {*} id id to pass into actual delete function
     */
     deletePrompt = (id) => {
        this.props.deletePrompt(() => this.deleteGraphEntry(id));
    }

    /**
     * Delete graph entry.
     * 
     * @param {*} id id of graph to delete
     */
    deleteGraphEntry = (id) => {
        this.props.db.transaction('graphs', 'readwrite')
        .objectStore('graphs')
        .delete(id).onsuccess = () => {
            // if current graph was deleted
            if (id === this.props.selectedGraph) {
                this.props.setGraph(undefined);
                const newData = Object.assign({}, this.props.data);
                newData.id = CREATE_ENTRY_ID();
                this.props.setGraphData(newData);
            }

            this.props.getSavedGraphs();
        }
    }

    render() {
        return (
            <div className="form-step">
                <h4 className="w-100 mb-4 text-center">Create New Graph</h4>
                <div className="d-flex flex-wrap justify-content-between w-100 mb-3">
                    <div className="input-group mb-4" style={{width: '77.5%'}}>
                        <input type="text" className="form-control" placeholder="Graph Name" aria-label="Username" 
                        value={this.state.newGraphName} onChange={this.updateNewGraphName}/>
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
                    deleteGraphEntry={this.deleteGraphEntry}
                    deletePrompt={this.props.deletePrompt}
                    setGraph={this.props.setGraph}
                    selected={this.props.selectedGraph === entry.id}
                    db={this.props.db}
                    />
                )}
            </div>
        )
    }
}

export default GraphEntryContainer