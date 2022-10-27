/**
 * Final data output component. Part of Form component.  
 */
import React, { Component } from 'react'

export class FinalData extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // store output data, as string (for download) and as react elements (for display)
            tsvData: "",
            tableData: [],
        }
    }

    // display finished str tsv results
    renderData = () => {
        const data = this.props.globals.data;
        let tsvData = ""; 

        const tableData = data.links.map(link => {
            const fromState = link.source.name;
            const toState = link.target.name;
            const inducerState = data.nodes.find(node => node.id === link.inducer)?.name ?? "None";
            const rate = link.rate;

            // use url encoding for tabs / new lines 
            tsvData += fromState + "%09" + toState + "%09" + inducerState + "%09" + rate + "%0D%0A";
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
                <button className="w-100 btn btn-primary" id="btn" onClick={() => {
                    // create temporary element for download 
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + this.state.tsvData);
                    element.setAttribute('download', "STR.tsv");
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }}>Download</button>
            </div>
        )
    }
}

export default FinalData