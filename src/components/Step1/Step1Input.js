import React, { Component, Fragment } from 'react'

export class Step1Input extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
        deleted: false,
        inputCreated: false,
        inputValue: '',
        count: this.props.inputCounter,
      }
    }

    updateInput = (e) => {
        this.setState({inputValue: e.target.value})

        const data = Object.assign({}, this.props.globals.data);
        console.log(data);
        // if the input has not been created
        if (!this.state.inputCreated) {
            // set the input to have been created
            this.setState({inputCreated: true})
            // create a new node (and push it to the data.nodes) and give the new node's name a value of whatever was input
            data.nodes.push({
                id: this.state.count,
                name: e.target.value,
                x: 0,
                y: 0
            })
            // temporarily sets the collision force to the whole node radius so that nodes do not intersect on creation
            this.props.setForceCollideRadius(this.props.globals.NODE_RADIUS * 1.2);
            this.props.updateGraphData(data);
            setTimeout(() => this.props.setForceCollideRadius(this.props.globals.NODE_RADIUS / 2), 400)
            // set up a new blank input box 
            this.props.createNewInput();
        } else {
            // find the pre-existing node by id
            let node = data.nodes.find(x => x.id === this.state.count);
            // remove any red border
            e.target.parentNode.classList.remove("border");
            e.target.parentNode.classList.remove("border-danger");
            // updates the name to the new value in the input
            node.name = e.target.value;
            this.props.updateGraphData(data);
        }
    }

    deleteInput = () => {
        const data = Object.assign({}, this.props.globals.data);
        if (this.state.inputCreated) {
            data.nodes.splice(data.nodes.findIndex(node => node.id === this.state.count), 1);
            while (data.links.findIndex(link => link.source.id === this.state.count || link.target.id === this.state.count) !== -1) {
                data.links.splice(data.links.findIndex(link => link.source.id === this.state.count || link.target.id === this.state.count), 1)
            }
            this.props.updateGraphData(data);
            this.setState({deleted: true})
        }
    }

    render() {
        return (
            <Fragment>
                {this.state.deleted ? <div></div> : 
                <div className="input-group mb-3 w-100">
                    <input id={'s-1-input-' + this.state.count} className='form-control' type="text" placeholder='State Name' aria-label='State Name' value={this.state.inputValue} onChange={this.updateInput}></input>
                    <button id={"button-addon-" + this.state.count} className="btn btn-danger" type="button" onClick={this.deleteInput}>Delete</button>
                </div>}
            </Fragment>
        )
    }
}

export default Step1Input