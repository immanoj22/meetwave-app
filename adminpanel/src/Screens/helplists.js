import React, { useState, useEffect } from 'react'
import { Col, Container, Pagination, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'
import ReactDatatable from '@ashvin27/react-datatable';

import { deleteData, hideshowplan, getHelplists } from '../api/api'
import { toastAlert } from "../lib/toastAlert";
import keys from "../config/config";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaEye, FaPlus } from "react-icons/fa6";
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom'
import ViewHelpLists from '../Modals/ViewHelpList'

const HelpLists = () => {

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
    const [limit, setLimit] = useState(5)
    const [currentpage, setCurrentPage] = useState(1)
    const [totalCount, settotalCount] = useState(0)

    const columns = [
        {
            key: "",
            text: "S.No",
            align: "center",
            className: "text-center w_80",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{index + 1}
                </p>
        },
        {
            key: "email",
            text: "Email",
            className: "text-center w_250",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.email}</p>
                )
            }
        },
        {
            key: "feature",
            text: "feature",
            className: "text-center w_150",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.feature}</p>
                )
            }
        },
        {
            key: "description",
            text: "Description",
            className: "text-center w_180",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <p>{record?.description?.length > 40 ? record?.description.slice(0, 40) + '...' : record?.description}</p>
                )
            }
        },
        // {
        //     key: "help",
        //     text: "help",
        //     className: "text-center w_180",
        //     align: "center",
        //     sortable: false,
        //     cell: (record) => {
        //         return (
        //             <p>{record?.help?.length > 40 ? record?.help.slice(0, 40) + '...' : record?.help}</p>
        //         )
        //     }
        // },
        {
            key: "maysent",
            text: "mail sent",
            className: "text-center w_180",
            align: "center",
            sortable: false,
            cell: (record) => {
                console.log("sdfgsdgdgdfghf", record)
                return (
                    <p>{record?.maySent}</p>
                )
            }
        },


        {
            key: "action",
            text: "View",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <div className='d-flex justify-content-center align-items-center gap-3'>
                        <button className='green_edit_button' onClick={() => { setEditData(record); handleShow() }}> <FaEye className='' /> </button>

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

    useEffect(() => {

        Gethelplists()
    }, [])






    const Gethelplists = async (page = 1, limit = 5) => {
        console.log("rrefresshhhhhhh");

        try {
            let payload = {
                page: page || 1,
                limit: limit || 5
            }
            let resp = await getHelplists(payload)
            console.log("responses", resp);
            if (resp.status) {
                setList(resp.data)
                settotalCount(resp.count)
                setCurrentPage(page)
            }
        } catch (error) {
            console.log("error_planlist", error);
        }
    }

    const pagination = [1, 2, 3, 4, 5];

    return (
        <>
            <Header title="Help Lists" />

            <div className='common_page_scroller'>


                <div className='exchange_table_holder plans__tableHolder dashboard_box rounded-3 mt-4'>
                    <ReactDatatable
                        config={config}
                        records={list}
                        columns={columns}
                        extraButtons={extraButtons}
                    />
                </div>

            </div>
            <div className='primaryPagination mt-4'>

                <Pagination>
                    <Pagination.Prev onClick={() => { Gethelplists(currentpage - 1, limit) }} disabled={currentpage === 1 ? true : false} />
                    {
                        pagination.map((pg, i) => (
                            <Pagination.Item active={pg === currentpage} onClick={() => { Gethelplists(pg, limit) }}>{pg}</Pagination.Item>
                        ))
                    }
                    <Pagination.Next onClick={() => { Gethelplists(currentpage + 1, limit) }}
                        disabled={(totalCount / limit) > currentpage ? false : true}
                    />
                </Pagination>

            </div>
            {/* modals */}
            <ViewHelpLists show={show} handleClose={handleClose} editData={editData} planlist={Gethelplists} />
            {/* end of modals */}

        </>
    )
}

export default HelpLists