/**
 * Welcome page of Form component. 
 */
import React, { Component } from 'react'

export class Welcome extends Component {
  render() {
    return (
        <div id="welcome-container" className="form-step">
            <h6>State Transition Rates (STR) File Generation Process:</h6>
            <ul>
                <li>Create new or select existing graph</li>
                <li>Import existing STR (optional)
                    <ul>
                        <li>Only imports new nodes</li>
                        <li>Overrides existing links</li>
                    </ul>
                </li>
                <li>Add states (nodes)</li>
                <li>Add transitions (either edge-based and node-based)</li>
                <li>Adjust nodes and edges through graph or auto-format feature</li>
                <li>Download finished STR file</li>
            </ul>
            <h6>Graph Shortcuts (after creating nodes & while hovering over graph): </h6>
            <ul>
                <li>Shift + G: Toggle Snap Mode with Gridlines.</li>
                {/**<li>Shift + A: Auto-Draw.</li>
                <li>Shift + S: Download Graph as SVG.</li>
                <li>Shift + P: Download Graph as PNG.</li>**/}
            </ul>
            <br></br>
            <footer className="text-center mb-3">Created by Daniel Ji (daji@ucsd.edu)<br></br> UCSD Undergraduate Student Researcher for Professor <a href="https://www.niema.net" target="_blank" rel="noreferrer">Niema Moshiri</a></footer>
        </div>
    )
  }
}

export default Welcome