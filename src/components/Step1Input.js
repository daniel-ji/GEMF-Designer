import React, { Component, Fragment } from 'react'

export class Step1Input extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
        data: this.props.globals.data,
        deleted: false,
        inputCreated: false,
      }
    }

    updateInput = (e) => {
        const data = Object.assign({}, this.props.globals.data);
        // if the input has not been created
        if (!this.state.inputCreated) {
            // set the input to have been created
            this.setState({inputCreated: true})
            // create a new node (and push it to the data.nodes) and give the new node's name a value of whatever was input
            data.nodes.push({
                id: this.props.count,
                name: e.target.value,
                x: 0,
                y: 0
            })
            // temporarily sets the collision force to the whole node radius so that nodes do not intersect on creation
            this.props.setForceCollideRadius(this.props.globals.NODE_RADIUS * 1.2);
            this.props.updateGraphData(data);
            console.log(data)
            setTimeout(() => this.props.setForceCollideRadius(this.props.globals.NODE_RADIUS / 2), 400)
            // set up a new blank input box 
            this.props.createNewInput();
            setTimeout(() => console.log(this.props.globals.data), 0);
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

    render() {
        return (
            <Fragment>
                {this.state.deleted ? <div></div> : 
                <div className="input-group mb-3 w-100">
                    <input id={'s-1-input-' + this.props.inputCounter} className='form-control' type="text" placeholder='State Name' aria-label='State Name' onChange={this.updateInput}></input>
                    <button id={"button-addon-" + this.props.inputCounter} className="btn btn-danger" type="button" onClick={() => this.setState({deleted: true})}>Delete</button>
                </div>}
            </Fragment>
        )
    }
}

export default Step1Input