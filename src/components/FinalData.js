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
            tsvData: "",
            tableData: [],
        }
    }

    /**
     * Display final TSV results parsed from data. Creates both UI table data and data to download.
     */
    renderData = () => {
        const data = this.props.data;
        let tsvData = ""; 

        const tableData = data.links.map(link => {
            const fromState = link.source.name;
            const toState = link.target.name;
            const inducerState = data.nodes.find(node => node.id === link.inducer)?.name ?? "None";
            const rate = link.rate;

            tsvData += fromState + "\t" + toState + "\t" + inducerState + "\t" + rate + "\n";
            return (
                <tr key={fromState + "-" + toState + "-" + inducerState}>
                    <td>{fromState}</td>
                    <td>{toState}</td>
                    <td>{inducerState}</td>
                    <td>{rate}</td>
                </tr>
            )
        })

        this.setState({tableData, tsvData})
    }

    componentDidMount() {
        this.renderData();
    }

    render() {
        return (
            <div className="form-step">
                <h3 className="title">Finished State Transition Rates</h3>
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
                        {this.state.tableData}
                    </tbody>
                </table>
                <button className="w-100 btn btn-primary" id="btn" 
                    onClick={() => saveAs(new Blob([this.state.tsvData], {type: "text/plain;charset=utf-8"}), "STR.tsv")}>
                    Download
                </button>
            </div>
        )
    }
}

export default FinalData