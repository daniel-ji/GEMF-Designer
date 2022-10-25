import React, { Component, Fragment } from 'react'

export class Step2Container extends Component {
    constructor(props) {
        super(props)

        this.state = {
            edgeInputs: [],
            edgeCheckboxes: [],
            inputsChecked: [],
        }
    }
    
    componentDidMount() {
        this.renderStep2();
    }

    renderCheckbox = (data, i, j) => {
        return (
            <div key={data.nodes[i].id + "-" + data.nodes[j].id} className="form-check">
                <input 
                type="checkbox"
                className="form-check-input"
                id={"flexCheck" + data.nodes[i].id + "-" + data.nodes[j].id}
                checked={this.state.inputsChecked[i][j]}
                onChange={(e) => {
                    // add / remove link logic
                    if (!this.state.inputsChecked[i][j]) {
                        data.links.push({
                            id: data.nodes[i].id + "-" + data.nodes[j].id,
                            source: data.nodes[i].id,
                            target: data.nodes[j].id,
                        })
                    } else {
                        data.links.splice(
                            data.links.findIndex(
                                link => link.source.id === data.nodes[i].id 
                                && link.target.id === data.nodes[j].id 
                                // making sure not to remove any edge-based transitions
                                && link.inducer === undefined
                            )
                        , 1)
                    }
                    const newEdgeCheckboxes = Object.assign({}, this.state.edgeCheckboxes);
                    const newInputsChecked = Object.assign({}, this.state.inputsChecked);
                    newInputsChecked[i].splice(j, 1, !newInputsChecked[i][j]);
                    newEdgeCheckboxes[i].splice(j, 1, this.renderCheckbox(data, i, j))
                    this.setState({inputsChecked: newInputsChecked, edgeCheckboxes: newEdgeCheckboxes}, () => {
                        this.props.updateGraphData(data, () => {
                            this.renderStep2();
                        });
                    })
                }}/>
                <label className="form-check-label" htmlFor={"flexCheck" + data.nodes[i].id + "-" + data.nodes[j].id}>
                    {data.nodes[j].name}
                </label>
            </div>
        )
    }

    renderStep2 = () => {
        const data = Object.assign({}, this.props.globals.data);
        const inputsChecked = [];
        
        for (let i = 0; i < data.nodes.length; i++) {
            inputsChecked.push([]);
            for (let j = 0; j < data.nodes.length; j++) {
                inputsChecked[i][j] = !!data.links.find(obj => 
                    (obj.source === data.nodes[i].id || obj.source.id === data.nodes[i].id)
                    && (obj.target === data.nodes[j].id || obj.target.id === data.nodes[j].id)
                    && obj.inducer === undefined)
            }
        }

        this.setState({inputsChecked}, () => {
            const checkboxes = [];

            for (let i = 0; i < data.nodes.length; i++) {
                checkboxes.push([]);
                for (let j = 0; j < data.nodes.length; j++) {
                    if (i !== j) {
                        checkboxes[i].push(this.renderCheckbox(data, i, j))
                    } else {
                        checkboxes[i].push('')
                    }
                }
            }
            
            this.setState({edgeCheckboxes: checkboxes}, () => {
                const edgeInputs = [];

                // create an accordion header for each node, contains rest of nodes to link to
                for (let i = 0; i < data.nodes.length; i++) {
                    let open;
                    if (this.props.openedStep2) {
                        open = this.props.openAccordions.has(data.nodes[i].id);
                    } else {
                        open = i === 0;
                    }
                    edgeInputs.push(
                        <div className="accordion-item" key={data.nodes[i].id}>
                        <h2 className="accordion-header" id={"openAccordionHeading-" + data.nodes[i].id}>
                            <button
                            type="button"
                            className={"step2accordion-button accordion-button" + (open ? "" : " collapsed")}
                            data-bs-toggle="collapse"
                            data-bs-target={"#panels-collapse-" + data.nodes[i].id}
                            aria-expanded={open ? "true" : "false"}
                            aria-controls={"panels-collapse-" + data.nodes[i].id}
                            data-node-id={data.nodes[i].id}>
                            Links from State  {data.nodes[i].name + ":"}
                            </button>
                        </h2>
                        <div 
                        className={"accordion-collapse collapse" + (open ? " show" : "")} 
                        id={"panels-collapse-" + data.nodes[i].id}
                        aria-labelledby={"openAccordionHeading-" + data.nodes[i].id}>
                            <div className="accordion-body" id={"accordion-body-" + data.nodes[i].id}>
                                {this.state.edgeCheckboxes[i]}
                            </div>
                        </div>
                    </div>)
                }

                this.setState({edgeInputs});
            })
        })
    }

    render() {
        return (
            <Fragment>
                <h3 className="title">Add Edges To Nodes</h3>
                <div className="accordion" id="accordionOpen">
                    {this.state.edgeInputs}
                </div>
            </Fragment>
        )
    }
}

export default Step2Container