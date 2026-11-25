import React from 'react'
import { Modal } from 'react-bootstrap';

function GroupBlockedReason({ show, handleClose, BlockData }) {
    console.log("BlockData", BlockData);
    // const { username, joinedgroup } = groupData

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
                        <p className='cmn_modal_title'> <span className='yellow_text'>{BlockData?.chatName}
                        </span> Blocked Reason</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <div className='mt-4 p-3 mdl_value_wrapper'>
                        <p className='mdl_content mb-0'>
                            {BlockData?.blockedReason}
                        </p>
                    </div>
                    {/* <div className='d-flex align-items-center gap-3 mt-4'>
                        <button className='cancel_button ' onClick={handleClose}>Cancel</button>
                        <button className='orange_small_primary ' onClick={handleClose}>Block</button>
                    </div> */}

                </Modal.Body>

            </Modal>
        </>
    )
}

export default GroupBlockedReason