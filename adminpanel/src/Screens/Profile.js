import React, { useState, useEffect } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'
import EditProfile from '../Modals/EditProfile'

import defaultProfile from '../assets/images/emptyprofile.png'
import { Getadminprofile } from '../api/resetPass'
import config from "../config/config"
function Profile() {
    // modal
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [errors, setErrors] = useState('')
    const [formValue, setFormValue] = useState({});

    useEffect(() => {

        getAdminDetails()

    }, [])

    const getAdminDetails = async () => {

        let resp = await Getadminprofile();
        console.log("responseAdminprofile", resp);
        if (resp.status) {
            setFormValue(resp.data)

        }

    }
    console.log("formValue", formValue, config.AWS_CDN_URL);

    return (
        <>
            <Header title="Profile" />
            <div className=''>
                <div className='text-end'>
                    <button className='orange_primary_btn' onClick={handleShow}>Edit Profile</button>
                </div>
                <Row className='profile_holder'>
                    <Col xxl={5} xl={6} lg={7} md={8} sm={10} >
                        <div>
                            <div className='profile_wrapper mb-4'>
                                <img src={`${config.AWS_CDN_URL}${formValue?.image}`} alt='profile' />
                            </div>
                            <div className='rp_singleinput_holder mb-4'>
                                <p className='rp_label mb-2'>Name</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input disabled={true} type='text' className='rp_singleInput flex-grow-1' value={formValue?.adminname} />
                                </div>
                            </div>


                            <div className='rp_singleinput_holder'>
                                <p className='rp_label mb-2'>Email</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type='email' disabled={true} className='rp_singleInput flex-grow-1' value={formValue?.email} />
                                </div>
                            </div>
                        </div>

                    </Col>


                </Row>

            </div>

            {/* modals */}
            <EditProfile show={show} handleClose={handleClose} getAdminDetails={() => { getAdminDetails() }} editData={formValue} />
            {/* end of modals */}
        </>
    )
}

export default Profile