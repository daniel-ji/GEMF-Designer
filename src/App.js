import React, {Component} from 'react';
import Graphviz from 'graphviz-react';

import GraphComponent from './components/Graph';
import Form from './components/Form';

import './App.scss';    
import githubIcon from './images/githubicon.png';

import {
    WIDTH_RATIO, NODE_COLLIDE_RADIUS, NODE_RADIUS, ARROW_SIZE, FORM_STEPS,
    GRAPHVIZ_PARSE_DELAY, GRAPHVIZ_PARSE_RETRY_INTERVAL, STR_REGEX, INVALID_STR_FILE_ERROR,
    INVALID_STR_ENTRY_ERROR, INVALID_STR_SELF_LOOP_ERROR, INVALID_STR_NODE_NAME_ERROR,
    INVALID_STR_RATE_ERROR
} from './Constants';

export class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // global variables to be used across components
            globals: {
                NODE_RADIUS: NODE_RADIUS,
                ARROW_SIZE: ARROW_SIZE,
                data: {
                    nodes: [],
                    links: [],
                    linkCounter: {},
                },
                // form step counter
                step: 0,
            },
            // graph interaction indicator style
            indicatorStyle: {},
            // stores graphviz component (dot-engine based graph rendering of user-inputted existing STR)
            strGraphviz: undefined,
            // stores STR data,
            STRdata: [],
            // form error messages
            formError: "",
            // if form error message is being hidden by user
            formErrorTrans: false,
            // if form error message is hidden
            formErrorHide: false,
        }

        this.state.globals.forceCollideRadius = NODE_COLLIDE_RADIUS
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
                ({globals: {
                    ...prevState.globals, 
                    step: Math.max(Math.min(prevState.globals.step + amount, FORM_STEPS - 1), 0)
                }}))
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
        this.setState(prevState => ({globals: {
            ...prevState.globals,
            data
        }}), callback)
    }

    /**
     * Set form error message(s). Set message to empty string 
     * to remove error message.
     * 
     * @param {*} errors error messages 
     * @param {*} warn whether to just warn or actually err
     */
    setFormError = (errors, warn = false) => {
        if (typeof errors === 'string') {
            if (errors === "") {
                this.hideFormError(true);
            } else {
                this.setState({formError: errors, formErrorHide: false})
            }
        } else {
            const error = errors.map(msg => <div>{msg}<br /></div>)
            this.setState({formError: error, formErrorHide: false})
        }

        if (warn) {
            setTimeout(() => this.setFormError(""), 3000)
        }
    }

    hideFormError = (clear = false) => {
        this.setState({formErrorTrans: true});
        setTimeout(() => this.setState({formErrorHide: true, formErrorTrans: false, formError: clear ? "" : this.state.formError}), 400);
    }

    showFormError = () => {
        this.setState({formErrorHide: false})
    }

    /**
     * Update collision radius, used when generating new nodes to prevent overlapping. 
     * @param {*} radius collision radius 
     */
    setForceCollideRadius = (radius) => {
        this.setState(prevState => 
            ({globals: {
                ...prevState.globals, 
                forceCollideRadius: radius
            }}))
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
        const data = Object.assign({}, this.state.globals.data);
        const nodes = data.nodes;
        const links = data.links;

        reader.onload = (e) => {
            let errors = [];            
            let nodeID = this.state.globals.data.nodes.length === 0 ? 
                0 : Math.max(...this.state.globals.data.nodes.map(node => parseInt(node.id))) + 1;

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
                        const nodeObject = {id: nodeID, name: parsedSTR[i][j]}
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
                                rate: parseFloat(parsedSTR[i][3])
                            }
                            newLinks.push(linkObject);
                            links.push(linkObject);
                        }
                    } else {
                        console.log(links);
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
                                rate: parseFloat(parsedSTR[i][3])
                            }
                            newLinks.push(linkObject);
                            links.push(linkObject);
                        }
                    }
                }
            }

            let dotNodeContent = '';
            for (const node of nodes) {
                dotNodeContent += node.name + ' ';
            }

            // create graphviz 
            let dotContent = '';
            for (const link of links) {
                console.log(link.source);
                console.log(getNode(link.source));
                dotContent += 
                    `${getNode(link.source).name} -> ${getNode(link.target).name} [label = "${(link.inducer !== undefined ? getNode(link.inducer).name + ", " : "") + link.rate}"];\n`;
            }

            // add data to strdata
            this.setState({STRdata: [...this.state.STRdata, {
                id: Math.floor(Math.random() * 1000000000),
                nodes: newNodes.map(node => node.id),
                links: newLinks.map(link => link.id),
                name: event.target.files[0].name
            }]})

            this.setGraphData(data);

            if (newNodes.length > 0) {
                this.setState({strGraphviz: 
                    <Graphviz 
                    className="graph-overlay graph-viz"
                    options={{
                        width: window.innerWidth * WIDTH_RATIO,
                        height: window.innerHeight
                    }}
                    dot={`digraph finite_state_machine {
                        fontname="monospace"
                        node [fontname="monospace"]; ${dotNodeContent};
                        edge [fontname="monospace"]
                        rankdir=LR;
                        node [shape = circle];
                        ${dotContent}
                    }`}/>
                }, () => setTimeout(() => this.parseGraphvizSVG(nodes, links), GRAPHVIZ_PARSE_DELAY));
            }
        }

        // valid plaintext file
        for (let i = 0; i < event.target.files.length; i++) {
            if (event.target.files[i].type.match(/^\s*$|(text\/plain)/)) {
                reader.readAsText(event.target.files[0]);
            } else {
                this.setFormError([INVALID_STR_FILE_ERROR]);
                break;
            }
        }
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
            const data = Object.assign({}, this.state.globals.data);
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
                    const scaleRatio = 2 / normalizedR * this.state.globals.NODE_RADIUS;
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

    deleteSTR = (id) => {
        this.setState({STRdata: this.state.STRdata.filter(entry => entry.id !== id)}, () => console.log(this.state.STRdata))
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
            <div id="graph-cover">
                <h1 className="noselect">Graph View </h1>
                <p className="noselect">
                    Legend:<br/>
                    <span style={{color: "green"}}>Green</span> Links: Node-based Transition<br/>
                    <span style={{color: "red"}}>Red</span> Links: Edge-based Transition
                </p>
                <a href="https://github.com/daniel-ji/GEMF-Designer" target="_blank" rel="noreferrer" aria-label="github repo link">
                    <button className="btn btn-outline-dark p-0 github-button" aria-label="github repo button"><img src={githubIcon} alt="" /></button>
                </a>
                <GraphComponent globals={this.state.globals}/> 
            </div>
            <Form
            globals={this.state.globals} 
            incrementStep={this.incrementStep}
            setGraphData={this.setGraphData}
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
            STRdata={this.state.STRdata}/>
        </div>
        );
    }
}

export default App;
