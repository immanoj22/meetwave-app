import React, { useEffect, useState } from 'react'
import { Col, Row, Dropdown, Container, Offcanvas, Accordion } from 'react-bootstrap'
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import LogoutModal from '../Modals/LogoutModal';
import config from "../config/config"
import { Getadminprofile } from '../api/resetPass';
import { IoMdLogOut } from "react-icons/io";

function Header({ title }) {
    console.log("headers", title);
    const navigate = useNavigate();

    const location = useLocation().pathname

    //modal
    const [showLogout, setShowLogout] = useState(false);

    const handleCloseLogout = () => {
        localStorage.clear();

        setShowLogout(false);

        navigate("/login");
    }
    const handleShowLogout = () => setShowLogout(true);

    const dispatch = useDispatch();

    const [mobSearch, setMobSearch] = useState(false)

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const setSwitcher = (val) => {
        dispatch({
            type: "switching",
            value: { switcher: val }
        })
    }

    const [formValue, setFormValue] = useState({});

    useEffect(() => {

        getAdminDetails()

    }, [])

    const getAdminDetails = async () => {

        let resp = await Getadminprofile();
        if (resp.status) {
            setFormValue(resp.data)

        }

    }


    const handleProfile = () => {


        navigate("/profile");
    }

    const handleresetPassord = () => {


        navigate("/resetPassord");
    }

    return (
        <>
            <div className='header'>
                {mobSearch &&
                    <div className='mob_searchbar_holder p-3 d-flex justify-content-start align-items-center gap-3'>
                        <input type='text' placeholder='Search' className='mob_searchbar_inp flex-grow-1' />
                        <i class="fa-solid fa-xmark" onClick={() => setMobSearch(false)} />
                    </div>}
                <div className='d-flex justify-content-between align-items-center w-100'>
                    <div className='d-flex gap-3'>
                        <p className='header_title d-block d-xl-none' onClick={handleShow}><i class="fa-solid fa-bars" /></p>
                        <p className='header_title'>{title}</p>
                    </div>
                    <div className='d-flex justify-content-end align-items-center gap-3'>
                        {/* <div className='header_searchbar_holder  d-none d-md-block'>
                            <div className='header_searchbar rounded-5 d-flex justify-content-start align-items-center gap-2 px-3 py-2'>
                                <img src={require('../assets/images/searchglass.svg').default} className='img-fluid' />
                                <input type='text' className='header_searchbar_input flex-grow-1' placeholder='Search' />
                            </div>
                        </div> */}
                        {/* mobile searchbar */}
                        {/* <img src={require('../assets/images/searchglass.svg').default} className='img-fluid mob_searchglass d-block d-md-none' onClick={() => setMobSearch(true)} /> */}


                        {/* end of mobile searchbar */}
                        {/* <div className='header_switch_holder d-none d-sm-block'>
                            <div className='header_dragger p-2 rounded-5 position-relative d-flex justify-content-center align-items-center w-100' >
                                <img src={switcher ? require('../assets/images/bitcoin.svg').default : require('../assets/images/thunder.svg').default} className={`img-fluid header_switchThunder ${switcher ? 'header_thunderRight' : 'header_thunderLeft'}`} onClick={() => setSwitcher(!switcher)} />
                                <p className={`header_switchHint ${switcher ? 'me-3' : 'ms-3'} `}>{switcher ? 'Switch to BTC' : 'Switch to LN'}</p>
                            </div>
                        </div> */}

                        <div className='header_profileImg_holder'>
                            <Dropdown className='header_profile_drop' drop='down'>
                                <Dropdown.Toggle variant="success" id="dropdown-basic">

                                    <img src={formValue?.image ? `${config.AWS_CDN_URL}${formValue?.image}` : require('../assets/images/emptyprofile.png')} className='img-fluid header_profileImg' />
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item className='rounded-2' onClick={handleProfile}>Profile</Dropdown.Item>

                                    <Dropdown.Item className='rounded-2' onClick={handleresetPassord}>Reset Password</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* offcanva content */}
            <Offcanvas show={show} onHide={handleClose} backdrop="static" className='header_canvas d-xl-none'>
                <Offcanvas.Body>
                    <div className='header_canva_header pb-2 d-flex justify-content-between align-items-center'>
                        <img src={require('../assets/images/Logo.svg').default} className='img-fluid main_logo' />
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>
                    {/* <ul className="pt-4">
                        <li className="rounded-end-5 mb-3">
                            <NavLink to='/' className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/grid.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Dashboard</p>
                            </NavLink>
                        </li>

                        <li className="rounded-end-5 mb-3">
                            <NavLink to='/exchange' className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/exchange.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Transaction</p>
                            </NavLink>
                        </li>

                        <li className="rounded-end-5 mb-3">
                            <NavLink to='/network' className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/network.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Bitcoin Network</p>
                            </NavLink>
                        </li>

                        <li className="rounded-end-5 mb-3">
                            <NavLink to='/userWallet' className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/wallet.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Users Wallet</p>
                            </NavLink>
                        </li>

                        <li className="rounded-end-5 mb-3">
                            <NavLink to='/supportTicket' className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/ticket.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Support Ticket</p>
                            </NavLink>
                        </li>

                        <li className="rounded-end-5 mb-3">
                            <NavLink to='/settings' className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/setting.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Settings</p>
                            </NavLink>
                        </li>
                        <li className="rounded-end-5 mb-3">
                            <NavLink to='/subscription' className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/prime.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Subscription</p>
                            </NavLink>
                        </li>
                        <li className="rounded-end-5 mb-3">
                            <NavLink to='/plans' className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/prime.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">plans</p>
                            </NavLink>
                        </li>
                        <li className="rounded-end-5" onClick={handleShowLogout}>
                            <NavLink className="sidebar_links d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/logout.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Logout</p>
                            </NavLink>
                        </li>

                    </ul>

                    <div className='header_switch_holder d-md-none ps-4'>
                        <div className='header_dragger p-2 rounded-5 position-relative d-flex justify-content-center align-items-center w-100' >
                            <img src={switcher ? require('../assets/images/bitcoin.svg').default : require('../assets/images/thunder.svg').default} className={`img-fluid header_switchThunder ${switcher ? 'header_thunderRight' : 'header_thunderLeft'}`} onClick={() => { setSwitcher(!switcher); handleClose() }} />
                            <p className={`header_switchHint ${switcher ? 'me-3' : 'ms-3'} `}>{switcher ? 'Switch to BTC' : 'Switch to LN'}</p>
                        </div>
                    </div> */}

                    <ul className="pt-4 sidebar">
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
                        <li className="mb-3">

                            <NavLink to='/users' className="sidebar_links rounded-end-5 d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <img src={require('../assets/images/user.svg').default} className="img-fluid sidebar_linkImg" />
                                <p className="sidebar_link_hint">Users</p>
                            </NavLink>
                        </li>
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
                            <div className={`sidebar_links acc_links rounded-end-5 p-2 ps-4 ${location === '/category' ? "active" : location === '/sub-category' ? "active" : ""}`}>
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
                        {/* <li className="mb-3">
                            <div className={`sidebar_links acc_links rounded-end-5 p-2 ps-4 ${location === '/terms-and-conditions' ? "active" : location === '/about' ? "active" : location === '/privacy-policy' ? "active" : ""}`}>
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
                        {/* </li> */}
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



                    </ul>

                    <div className="w-100 ">
                        <li className="mb-3 sidebar_logout_button" onClick={handleShow}>
                            <div className="sidebar_links rounded-end-5  d-flex gap-3 justify-content-start align-items-center p-2 ps-4">
                                <IoMdLogOut fontSize={20} />
                                <p className="sidebar_link_hint">Logout</p>
                            </div>
                        </li>
                    </div>

                </Offcanvas.Body>
            </Offcanvas>
            {/* end of offcanva content */}

            {/* modals */}
            <LogoutModal show={showLogout} handleClose={handleCloseLogout} />
            {/* end of modals */}
        </>
    )
}

export default Header