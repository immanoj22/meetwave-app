import React from 'react'
import { Modal } from 'react-bootstrap';
import { BlockGroups } from '../api/api';
import toast from 'react-hot-toast';

function UnBlockGroup({ show, handleClose,UserUnblock,Blockfunc,unblock }) {
console.log("UserUnblock",UserUnblock);

const unblockdata = async () => {
    

    try {
        let payload = {
            groupId: UserUnblock?._id,

            type: "unblock"

        }
        let resp = await BlockGroups(payload)
        console.log("responses", resp);
        if (resp.status) {
            toast.success(resp.message)
            unblock()
            Blockfunc()

        }
        else {
            toast.error(resp.message)

        }

    } catch (error) {
        console.log("errors", error);
    }
    handleClose()
}

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
                        <p className='cmn_modal_title'>UnBlock Group</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <div className='mt-3'>

                        <p className='dash_graymed_text'>Are you sure want to Unblock this Group? </p>
                        {/* <textarea className='ot_textarea w-100 mt-2 p-2' style={{ minHeight: "100px" }}></textarea> */}
                        <div className='d-flex align-items-center gap-3 mt-4'>
                            <button className='cancel_button ' onClick={handleClose}>Cancel</button>
                            <button className='orange_small_primary ' onClick={()=>unblockdata()}>UnBlock</button>
                        </div>
                    </div>

                </Modal.Body>

            </Modal>
        </>
    )
}

export default UnBlockGroup