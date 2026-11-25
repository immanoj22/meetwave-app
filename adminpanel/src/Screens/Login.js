import React, { useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import isEmpty from "is-empty";
import { login } from '../api/loginapi'
import { toastAlert } from "../lib/toastAlert";
import toast from 'react-hot-toast';
import logo from '../assets/images/Logo.svg'


const initialFormValue = {
    email: "",
    password: "",
};

const Login = () => {
    const [oldPw, setOldPw] = useState(false)
    const [formValue, setFormValue] = useState({ initialFormValue });
    console.log("formvaliues", formValue);
    const [errors, setErrors] = useState('')
    const { email, password } = formValue;
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const handleChange = (e) => {
        setErrors({})
        e.preventDefault();
        const { name, value } = e.target;
        console.log("handleChange", value)
        let error = { ...errors, ...{ [name]: "" } };

        setErrors(error);
        let formData = { ...formValue, ...{ [name]: value } };
        setFormValue(formData);
    };
    const validation = () => {
        let errors = {};
        var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

        if (isEmpty(formValue?.email)) {
            errors.email = "Email field is required";
        }
        else if (!(emailRegex.test(formValue?.email))) {
            errors.email = "Invalid email"
        }
        if (isEmpty(formValue?.password)) {
            errors.password = "Password field is required";
        }

        return errors
    }

    const handlelogin = async () => {


        try {

            var value = validation()
            if (!isEmpty(value)) {
                setErrors(value)
            }
            else {

                let payload = {
                    email: formValue?.email,
                    password: formValue?.password
                }

                let resp = await login(payload);

                console.log("gvfdgfdgdfg", resp);
                if (resp.data.status) {
                    localStorage.setItem("token", resp.data.token)
                    sessionStorage.setItem("token", resp.data.token)
                    localStorage.setItem("adminlogin", "yes")
                    dispatch({ type: "loginauth", data: { loginauth: resp.data ?? localStorage.getItem("token") } })

                    setErrors({})
                    console.log("tokenJWT", localStorage.getItem("token"))
                    if (localStorage.getItem("token")) {
                        navigate('/dashboard')
                        toast.success(resp.data.message);

                    }
                    else {
                        navigate('/')

                    }
                }
                else {

                    toast.error(resp.data.message);

                }

            }
        } catch (err) {
            console.log("handlelogin err", err);
        }

    }

    return (
        <>
            <Container fluid className='common_bg position-relative p-0 login__wholeAligner d-flex align-items-center'>
                <div className='w-100'>
                    <Row className='justify-content-center'>
                        <Col xl={4} lg={5} md={7} sm={10} xs={11}>
                            <div className='login__formHolder rounded-3 p-4'>
                                <div className='d-flex align-items-center justify-content-center'>
                                    <img src={logo} className='auth-logo' />
                                </div>
                                <div className='rp_singleinput_holder mt-4 mb-4'>
                                    <p className='rp_label mb-2'>Email Address</p>
                                    <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input
                                            type='text'
                                            placeholder='Enter email'
                                            id="email"
                                            name="email"
                                            className='rp_singleInput flex-grow-1 w-100'
                                            onChange={(e) => { handleChange(e) }}
                                        />
                                    </div>
                                    <span className="text-danger f-12 d-block text-left">{errors?.email}</span>

                                </div>

                                <div className='rp_singleinput_holder mb-4'>
                                    <p className='rp_label mb-2'>Password</p>
                                    <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input type={oldPw ? 'text' : 'password'} placeholder='Enter Password' className='rp_singleInput flex-grow-1'
                                            name="password" id="password" onChange={(e) => { handleChange(e) }}
                                        />

                                        <i class={oldPw ? 'fa-solid fa-eye-slash' : "fa-solid fa-eye"} onClick={() => setOldPw(!oldPw)} />
                                    </div>
                                    <span className="text-danger f-12 d-block text-left">{errors?.password}</span>

                                </div>

                                <div className='text-center'>
                                    {/* <NavLink to='/dashboard' className='sidebar_links'> */}
                                    <button className='orange_primary_btn mb-2 mt-2 w-100' onClick={() => { handlelogin() }}>Login</button>
                                    {/* </NavLink> */}
                                </div>

                                <p className='login__forgotLinkText text-center mt-3'>Don't remind password <NavLink to='/forgot-Password' className='sidebar_links'>Forgot Password</NavLink></p>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    )
}

export default Login