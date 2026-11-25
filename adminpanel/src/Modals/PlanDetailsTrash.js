import React from 'react'
import { Modal } from 'react-bootstrap';

function PlanDetailsTrash({ show, handleClose, interestData }) {
    // const { username, interests } = interestData
    return (
        <>
            <Modal centered className='cmn_modal'
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >

                <Modal.Body>
                    <div className='cmn_modal_header d-flex justify-content-between align-items-center'>
                        <p className='cmn_modal_title'> <span className='yellow_text'>
                        </span> Remove Plan </p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <div className='text-center mt-3 text-white'>
                       Are you sure to remove plan?
                    </div>
                    <div className='d-flex align-items-center justify-content-center gap-3 mt-4'>
                        <button className='cancel_button ' onClick={handleClose}>Cancel</button>
                        <button className='orange_small_primary ' onClick={handleClose}>Remove</button>
                    </div>

                </Modal.Body>

            </Modal>
        </>
    )
}

export default PlanDetailsTrash