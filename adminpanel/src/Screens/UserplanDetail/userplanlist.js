import React, { useState, useEffect } from 'react'
import { Col, Container, Pagination, Row } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import Header from '../../Components/Header'
import ReactDatatable from '@ashvin27/react-datatable';




import { FaPlus, FaTrash } from "react-icons/fa6";

import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { PlansubscribeDelete, refundUpdateStatus, UserplanDetails } from '../../api/api'
import { LuSearch } from "react-icons/lu";

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
    const navigate = useNavigate();
    const [limit, setLimit] = useState(5)
    const [currentpage, setCurrentPage] = useState(1)
    const [totalCount, settotalCount] = useState(0)
    const [searchText, setSearchText] = useState("")
    console.log("dghdfghgfhfghgfh", planDays);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{index + 1}
                </p>
        },
        {
            key: "subscription",
            text: "Subscription Id",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {

                return (
                    <p>{record?._id}</p>
                )
            }
        },
        {
            key: "plan",
            text: "Plan Id",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {

                return (
                    <p>{record?.plandays?._id}</p>
                )
            }
        },
        {
            key: "User",
            text: "Plan User",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.User?.username}</p>
                )
            }
        },

        {
            key: "plantype",
            text: "Plan Type",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                console.log("record?.plandays?.planType", record?.plandays?.planType);

                return (
                    <p>{record?.plandays?.planType}</p>
                )
            }
        },
        {
            key: "days",
            text: "Plan Days",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                console.log("record?.planDays", record?.planDays);

                return (
                    <p>{record?.planDays}</p>
                )
            }
        },
        {
            key: "price",
            text: "Plan Price",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                console.log("record?.planPrice", record?.planPrice);

                return (
                    <p>{record?.planPrice}</p>
                )
            }
        },
        {
            key: "Start Date",
            text: "Start Date",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{`${new Date(record?.startDate).toLocaleDateString().replace(/\//g, '-')}`}</p>
                )
            }
        },
        {
            key: "Expiry Date",
            text: "Expiry Date",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{`${new Date(record?.EndDate).toLocaleDateString().replace(/\//g, '-')}`}</p>


                    // <p>{`${new Date(record?.EndDate).getDate() < 10 ? '0' + new Date(record?.EndDate).getDate() : new Date(record?.EndDate).getDate()}-${new Date(record?.EndDate).getMonth() < 10 ? '0' + new Date(record?.EndDate).getMonth() : new Date(record?.EndDate).getMonth()}-${new Date(record?.EndDate).getFullYear()} ${new Date(record?.EndDate).getHours() < 10 ? '0' + new Date(record?.EndDate).getHours() : new Date(record?.EndDate).getHours()}:${new Date(record?.EndDate).getMinutes() < 10 ? '0' + new Date(record?.EndDate).getMinutes() : new Date(record?.EndDate).getMinutes()}`}</p>
                )
            }
        },
        // {
        //     key: "isActive",
        //     text: "Active",
        //     className: "text-center w_130",
        //     align: "center",
        //     sortable: false,
        //     cell: (record) => {
        //         return (
        //             <p className={`text-center ${(record?.isActive === "started" || record?.isActive === "comingsoon") ? "green_text" : "red_text"}`}>{record?.isActive}</p>
        //         )
        //     }
        // },
        {
            key: "isActive",
            text: "Subscription Status",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p className={`text-center ${(record?.subscriptionStatus === "subscribe" || record?.isActive === "started" || record?.isActive === "comingsoon" || record?.subscriptionStatus === "trial") ? "green_text" : "red_text"}`}>{record?.subscriptionStatus}</p>
                )
            }
        },
        {
            key: "action",
            text: "Change Status",
            className: "activity",
            align: "center",
            sortable: false,
            cell: (record) => {
                if (record?.subscriptionStatus === "cancel") {
                    return (
                        <button className='orange_primary_btn' onClick={() => { refundUpdate(record) }}>
                            Mark as Refunded
                        </button>
                    )
                }
                if (record?.subscriptionStatus === "refunded" || record?.subscriptionStatus === "refund") {
                    return <p className='text-center red_text mb-0'>Refunded</p>
                }
                return <p className='text-center mb-0'>—</p>
            }
        },
        {
            key: "Delete",
            text: "Delete",
            className: "activity",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <>
                        {
                            (record?.subscriptionStatus == "refunded" || record?.isActive == "expired") ?
                                <div className='d-flex justify-content-center align-items-center gap-3'>

                                    <button className='delete_button' onClick={() => { DeleteValue(record?._id) }} >
                                        <FaTrash />
                                    </button>
                                </div>
                                : "-"
                        }
                    </>
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

    useEffect(() => {
        Getuserplan()
    }, [])

    const Getuserplan = async (page = 1, limit = 5, search = searchText) => {
        try {
            let payload = {
                page: page || 1,
                limit: limit || 5
            }
            if (search) {
                payload.searchtext = search
            }
            let resp = await UserplanDetails(payload)
            console.log("responses", resp);
            if (resp.status) {
                setPlandays(resp.data.data)
                settotalCount(resp.data.totalCount[0].count)
                setCurrentPage(page)
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    const DeleteValue = async (record) => {
        console.log("records_subs", record);
        try {
            const confirm = window.confirm("Are you sure to delete?")
            if (confirm) {
                let payload = {
                    id: record,
                }
                let resp = await PlansubscribeDelete(payload)
                console.log("respmses", resp);
                if (resp.status) {
                    toast.success(resp.message)
                    Getuserplan()
                }
                else {
                    toast.error(resp.message)
                }
            }

        } catch (error) {
            console.log("error", error);
        }
    }

    const UserplanSearch = (e) => {
        const value = e.target.value
        setSearchText(value)
        if (!value) {
            Getuserplan(1, limit, "")
            return
        }
        Getuserplan(1, limit, value)
    }

    const refundUpdate = async (record) => {
        console.log("refundUpdate", record, record._id, record.User._id);

        try {
            const confirm = window.confirm("Are you sure to refund?.")
            if (confirm) {
                let payload = {
                    subscriptionId: record?._id,
                    userId: record?.User?._id
                }
                let resp = await refundUpdateStatus(payload)
                console.log("refundUpdate_resp", resp);
                if (resp.status) {
                    toast.success(resp.message)
                    Getuserplan()
                }
                else {
                    toast.error(resp.message)
                }
            }
        } catch (error) {
            console.log("error", error);

        }
    }
    const pagination = [1, 2, 3, 4, 5];

    return (
        <>
            <Header title="User Plan List" />

            <div className='d-flex justify-content-between align-items-center '>
                <p className='text-white mb-0 fw-bolder'>User Subscriptions</p>


            </div>
            <div className='common_page_scroller mt-5 '>

                <div className='exchange_table_holder plans__tableHolder dashboard_box rounded-3 mt-4'>
                    <div className='d-flex align-items-center justify-content-end mb-3 me-3 mt-3'>
                        <div className='search_wrapper'>
                            <LuSearch color='#fff' />
                            <input
                                placeholder='Search by username, name, email, or subscription id...'
                                onChange={UserplanSearch}
                            />
                        </div>
                    </div>
                    <ReactDatatable
                        config={config}
                        records={planDays}
                        columns={columns}
                        extraButtons={extraButtons}
                    />
                </div>
            </div>
            <div className='primaryPagination mt-4'>

                <Pagination>
                    <Pagination.Prev onClick={() => { Getuserplan(currentpage - 1, limit) }} disabled={currentpage === 1 ? true : false} />
                    {
                        pagination.map((pg, i) => (
                            <Pagination.Item active={pg === currentpage} onClick={() => { Getuserplan(pg, limit) }}>{pg}</Pagination.Item>
                        ))
                    }
                    <Pagination.Next onClick={() => { Getuserplan(currentpage + 1, limit) }}
                        disabled={(totalCount / limit) > currentpage ? false : true}
                    />
                </Pagination>


            </div>
            {/* modals */}
            {/* <EditPlans show={show} handleClose={handleClose} editData={editData} /> */}
            {/* end of modals */}

        </>
    )
}

export default PlanDetails