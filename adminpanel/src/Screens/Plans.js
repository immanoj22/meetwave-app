import React, { useState, useEffect } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'
import ReactDatatable from '@ashvin27/react-datatable';
import AddPlans from './AddPlans'
import EditPlans from '../Modals/EditPlans'
import { getplanlists, deleteData, hideshowplan, planlistDelete } from '../api/api'
import { toastAlert } from "../lib/toastAlert";
import keys from "../config/config";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaPlus } from "react-icons/fa6";
import toast from 'react-hot-toast';
import { sanitizeHtml } from '../lib/sanitizeHtml';

import { useNavigate } from 'react-router-dom'

const Plans = () => {

    // edit modal
    const [show, setShow] = useState(false);
    const [errors, setError] = useState()
    const [editData, setEditData] = useState({})
    const [list, setList] = useState([
        {
            id: 1
        }
    ])
    const navigate = useNavigate()
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [deleteId, setDeleteId] = useState('')

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
            className: "text-center w_100",
            align: "center",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{index + 1}
                </p>
        },
        {
            key: "ProductId",
            text: "ProductId",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?._id}</p>
                )
            }
        },
        {
            key: "plantype",
            text: "Plan Type",
            className: "text-center w_100",
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
            className: "text-center w_150",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.plan_description?.length > 80 ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(record?.plan_description.slice(0, 80) + '...') }}></div> : <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(record?.plan_description) }}></div>}</p>
                )
            }
        },
        {
            key: "level",
            text: "plan level",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.level}</p>
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
            text: "Add Plan",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (

                    // record?.planType == "free" ? "-" :
                    <button className='interest_value border-0 outline-0' onClick={() => navigate('/plan-details', { state: record })}>Add Plans</button>
                )
            }
        },
        {
            key: "action",
            text: "Action",
            className: "text-center w_150",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <div className='d-flex justify-content-center align-items-center gap-3'>
                        <button className='green_edit_button' onClick={() => { setEditData(record); handleShow() }}> <FaEdit className='ms-1' /> </button>
                        {/*   <button className='delete_button' onClick={() => { DeleteValue(record?._id) }}>
                            <FaTrash />
                        </button> */}
                    </div>
                )
            }
        },
        {
            key: "hideshow",
            text: "hide/show",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) => (<>
                {console.log("ererererere", record)}
                {/* // <p className=" text-center">{record?.category}</p>, */}
                <div className="custom_toggle custom_toggle_secondary">
                    <label class="switch">
                        {/* <button
                            type="checkbox" onClick={() => hideshowchange(record?.hideshow == "visible" ? "hidden" : "visible", record?._id)}
                        ></button> */}
                        <input
                            checked={record.hideshow == "visible" ? true : false}
                            type="checkbox" onChange={() => hideshowchange(record.hideshow == "visible" ? "hidden" : "visible", record._id)}
                        />
                        <span class="slider round"></span>
                    </label>
                </div>

            </>)


        },
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

    useEffect(() => {
        // listplan();
        Getplanlists()
    }, [])

    // const listplan = async () => {
    //     try {
    //         let { status, loading, error, message, result } = await getPlan();
    //         if (status) {

    //             toastAlert("successData", result);
    //             setList(result?.data)
    //         } else {
    //             if (error) {
    //                 setError(error);
    //             } else if (message) {
    //                 toastAlert("error", message);
    //             }
    //         }
    //     } catch (err) {
    //         console.log("listplan err", err);

    //     }
    // }

    const hideshowchange = async (record, id) => {
        console.log("records", record);
        try {
            let payload = {

                planId: id,
                hideshow: record
            }
            let resp = await hideshowplan(payload)
            console.log("respmses", resp);
            if (resp.status) {
                toast.success(resp.message)
            }
            else {
                toast.error(resp.message)

            }
            Getplanlists()
        } catch (error) {
            console.log("error", error);
        }
    }



    const DeleteValue = async (record) => {
        console.log("records", record);
        try {
            const confirm = window.confirm("Are you sure to delete?")
            if (confirm) {
                let payload = {
                    planid: record,
                }
                let resp = await planlistDelete(payload)
                console.log("respmses", resp);
                if (resp.status) {
                    toast.success(resp.message)
                    Getplanlists()
                }
                else {
                    toast.error(resp.message)
                }
            }
            // else {
            //     toast.success("Cancelled delete")

            // }

        } catch (error) {
            console.log("error", error);
        }
    }


    const Getplanlists = async () => {
        try {
            let resp = await getplanlists()
            console.log("responses", resp);
            if (resp.status) {
                setList(resp.data)
            }
        } catch (error) {
            console.log("error_planlist", error);
        }
    }


    return (
        <>
            <Header title="Plan" />
            <div className='common_page_scroller'>

                <div className='text-end mt-2'>
                    <NavLink to='/addPlans' className='sidebar_links'>
                        {
                            list.length >= 1 ? "" :

                                <div className='d-flex justify-content-end'>
                                    <button className='orange_primary_btn d-flex align-items-center gap-2' ><FaPlus />Add Plan Type</button>
                                </div>
                        }
                    </NavLink>
                </div>
                <div className='exchange_table_holder plans__tableHolder dashboard_box rounded-3 mt-4'>
                    <ReactDatatable
                        config={config}
                        records={list}
                        columns={columns}
                        extraButtons={extraButtons}
                    />
                </div>
            </div>

            {/* modals */}
            <EditPlans show={show} handleClose={handleClose} editData={editData} planlist={Getplanlists} />
            {/* end of modals */}

        </>
    )
}

export default Plans