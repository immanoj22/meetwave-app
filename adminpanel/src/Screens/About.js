
/** npm import */
import React, { useState, useEffect } from 'react'
import { Col, Container, Row } from "react-bootstrap";
import RichTextEditor from "../Components/RichTextEditor";


/** npm import */
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";


/** code start */

function About() {

    return (
        <>
            <Header title="About" />

            <div className="common_page_scroller">
                <Row>
                    <Col xs={12} lg={7} md={8} sm={10} className='mb-4'>
                        <div className='rp_singleinput_holder'>
                            <p className='rp_label mb-2'>Add Title</p>
                            <div className='d-flex align-items-center gap-3 '>

                                <div className='rp_input_holder w-100 rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type='text' placeholder='About' id="price" name="price" className='rp_singleInput flex-grow-1'
                                    // value={formValue.price}
                                    // onChange={(event) => handlechange(event)}
                                    />

                                </div>
                                <button className='orange_primary_btn'>Add</button>
                            </div>
                            {/* <span className="errors_style" id="price-error" >error</span> */}

                        </div>
                        <div className="mt-4">
                            <RichTextEditor
                                value="<p>This is an example CKEditor WYSIWYG editor instance.</p>"
                            />
                        </div>
                    </Col>
                </Row>



            </div>
        </>
    );
}

export default About;
