/**
 * Final data output component. Part of Form component.  
 */
import React, { Component } from 'react'
import { saveAs } from 'file-saver'

export class FinalData extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // store output data, as string (for download) and as react elements (for display)
            STRText: "",
            STRData: [],
            downloadSTR: true,
            // for infected states file
            infectedData: [],
            infectedText: '',
            downloadInfected: true,
        }
    }

    componentDidMount() {
        this.renderData();
    }

    /**
     * Display final TSV results parsed from data. Creates both UI table data and data to download.
     */
    renderData = () => {
        const data = this.props.data;
        let STRText = ""; 

        const STRData = data.links.map(link => {
            const fromState = link.source.name;
            const toState = link.target.name;
            const inducerState = data.nodes.find(node => node.id === link.inducer)?.name ?? "None";
            const rate = link.rate;

            STRText += fromState + "\t" + toState + "\t" + inducerState + "\t" + rate + "\n";
            return (
                <tr key={fromState + "-" + toState + "-" + inducerState}>
                    <td>{fromState}</td>
                    <td>{toState}</td>
                    <td>{inducerState}</td>
                    <td>{rate}</td>
                </tr>
            )
        })

        let infectedText = '';

        const infectedData = data.nodes.filter(node => node.infected)
        .map(node => {
            infectedText += node.name + '\n';
            return (
                <tr key={node.id}>
                    <td>{node.name}</td>
                </tr>
            )
        })

        this.setState({STRData, STRText, infectedData, infectedText})
    }

    setDownloadSTR = (e) => {
        this.setState({downloadSTR: e.target.checked})
    }

    setDownloadInfected = (e) => {
        this.setState({downloadInfected: e.target.checked})
    }

    downloadFiles = () => {
        this.state.downloadSTR && 
        saveAs(new Blob([this.state.STRText], {type: "text/plain;charset=utf-8"}), this.props.data.name + "_STR.tsv")
        this.state.downloadInfected && 
        saveAs(new Blob([this.state.infectedText], {type: "text/plain;charset=utf-8"}), this.props.data.name + "_INFECTED_STATES.tsv")
    }

    render() {
        return (
            <div className="form-step">
                <div className="d-flex">
                    <h3 className="title">State Transition Rates &nbsp;</h3>
                    <h4><input
                    className="form-check-input"
                    type="checkbox"
                    id="downloadSTR"
                    checked={this.state.downloadSTR}
                    onChange={this.setDownloadSTR}/></h4>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Source</th>
                            <th scope="col">Target</th>
                            <th scope="col">Inducer</th>
                            <th scope="col">Transition Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.STRData}
                    </tbody>
                </table>
                <div className="d-flex">
                    <h3 className="title">Infected States &nbsp;</h3>
                    <h4><input
                    className="form-check-input"
                    type="checkbox"
                    id="downloadInfected"
                    checked={this.state.downloadInfected}
                    onChange={this.setDownloadInfected}/></h4>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">States</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.infectedData}
                    </tbody>
                </table>
                <button className="w-100 btn btn-primary" id="btn" 
                    onClick={this.downloadFiles}>
                    Download
                </button>
            </div>
        )
    }
}

export default FinalData