import React from 'react';
import {Modal} from 'react-bootstrap';

import {viewBuilderCreateView, viewBuilderSelectView, viewBuilderUpdateView} from '../../../actions/viewBuilder';

export default class ViewBuilderFooter extends React.Component {

    render() {
        const {confirmButtonParams} = this.props;

        return (
            <Modal.Footer>
                <button
                    onClick={() => this.cancelOnClick()}
                    type='button'
                    className='btn btn-default'
                    data-dismiss='modal'
                >
                    <span data-localize='actions.cancel'/>Cancel
                </button>

                <button
                    onClick={(e) => this.selectOnClick(e)}
                    type='submit'
                    className='btn btn-primary'
                    disabled={confirmButtonParams.disabled}
                    title={confirmButtonParams.title}
                >
                    <span data-localize='actions.save_select.title'>{confirmButtonParams.caption}</span>
                </button>
            </Modal.Footer>
        );
    }

    cancelOnClick() {
        const {dispatch, closeModal, userData: {views}, viewBuilder} = this.props;
        const selectedView = viewBuilder.selectedView;
        closeModal('views');
        dispatch(viewBuilderSelectView(views, selectedView.id));
    }

    selectOnClick(e) {
        e.preventDefault();
        const {dispatch, viewBuilder} =this.props;
        const editedView = viewBuilder.editedView;
        if (!editedView.name.trim()) {
            return;
        }
        editedView.id !== null ? dispatch(viewBuilderUpdateView()) : dispatch(viewBuilderCreateView());
    }

}
