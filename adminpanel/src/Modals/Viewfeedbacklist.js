import React, { useEffect, useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap';
import keys from "../config/config";
import { Addplans, Editplans, sendHelpAndfeedbackmail, sendSubscriberMail, userfeedbackdelete, userhelpdelete } from '../api/api'
import { toastAlert } from "../lib/toastAlert";
import fileObjectUrl from "../lib/fileObjectUrl";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NavLink, useNavigate } from 'react-router-dom'
import bsCustomFileInput from 'bs-custom-file-input';
import { Form } from 'react-bootstrap';

import toast from 'react-hot-toast';
import isEmpty from 'is-empty';
import config from "../config/config"
const ViewfeedbackLists = ({ show, handleClose, editData, planlist }) => {
    console.log("editData", editData);
    const initialValue = {
        "planType": "",
        "plan_description": "",
        "level": ""
    };
    useEffect(() => {
        bsCustomFileInput.init()

    }, [])
    const [status, setStatus] = useState(true)
    const [errors, setErrors] = useState('')
    const [formValue, setFormValue] = useState(initialValue);
    console.log("dfdfgdfg", formValue);
    const [ans, setAns] = useState("")
    console.log("ansansans", ans);
    const [ValidateError, SetValidateError] = useState({})
    console.log("ValidateError", ValidateError)
    const navigate = useNavigate();
    const [subject, setsubject] = useState("");
    const [mailData, setMailData] = useState("");

    useEffect(() => {
        setStatus(false)
        setFormValue(editData)
        setAns(editData?.plan_description)
        setStatus(true)
    }, [editData])





    const onChange = (e) => {
        console.log("subject", e.target.value)
        setsubject(e.target.value)

    }
    const onEditorChange = (event, editor) => {
        var description_text = editor.getData();

        console.log("check", { event, editor, description_text });

        setMailData(description_text);
    }

    const EmptyState = () => {
        setFormValue(initialValue)
        setsubject("")
        setMailData("")
        handleClose()
        planlist()
    }


    const handleFormSubmit = async () => {
        // e.preventDefault();
        let reqData = {
            id: editData?._id,
            email: editData?.email,
            subject: subject,
            boc: mailData
        }
        console.log("data to send ", reqData)
        if (mailData && subject) {

            const loadingToastId = toast.loading("Sending Mail.. Please wait")
            let sentSubMail = await sendHelpAndfeedbackmail(reqData);
            console.log("mailsend", sentSubMail);
            if (sentSubMail.status) {


                toast.success("Mail Successfully Sent", { id: loadingToastId, duration: 3000 });
                EmptyState()
            } else {
                toast.dismiss(loadingToastId);
                // toast.error("Mail Failed to Send");
                toast.error(sentSubMail?.data)
            }
        }
        else {
            toast.error("Please enter subject and content");
        }
    }

    const handleDelete = async () => {
        try {
            let payload = {
                id: editData?._id
            }
            let resp = await userfeedbackdelete(payload)
            console.log("fgdfghhhhh", resp.data);
            if (resp?.status) {
                toast.success(resp.message)
                handleClose()
                planlist()
            }
            else {
                toast.error(resp.message)

            }
        } catch (error) {
            console.log("error", error);
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
                        <p className='cmn_modal_title'>View Feedback List</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <Row className='profile_holder mt-3'>
                        <Col sm={12} className='mb-4'>
                            <div className='rp_singleinput_holder'>
                                <p className='rp_label mb-2'>feedback</p>
                                {/* <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <textarea type='text' placeholder='Title' id="planType" className='rp_singleInput flex-grow-1' disabled={true} value={editData?.feedback}
                                    />
                                </div> */}

                                <textarea type='text' placeholder='Title' id="planType" className='mdl_textarea' disabled={true} value={editData?.feedback}

                                />

                            </div>
                            <div >
                                <h4 className="yellow_title mt-4"> Send Mail</h4>
                                <div className='rp_singleinput_holder mt-3'>
                                    <p className='rp_label mb-2'>subject</p>
                                    <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input className='rp_singleInput flex-grow-1' type="text" id="subject" placeholder="Enter your subject here" onChange={onChange} />
                                    </div>
                                </div>

                                <div className='rp_singleinput_holder mt-3'>
                                    <p className='rp_label mb-2'>Content</p>
                                    <CKEditor
                                        editor={ClassicEditor}

                                        onChange={(event, editor) => {
                                            onEditorChange(event, editor);

                                        }}
                                        config={{
                                            entities: false,
                                            basicEntities: false,
                                            htmlEncodeOutput: false,
                                            entities_greek: false,
                                            entities_latin: false,
                                            allowedContent: true,
                                            // removePlugins: 'htmlwriter', // stops output encoding
                                            extraAllowedContent: '*[*]{*}(*);'
                                        }}

                                    />
                                </div>






                                {/* <button type="submit" className="btn btn-primary mr-2">Submit</button> */}


                                <div className='mt-4 d-flex flex-wrap  align-items-center gap-3'>
                                    <button className='cancel_button' onClick={() => handleDelete()}>Delete</button>
                                    <button className='orange_small_primary' type='button' onClick={() => handleFormSubmit()}>SEND</button>

                                </div>

                            </div>
                        </Col>


                    </Row>

                </Modal.Body>
            </Modal>
        </>
    )
}

export default ViewfeedbackLists