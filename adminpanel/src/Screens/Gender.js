import React, { useState, useEffect, useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'
import ReactDatatable from '@ashvin27/react-datatable';
import { AddEditGender, Genderlists } from '../api/api'
import { toastAlert } from "../lib/toastAlert";
import keys from "../config/config";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaPlus } from "react-icons/fa6";
import toast from 'react-hot-toast';
import { sanitizeHtml } from '../lib/sanitizeHtml';

import { useNavigate } from 'react-router-dom'
import isEmpty from 'is-empty'
import EditGender from '../Modals/EditGender'

const Gender = () => {

    // edit modal
    const [show, setShow] = useState(false);
    const [showGenderEdit, setShowGenderEdit] = useState(false)
    const [errors, setError] = useState()
    const [editData, setEditData] = useState({})
    const [list, setList] = useState([
        {
            id: 1
        }
    ])

    const focusInputRef = useRef(null);

    const navigate = useNavigate()
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [deleteId, setDeleteId] = useState('')
    var initial = { "gendername": "" }
    const [formData, setFormData] = useState(initial)
    console.log("fgdfgfdgdfgfdg", formData);

    const handleShowGenderEdit = (item) => {
        console.log("ewrefgsdgdfg", item);
        setEditData(item);
        setShowGenderEdit(true)
    }

    const handleCloseGenderEdit = () => {
        setShowGenderEdit(false)
    }
    // const state = {
    //     records: [
    //       {
    //         "name": <p className='exchange_table_values text-center'>Demo</p>,
    //         "symbol": <div className='text-center'><img src={require('../assets/images/bitcoin.svg').default} className='img-fluid plans__symbolImg' /></div>,
    //         "price": <p className='exchange_table_values text-center'>$ 100</p>,
    //         "description": <p className='exchange_table_values text-center'>Lorem ipsum simply dummy text</p>,
    //         "validity": <p className='exchange_table_values text-center'>2 Days</p>,

    //       },
    //       {
    //         "name": <p className='exchange_table_values text-center'>Demo</p>,
    //         "symbol": <div className='text-center'><img src={require('../assets/images/viothunder.svg').default} className='img-fluid plans__symbolImg' /></div>,
    //         "price": <p className='exchange_table_values text-center'>$ 100</p>,
    //         "description": <p className='exchange_table_values text-center'>Lorem ipsum simply dummy text</p>,
    //         "validity": <p className='exchange_table_values text-center'>2 Days</p>,

    //       },

    //     ]
    // }

    const columns = [
        {
            key: "",
            text: "S.No",
            align: "center",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{index + 1}
                </p>
        },
        {
            key: "plantype",
            text: "Plan Type",
            className: "text-center",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.planType}</p>
                )
            }
        },
        {
            key: "plandescription",
            text: "Plan Description",
            className: "text-center",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.plan_description?.length > 80 ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(record?.plan_description.slice(0, 80) + '...') }}></div> : <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(record?.plan_description) }}></div>}</p>
                )
            }
        },
        {
            key: "status",
            text: "Status",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <p className={`${record?.hideshow === "visible" ? "green_text" : "red_text"}`}>{record?.hideshow}</p>,
        },
        {
            key: "view",
            text: "View",
            className: "text-center",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <button className='interest_value border-0 outline-0' onClick={() => navigate('/plan-details', { state: record })}>Click to Add Plans</button>
                )
            }
        },
        {
            key: "action",
            text: "Action",
            className: "activity",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <div className='d-flex justify-content-center align-items-center gap-3'>
                        <button className='green_edit_button' onClick={() => { setEditData(record); handleShow() }}> <FaEdit className='ms-1' /> </button>
                        {/* <button className='delete_button' onClick={() => { onsubmit(record?._id) }}>
                            <FaTrash />
                        </button> */}
                    </div>
                )
            }
        },
        // {
        //     key: "hideshow",
        //     text: "hide/show",
        //     className: "text-center w_100",
        //     align: "center",
        //     sortable: false,
        //     cell: (record, index) => (<>
        //         {console.log("ererererere", record)}
        //         {/* // <p className=" text-center">{record?.category}</p>, */}
        //         <div className="custom_toggle custom_toggle_secondary">
        //             <label class="switch">
        //                 <button
        //                     type="checkbox" onClick={() => hideshowchange(record?.hideshow == "visible" ? "hidden" : "visible", record?._id)}
        //                 ></button>
        //                 <span class="slider round"></span>
        //             </label>
        //         </div>

        //     </>)


        // },
    ];

    const config = {
        page_size: 10,
        length_menu: [10, 20, 50],
        filename: "Emailtemplates",
        no_data_text: "No Email Templates found!",
        language: {
            length_menu: "Show _MENU_ result per page",
            filter: "Filter in records...",
            info: "Showing _START_ to _END_ of _TOTAL_ records",
            pagination: {
                first: "First",
                previous: "Previous",
                next: "Next",
                last: "Last",
            },
        },
        show_length_menu: false,
        show_filter: false,
        show_pagination: false,
        show_info: false,
    };

    const extraButtons = [
        {
            className: "btn btn-primary buttons-pdf",
            title: "Export TEst",
            children: [
                <span>
                    <i className="glyphicon glyphicon-print fa fa-print" aria-hidden="true"></i>
                </span>
            ],
            onClick: (event) => {
                console.log(event);
            },
        },
        {
            className: "btn btn-primary buttons-pdf",
            title: "Export TEst",
            children: [
                <span>
                    <i className="glyphicon glyphicon-print fa fa-print" aria-hidden="true"></i>
                </span>
            ],
            onClick: (event) => {
                console.log(event);
            },
            onDoubleClick: (event) => {
                console.log("doubleClick")
            }
        },
    ]
    const [genderForms, setGenderForms] = useState([

    ])
    const [status, setStatus] = useState(false)
    useEffect(() => {

        // Getplanlists()
        getGenderlists()
    }, [])



    const getGenderlists = async () => {
        try {
            let resp = await Genderlists()
            console.log("resp", resp);
            setGenderForms(resp.data)

        } catch (error) {
            console.log("error", error);
        }
    }





    const handlechange = async (e) => {
        e.preventDefault();
        const { id, value } = e.target;


        console.log("value", id, value)
        let formdata = { ...formData, ...{ [id]: value } }
        setFormData(formdata)
        console.log("formval", formData)

    }

    const addGender = async () => {
        // setReferralRows([...referralRows, { numberOfrefers: "", earnPersentage: "" }])
        if (isEmpty(formData?.gendername)) {
            return toast.error("gendername can't be empty")

        }
        else {
            let payload = {
                gendername: formData?.gendername,
                type: "add"
            }

            let respData = await AddEditGender(payload)
            console.log("fgawfrefr", respData);
            if (respData.status) {
                toast.success(respData.message)
                getGenderlists()
                setFormData(initial)
            } else {
                toast.success(respData?.message)
            }
        }


    };


    const removeReferral = async (e, type) => {
        console.log("dfgfdgdfg", e, type);
        // const list = [...referralRows]
        // list.splice(index, 1)
        // setReferralRows(list)
        if (type == "delete") {

            let confirm = window.confirm("Are you sure to delete?")
            if (confirm) {
                var removeData = await AddEditGender({ id: e._id })
                if (removeData.status) {
                    toast.success(removeData.message)
                    getGenderlists()

                } 
                // else {
                //     toast.success(removeData.message)
                // }
            }
            else {
                toast.success("Cancelled delete")
            }
        }

    };





    const handleAddGenderForms = () => {
        setGenderForms([...genderForms, { id: 3 }])
    }
    console.log('formaddd', genderForms)

    return (
        <>

            {/* start of modal import */}

            {/* <EditGender show={showGenderEdit} handleClose={handleCloseGenderEdit} /> */}

            {/* end of modal import */}


            {/* modals */}
            <EditGender show={showGenderEdit} handleClose={handleCloseGenderEdit} getGender={getGenderlists} EditData={editData} />
            {/* end of modals */}

            <Header title="Gender" />

            <div className='common_page_scroller'>

                <div className='gender_card p-2 p-md-4'>

                    <div className='row'>
                        <div className='col-6'>
                            <div>
                                <h5 className='h5_heads'>
                                    Add Gender
                                </h5>


                                <div className='d-flex flex-wrap align-items-end gap-3 mt-3'>
                                    <div className='d-flex flex-column gap-2 card_form_wrapper'>

                                        <input placeholder='Enter the Gender' id="gendername" value={formData?.gendername} onChange={(e) => { handlechange(e) }} />
                                    </div>
                                    <button type="button" className='orange_primary_btn' onClick={() => addGender()}>
                                        Add
                                    </button>
                                </div>




                            </div>

                        </div>
                    </div>



                </div>
            </div>

            <div className='common_page_scroller mt-5'>

                <div className='gender_card p-2 p-md-4'>

                    <div className='row'>
                        <div className='col-6'>
                            <div>
                                <h5 className='h5_heads'>
                                    Genders
                                </h5>
                                {genderForms.map((item, index) => (
                                    <div key={index}>

                                        <div className='d-flex flex-wrap align-items-end gap-3 mt-3'>
                                            <div className='d-flex flex-column gap-2 card_form_wrapper'>
                                                {/* <label>{item.gendername}</label> */}
                                                <input type="text" placeholder='Enter the Gender' id="gendername" value={item?.gendername} disabled={true} />
                                            </div>
                                            <button className='orange_primary_btn' onClick={() => removeReferral(item, "delete")}>
                                                Delete
                                            </button>
                                            <button className='orange_primary_btn' onClick={() => handleShowGenderEdit(item)}>
                                                Edit
                                            </button>
                                        </div>
                                    </div>

                                ))}


                            </div>

                        </div>
                    </div>



                </div>
            </div>


        </>
    )
}

export default Gender