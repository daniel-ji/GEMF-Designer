import React, { Component } from 'react'

import GraphComponent from './Graph';
import githubIcon from '../images/githubicon.png';

export class GraphOverlay extends Component {
    render() {
        return (
            <div id="graph-cover">
                <div className="graph-tl">
                    <h1 className="noselect">Graph View </h1>
                    <p className="noselect">
                        <span style={{color: "green"}}>Green</span> Transitions: Node-based<br/>
                        <span style={{color: "red"}}>Red</span> Transitions: Edge-based <br/>
                    </p>
                </div>
                <div className="graph-buttons">
                    <button className="btn btn-success auto-draw" onClick={this.props.autoDraw}>Auto-Draw</button>
                    <div className="dropdown">
                        <button className="btn btn-primary download-graph" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi bi-download"></i>
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => this.props.downloadGraph('svg')}>SVG</button></li>
                            <li><button className="dropdown-item" onClick={() => this.props.downloadGraph('png')}>PNG</button></li>
                        </ul>
                    </div>
                    <button type="button"
                    className="btn btn-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#siteModal"
                    onClick={this.props.deleteGraphPrompt}>
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
                <a className="github-button" href="https://github.com/daniel-ji/GEMF-Designer" target="_blank" rel="noreferrer" aria-label="github repo link">
                    <button className="btn btn-outline-dark p-0" aria-label="github repo button"><img src={githubIcon} alt="" /></button>
                </a>
                <GraphComponent globals={this.props.globals} STRdata={this.props.STRdata} downloading={this.props.downloading}/> 
            </div>
        )
    }
}

export default GraphOverlay