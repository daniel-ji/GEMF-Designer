/**
 * Site modal, for displaying an errors / prompts / confirmations.
 */
import React, { Component } from 'react'

export class SiteModal extends Component {
    render() {
        return (
            <div className="modal fade" id="siteModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.props.modalTitle}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        {this.props.modalBody !== undefined && this.props.modalBody !== '' &&
                        <div class="modal-body">
                            <p>{this.props.modalBody}</p>
                        </div>
                        }
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className={`btn btn-${this.props.modalButtonType}`} data-bs-dismiss="modal" onClick={this.props.modalAction}>{this.props.modalActionText}</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SiteModal