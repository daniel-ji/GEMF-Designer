import React, { Component, Fragment } from 'react'

export class Welcome extends Component {
  render() {
    return (
        <Fragment>
            <h5 className="text-center">State Visualization Tool for Dr. Niema Moshiri's GEMF_FAVITES.py (Generalized Epidemic Modeling Framework)</h5>
            <br></br>
            <h6>STR Generation Process:</h6>
            <ul>
                <li>Import existing STR (optional)</li>
                <li>Add states (nodes)</li>
                <li>Add transitions (either edge-based and node-based)</li>
                <li>Adjust nodes and edges through graph or auto-format feature</li>
                <li>Download finished STR file</li>
            </ul>
            <br></br>
            <footer className="text-center mb-3">Created by Daniel Ji (daji@ucsd.edu)<br></br> UCSD Undergraduate Student Researcher for Professor <a href="https://www.niema.net" target="_blank" rel="noreferrer">Niema Moshiri</a></footer>
        </Fragment>
    )
  }
}

export default Welcome