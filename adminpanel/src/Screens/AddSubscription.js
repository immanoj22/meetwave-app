import React, { useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'

function AddSubscription() {

    const [count, setCount] = useState(1)
    return (
        <>

            <Header title="Add Subscription" />
            <div className='common_page_scroller'>
                <Row className='profile_holder'>
                    <Col lg={7} md={8} sm={10} className='mb-4'>
                        <div className='rp_singleinput_holder'>
                            <p className='rp_label mb-2'>Plan name</p>
                            <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                <input type='text' placeholder='Plan name' className='rp_singleInput flex-grow-1' />
                            </div>
                        </div>
                    </Col>

                    <Col lg={7} md={8} sm={10} className='mb-4'>
                        <div className='rp_singleinput_holder'>
                            <p className='rp_label mb-2'>Price</p>
                            <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                <input type='number' placeholder='Price' className='rp_singleInput flex-grow-1' />
                            </div>
                        </div>
                    </Col>

                    <Col lg={7} md={8} sm={10} className='mb-4'>
                        <div className='rp_singleinput_holder'>
                            <p className='rp_label mb-2'>Days</p>
                            <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                <input type='number' placeholder='Days' className='rp_singleInput flex-grow-1' />
                            </div>
                        </div>
                    </Col>

                    <Col lg={7} md={8} sm={10} className='mb-4'>
                        <div className='rp_singleinput_holder'>
                            <p className='rp_label mb-2'>Highlights</p>
                            {[...Array(count)].map((item) =>
                                <div className='mb-3'>
                                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                        <input type='text' placeholder='Highlights' className='rp_singleInput flex-grow-1' />
                                    </div>
                                    <div className='d-flex gap-3 justify-content-end mt-3'>
                                        <button className='subs_add_btn rounded-2' onClick={() => setCount(count + 1)} ><i class="fa-solid fa-plus" /></button>
                                        {count != 1 &&
                                            <button className='subs_dlt_btn rounded-2' onClick={() => setCount(count - 1)}><i class="fa-solid fa-trash" /></button>}
                                    </div>
                                </div>
                            )}
                        </div>

                    </Col>
                </Row>

                <div className='d-flex gap-3'>
                    <button className='secondary_btn'>Cancel</button>
                    <button className='orange_primary_btn'>Save</button>
                </div>
            </div>
        </>
    )
}

export default AddSubscription