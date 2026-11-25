import React, { useState } from 'react'
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
import isEmpty from 'is-empty';
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
    const [validator, setValidator] = useState({})
    console.log("validartoresd", validator);
    const userdata = useSelector((state) => state.redux.userdata)
    console.log("userlocfds__sdfg", userdata);
    const navigate = useNavigate();
    const handlechange = (e) => {
        setError({})
        var { name, value } = e.target;
        console.log("changedas", name, value);
        setFormValue({ ...formValue, [name]: value });
    }

   /*  const sendOTP = async () => {
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

    } */
        const sendOTP = async () => {
            const toastId = toast.loading("Sending OTP...");
            try {
                const data = {
                    email: userdata?.email,
                };
        
                const resp = await verifyEmail(data);
                console.log("OTP Response:", resp);
        
                if (resp?.status) {
                    toast.success(resp.message || "OTP sent successfully", {
                        id: toastId,
                        duration: 3000,
                    });
                } else {
                    toast.error(resp?.message || "Failed to send OTP", {
                        id: toastId,
                        duration: 3000,
                    });
                }
            } catch (error) {
                console.error("Error sending OTP:", error);
                toast.error("Something went wrong. Please try again later.", {
                    id: toastId,
                    duration: 3000,
                });
            }
        };
    const validation = () => {
        try {
            let ValidateError = {}
            if (isEmpty(formValue?.otp)) {
                ValidateError.otp = "OTP is required"
            }
            if (isEmpty(formValue?.newPassword)) {
                ValidateError.newPassword = "New password is required"
            }
            if (isEmpty(formValue?.confirmPassword)) {
                ValidateError.confirmPassword = "Confirm password is required"
            }
            setValidator(ValidateError)
            return ValidateError;
        } catch (error) {
            console.log("error", error)
        }

    }
    /* const handleSubmit = async () => {
        try {

            const errors = await validation();
            console.log("errorororo", errors, Object.keys(errors));
            if (!isEmpty(errors)) {
                // setValidator(errors);
                toast.error("Fix all validation errors");
                return;
            }
            else {
                if (Object.keys(errors).length == 0) {
                    const id = toast.loading("loading...")
                    let Data = {
                        OTP: formValue?.otp,
                        password: formValue?.newPassword,
                        confirmpassword: formValue?.confirmPassword,
                        email: userdata?.email,
                    };
                    console.log("DataData", Data);

                    let resp = await Adminforgetpwd(Data);
                    console.log("eerererer", resp);
                    if (resp.status) {
                        navigate('/')
                        toast.success(resp?.message, {
                            id: id,
                            duration: 3000
                        });
                        setStatus(true)
                        setError({})


                    } else {

                        // setError(resp.message);

                        // toastAlert("error", resp?.message);
                        toast.dismiss(id); // Remove loading toast
                        toast.error(resp?.message || "An error occurred");

                    }
                }

            }

        } catch (error) {
            console.log("error", error);
            toast.error(error?.message)
        }
    } */
        const handleSubmit = async () => {
            try {
                
                const errors = await validation();
                console.log("Validation Errors:", errors);
        
                if (!isEmpty(errors)) {
                    toast.error("Fix all validation errors");
                    // Optionally set error state if needed
                    // setValidator(errors);
                    return;
                }
                const toastId = toast.loading("Processing...");
        
                const data = {
                    OTP: formValue?.otp,
                    password: formValue?.newPassword,
                    confirmpassword: formValue?.confirmPassword,
                    email: userdata?.email,
                };
                console.log("Submitted Data:", data);
        
                const resp = await Adminforgetpwd(data);
                console.log("API Response:", resp);
        
                toast.dismiss(toastId);
        
                if (resp?.status) {
                    toast.success(resp?.message || "Password reset successful", {
                        duration: 3000,
                    });
                    setStatus(true);
                    setError({});
                    navigate('/');
                } else {
                    toast.error(resp?.message || "Failed to reset password");

                }
            } catch (error) {
                console.error("Error during submission:", error);
                toast.error(error?.message || "Something went wrong");
            }
        };
        
    return (
        <>
            {/* <Container fluid className='common_bg position-relative pt-5 pt-sm-0 p-0 login__wholeAligner d-flex align-items-center'> */}

            <Header title={'Forgot Password'} switcher={switcher} />
            <div className='login__formHolder rounded-3 p-4 '>
                <h5 className='m-0 cmn_modal_title'>Email Verification</h5>

                <div className='rp_singleinput_holder mb-2 mt-4'>
                    <p className='rp_label mb-2'>Email</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type='email' placeholder='Enter Email' className='rp_singleInput flex-grow-1' name="email" disabled={true} value={userdata?.email} onChange={(e) => handlechange(e)} />
                    </div>
                </div>

                <button className='orange_primary_btn mb-2 mt-2' onClick={() => sendOTP()}>Send OTP</button>

                <div className='rp_singleinput_holder mb-4 mt-3'>
                    <p className='rp_label mb-2'>Enter OTP</p>

                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type="number" placeholder='Enter OTP' className='rp_singleInput flex-grow-1' name="otp" value={formValue?.otp} onChange={(e) => handlechange(e)} />

                    </div>
                    <span className="errors_style" id="name-error" >{validator && validator.otp}</span>

                </div>


                <div className='rp_singleinput_holder mb-4'>
                    <p className='rp_label mb-2'>New Password</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type={newPw ? 'text' : 'password'} placeholder='Enter New Password' className='rp_singleInput flex-grow-1' name="newPassword" value={formValue?.newPassword} onChange={(e) => handlechange(e)} />

                        <i class={newPw ? "fa-solid fa-eye" : 'fa-solid fa-eye-slash'} onClick={() => setNewPw(!newPw)} />
                    </div>
                    <span className="errors_style" id="name-error" >{validator && validator.newPassword}</span>

                </div>

                <div className='rp_singleinput_holder'>
                    <p className='rp_label mb-2'>Confirm password</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type={confirmPw ? 'text' : 'password'} placeholder='Enter Confirm Password' className='rp_singleInput flex-grow-1' name="confirmPassword" value={formValue?.confirmPassword} onChange={(e) => handlechange(e)} />

                        <i class={confirmPw ? "fa-solid fa-eye" : 'fa-solid fa-eye-slash'} onClick={() => setConfirmPw(!confirmPw)} />
                    </div>
                    <span className="errors_style" id="name-error" >{validator && validator.confirmPassword}</span>

                </div>


                {/* <NavLink to='/' className='sidebar_links'> */}
                <button className='orange_primary_btn mb-2 mt-4' onClick={() => handleSubmit()}>Submit</button>
                {/* </NavLink> */}
                {/* <div className='forgotpw__countdownHolder d-flex justify-content-center gap-5 align-items-center'>
                <p className='login__forgotLinkText pointer m-0'>Resend Code</p>
<div className='forgotpw__countdown'>
                <Countdown date={Date.now() + 30000} />
                </div>
                </div> */}
            </div>

        </>
    )
}

export default ForgotPassword