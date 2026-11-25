import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import LogoutModal from "../Modals/LogoutModal";
import { Accordion } from "react-bootstrap";
import { IoMdLogOut } from "react-icons/io";


function Sidebar() {

    const location = useLocation().pathname;

    // modal
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
        <>
            <div className="sidebar d-flex flex-column justify-content-between align-items-start">
                <div className="w-100">
                    <div className="sidebar_logo_holder px-4 py-3">
                        <img src={require('../assets/images/Logo.svg').default} className="img-fluid main_logo" />
                    </div>
                    {/* <p>{Math.random() * 100}</p> */}
                    <ul className="pt-4">
                        <li className="mb-3">
                            <NavLink to='/dashboard' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/grid.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Dashboard</p>
                            </NavLink>
                        </li>
                        <li className="mb-3">
                            <NavLink to='/forgotPassword' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/forgotPassword.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Forgot Password</p>
                            </NavLink>
                        </li>

                        {/* <li className="mb-3">
                <NavLink to='/network' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                    <img src={require('../assets/images/network.svg').default} className="img-fluid sidebar_linkImg" />
                    <p className="sidebar_link_hint">Bitcoin Network</p>
                </NavLink>
            </li> */}

                        <li className="mb-3">
                            {/* <NavLink to='/userWallet' className="sidebar_links rounded-end-5 d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/user.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Users</p>
                            </NavLink> */}
                            <NavLink to='/users' className="sidebar_links rounded-end-5 d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/user.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Users</p>
                            </NavLink>
                        </li>

                        {/* <li className="mb-3">
                <NavLink to='/supportTicket' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                    <img src={require('../assets/images/ticket.svg').default} className="img-fluid sidebar_linkImg" />
                    <p className="sidebar_link_hint">Support Ticket</p>
                </NavLink>
            </li> */}
                        <li className="mb-3">
                            <NavLink to='/groups' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/group.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Groups</p>
                            </NavLink>
                        </li>
                        <li className="mb-3">
                            <NavLink to='/eventlists' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/events.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Events</p>
                            </NavLink>
                        </li>
                        {/* <li className="mb-3">
                            <NavLink to='/transactions' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/exchange.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Transaction</p>
                            </NavLink>
                        </li> */}
                        <li className="mb-3">
                            <div className={`sidebar_links acc_links rounded-end-5 p-2 ps-4 pb-0 ${location === '/category' ? "active" : location === '/sub-category' ? "active" : ""}`}>
                                <Accordion className="sidebar_link_accordion">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header
                                        >
                                            <div className="d-flex gap-3 justify-content-start align-items-center">
                                                <img src={require('../assets/images/hobbies.svg').default} className="img-fluid sidebar_linkImg" />
                                                <p className="sidebar_link_hint">Hobbies</p>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body className="d-flex flex-column">
                                            <NavLink to='/category' className="text_sm">
                                                Category
                                            </NavLink>
                                            <NavLink to='/sub-category' className="text_sm">
                                                Sub Category
                                            </NavLink>
                                            {/* <NavLink to='/Groupcategorylist' className="text_sm">
                                                Groups
                                            </NavLink> */}
                                            <NavLink to='/Hobbieslists' className="text_sm">
                                                Hobbies
                                            </NavLink>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>

                            {/* <details>
                                <summary>summart</summary>
                                outli
                            </details> */}
                        </li>

                        {/* <li className="mb-3">
                            <NavLink to='/interests' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/exchange.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Interests</p>
                            </NavLink>
                        </li> */}
                        <li className="mb-3">
                            {/* <div className={`sidebar_links acc_links rounded-end-5 p-2 ps-4 ${location === '/terms-and-conditions' ? "active" : location === '/about' ? "active" : location === '/privacy-policy' ? "active" : ""}`}>
                                <Accordion className="sidebar_link_accordion">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header
                                        >
                                            <div className="d-flex gap-3 justify-content-start align-items-center">
                                                <img src={require('../assets/images/cms.svg').default} className="img-fluid sidebar_linkImg" />
                                                <p className="sidebar_link_hint">CMS</p>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body className="d-flex flex-column">
                                            <NavLink to='/terms-and-conditions' className="text_sm">
                                                Terms & Conditions
                                            </NavLink>
                                            <NavLink to='/about' className="text_sm">
                                                About
                                            </NavLink>
                                            <NavLink to='/privacy-policy' className="text_sm">
                                                Privacy Policy
                                            </NavLink>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div> */}

                            {/* <details>
                                <summary>summart</summary>
                                outli
                            </details> */}
                        </li>
                        <li className="mb-3">

                            <NavLink to='/plans' className={`sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4 ${location === '/addPlans' ? "active" : ""}`}>
                                <img src={require('../assets/images/plans.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Plans</p>
                            </NavLink>
                        </li>
                        {/* <li className="mb-3">
                            <NavLink to='/gender' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/gender.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Gender</p>
                            </NavLink>
                        </li> */}

                        <li className="mb-3">
                            <NavLink to='/emailupdatelists' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/email-announement.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Email Announcement</p>
                            </NavLink>
                        </li>

                        <li className="mb-3">
                            <NavLink to='/emailtemplatelist' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/emailTemplate.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Email Template</p>
                            </NavLink>
                        </li>
                        <li className="mb-3">
                            <NavLink to='/userplanlist' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/subscription.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">User Plan Subscription</p>
                            </NavLink>
                        </li>
                        <li className="mb-3">
                            <NavLink to='/cmslists' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/cms.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">CMS</p>
                            </NavLink>
                        </li>

                        <li className="mb-3">
                            <NavLink to='/faqlists' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/faq.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Faq</p>
                            </NavLink>
                        </li>
                        {/* available is remove the command */}
                        <li className="mb-3">
                            <NavLink to='/helplists' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/userhelp.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">User Help</p>
                            </NavLink>
                        </li>

                        <li className="mb-3">
                            <NavLink to='/feedbacklists' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/userfeedback.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">User Feedback</p>
                            </NavLink>
                        </li>
                        <li className="mb-3">
                            <NavLink to='/reportlist' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/reports.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Reports</p>
                            </NavLink>
                        </li>
                        {/* <li className="mb-3">
                            <NavLink to='/terms-and-conditions' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/exchange.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Terms & Conditions</p>
                            </NavLink>
                        </li>
                        <li className="mb-3">
                            <NavLink to='/about' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/exchange.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">About</p>
                            </NavLink>
                        </li>
                        <li className="mb-3">
                            <NavLink to='/privacy-policy' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/exchange.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Privacy Policy</p>
                            </NavLink>
                        </li> */}
                        {/* <li className="mb-3">
                            <NavLink to='/buyList' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/buylink.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Buy List</p>
                            </NavLink>
                        </li> */}
                        {/* <li className="mb-3">
                            <NavLink to='/sellList' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/selllink.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Sell List</p>
                            </NavLink>
                        </li> */}
                        {/* <li className="mb-3">
                <NavLink to='/subscription' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                    <img src={require('../assets/images/prime.svg').default} className="img-fluid sidebar_linkImg" />
                    <p className="sidebar_link_hint">Subscription</p>
                </NavLink>
            </li> */}
                        {/* <li className="mb-3">
                            <NavLink to='/plans' className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/plan.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Plans</p>
                            </NavLink>
                        </li> */}



                    </ul>
                </div>

                <div className="w-100 d-none d-xl-block">
                    <li className="mb-3 sidebar_logout_button" onClick={handleShow}>
                        <div className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                            <IoMdLogOut fontSize={20} />
                            <p className="sidebar_link_hint">Logout</p>
                        </div>
                    </li>
                </div>



            </div>

            {/* modals */}
            <LogoutModal show={show} handleClose={handleClose} />
            {/* end of modals */}
        </>
    );
}

export default Sidebar;