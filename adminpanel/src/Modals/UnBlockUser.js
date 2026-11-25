import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import { Blockuser } from '../api/api';
import toast from 'react-hot-toast';

function UnBlockUser({ show, handleClose, UserUnblock,unBlockfunc,blockfunc }) {
    console.log("UserUnblock", UserUnblock);


    const unblockdata = async () => {
    

        try {
            let payload = {
                userId: UserUnblock?._id,

                type: "unblock"

            }
            let resp = await Blockuser(payload)
            console.log("responses", resp);
            if (resp.status) {
                toast.success(resp.message)
                unBlockfunc()
                blockfunc()

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
                        <p className='cmn_modal_title'>UnBlock User</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <div className='mt-3'>

                        <p className='dash_graymed_text'>Are you sure want to Unblock this user? </p>
                        {/* <textarea className='ot_textarea w-100 mt-2 p-2' style={{ minHeight: "100px" }}></textarea> */}
                        <div className='d-flex align-items-center gap-3 mt-4'>
                            <button className='cancel_button ' onClick={handleClose}>Cancel</button>
                            <button className='orange_small_primary ' onClick={() => unblockdata()}>UnBlock</button>
                        </div>
                    </div>

                </Modal.Body>

            </Modal>
        </>
    )
}

export default UnBlockUser