/**
 * Graph component of site, including graph itself. 
 */
import React, { Component } from 'react'

import GraphComponent from './Graph';

export class GraphOverlay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // ruler / gridlines snap mode delay
            snapModeDelayed: false,
            // downloading graph as graphic
            downloading: false,
            downloadDelayed: false,
            // for recording when shortcut button is pressed
            shortcutMode: false,
            // if user is hovering mouse over graph
            graphFocused: false,
            // graph interaction indicator style
            indicatorStyle: {},
            hoveringUndo: false,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.graphUndo && !prevProps.graphUndo) {
            setTimeout(() => {
                this.props.hideGraphUndo();
            }, 10000)
        }
    } 

    componentDidMount() {
        // Snap feature for graph
        document.onkeydown = (e) => {
            if (e.key === "Shift") {
                this.setState({shortcutMode: true})
            }

            if (this.state.graphFocused && this.state.shortcutMode) {
                // toggling snap mode with delay
                if (e.key === "G") {
                    this.toggleGrid();
                } else if (e.key === "S") {
                    this.startDownload('SVG');
                } else if (e.key === "P") {
                    this.startDownload("PNG");
                } else if (e.key === "A") {
                    this.props.autoDraw();
                }
            }
        }

        // turning off shortcut mode 
        document.onkeyup = (e) => {
            if (e.key === "Shift") {
                this.setState({shortcutMode: false})
            }
        }

        // detecting if graph is focused
        document.onmousemove = (e) => {
            if (e.target.nodeName === "CANVAS") {
                this.setState({graphFocused: true})
            } else {
                this.setState({graphFocused: false})
            }
        }
    }

    /**
     * Toggle gridlines.
     */
    toggleGrid = () => {
        if (!this.state.snapModeDelayed) {
            this.props.toggleSnapMode();
            this.setState({snapModeDelayed: true})
            setTimeout(() => this.setState({snapModeDelayed: false}), 100)
        }
    }

    /**
     * Start download of graph as PNG / SVG. 
     * @param {*} fileType file type of graphic to download
     */
    startDownload = (fileType) => {
        if (!this.state.downloadDelayed) {
            this.setState({downloading: fileType, downloadDelayed: true});
            setTimeout(() => this.setState({downloading: false}), 500);
            setTimeout(() => this.setState({downloadDelayed: false}), 1000)
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

    render() {
        return (
            <div id="graph-cover">
                <div className="graph-overlay" id="graph-indicator"
                onMouseDown={this.indicatorFadeOut}
                onTouchStart={this.indicatorFadeOut}
                style={this.state.indicatorStyle}>
                    <p className="noselect">Click and Drag Graph to Interact</p>
                </div>
                <div className="graph-tl">
                    <h1 className="noselect">Graph View </h1>
                </div>
                <div className="graph-buttons">
                    <button className="btn btn-primary toggle-grid" onClick={this.toggleGrid}>Toggle Grid</button>
                    <button className="btn btn-primary auto-draw" onClick={this.props.autoDraw}>Auto-Draw</button>
                    <div className="dropdown">
                        <button className="btn btn-success download-graph" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi bi-download"></i>
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item"  onClick={() => this.startDownload('SVG')}>SVG</button></li>
                            <li><button className="dropdown-item" onClick={() => this.startDownload('PNG')}>PNG</button></li>
                        </ul>
                    </div>
                    <button type="button"
                    id="deleteGraphBtn"
                    className="btn btn-danger"
                    onClick={this.props.deleteGraphDataPrompt}>
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
                <GraphComponent 
                forceCollideRadius={this.props.forceCollideRadius}
                data={this.props.data}
                downloading={this.state.downloading}
                snapMode={this.props.snapMode}
                shortcutLink={this.props.shortcutLink}
                setModal={this.props.setModal}
                /> 
                {this.props.graphUndo &&
                <div className="alert alert-dark" id="undo-alert" role="alert" onMouseLeave={this.delayHideGraphUndo}>
                    <p>Auto-draw complete.</p>
                    <button type="button" className="btn btn-outline-primary" onClick={this.props.undoGraph}>Undo</button>
                </div>
                }
            </div>
        )
    }
}

export default GraphOverlay