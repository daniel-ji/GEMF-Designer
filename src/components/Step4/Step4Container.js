import React, { Component, Fragment } from 'react'

export class Step4Container extends Component {
    constructor(props) {
        super(props)

        this.state = {
            edgeEntries: []
        }
    }

    renderStep4 = () => {
        const data = this.props.globals.data;
    
        // when step4 is rendered, create entries for existing inducer-based links
        for (let i = 0; i < data.links.length; i++) {
            if (data.links[i].inducer !== undefined) {
                this.createEdgeEntry(data.links[i]);
            }
        }
    }

    addRate = () => {
        const data = Object.assign({}, this.props.globals.data);
        const selectSource = document.getElementById("selectSource");
        const selectTarget = document.getElementById("selectTarget");
        const selectInducer = document.getElementById("selectInducer");
        const rateInput = document.getElementById("rateInput");
        
        let valid = true;
        // ensure valid edge-based transition
        // can't be to self
        if (selectSource.value === selectTarget.value) {
            valid = false
            selectSource.className += " border border-danger";
            selectTarget.className += " border border-danger";
        } else {
            selectSource.classList.remove("border");
            selectSource.classList.remove("border-danger");
            selectTarget.classList.remove("border");
            selectTarget.classList.remove("border-danger");
        }

        // has to have rate
        if (rateInput.value.length === 0) {
            valid = false
            rateInput.className += " border border-danger";
        } else {
            rateInput.classList.remove("border");
            rateInput.classList.remove("border-danger");
        }

        // if edge-based link doesn't exist already 
        if (valid 
            && data.links.find(link => 
                link.source.id === parseInt(selectSource.value)
                && link.target.id === parseInt(selectTarget.value)
                && link.inducer === parseInt(selectInducer.value)
            ) === undefined) {
            // TODO: show alert when tries to add an existing link
            // add link 
            data.links.push({
                id: selectSource.value + "-" + selectTarget.value + "-" + selectInducer.value,
                shortName: selectSource.options[selectSource.selectedIndex].text[0] + "-" + selectTarget.options[selectTarget.selectedIndex].text[0] + ", " + selectInducer.options[selectInducer.selectedIndex].text[0],
                source: parseInt(selectSource.value),
                target: parseInt(selectTarget.value),
                inducer: parseInt(selectInducer.value),
                rate: rateInput.value,
            })

            this.props.updateGraphData(data);

            // create new entry based off link 
            this.createEdgeEntry(data.links[data.links.length - 1])
        }
    }
    
    // create entry for edge-based transition
    createEdgeEntry = (link) => {
        const data = this.props.globals.data;

        console.log(data);
        console.log(link);
        this.setState({edgeEntries: [...this.state.edgeEntries,
            <div key={link.id}>
                <div 
                style={{
                    display: "flex", 
                    flexWrap: "wrap",
                    justifyContent: "space-between"
                }} 
                className="mt-4 mb-3 w-100">
                    <div style={{width: "60%"}}>
                        <button
                        type="button"
                        className="btn btn-primary mb-3 w-100"
                        data-bs-toggle="collapse"
                        data-bs-target={"#collapseWidth-" + link.id}
                        aria-controls={"collapseWidth-" + link.id}
                        aria-expanded="false">
                            State Transition Edge {link.shortName}
                        </button>
                    </div>
                    <button 
                    className="btn btn-danger p-0 mb-3" 
                    style={{width: "10%"}}
                    onClick={(e) => {
                        const newData = Object.assign({}, this.props.globals.data);
                        newData.links = newData.links.filter(l => l.id !== link.id);
                        this.props.updateGraphData(newData);
                        this.setState({edgeEntries: this.state.edgeEntries.filter(element => 
                            element.key !== link.id
                        )})
                    }}>
                        <i className="bi bi-trash" />
                    </button>
                </div>
                <div>
                    <div 
                    className="collapse"
                    id={"collapseWidth-" + link.id}
                    style={{minHeight: "120px"}}>
                        <div className="card card-body w-100">
                            <p className="mb-1">Source: </p>
                            <input 
                            type="text" 
                            className="form-control mb-2"
                            disabled
                            readOnly
                            style={{width: "30%"}}
                            value={typeof link.source === 'number' ? 
                                data.nodes.find(n => n.id === link.source).name
                                : link.source.name}/>

                            <p className="mb-1">Target: </p>
                            <input 
                            type="text" 
                            className="form-control mb-2"
                            disabled
                            readOnly
                            style={{width: "30%"}}
                            value={typeof link.target === 'number' ? 
                                data.nodes.find(n => n.id === link.target).name
                                : link.target.name}/>

                            <p className="mb-1">Inducer: </p>
                            <input 
                            type="text" 
                            className="form-control mb-2"
                            disabled
                            readOnly
                            style={{width: "25%"}}
                            value={data.nodes.find(n => n.id === link.inducer).name}/>

                            <p className="mb-1">Rate: </p>
                            <input 
                            type="text" 
                            className="form-control mb-2"
                            disabled
                            readOnly
                            style={{width: "20%"}}
                            value={link.rate}/>
                        </div>
                    </div>
                </div>
            </div>
        ]})
    }

    componentDidMount() {
        this.renderStep4();
    }

    render() {
        const data = this.props.globals.data;

        return (
            <Fragment>
                <h3 className="title">Add Edge-Based Transition Rates</h3>
                <p>Select Source Node</p>
                <select
                className="form-select"
                aria-label="Select Source Node"
                id="selectSource">
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-source-" + node.id}>{node.name}</option>
                        )
                    })}
                </select>
                <p>Select Target Node</p>
                <select
                className="form-select"
                aria-label="Select Target Node"
                id="selectTarget">
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-target-" + node.id}>{node.name}</option>
                        )
                    })}
                </select>
                <p>Select Inducer Node</p>
                <select
                className="form-select"
                aria-label="Select Inducer Node"
                id="selectInducer">
                    {data.nodes.map(node => {
                        return (
                            <option key={node.id} value={node.id} id={"select-inducer-" + node.id}>{node.name}</option>
                        )
                    })}
                </select> 
                {/** TODO: put this in css*/}
                <div style={{display: "flex", justifyContent: "space-between"}} className="mb-3">
                    {/** is this outer div redundant?` */}
                    <div className="input-group" style={{width: "60%"}}>
                        <input
                        type="number"
                        className="form-control"
                        placeholder="Enter Trans. Rate"
                        aria-label="Enter Trans. Rate"
                        id="rateInput"/>
                    </div>
                    <button 
                    className="btn btn-success"
                    style={{width: "30%"}} 
                    onClick={this.addRate}>Add</button>
                </div>
                {this.state.edgeEntries}
            </Fragment>
        )
    }
}

export default Step4Container