import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import { Adminblockevents, Blockuser, ReportGroup } from '../api/api';
import toast from 'react-hot-toast';
function ReportBlockUser({ show, handleClose, Report, blockfunc }) {
    console.log("UserBlock", Report);

    const [formdata, setFormdata] = useState("")
    console.log("dfgdfgdfhh", formdata);
    let BlockId = Report?.type == "event" ? Report?.eventDetails?.userId : Report?.type == "user" ? Report?.UserDetails?._id : Report?.type == "group" ? Report?.report_to : ""
    console.log("BlockIdBlockId", BlockId);
    const blockdata = async () => {


        try {
            if (Report?.type == "event") {
                if (!formdata) {
                    toast.error("please Enter the reason")
                }
                else {
                    let payload = {
                        userId: Report?.eventDetails?.userId,
                        eventId: Report?.eventDetails?._id,
                        blockedReason: formdata,
                        type: "block"

                    }
                    let resp = await Adminblockevents(payload)
                    console.log("responses", resp);
                    if (resp.status) {
                        toast.success(resp.message)

                        handleClose()
                        blockfunc()
                    }
                    else {
                        toast.error(resp.message)

                    }
                }
            }
            else if (Report?.type == "user") {
                if (!formdata) {
                    toast.error("please Enter the reason")
                }
                else {
                    let payload = {
                        userId: Report?.UserDetails?._id,
                        blockedReason: formdata,
                        type: "block"

                    }
                    let resp = await Blockuser(payload)
                    console.log("responses", resp);
                    if (resp.status) {
                        toast.success(resp.message)

                        handleClose()
                        blockfunc()
                    }
                    else {
                        toast.error(resp.message)

                    }
                }
            }
            else if (Report?.type == "group" || Report?.type == "singlechat") {

                let payload = {
                    instanceId: Report?.instanceDetails?._id,
                    userId: Report?.report_from
                }
                let resp = await ReportGroup(payload)
                console.log("responses", resp);
                if (resp.status) {
                    toast.success(resp.message)

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
                        {/* <>
                            <textarea placeholder='Enter reason...' className='ot_textarea w-100 mt-2 p-2' style={{ minHeight: "100px" }} id="block" onChange={(e) => { setFormdata(e.target.value) }}></textarea>
                            <div className='d-flex align-items-center gap-3 mt-4'>
                                <button className='cancel_button ' onClick={handleClose}>Cancel</button>
                                <button className='orange_small_primary ' onClick={() => blockdata()}>Block</button>
                            </div>
                        </> */}
                        {
                            Report?.type == "group" || Report?.type == "singlechat" ?
                                <>
                                    <div className='d-flex align-items-center gap-3 mt-4'>
                                        <button className='cancel_button ' onClick={handleClose}>Cancel</button>
                                        <button className='orange_small_primary ' onClick={() => blockdata()}>Block</button>
                                    </div>
                                </>
                                :
                                <>
                                    <textarea placeholder='Enter reason...' className='ot_textarea w-100 mt-2 p-2' style={{ minHeight: "100px" }} id="block" onChange={(e) => { setFormdata(e.target.value) }}></textarea>
                                    <div className='d-flex align-items-center gap-3 mt-4'>
                                        <button className='cancel_button ' onClick={handleClose}>Cancel</button>
                                        <button className='orange_small_primary ' onClick={() => blockdata()}>Block</button>
                                    </div>
                                </>
                        }

                    </div>

                </Modal.Body>

            </Modal>
        </>
    )
}

export default ReportBlockUser