import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
// import Countdown from 'react-countdown';
import OtpInput from 'react-otp-input';
import { useSelector } from "react-redux";
import { Adminforgetpwd, verifyEmail } from '../api/forgotPass'
import { toastAlert } from "../lib/toastAlert";
import toast from 'react-hot-toast';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import logo from '../assets/images/Logo.svg'
import { GetAdmindata, getAdminDetails } from '../api/cms';



const ForgotPassword = () => {

    const switcher = useSelector(state => state?.reducer?.switcher)
    let initialValue = {
        otp: "",
        email: "",
        newPassword: "",
        confirmPassword: "",
    };

    const [otp, setOtp] = useState('');
    const [formValue, setFormValue] = useState(initialValue);
    console.log("gdfgdf", formValue);
    const [errors, setError] = useState()
    const [newPw, setNewPw] = useState(false)
    const [status, setStatus] = useState(false)
    const [confirmPw, setConfirmPw] = useState(false)
    // const userdata = useSelector((state) => state.redux.userdata)
    const [userdata, setUserdata] = useState({})
    console.log("userlocfds__sdfg", userdata);
    const navigate = useNavigate();

    useEffect(() => {
        GetadminData()
    }, [])

    const handlechange = (e) => {
        setError({})
        var { name, value } = e.target;
        console.log("changedas", name, value);
        setFormValue({ ...formValue, [name]: value });
    }
    const GetadminData = async () => {
        try {
            let resp = await getAdminDetails({ type: "adminDetail" })
            console.log("getadmin", resp);
            if (resp.status) {
                setUserdata(resp.data[0])
            }
            else {
                console.log("something error");
            }
        } catch (error) {
            console.log("error", error);
        }
    }
    const sendOTP = async () => {
        try {
            const id = toast.loading("loading...")
            let Data = {
                email: userdata?.email,
            };

            let resp = await verifyEmail(Data);
            console.log("messagemessage", resp);
            if (resp.status) {
                toast.success(resp.message, {
                    id: id,
                    duration: 3000
                });
            } else {
                toastAlert("error", resp.message);
            }
        } catch (error) {
            console.log("error", error);
        }

    }

    const handleSubmit = async () => {
        try {
            const id = toast.loading("loading...")
            let Data = {
                OTP: formValue?.otp,
                password: formValue?.newPassword,
                confirmpassword: formValue?.confirmPassword,
                email: userdata?.email,
            };
            console.log("DataData", Data);

            let resp = await Adminforgetpwd(Data);
            if (resp.status) {
                toast.success(resp?.message, {
                    id: id,
                    duration: 3000
                });
                setStatus(true)
                setError({})
                navigate('/dashboard')
            } else {

                setError(resp.message);

                toastAlert("error", resp?.message);


            }
        } catch (error) {
            console.log("error", error);
            toast.error(error?.message)
        }



    }

    return (
        <>
            <Container fluid className='common_bg position-relative p-0 login__wholeAligner d-flex align-items-center'>
                <div className='w-100'>
                    <Row className='justify-content-center'>
                        <Col xl={4} lg={5} md={7} sm={10} xs={11}>
                            <div className='login__formHolder rounded-3 p-4 '>
                                {/* <div className='d-flex align-items-center justify-content-center'>
                                    <img src={logo} className='auth-logo' />
                                </div> */}
                                <h5 className='m-0 theme_title text-center'>Forgot Password</h5>

                                <div className='rp_singleinput_holder mb-2 mt-4'>
                                    <p className='rp_label mb-2'>Email</p>
                                    <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input
                                            type='email'
                                            placeholder='Enter Email'
                                            className='rp_singleInput flex-grow-1'
                                            name="email"
                                            disabled={true}
                                            value={userdata?.email}
                                            onChange={(e) => handlechange(e)}
                                        />
                                    </div>
                                </div>

                                <button className='orange_primary_btn mb-2 mt-2' onClick={() => sendOTP()}>Send OTP</button>

                                <div className='rp_singleinput_holder mb-4 mt-3'>
                                    <p className='rp_label mb-2'>Enter OTP</p>

                                    <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input
                                            type="number"
                                            placeholder='Enter OTP'
                                            className='rp_singleInput flex-grow-1'
                                            name="otp"
                                            value={formValue?.otp}
                                            onChange={(e) => handlechange(e)}
                                        />

                                    </div>
                                    <span className="errors_style" id="name-error" >{errors && errors.otp}</span>

                                </div>


                                <div className='rp_singleinput_holder mb-4'>
                                    <p className='rp_label mb-2'>New Password</p>
                                    <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input
                                            type={newPw ? 'text' : 'password'}
                                            placeholder='Enter New Password'
                                            className='rp_singleInput  flex-grow-1'
                                            name="newPassword"
                                            value={formValue?.newPassword}
                                            onChange={(e) => handlechange(e)}
                                        />

                                        <i class={newPw ? 'fa-solid fa-eye-slash' : "fa-solid fa-eye"} onClick={() => setNewPw(!newPw)} />
                                    </div>
                                    <span className="errors_style" id="name-error" >{errors && errors.newPassword}</span>

                                </div>

                                <div className='rp_singleinput_holder'>
                                    <p className='rp_label mb-2'>Confirm password</p>
                                    <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input
                                            type={confirmPw ? 'text' : 'password'}
                                            placeholder='Enter Confirm Password'
                                            className='rp_singleInput flex-grow-1'
                                            name="confirmPassword"
                                            value={formValue?.confirmPassword}
                                            onChange={(e) => handlechange(e)}
                                        />

                                        <i class={confirmPw ? 'fa-solid fa-eye-slash' : "fa-solid fa-eye"} onClick={() => setConfirmPw(!confirmPw)} />
                                    </div>
                                    <span className="errors_style" id="name-error" >{errors && errors.confirmPassword}</span>

                                </div>


                                {/* <NavLink to='/' className='sidebar_links'> */}
                                <button className='orange_primary_btn mb-2 mt-4 w-100' onClick={() => handleSubmit()}>Submit</button>
                                {/* </NavLink> */}
                                {/* <div className='forgotpw__countdownHolder d-flex justify-content-center gap-5 align-items-center'>
                <p className='login__forgotLinkText pointer m-0'>Resend Code</p>
<div className='forgotpw__countdown'>
                <Countdown date={Date.now() + 30000} />
                </div>
                </div> */}
                            </div>






                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    )
}

export default ForgotPassword