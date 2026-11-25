import React, { useEffect, useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap';
import keys from "../config/config";
import { Addplans, Editplans } from '../api/api'
import { toastAlert } from "../lib/toastAlert";
import fileObjectUrl from "../lib/fileObjectUrl";
import RichTextEditor from "../Components/RichTextEditor";
import { NavLink, useNavigate } from 'react-router-dom'
import bsCustomFileInput from 'bs-custom-file-input';

import toast from 'react-hot-toast';
import isEmpty from 'is-empty';

const EditPlans = ({ show, handleClose, editData, planlist }) => {
    console.log("editData", editData);
    const initialValue = {
        "planType": "",
        "plan_description": "",
        "level": 0
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


    useEffect(() => {
        setStatus(false)
        setFormValue(editData)
        setAns(editData?.plan_description)
        setStatus(true)
    }, [editData])


    const validation = () => {

        var Errors = {}


        if (!(ans)) {
            Errors.ans = "plan description cannot be empty"

        }



        console.log('valueeeeedddddd', Errors)
        SetValidateError(Errors)
        return Errors
    }


    const handlechange = (e) => {
        SetValidateError({})
        const { id, value } = e.target;
        console.log('handlechange', id, value)
        setFormValue({ ...formValue, [id]: value });
    }

    const onEditorChange = (content_text) => {
        setAns(content_text)
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
                        planid: editData?._id,
                        planType: formValue?.planType.toLowerCase(),
                        plan_description: ans,
                        level: formValue?.level
                    }
                    let resp = await Editplans(payload)
                    console.log("responses_addplans", resp);
                    if (resp.status) {
                        toast.success(resp.message)
                        navigate('/plans')
                        planlist()
                        handleClose()
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
    // const onChangeValue = async (e) => {
    //     setErrors({})
    //     let errors = {};
    //     // var allowedExtensions = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;'

    //     var { name, value, files } = e.target;
    //     console.log(files, 'onChangeValue')
    //     if (!/\.(gif|jpeg|tiff|png|webp|bmp|jpg)$/i.test(files[0]?.name)) {
    //         errors.symbol =
    //             "Please upload file having extensions  .png,.jpeg,.jpg only.";
    //     }
    //     if (Object.keys(errors).length > 0) {
    //         setErrors(errors);
    //     } else {
    //         if (name === "symbol") {
    //             console.log({ ...formValue, [name]: files }, 'onChangeValue')
    //             setFormValue({ ...formValue, [name]: files[0] });
    //             // setFiles(files[0]);

    //         }
    //     }
    // };

    // useEffect(() => {
    //     var imageUrl = `${keys.API_URL}/plan/${editData.symbol}`;

    //     setFormValue({
    //         id: editData?._id,
    //         name: editData.name,
    //         symbol: imageUrl,
    //         price: editData.price,
    //         description:editData.description,
    //         validity: editData.validity
    //     })

    // }, [editData])

    // const handleedit = async () => {

    //     var passData = new FormData();
    //     passData.append("_id", formValue.id)
    //     passData.append("name", formValue.name)
    //     passData.append("file", formValue.symbol)
    //     passData.append("price", formValue.price)
    //     passData.append("description", formValue.description)
    //     passData.append("validity", formValue.validity)

    //     let { status, loading, error, message, result } = await EditPlan(passData);
    //     if (status) {
    //         toastAlert("success", message);
    //         setErrors({})
    //         getPlan()
    //         handleClose()
    //     } else {
    //         if (error) {
    //             setErrors(error);
    //         } else if (message) {
    //               toastAlert("error", message);
    //         }
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
                        <p className='cmn_modal_title'>Edit Plan</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <Row className='profile_holder mt-3'>
                        <Col sm={12} className='mb-4'>
                            <div className='rp_singleinput_holder'>
                                <p className='rp_label mb-2'>Title</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type='text' placeholder='Title' id="planType" disabled={true} className='rp_singleInput flex-grow-1' value={formValue?.planType}
                                        onChange={(e) => { handlechange(e) }}
                                    />
                                </div>

                            </div>


                            <div className='rp_singleinput_holder'>
                                <p className='rp_label mb-2'>Level</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type='number' placeholder='level' id="level" disabled={true} className='rp_singleInput flex-grow-1' value={formValue?.level}
                                        onChange={(e) => { handlechange(e) }}
                                    />
                                </div>

                            </div>

                            <div className="mt-4">

                                {status && <RichTextEditor
                                    value={ans}
                                    onChange={onEditorChange}
                                    editorKey={editData?._id}
                                />}
                            </div>
                            {ValidateError && ValidateError.ans && <span className="error_msg">{ValidateError.ans}</span>}

                        </Col>
                        {/* <Col  sm={12} className='mb-4'>
                    <div className='rp_singleinput_holder'>
                    <p className='rp_label mb-2'>Symbol</p>
                    <div className='rp_input_holder rounded-2 position-relative py-2 d-flex justify-content-start align-items-center gap-2'>
                        <input type='file' name="symbol" placeholder='Symbol' className='rp_singleInput rp_singleFileInput flex-grow-1' 
                         onChange={(event) => onChangeValue(event)}
                        />
                    </div>
                          {typeof formValue.symbol == 'object' ? (
                                  <div className="banner_img_sec">
                                      <img src={fileObjectUrl(formValue?.symbol)} className='img-fluid rounded-5 plans__symbolImg mt-3' alt='' />
                                  </div>
                              ) : ( 
                                  <img src={formValue?.symbol} className='img-fluid rounded-5 plans__symbolImg mt-3' alt=''/>
                              )}
                </div>
                    </Col>

                    <Col  sm={12} className='mb-4'>
                    <div className='rp_singleinput_holder'>
                    <p className='rp_label mb-2'>Price</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type='text' placeholder='Price' name="price" className='rp_singleInput flex-grow-1' value={formValue?.price} 
                           onChange={(e) => { handlechange(e) }}
                        />
                    </div>
                </div>
                    </Col>

                    <Col  sm={12} className='mb-4'>
                    <div className='rp_singleinput_holder'>
                    <p className='rp_label mb-2'>Description</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type='text' placeholder='Description' name="description" className='rp_singleInput flex-grow-1' value={formValue?.description} 
                           onChange={(e) => { handlechange(e) }}
                        />
                    </div>
                </div>
                    </Col>

                    <Col  sm={12} className='mb-4'>
                    <div className='rp_singleinput_holder'>
                    <p className='rp_label mb-2'>Validity</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type='text' placeholder='Validity'  name="validity" className='rp_singleInput flex-grow-1' value={formValue?.validity} 
                           onChange={(e) => { handlechange(e) }}
                        />
                    </div>
                </div>
                    </Col> */}

                    </Row>

                    <button className='orange_primary_btn mt-4' onClick={() => { handleSubmit() }}>Save</button>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default EditPlans