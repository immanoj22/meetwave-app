import React, { useEffect, useState } from 'react'
import { Col, Container, Pagination, Row } from 'react-bootstrap'
import Sidebar from '../../Components/Sidebar'
import Header from '../../Components/Header'
import ReactDatatable from '@ashvin27/react-datatable';
import EditCmsModal from './editcms';
// import DeleteFeeModal from '../Modals/DeleteFeeModal';
import { NavLink } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { getCmslists } from '../../api/cms';
import { FaPlus } from "react-icons/fa6";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { sanitizeHtml } from '../../lib/sanitizeHtml';



function Contentmanagement() {
    // edit modal
    const [showEdit, setShowEdit] = useState(false);
    const handleCloseEdit = () => setShowEdit(false);
    const handleShowEdit = () => setShowEdit(true);
    const [getFee, setGetFee] = useState([])
    const [editData, setEditData] = useState({})
    const [limit, setLimit] = useState(5)
    const [currentpage, setCurrentPage] = useState(1)
    const [totalCount, settotalCount] = useState(0)

    const columns = [

        {
            key: "identifier",
            text: "Identifier",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <div>{record?.identifier}</div>
                )
            },
        },
        {
            key: "currencyvalue",
            text: "Title",
            className: "text-center w_150",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(record?.Title.length > 15 ? record?.Title.slice(0, 15) + "..." : record?.Title) }} />
                )
            },
        },
        {
            key: "tokenvalue",
            text: "Content",
            className: "text-center w_500",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <>{
                        record?.Content?.length > 0 ?
                            <div className='html_div' dangerouslySetInnerHTML={{ __html: sanitizeHtml(record?.Content.length > 30 ? record?.Content.slice(0, 30) + "...." : record?.Content) }} />
                            : "-No content-"
                    }

                    </>)
            },
        },
        {
            key: "action",
            text: "Action",
            className: "text-center w_130",
            align: "center",
            sortable: false,
            cell: (record) => {
                return (
                    <div className='d-flex justify-content-center align-items-center gap-3'>
                        <button className='green_edit_button' onClick={() => { setEditData(record); handleShowEdit() }}><FaEdit className='ms-1' />
                        </button>
                        {/* <button className='cmn_plain_btn' onClick={() => { setDeleteId(record._id); handleShowDelete(); }}>
                            <img src={require('../assets/images/trash.svg').default} className='img-fluid table_activity_img' /> </button> */}
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
        GetCmscontents()
    }, [])


    const GetCmscontents = async (page = 1, limit = 5) => {
        let payload = {
            page: page || 1,
            limit: limit || 5
        }
        let resp = await getCmslists(payload);
        console.log("getCmslists", resp);
        if (resp?.status) {
            setGetFee(resp?.data);
            settotalCount(resp.count)
            setCurrentPage(page)
            console.log("respresp", resp?.data)
        }
    }

    const pagination = [1, 2, 3, 4, 5];

    return (
        <>
            <Header title="CMS Lists" />
            <div className='setting_tab_holder'>
                <Row>
                    <Col sm={6} className='d-flex gap-3 mb-3 mb-sm-0'>

                    </Col>
                    <Col sm={6} className='text-end'>
                        {/* <NavLink to='/addFee' className='sidebar_links'>
                                        <button className='orange_small_primary'>Add</button>
                                    </NavLink> */}
                    </Col>
                </Row>
            </div>

            <div className='common_page_scroller mt-4'>
                <div className='exchange_table_holder dashboard_box rounded-3'>
                    <ReactDatatable
                        config={config}
                        records={getFee}
                        columns={columns}
                        extraButtons={extraButtons}
                    />
                </div>
            </div>
            <div className='primaryPagination mt-4'>

                <Pagination>
                    <Pagination.Prev onClick={() => { GetCmscontents(currentpage - 1, limit) }} disabled={currentpage === 1 ? true : false} />
                    {
                        pagination.map((pg, i) => (
                            <Pagination.Item active={pg === currentpage} onClick={() => { GetCmscontents(pg, limit) }}>{pg}</Pagination.Item>
                        ))
                    }
                    <Pagination.Next onClick={() => { GetCmscontents(currentpage + 1, limit) }}
                        disabled={(totalCount / limit) > currentpage ? false : true}
                    />
                </Pagination>


            </div>
            {/* modals */}

            {showEdit && <EditCmsModal show={showEdit} handleClose={() => { handleCloseEdit() }} getSettings={() => { GetCmscontents() }} editData={editData} />}

        </>
    )
}

export default Contentmanagement