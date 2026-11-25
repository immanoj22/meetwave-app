import React, { useState, useEffect } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'
import ReactDatatable from '@ashvin27/react-datatable';

import keys from "../config/config";
import { FaPlus } from "react-icons/fa6";
import AddPlanDetails from '../Modals/AddPlanDetails'
import EditPlanDetails from '../Modals/EditPlanDetails'
import { FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { deleteData } from '../api/api'
import PlanDetailsTrash from '../Modals/PlanDetailsTrash'

const PlanDetails = () => {

    let location = useLocation()
    console.log("fdgdfgdfh", location);
    let Data = location.state
    console.log("datassfsg", Data);
    // edit modal
    const [show, setShow] = useState(false);
    // const [planDays,setPlanDays]= useState([])
    const [errors, setError] = useState()
    const [editData, setEditData] = useState({})
    const [list, setList] = useState([
        {
            id: 1
        }
    ])
    console.log("liststss", list);
    const [showAddPlanDetails, setShowAddPlanDetails] = useState(false);
    const [showEditPlanDetails, setShowEditPlanDetails] = useState(false);
    const [planDays, setPlandays] = useState([])
    // const [editData, setEditData] = useState({})
    const [showPlanDetailsTrash, setShowPlanDetailsTrash] = useState(false);
    const navigate = useNavigate();

    console.log("dghdfghgfhfghgfh", planDays);
    useEffect(() => {
        setPlandays(Data.plan_days)
    }, [Data])
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleClosePlanDetailsTrash = () => {
        setShowPlanDetailsTrash(false);
    }
    const handleShowAddPlanDetails = () => {
        setShowAddPlanDetails(true)
    }
    const handleCloseAddPlanDetails = () => {
        setShowAddPlanDetails(false)
    }
    const handleShowEditPlanDetails = (record) => {
        setShowEditPlanDetails(true)
        setEditData(record)
    }
    const handleCloseEditPlanDetails = () => {
        setShowEditPlanDetails(false)
    }

    const [deleteId, setDeleteId] = useState('')



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
            key: "PlanId",
            text: "PlanId",
            className: "text-center",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?._id}</p>
                )
            }
        },
        {
            key: "days",
            text: "Plan Days",
            className: "text-center",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.planDays}</p>
                )
            }
        },
        {
            key: "price",
            text: "Plan Price",
            className: "text-center",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.planPrice}</p>
                )
            }
        },
        // {
        //     key: "bonuswords",
        //     text: "Bonus Words",
        //     className: "text-center",
        //     align: "center",
        //     sortable: false,
        //     cell: (record) => {
        //         return (
        //             <p>{record?.bonuswords}</p>
        //         )
        //     }
        // },
        {
            key: "action",
            text: "Action",
            className: "activity",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <div className='d-flex justify-content-center align-items-center gap-3'>
                        <button className='green_edit_button' onClick={() => handleShowEditPlanDetails(record)}><FaEdit className='ms-1' /></button>
                        <button className='delete_button' onClick={() => { DeleteValue(record?._id) }} >
                            <FaTrash />
                        </button>
                    </div>
                )
            }
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




    const DeleteValue = async (record) => {
        console.log("records", record, Data._id);
        try {
            setShowPlanDetailsTrash(true);
            // const confirm = window.confirm("Are you sure to delete?")
            // if(confirm){
            //     let payload = {
            //         planid: Data._id,
            //         planinId: record
            //     }
            //     let resp = await deleteData(payload)
            //     console.log("respmses", resp);
            //     if (resp.status) {
            //         toast.success(resp.message)
            //         navigate("/plans")
            //     }
            //     else {
            //         toast.error(resp.message)
            //     }
            // }
            // else{
            //     toast.success("Cancelled delete")
            // }
         
        } catch (error) {
            console.log("error", error);
        }
    }


    return (
        <>

            {/* start of modal import */}

            <AddPlanDetails show={showAddPlanDetails} handleClose={handleCloseAddPlanDetails} AddData={Data} />
            <EditPlanDetails show={showEditPlanDetails} handleClose={handleCloseEditPlanDetails} EditData={editData} Data={Data} />
            <PlanDetailsTrash show={showPlanDetailsTrash} handleClose={handleClosePlanDetailsTrash}  />

            {/* end of modal import */}

            <div className='d-flex justify-content-between align-items-center'>
                <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={() => navigate("/plans")}>Back</button>

            </div>
            <Header title="Plan Details" />

            <div className='d-flex justify-content-between align-items-center'>
                <p className='text-white mb-0 fw-bolder'> Plan's</p>
                <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={handleShowAddPlanDetails}><FaPlus />Add Plan's</button>

            </div>
            <div className='common_page_scroller mt-5'>

                {/* <div className='text-end mt-2'>
                                <NavLink to='/addPlans' className='sidebar_links'>
                                    <button className='orange_primary_btn d-flex align-items-center gap-2'><FaPlus />Add Plan Details</button>
                                </NavLink>
                            </div> */}
                <div className='exchange_table_holder plans__tableHolder dashboard_box rounded-3 mt-4'>
                    <ReactDatatable
                        config={config}
                        records={planDays}
                        columns={columns}
                        extraButtons={extraButtons}
                    />
                </div>
            </div>

            {/* modals */}
            {/* <EditPlans show={show} handleClose={handleClose} editData={editData} /> */}
            {/* end of modals */}

        </>
    )
}

export default PlanDetails