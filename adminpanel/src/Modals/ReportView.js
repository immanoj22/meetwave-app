import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import { Blockuser } from '../api/api';
import toast from 'react-hot-toast';
function ReportView({ show, handleClose, ReportViwew }) {
    console.log("ReportViwew", ReportViwew);

    // const [formdata, setFormdata] = useState("")
    // console.log("dfgdfgdfhh", formdata);

    // const blockdata = async () => {


    //     try {
    //         if (!formdata) {
    //             toast.error("please Enter the reason")
    //         }
    //         else {
    //             let payload = {
    //                 userId: ReportViwew?._id,
    //                 blockedReason: formdata,
    //                 type: "block"

    //             }
    //             let resp = await Blockuser(payload)
    //             console.log("responses", resp);
    //             if (resp.status) {
    //                 toast.success(resp.message)

    //                 handleClose()

    //             }
    //             else {
    //                 toast.error(resp.message)

    //             }
    //         }


    //     } catch (error) {
    //         console.log("errors", error);
    //     }
    // }
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
                        <p className='cmn_modal_title'>Reported by</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <div className='rp_singleinput_holder mb-2 mt-4'>
                        <p className='rp_label mb-2'>Reporter Name:</p>
                        <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>

                            <input type="text" value={ReportViwew?.reporter?.username} readOnly className='rp_singleInput flex-grow-1' />
                        </div>
                    </div>
                    <div className='rp_singleinput_holder mb-2 mt-3'>
                        <p className='rp_label mb-2'>  Reporter mail:</p>
                        <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>

                            <input type="text" value={ReportViwew?.reporter?.email} readOnly className='rp_singleInput flex-grow-1'></input>
                        </div>
                    </div>
                    <div className='rp_singleinput_holder mb-2 mt-3'>
                        <p className='rp_label mb-2'>Reason:</p>
                        <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                            <textarea type="text" className='rp_singleInput flex-grow-1' value={ReportViwew?.message} readOnly />
                        </div>
                    </div>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default ReportView