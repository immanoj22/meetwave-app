import React, { Component, useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
// import DatePicker from "react-datepicker";
import bsCustomFileInput from 'bs-custom-file-input';
import toast, { Toaster } from 'react-hot-toast';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { sendSubscriberMail } from '../../api/api.js';
import { Col, Container, Row } from "react-bootstrap";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";


export function MailTemplate() {

    useEffect(() => {
        bsCustomFileInput.init()

    }, [])

    const [subject, setsubject] = useState("");
    const [mailData, setMailData] = useState("");
    const [status, setStatus] = useState(false)
    console.log("statusss", status);
    const History = useNavigate();

    let location = useLocation()
    console.log("location", location)
    const onChange = (e) => {
        console.log("subject", e.target.value)
        setsubject(e.target.value)

    }
    const onEditorChange = (event, editor) => {
        var description_text = editor.getData();
        console.log("check", { event, editor, description_text });
        setMailData(description_text);
    }

    const handleFormSubmit = async () => {
        // e.preventDefault();


        let reqData = {
            subject: subject,
            boc: mailData
        }
        console.log("data to send ", reqData)
        if (mailData && subject) {

            const loadingToastId = toast.loading("Sending Mail.. Please wait")
            let sentSubMail = await sendSubscriberMail(reqData);
            console.log("mailsend", sentSubMail);
            if (sentSubMail.status) {
                setStatus(true)

                toast.success("Mail Successfully Sent", { id: loadingToastId, duration: 3000 });
                setTimeout(() => {
                    History('/emailupdatelists')
                }, 2000);
            } else {
                toast.dismiss(loadingToastId);
                toast.error("Mail Failed to Send");
            }
        }
        else {
            toast.error("Please Enter Subject or Content");
        }
    }


    return (
        <>
            <Header title="Send" />
            <div className='login__formHolder rounded-3 p-4'>
                <div className='d-flex justify-content-end'>
                    <button className='orange_primary_btn' type='button' onClick={() => History('/emailupdatelists')} >Back</button>
                </div>

                <div className="row mt-2">
                    <div className="col-12 col-sm-11 col-md-9 col-lg-8 col-xl-7 col-xxl-6">
                        <div>
                            <p className='m-0 theme_title '>Create Email</p>
                            <form className="forms-sample mt-4">
                                <div>
                                    <label htmlFor="exampleInputName1" className='rp_label mb-2'>Subject</label>
                                    <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input
                                            type="text"
                                            className="rp_singleInput flex-grow-1"
                                            id="subject"
                                            placeholder="Enter the subject"
                                            onChange={onChange}
                                            value={subject || ''}
                                        />
                                    </div>
                                </div>
                                <br />

                                <Form.Group>
                                    <CKEditor
                                        editor={ClassicEditor}

                                        onChange={(event, editor) => {
                                            onEditorChange(event, editor);

                                        }}
                                        config={{
                                            entities: false,
                                            basicEntities: false,
                                            entities_greek: false,
                                            entities_latin: false,
                                            allowedContent: true,
                                            htmlEncodeOutput: false,
                                            // removePlugins: 'htmlwriter',
                                            extraAllowedContent: '*[*]{*}(*);'
                                        }}
                                    />
                                </Form.Group>




                                {/* <button type="submit" className="btn btn-primary mr-2">Submit</button> */}
                            </form>
                            <button className='orange_primary_btn mt-4' type='button' onClick={() => handleFormSubmit()}>SEND</button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
            </div>
        </>
    )

}

export default MailTemplate;
