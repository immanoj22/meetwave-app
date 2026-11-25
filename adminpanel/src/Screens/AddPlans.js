import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'
import isEmpty from "is-empty";
import { NavLink, useNavigate } from 'react-router-dom'
import { toastAlert } from "../lib/toastAlert";
import { Addplans } from '../api/api'
import fileObjectUrl from "../lib/fileObjectUrl";
import toast from 'react-hot-toast';
import RichTextEditor from "../Components/RichTextEditor";


const AddPlans = () => {
    const initialValue = {
        planType: "",
        plan_description: "",
        level: ""


    };
    const [formValue, setFormValue] = useState(initialValue);
    console.log("formvalues", formValue);
    const [ans, setAns] = useState("")
    const [ValidateError, SetValidateError] = useState({})
    console.log("ValidateError", ValidateError)
    const [errors, setError] = useState()
    const navigate = useNavigate();
    useEffect(() => {
        // handleSubmit()
    }, [])

    const validation = () => {

        var Errors = {}

        if (!(formValue?.planType)) {
            Errors.planType = "planType cannot be empty"
            console.log('valueeeeedddddd', Errors.name)
        }
        if (!(ans)) {
            Errors.ans = "plan description cannot be empty"

        }

        if (!(formValue?.level)) {
            Errors.level = "level cannot be empty"

        }

        console.log('valueeeeedddddd', Errors)
        SetValidateError(Errors)
        return Errors
    }

    const handlechange = (e) => {

        var { id, value } = e.target;
        console.log("idvalues", id, value);
        setFormValue({ ...formValue, [id]: value });
    }


    const onEditorChange = (content_text) => {
        if (content_text == "") {
            setAns(" ")
        }
        else {
            setAns(content_text)
        }
    }


    const handleSubmit = async () => {
        try {
            var errors = {};

            let value = validation();
            console.log("value", value)
            if (!isEmpty(value)) {
                SetValidateError(value);
                toast.error("fix all validation");
            }
            else {
                if (Object.keys(errors).length == 0) {
                    let payload = {
                        planType: formValue?.planType.toLowerCase(),
                        plan_description: ans,
                        level: formValue?.level
                    }
                    let resp = await Addplans(payload)
                    console.log("responses_addplans", resp);
                    if (resp.status) {
                        toast.success(resp.message)
                        navigate('/plans')
                    }
                    else {
                        toast.error(resp.message)

                    }
                }
            }
        } catch (error) {
            console.log("error_planadd", error);
        }
    }

    return (
        <>
            <Header title="Add Plan" />
            <div className='common_page_scroller '>


                <Row className='profile_holder mt-5'>
                    <Col lg={7} md={8} sm={10} className='mb-4'>
                        <div className='rp_singleinput_holder'>
                            <p className='rp_label mb-2'>Title</p>
                            <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                <input type='text' placeholder='Name' id="planType" name="planType" className='rp_singleInput flex-grow-1'
                                    value={formValue.planType} onChange={(e) => handlechange(e)}
                                />

                            </div>

                            {ValidateError && ValidateError.planType && <span className="error_msg">{ValidateError.planType}</span>}


                        </div>

                        <div className='rp_singleinput_holder'>
                            <p className='rp_label mb-2'>Level</p>
                            <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                <input type='number' placeholder='Name' id="level" name="level" className='rp_singleInput flex-grow-1'
                                    value={formValue.level} onChange={(e) => handlechange(e)}
                                />

                            </div>


                            {ValidateError && ValidateError.level && <span className="error_msg">{ValidateError.level}</span>}

                        </div>

                        <div className="mt-4">
                            <RichTextEditor
                                value={ans}
                                onChange={onEditorChange}
                            />
                        </div>
                        {ValidateError && ValidateError.ans && <span className="error_msg">{ValidateError.ans}</span>}

                    </Col>

                    {/* <Col lg={7} md={8} sm={10} className='mb-4'>
                                    <div className='rp_singleinput_holder'>
                                        <p className='rp_label mb-2'>Symbol</p>
                                        <div className='rp_input_holder rounded-2 position-relative py-2 d-flex justify-content-start align-items-center gap-2'>
                                            <input type='file' placeholder='Symbol' name="symbol" id="symbol" className='rp_singleInput rp_singleFileInput flex-grow-1'
                                                onChange={(event) => onChangeValue(event)}
                                            />

                                        </div>
                                        {formValue.symbol ? (
                                            <div className="banner_img_sec">
                                                <img src={fileObjectUrl(formValue.symbol)} className='img-fluid rounded-5 plans__symbolImg mt-3' alt='' />
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                        <span className="errors_style" id="symbol-error" >{errors && errors.symbol}</span>
                                    </div>
                                </Col>

                                <Col lg={7} md={8} sm={10} className='mb-4'>
                                    <div className='rp_singleinput_holder'>
                                        <p className='rp_label mb-2'>Price</p>
                                        <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                            <input type='text' placeholder='Price' id="price" name="price" className='rp_singleInput flex-grow-1'
                                                value={formValue.price}
                                                onChange={(event) => handlechange(event)}
                                            />
                                        </div>
                                        <span className="errors_style" id="price-error" >{errors && errors.price}</span>

                                    </div>
                                </Col>

                                <Col lg={7} md={8} sm={10} className='mb-4'>
                                    <div className='rp_singleinput_holder'>
                                        <p className='rp_label mb-2'>Description</p>
                                        <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                            <input type='text' placeholder='Description' id="description" name="description" className='rp_singleInput flex-grow-1'
                                                value={formValue.description}
                                                onChange={(event) => handlechange(event)}
                                            />
                                        </div>
                                        <span className="errors_style" id="description-error" >{errors && errors.description}</span>

                                    </div>
                                </Col>

                                <Col lg={7} md={8} sm={10} className='mb-4'>
                                    <div className='rp_singleinput_holder'>
                                        <p className='rp_label mb-2'>Member</p>
                                        <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                            <input type='text' placeholder='member' id="member" name="member" className='rp_singleInput flex-grow-1'
                                                value={formValue.member}
                                                onChange={(event) => handlechange(event)}
                                            />
                                        </div>
                                        <span className="errors_style" id="member-error" >{errors && errors.member}</span>

                                    </div>
                                </Col>

                                <Col lg={7} md={8} sm={10} className='mb-4'>
                                    <div className='rp_singleinput_holder'>
                                        <p className='rp_label mb-2'>Validity</p>
                                        <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                            <input type='text' placeholder='Validity' name="validity" id="validity" className='rp_singleInput flex-grow-1'
                                                value={formValue.validity}
                                                onChange={(event) => handlechange(event)}
                                            />
                                        </div>
                                        <span className="errors_style" id="validity-error" >{errors && errors.validity}</span>

                                    </div>
                                </Col> */}

                </Row>
                <button className='orange_primary_btn mt-4 mb-2' onClick={() => handleSubmit()} >Submit</button>
            </div>
        </>
    )
}

export default AddPlans