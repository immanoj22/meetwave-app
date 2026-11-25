import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import { Blockuser } from '../api/api';
import toast from 'react-hot-toast';
function BlockUser({ show, handleClose, UserBlock, Blockfunc, unblock }) {
    console.log("UserBlock", UserBlock);

    const [formdata, setFormdata] = useState("")
    console.log("dfgdfgdfhh", formdata);

    const blockdata = async () => {


        try {
            if (!formdata) {
                toast.error("please Enter the reason")
            }
            else {
                let payload = {
                    userId: UserBlock?._id,
                    blockedReason: formdata,
                    type: "block"

                }
                let resp = await Blockuser(payload)
                console.log("responses", resp);
                if (resp.status) {
                    toast.success(resp.message)
                    Blockfunc()
                    unblock()
                    handleClose()

                }
                else {
                    toast.error(resp.message)

                }
            }


        } catch (error) {
            console.log("errors", error);
        }
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
                        <p className='cmn_modal_title'>Block User</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <div className='mt-3'>

                        <p className='dash_graymed_text'>Are you sure want to block this user? </p>
                        <textarea placeholder='Enter reason...' className='ot_textarea w-100 mt-2 p-2' style={{ minHeight: "100px" }} id="block" onChange={(e) => { setFormdata(e.target.value) }}></textarea>
                        <div className='d-flex align-items-center gap-3 mt-4'>
                            <button className='cancel_button ' onClick={handleClose}>Cancel</button>
                            <button className='orange_small_primary ' onClick={() => blockdata()}>Block</button>
                        </div>
                    </div>

                </Modal.Body>

            </Modal>
        </>
    )
}

export default BlockUser