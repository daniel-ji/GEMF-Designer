/**
 * Graph input container component. Part of Form component.  
 */
import React, { Component } from 'react'
import Sortable from 'sortablejs';

import GraphEntry from './GraphEntry';
import { CREATE_ENTRY_ID, DEFAULT_GRAPH_DATA, FETCH_STR_TEMPLATES, UPDATE_DATA_DEL, UPDATE_DATA_ORDER } from '../../Constants';

export class GraphEntryContainer extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            newGraphName: '',
            sortable: undefined,
        }
    }

    /**
     * Update entries to ensure they contain any new graph edits and set up Sortable.
     */
    componentDidMount() {
        this.props.getSavedGraphs();

        this.setState({sortable: new Sortable(document.getElementById('graphEntries'), {
            onUpdate: (e) => {
                const savedGraphs = JSON.parse(JSON.stringify(this.props.savedGraphs));
                const updatedGraphs = UPDATE_DATA_ORDER(e, savedGraphs);
                const tx = this.props.db.transaction('graphs', 'readwrite');
                tx.oncomplete = () => {
                    this.props.getSavedGraphs();
                }
                for (const savedGraph of updatedGraphs) {
                    tx.objectStore('graphs').put(savedGraph)
                }
            }
        })})
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
    createGraph = async () => {
        // ensure graph name doesn't exist already
        if (this.state.newGraphName === '') {
            this.props.setFormError("Graph name cannot be empty.", true);
        } else if (!this.props.savedGraphs.map(entry => entry.name).includes(this.state.newGraphName)) {
            const data = Object.assign({}, this.props.data);
            data.name = this.state.newGraphName;
            data.id = CREATE_ENTRY_ID();
            data.lastModified = new Date();
            data.order = this.props.savedGraphs.length;
            data.STRTemplates = await FETCH_STR_TEMPLATES();
            this.setState({newGraphName: ''});
    
            // update graph data with new name and put data in IndexedDB
            this.props.setGraphData(data, () => {
                this.props.db.transaction('graphs', 'readwrite')
                .objectStore('graphs')
                .put(data).onsuccess = () => {
                    this.props.getSavedGraphs(() => {
                        this.props.setGraph(data.id);
                    });   
                }
            })
        } else {
            this.props.setFormError("Graph name already exists.", true);
        }
    }

    /**
     * Delete graph entry.
     * 
     * @param {*} id id of graph to delete
     */
    deleteGraphEntry = (id) => {
        const order = this.props.savedGraphs.find(graph => graph.id === id).order;
        this.props.db.transaction('graphs', 'readwrite')
        .objectStore('graphs')
        .delete(id).onsuccess = () => {
            // if current graph was deleted
            if (id === this.props.selectedGraph) {
                this.props.setGraph(undefined);
                this.props.setGraphData(DEFAULT_GRAPH_DATA())
            }

            this.props.getSavedGraphs(() => {
                const savedGraphs = JSON.parse(JSON.stringify(this.props.savedGraphs));
                const updatedGraphs = UPDATE_DATA_DEL(order, savedGraphs);
                for (const savedGraph of updatedGraphs) {
                    if (savedGraph.id === this.props.selectedGraph) {
                        const data = Object.assign({}, this.props.data);
                        data.order = savedGraph.order;
                        this.props.setGraphData(data);
                    }
                    this.props.db.transaction('graphs', 'readwrite')
                    .objectStore('graphs')
                    .put(savedGraph);
                }
            });
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
                <div id="graphEntries">
                    {this.props.savedGraphs.map(entry => 
                        <GraphEntry
                        key={entry.id}
                        data={entry}
                        deleteGraphEntry={this.deleteGraphEntry}
                        deletePrompt={this.props.deletePrompt}
                        setGraph={this.props.setGraph}
                        setGraphData={this.props.setGraphData}
                        selected={this.props.selectedGraph === entry.id}
                        db={this.props.db}
                        />
                    )}
                </div>
            </div>
        )
    }
}

export default GraphEntryContainer