import React, { Component, useState, useEffect } from 'react';

import { Button, Col, Container, Form, FormControl, Row } from 'react-bootstrap';

import RichTextEditor from '../../Components/RichTextEditor';

import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';

import { useNavigate, useLocation } from 'react-router-dom';
import { editemailTemplateList } from '../../api/api.js';
import Sidebar from '../../Components/Sidebar.js';
import Header from '../../Components/Header.js';



export function EmailTemplateEdit() {

    const location = useLocation();
    const navigate = useNavigate();
    console.log("locaoisjdjahx", location)
    const detail = location.state
    const [Content, setContent] = useState(detail.Content)
    const [subject, setSubject] = useState(detail.subject)
    const onEditorChange = (description_text) => {
        setContent(description_text);
    }
    const FormSubmit = async () => {
        if (!subject) {
            return toast.error("Subject field is required")
        }
        if (!Content) {
            return toast.error("Content field is required")
        }
        var data = { Type: detail.Type, Content: Content, subject: subject };
        var resp = await editemailTemplateList(data);
        console.log("responses", resp);
        if (resp.status) {
            toast.success(resp.message)
            navigate("/emailtemplatelist")
        }
        else {
            toast.error(resp.message);
        }

    }

    return (
        <>
            <Header title="Email Template List" />

            <div className='login__formHolder rounded-3 p-4'>
                <div className='d-flex justify-content-end'>
                    <button className='orange_primary_btn' type='button' onClick={() => navigate('/emailtemplatelist')} >Back</button>
                </div>
                {/* <h4 className="card-title mt-3">Email Template Edit</h4> */}
                <div className='row mt-2'>
                    <div className='col-12 col-sm-11 col-md-9 col-lg-8 col-xl-7 col-xxl-6'>
                        <div>
                            <div className='rp_singleinput_holder mb-2 mt-4'>
                                <p className='rp_label mb-2'>Type</p>
                                <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type="text" className="rp_singleInput flex-grow-1" id="exampleInputName1" disabled={true} placeholder="Name" value={detail.Type} />
                                </div>
                            </div>
                            <div className='rp_singleinput_holder mb-2 mt-4'>
                                <p className='rp_label mb-2'>Subject</p>
                                <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type="text" className="rp_singleInput flex-grow-1" id="subject" value={subject} placeholder="Enter the subject" onChange={(e) => { setSubject(e.target.value) }} />
                                </div>
                            </div>
                            <div className='rp_singleinput_holder mb-2 mt-4'>
                                <p className='rp_label mb-2'>Content</p>
                                <RichTextEditor
                                    value={Content}
                                    onChange={onEditorChange}
                                    editorKey={detail?.Type}
                                />
                            </div>
                        </div>

                    </div>
                </div>
                <div className='d-flex justify-content-start mt-4'>
                    <button className='orange_primary_btn' onClick={() => { FormSubmit() }}> Submit</button>
                </div>
            </div>

        </>
    )
}

export default EmailTemplateEdit;