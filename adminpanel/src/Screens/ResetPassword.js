import React, { useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'

import { NavLink, useNavigate } from 'react-router-dom'
import { Adminchangepwd, verifyEmail } from '../api/resetPass'
import { useSelector } from "react-redux";

import toast from 'react-hot-toast';
function ResetPassword() {
    const initialValue = {
        OTP: "",
        oldpassword: "",
        newpassword: "",
        confirmpassword: "",

    };
    const [formValue, setFormValue] = useState(initialValue);
    const [errors, setError] = useState()
    const [oldPw, setOldPw] = useState(false)
    const [newPw, setNewPw] = useState(false)
    const [confirmPw, setConfirmPw] = useState(false)
    const userdata = useSelector((state) => state.redux.userdata)
    console.log("userlocfdsgsdfg", userdata);
    const navigate = useNavigate();
    console.log("formdatasd", formValue, oldPw, newPw, confirmPw);

    const handlechange = (e) => {
        // setError({})
        var { name, value } = e.target;
        console.log("bnameValues", name, value);
        setFormValue({ ...formValue, [name]: value });
    }


    const sendOTP = async () => {
        let id = toast.loading("loading...")
        let Data = {
            email: userdata?.email,
        };
        console.log("datas", Data);

        let resp = await verifyEmail(Data);
        console.log("messagemessage", resp);
        if (resp.status) {
            toast.success(resp?.message, {
                id: id,
                duration: 3000
            });
        }
        else {
            toast.error(resp.message)
        }
    }

    const handleSubmit = async () => {
        let Data = {
            OTP: formValue?.OTP,
            newpassword: formValue?.newpassword,
            password: formValue?.oldpassword,
            confirmpassword: formValue?.confirmpassword,
            email: userdata?.email,
        };
        // setFormValue({})
        console.log("DataData", Data);

        let resp = await Adminchangepwd(Data);
        console.log("resposnse", resp);
        if (resp.status) {
            toast.success(resp.message)
            // navigate('/dashboard')
            navigate('/')

        }
        else {
            toast.error(resp.message)
        }


    }

    return (
        <>
            <Header title="Reset Password" />
            <div className='common_page_scroller common_page_scroller_vh mt-5'>
                <Row className='justify-content-start'>
                    <Col lg={5} md={6} sm={8} xs={11}>
                        <div className=''>


                            <div className='rp_singleinput_holder mb-4'>
                                <p className='rp_label mb-2'>Email</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type="text" placeholder='Enter email' className='rp_singleInput flex-grow-1' name="email" disabled={true} value={userdata?.email} />

                                </div>


                            </div>
                            <button className='orange_primary_btn mb-2 mt-2' onClick={() => sendOTP()}>Send OTP</button>



                            <div className='rp_singleinput_holder mb-4'>
                                <p className='rp_label mb-2'>OTP</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type="number" placeholder='Enter OTP' className='rp_singleInput flex-grow-1' name="OTP" value={formValue?.OTP} onChange={(e) => handlechange(e)} />

                                </div>
                                {/* <span className="errors_style" id="name-error" >{errors && errors.otp}</span> */}

                            </div>

                            <div className='rp_singleinput_holder mb-4'>
                                <p className='rp_label mb-2'>Old Password</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type={oldPw ? 'text' : 'password'} placeholder='Enter Old Password' className='rp_singleInput flex-grow-1' name="oldpassword" value={formValue?.oldpassword} onChange={(e) => handlechange(e)} />

                                    <i class={oldPw ? 'fa-solid fa-eye-slash' : "fa-solid fa-eye"} onClick={() => setOldPw(!oldPw)} />
                                </div>
                                {/* <span className="errors_style" id="name-error" >{errors && errors.oldPassword}</span> */}

                            </div>
                            <div className='rp_singleinput_holder mb-4'>
                                <p className='rp_label mb-2'>New Password</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type={newPw ? 'text' : 'password'} placeholder='Enter New Password' className='rp_singleInput flex-grow-1' name="newpassword" value={formValue?.newpassword} onChange={(e) => handlechange(e)} />

                                    <i class={newPw ? 'fa-solid fa-eye-slash' : "fa-solid fa-eye"} onClick={() => setNewPw(!newPw)} />
                                </div>
                                {/* <span className="errors_style" id="name-error" >{errors && errors.newPassword}</span> */}

                            </div>

                            <div className='rp_singleinput_holder'>
                                <p className='rp_label mb-2'>Confirm password</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type={confirmPw ? 'text' : 'password'} placeholder='Enter Confirm Password' className='rp_singleInput flex-grow-1' name="confirmpassword" value={formValue?.confirmpassword} onChange={(e) => handlechange(e)} />

                                    <i class={confirmPw ? 'fa-solid fa-eye-slash' : "fa-solid fa-eye"} onClick={() => setConfirmPw(!confirmPw)} />
                                </div>
                                {/* <span className="errors_style" id="name-error" >{errors && errors.confirmPassword}</span> */}

                            </div>


                            {/* <NavLink to='/' className='sidebar_links'> */}
                            <button className='orange_primary_btn mb-2 mt-4' onClick={() => handleSubmit()}>Submit</button>
                            {/* </NavLink> */}
                        </div>
                    </Col>
                </Row>
            </div>

        </>
    )
}

export default ResetPassword