/**
 * Individual node input component for creating nodes. Part of node input container component.
 * The actual individual inputs.    
 */
import React, { Component, Fragment } from 'react'
import {NODE_COLLIDE_RADIUS} from '../../Constants';

export class AddNodesInput extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
        deleted: false,
        inputCreated: this.props.inputValue === undefined ? false : true,
        inputValue: this.props.inputValue ?? '',
        color: this.props.globals.data.nodes.find(node => node.id === this.props.inputCounter)?.color ?? '#000000',
        count: this.props.inputCounter,
      }
    }

    /**
     * Updates input value, whether that means creating a new node or updating the value of an 
     * existing input. 
     * @param {*} e event
     */
    setInput = (e) => {
        this.setState({inputValue: e.target.value})
        const data = Object.assign({}, this.props.globals.data);
        if (!this.state.inputCreated) {
            this.setState({inputCreated: true})
            // create a new node
            data.nodes.push({
                id: this.state.count,
                name: e.target.value,
                x: 0,
                y: 0,
                color: this.state.color
            })
            // temporarily sets the collision force to the whole node radius so that nodes do not intersect on creation
            this.props.setForceCollideRadius(this.props.globals.NODE_RADIUS * 1.2);
            this.props.setGraphData(data);
            setTimeout(() => this.props.setForceCollideRadius(NODE_COLLIDE_RADIUS), 400)
            // set up a new blank input box 
            this.props.createNewInput();
        // if the node already exists
        } else {
            const node = data.nodes.find(x => x.id === this.state.count);
            // remove any error border
            e.target.classList.remove("border");
            e.target.classList.remove("border-danger");
            // updates the name to the new value in the input
            node.name = e.target.value;
            this.props.setGraphData(data);
        }
    }

    /**
     * Updates color of node based on color picker.
     * @param {*} e 
     */
    setColor = (e) => {
        this.setState({color: e.target.value});
        const data = Object.assign({}, this.props.globals.data);
        const node = data.nodes.find(x => x.id === this.state.count);
        node.color = e.target.value;
        this.props.setGraphData(data);
    }

    /**
     * Prompt delete node entry. 
     */
    deleteInputPrompt = () => {
        if (this.state.inputCreated) {
            this.props.deletePrompt(this.deleteInput);
        }
    }

    /**
     * Delete corresponding nodes and links of input value from global data object. 
     */
    deleteInput = () => {
        const data = Object.assign({}, this.props.globals.data);
        data.nodes.splice(data.nodes.findIndex(node => node.id === this.state.count), 1);
        // have to do it this way because of weird React should-update interaction and the lack of deepness of the comparison check (i think?)
        while (data.links.findIndex(link => link.source.id === this.state.count || link.target.id === this.state.count || link.inducer === this.state.count) !== -1) {
            data.links.splice(data.links.findIndex(link => link.source.id === this.state.count || link.target.id === this.state.count || link.inducer === this.state.count), 1)
        }
        this.props.setGraphData(data);
        this.setState({deleted: true})
    }

    render() {
        return (
            <Fragment>
                {this.state.deleted ? <div></div> : 
                <div className="input-group mb-3 w-100">
                    <input
                    type="color" 
                    className="form-control form-control-color node-color-edit"
                    id={"button-color-" + this.state.count}
                    value={this.state.color}
                    onChange={this.setColor}
                    title="Choose node color" />

                    <input
                    id={'s-1-input-' + this.state.count}
                    className='form-control'
                    type="text"
                    placeholder='State Name'
                    aria-label='State Name'
                    value={this.state.inputValue}
                    onChange={this.setInput} />
                    <button id={"button-trash-" + this.state.count} className="btn btn-danger" type="button" onClick={this.deleteInputPrompt}>
                        <i className="bi bi-trash" />
                    </button>
                </div>}
            </Fragment>
        )
    }
}

export default AddNodesInput