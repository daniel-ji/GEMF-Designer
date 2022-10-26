import React, { Component, Fragment } from 'react'

export class AddNodesInput extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
        deleted: false,
        inputCreated: this.props.inputValue === undefined ? false : true,
        inputValue: this.props.inputValue ?? '',
        count: this.props.inputCounter,
      }
    }

    /**
     * Updates input value, whether that means creating a new node or updating the value of an 
     * existing input. 
     * @param {*} e event
     */
    updateInput = (e) => {
        this.setState({inputValue: e.target.value})
        const data = Object.assign({}, this.props.globals.data);
        if (!this.state.inputCreated) {
            this.setState({inputCreated: true})
            // create a new node
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
        // if the node already exists
        } else {
            let node = data.nodes.find(x => x.id === this.state.count);
            // remove any error border
            e.target.classList.remove("border");
            e.target.classList.remove("border-danger");
            // updates the name to the new value in the input
            node.name = e.target.value;
            this.props.updateGraphData(data);
        }
    }

    /**
     * Delete corresponding nodes and links of input value from global data object. 
     */
    deleteInput = () => {
        const data = Object.assign({}, this.props.globals.data);
        if (this.state.inputCreated) {
            data.nodes.splice(data.nodes.findIndex(node => node.id === this.state.count), 1);
            // have to do it this way because of weird React should-update interaction and the lack of deepness of the comparison check 
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

export default AddNodesInput