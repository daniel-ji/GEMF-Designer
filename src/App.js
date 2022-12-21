import React, {Component} from 'react';
import Graphviz from 'graphviz-react';

import canvasToSvg from "canvas-to-svg";
import { saveAs } from 'file-saver';

import Form from './components/Form';
import GraphOverlay from './components/GraphOverlay';
import SiteModal from './components/SiteModal';

import './App.scss';    

import {
    WIDTH_RATIO, NODE_COLLIDE_RADIUS, NODE_RADIUS, FORM_STEPS,
    GRAPHVIZ_PARSE_DELAY, GRAPHVIZ_PARSE_RETRY_INTERVAL, STR_REGEX, INVALID_STR_FILE_ERROR,
    INVALID_STR_ENTRY_ERROR, INVALID_STR_SELF_LOOP_ERROR, INVALID_STR_NODE_NAME_ERROR,
    INVALID_STR_RATE_ERROR, CREATE_ENTRY_ID, COMPARE_GRAPH, DEFAULT_GRAPH_DATA
} from './Constants';

export class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // current graph data
            data: DEFAULT_GRAPH_DATA(),
            // node collision
            forceCollideRadius: NODE_COLLIDE_RADIUS,
            // form step counter
            step: 0,
            // graph interaction indicator style
            indicatorStyle: {},
            // stores graphviz component (dot-engine based graph rendering of user-inputted existing STR)
            strGraphviz: undefined,
            // form error messages
            formError: "",
            // if form error message is being hidden by user
            formErrorTrans: false,
            // if form error message is hidden
            formErrorHide: false,
            // flag for downloading graph
            downloading: false,
            // database for indexeddb
            db: undefined,
            savedGraphs: undefined,
            selectedGraph: undefined,
            // site modal
            modalAction: () => {},
            modalActionText: '',
            modalTitle: '',
            modalButtonType: '',
        }
    }

    componentDidMount() {
        // IndexedDB for Graph Loading / Saving
        const openRequest = indexedDB.open('data');

        // for when object store is updated, in this case initializing graphs object store if not created
        openRequest.onupgradeneeded = () => {
            const db = openRequest.result;

            if (!db.objectStoreNames.contains('graphs')) {
                db.createObjectStore('graphs', {keyPath: 'id'});
            }
        }

        openRequest.onsuccess = () => {
            const db = openRequest.result;
            this.setState({db}, this.getSavedGraphs);

            db.onversionchange = () => {
                db.close();
            }
            db.onerror = () => {
                alert("IndexedDB error, graph data may have not properly been saved.")
            }
            
            // set interval to update graph data every second
            setInterval(this.saveGraph, 1000)
            
            // save before close
            onbeforeunload = (e) => {
                e.preventDefault();
                this.saveGraph()
            }
        }

        // on indexeddb load error
        openRequest.onerror = () => {
            console.error(openRequest.error);
        }
    }

    /**
     * Fade out graph interaction indicator. 
     */
    indicatorFadeOut = () => {
        if (Object.keys(this.state.indicatorStyle).length === 0) {
            this.setState({indicatorStyle: {opacity: 0}});
            setTimeout(() => {
                this.setState({indicatorStyle: {display: "none"}});
            }, 500)
        }
    }

    /**
     * Increment form step, decrement by providing a negative value. 
     * 
     * @param {*} amount to increment step by 
     */
    incrementStep = (amount = 1, override = false) => {
        if (this.state.formError === "" || override) {
            this.setState(prevState => 
                ({step: Math.max(Math.min(prevState.step + amount, FORM_STEPS - 1), 0)}))
        } else {
            this.showFormError();
        }
    }

    /**
     * Set graph data. 
     * @param {*} data new data 
     * @param {*} callback callback function after update has finished
     */
    setGraphData = (data, callback) => {
        this.setState({data}, callback)
    }

    /**
     * Set STR data for current graph.
     * 
     * @param {*} data new STRData
     * @param {*} callback callback function after update has finished
     */
    setSTRData = (STRData, callback) => {
        this.setState(prevState => ({data: {
            ...prevState.data,
            STRData
        }}), callback)
    }

    /**
     * Save graph that is currently being edited.
     */
    saveGraph = () => {
        const data = this.state.data;

        if (this.state.db !== undefined) {
            this.state.db.transaction('graphs').objectStore('graphs').get(data.id).onsuccess = (e) => {
                if (e.target.result !== undefined) {
                    if (!COMPARE_GRAPH(data, e.target.result)) {
                        data.lastModified = new Date();
                    }
                    this.state.db.transaction('graphs', 'readwrite')
                    .objectStore('graphs')
                    .put(data)
                }
            }
        }
    }

    /**
     * Get saved graphs from IndexedDB.
     */
    getSavedGraphs = (callback) => {
        this.state.db.transaction('graphs')
        .objectStore('graphs')
        .getAll().onsuccess = (e) => {
            this.setState({savedGraphs: e.target.result.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))}, () => {
                callback !== undefined && callback();
            })
        }
    }

    /** 
     * Set graph to edit.
     */
    setGraph = (id) => {
        this.setState(prevState => {
            if (prevState.selectedGraph === id || id === undefined) {
                this.setGraphData(DEFAULT_GRAPH_DATA())
                return {selectedGraph: undefined}
            } else {
                this.setFormError("");
                this.setGraphData(this.state.savedGraphs.find(graph => graph.id === id));
                return {selectedGraph: id}
            }
        });
    }

    /**
     * Set form error message(s). Set message to empty string 
     * to remove error message.
     * 
     * @param {*} errors error messages 
     * @param {*} warn whether to just warn or actually error, default is to error
     */
    setFormError = (errors, warn = false) => {
        // if the error is just a string
        if (typeof errors === 'string') {
            if (errors === "") {
                this.hideFormError(true);
            } else {
                this.setState({formError: errors, formErrorHide: false})
            }
        // if the error is an array of errors
        } else {
            const error = errors.map(msg => <div>{msg}<br /></div>)
            this.setState({formError: error, formErrorHide: false})
        }

        // clear error if the error is only a warning
        if (warn) {
            setTimeout(() => this.setFormError(""), 3000)
        }
    }

    /**
     * Hide form error. Does not remove the error unless specified.  
     * 
     * @param {*} clear whether or not to remove / clear the error.
     */
    hideFormError = (clear = false) => {
        this.setState({formErrorTrans: true});
        setTimeout(() => this.setState({formErrorHide: true, formErrorTrans: false, formError: clear ? "" : this.state.formError}), 400);
    }

    /**
     * Show form error.
     */
    showFormError = () => {
        this.setState({formErrorHide: false})
    }

    /**
     * Update collision radius, used when generating new nodes to prevent overlapping. 
     * @param {*} radius collision radius 
     */
    setForceCollideRadius = (radius) => {
        this.setState({forceCollideRadius: radius})
    }

    /**
     * Download graph in given file type. Utilizes Canvas.toBlob (built-in) for PNG
     * and canvasToSvg (external library) for SVG. SVG is flawed, just a PNG in svg. 
     * 
     * @param {*} fileType file type of image to download 
     */
    downloadGraph = (fileType) => {
        if (this.state.data.nodes.length > 0) {
            const canvas = document.getElementsByClassName("force-graph-container")[0].firstChild;
    
            // set downloading to true immediately to call force-graph zoom to fit
            this.setState({downloading: true}, () => {
                // wait 1500ms before starting download process
                setTimeout(() => {
                    switch (fileType) {
                        case 'png':
                            canvas.toBlob(blob => {
                                saveAs(blob, "STRGraph.png");
                            })
                            break;
                        case 'svg':
                        default: 
                            const ctx = new canvasToSvg(2 * canvas.offsetWidth, 2 * canvas.offsetHeight);
                            ctx.drawImage(canvas, 0, 0, 2 * canvas.offsetWidth, 2 * canvas.offsetHeight);
                            const serializedSVG = ctx.getSerializedSvg();
                            saveAs(new Blob([serializedSVG], {type:"image/svg+xml;charset=utf-8"}), "STRGraph.svg");
                    }
                }, 1500)
            })
            // set download back to false to reset flag for next download
            setTimeout(() => this.setState({downloading: false}), 500);
        }
    }

    /**
     * Shows prompt to delete current graph.
     */
    deleteGraphPrompt = () => {
        this.setState({
            modalTitle: 'Delete Current Graph Data?', 
            modalAction: this.deleteGraph, 
            modalActionText: 'Delete',
            modalButtonType: 'danger'
        })
    }

    /**
     * Deletes current graph data. 
     */
    deleteGraph = () => {
        // update indexeddb
        this.state.db.transaction('graphs', 'readwrite')
        .objectStore('graphs')
        .delete(this.state.data.id)
        // update graph data
        this.setGraphData(DEFAULT_GRAPH_DATA());
        this.incrementStep(-10);
    }

    /**
     * Automatically draw graph from current nodes / links.
     */
    autoDraw = () => {
        const nodes = this.state.data.nodes;
        const links = this.state.data.links;

        if (nodes.length > 0) {
            // create graphviz from current data
            let dotNodeContent = '';
            for (const node of nodes) {
                dotNodeContent += node.name + ' ';
            }

            let dotLinkContent = '';
            for (const link of links) {
                dotLinkContent += 
                    `${link.source.name} -> ${link.target.name} [label = "${(link.inducer !== undefined ? nodes.find(node => node.id === link.inducer).name + ", " : "") + link.rate}"];\n`;
            }

            this.generateGraphviz(dotNodeContent, dotLinkContent);
        }
    }

    /**
     * Callback function for when user uploads existing STR file. 
     * Ensures file is in valid STR format and creates corresponding 
     * node and link object arrays for graphviz and force-graph use.
     * Generates graphviz svg visualization of nodes and edges as well.  
     * @param {*} event event that contains file contents
     */
    processSTR = (event) => {
        const reader = new FileReader();
        const data = Object.assign({}, this.state.data);
        const nodes = data.nodes;
        const links = data.links;

        reader.onload = (e) => {
            let errors = [];            
            let nodeID = this.state.data.nodes.length === 0 ? 
                0 : Math.max(...this.state.data.nodes.map(node => parseInt(node.id))) + 1;

            const newNodes = [];
            const newLinks = [];

            // parse STR for both graphviz and force-graph use
            const parsedSTR = e.target.result.split(/\r?\n/).map(row => row.split(/\t/));
            const getNodeID = (i, j) => nodes.find(node => node.name === parsedSTR[i][j]).id;
            const getNode = (id) => nodes.find(node => (node.id === id || node === id));

            // STR validation
            for (let i = 0; i < parsedSTR.length; i++) {
                // entry format check
                if (parsedSTR[i].length === 4) {
                    // valid node name check
                    if (parsedSTR[i][0].match(STR_REGEX) && parsedSTR[i][1].match(STR_REGEX) &&
                        parsedSTR[i][2].match(STR_REGEX)) {
                            // valid link (no self-loop) check 
                            if (parsedSTR[i][0] === parsedSTR[i][1]) {
                                !errors.includes(INVALID_STR_SELF_LOOP_ERROR) && errors.push(INVALID_STR_SELF_LOOP_ERROR);
                            }
                    } else {
                        !errors.includes(INVALID_STR_NODE_NAME_ERROR) && errors.push(INVALID_STR_NODE_NAME_ERROR);
                    }

                    // valid rate check
                    if (!(parseFloat(parsedSTR[i][3]) > 0)) {
                        !errors.includes(INVALID_STR_RATE_ERROR) && errors.push(INVALID_STR_RATE_ERROR);
                    }
                } else if (parsedSTR[i].length === 1 && parsedSTR[i][0] === '') {
                    // do nothing
                } else {
                    this.setFormError([INVALID_STR_ENTRY_ERROR]);
                    return;
                }
            }

            if (errors.length > 0) {
                this.setFormError(errors);
                return;
            }

            for (let i = 0; i < parsedSTR.length; i++) {
                if (parsedSTR[i].length === 4) {
                    for (let j = 0; j < parsedSTR[i].length; j++) {
                        const foundNode = nodes.map(node => node.name).indexOf(parsedSTR[i][j]) !== -1;
                        // source and target node
                        const nodeObject = {id: nodeID, name: parsedSTR[i][j], color: '#000000'}
                        if (j <= 1 && !foundNode) {
                            newNodes.push(nodeObject);
                            nodes.push(nodeObject);
                            nodeID++;
                        // inducer node
                        } else if (j === 2) {
                            if (parsedSTR[i][j] !== "None" && !foundNode) {
                                newNodes.push(nodeObject);
                                nodes.push(nodeObject);
                                nodeID++;
                            }
                        }
                    }
                    
                    
                    // add edge / node-based transition to links 
                    if (parsedSTR[i][2] === "None") {
                        const linkExists = links.find(link => 
                            (link.source.id ?? link.source) === getNodeID(i, 0) && 
                            (link.target.id ?? link.target) === getNodeID(i, 1) && 
                            link.inducer === undefined);
                        if (linkExists === undefined) {                            
                            const linkObject = {
                                id: getNodeID(i, 0) + "-" + getNodeID(i, 1),
                                shortName: parsedSTR[i][0] + " to " + parsedSTR[i][1] + " (nodal) ",
                                source: getNodeID(i, 0),
                                target: getNodeID(i, 1),
                                inducer: undefined,
                                rate: parseFloat(parsedSTR[i][3]),
                                color: '#000000',
                            }
                            newLinks.push(linkObject);
                            links.push(linkObject);
                        }
                    } else {
                        const linkExists = links.find(link => 
                            (link.source.id ?? link.source) === getNodeID(i, 0) &&
                            (link.target.id ?? link.target) === getNodeID(i, 1) && 
                            (link.inducer?.id ?? link.inducer) === getNodeID(i, 2));
                        if (linkExists === undefined) {
                            const linkObject = {
                                id: getNodeID(i, 0) + "-" + getNodeID(i, 1) + "-" 
                                    + getNodeID(i, 2),
                                shortName: parsedSTR[i][0] + " to " + parsedSTR[i][1] + " by " + parsedSTR[i][2],
                                source: getNodeID(i, 0),
                                target: getNodeID(i, 1),
                                inducer: getNodeID(i, 2),
                                rate: parseFloat(parsedSTR[i][3]), 
                                color: '#000000',
                            }
                            newLinks.push(linkObject);
                            links.push(linkObject);
                        }
                    }
                }
            }

            // create graphviz 
            let dotNodeContent = '';
            for (const node of nodes) {
                dotNodeContent += node.name + ' ';
            }

            let dotLinkContent = '';
            for (const link of links) {
                dotLinkContent += 
                    `${getNode(link.source).name} -> ${getNode(link.target).name} [label = "${(link.inducer !== undefined ? getNode(link.inducer).name + ", " : "") + link.rate}"];\n`;
            }

            // add data to strdata
            data.STRData = [...data.STRData, {
                id: CREATE_ENTRY_ID(),
                nodes: newNodes.map(node => node.id),
                links: newLinks.map(link => link.id),
                name: event.target.files[0].name
            }]

            this.setGraphData(data);

            if (newNodes.length > 0) {
                this.generateGraphviz(dotNodeContent, dotLinkContent);
            }
        }

        // valid plaintext file
        for (let i = 0; i < event.target.files.length; i++) {
            if (event.target.files[i].type.match(/^\s*$|(text)/)) {
                reader.readAsText(event.target.files[0]);
            } else {
                this.setFormError([INVALID_STR_FILE_ERROR]);
                break;
            }
        }
    }

    /**
     * Creates graph visualization using provided nodes and links
     * @param {*} dotNodeContent node content to pass into dot engine 
     * @param {*} dotLinkContent link content to pass into dot engine
     */
    generateGraphviz = (dotNodeContent, dotLinkContent) => {
        this.setState({strGraphviz: 
            <Graphviz 
            className="graph-overlay graph-viz"
            options={{
                width: window.innerWidth * WIDTH_RATIO,
                height: window.innerHeight
            }}
            dot={`digraph finite_state_machine {
                fontname="monospace"
                node [fontname="monospace" shape=circle fixedsize=shape]; ${dotNodeContent};
                edge [fontname="monospace"]
                rankdir=LR;
                ${dotLinkContent}
            }`}/>
        }, () => setTimeout(() => this.parseGraphvizSVG(this.state.data.nodes, this.state.data.links), GRAPHVIZ_PARSE_DELAY));
    }

    /**
     * Parses the created graphviz SVG to create corresponding visualization on 
     * actual force-graph interactive graph. Translates coordinates from the svg to
     * coordinates usable for the force-graph graph element. Utilizes the absolute position
     * of the svg element and interactive graph element through getBoundingClientRect(). 
     * @param {*} nodes 
     * @param {*} links 
     */
    parseGraphvizSVG = (nodes, links) => {
        const graph = document.getElementById("graph0");

        // in the case that rendering had not finished yet
        if (graph !== null) {
            const data = Object.assign({}, this.state.data);
            const graphDimensions = graph.getBoundingClientRect();
            // change center of graph to simplify math later on for determining node coordinates 
            const graphMiddleX = (graphDimensions.left + graphDimensions.right) / 2; 
            const graphMiddleY = (graphDimensions.top + graphDimensions.bottom) / 2;

            for (const child of graph.children) {
                if (child.classList.contains("node")) {
                    // calculate node coordinate
                    const ellipse = child.querySelector('ellipse');
                    const rect = ellipse.getBoundingClientRect();
                    const normalizedX = (rect.left - graphMiddleX) / graphMiddleX;
                    const normalizedY = (rect.top - graphMiddleY) / graphMiddleY;
                    const normalizedR = rect.width / graphDimensions.width;
                    // 2 instead of 1 for spacing out more
                    const scaleRatio = 2 / normalizedR * NODE_RADIUS;
                    // add node with proper coordinate scaling
                    const node = data.nodes.find(node => node.name === child.getElementsByTagName('title')[0].innerHTML);
                    node.fx = normalizedX * scaleRatio;
                    node.fy = normalizedY * scaleRatio;
                    node.x = normalizedX * scaleRatio;
                    node.y = normalizedY * scaleRatio;
                }
            }

            this.setGraphData(data);
        } else {
            // retry in 200ms if graph has not rendered yet
            setTimeout(() => this.parseGraphvizSVG(nodes, links), GRAPHVIZ_PARSE_RETRY_INTERVAL);
        }
    }

    /**
     * Delete STR entry. Removes from graph data as well. 
     * Only removes nodes if it is no longer a target, source, or inducer node.
     * Removes all STR entry links that still exist and were imported from given file.
     *  
     * @param {*} id id of STR entry
     */
    deleteSTR = (id) => {
        const data = Object.assign({}, this.state.data);
        const entryData = this.state.data.STRData.find(entry => entry.id === id);
        for (const linkID of entryData.links) {
            data.links.splice(data.links.findIndex(entry => entry.id === linkID), 1);
        }
        for (const nodeID of entryData.nodes) {
            const otherLinks = data.links.filter(link => (link.source.id === nodeID || 
                link.target.id === nodeID || link.inducer === nodeID) && !entryData.links.includes(link.id))

            if (otherLinks.length === 0) {
                data.nodes.splice(data.nodes.findIndex(entry => entry.id === nodeID), 1);
            }
        }
        this.setGraphData(data);
        this.setSTRData(this.state.data.STRData.filter(entry => entry.id !== id));
    }

    render() {        
        return (
        <div className="App">
            <div className="graph-overlay graph-indicator"
            onMouseDown={this.indicatorFadeOut}
            onTouchStart={this.indicatorFadeOut}
            style={this.state.indicatorStyle}>
                <p className="noselect">Click and Drag Graph to Interact</p>
            </div>
            {this.state.strGraphviz}
            <GraphOverlay 
            forceCollideRadius={this.state.forceCollideRadius}
            data={this.state.data}
            autoDraw={this.autoDraw}
            downloadGraph={this.downloadGraph}
            downloading={this.state.downloading}
            deleteGraphPrompt={this.deleteGraphPrompt}
            />
            <Form
            data={this.state.data}
            step={this.state.step}
            incrementStep={this.incrementStep}
            forceCollideRadius={this.state.forceCollideRadius}
            setForceCollideRadius={this.setForceCollideRadius}
            formError={this.state.formError}
            formErrorHide={this.state.formErrorHide}
            formErrorTrans={this.state.formErrorTrans}
            hideFormError={this.hideFormError}
            showFormError={this.showFormError}
            setFormError={this.setFormError}
            processSTR={this.processSTR}
            deleteSTR={this.deleteSTR}
            deleteGraph={this.deleteGraph}
            getSavedGraphs={this.getSavedGraphs}
            savedGraphs={this.state.savedGraphs}
            setGraph={this.setGraph}
            selectedGraph={this.state.selectedGraph}
            setGraphData={this.setGraphData}
            db={this.state.db}
            />
            <SiteModal 
            deleteGraph={this.deleteGraph}
            modalTitle={this.state.modalTitle}
            modalActionText={this.state.modalActionText}
            modalAction={this.state.modalAction}
            modalButtonType={this.state.modalButtonType}
            />
            <button type="button"
            id="showModalBtn"
            className="btn .d-none"
            data-bs-toggle="modal"
            data-bs-target="#siteModal"
            />
        </div>
        );
    }
}

export default App;
