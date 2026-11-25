import React, { Component, useEffect, useState } from 'react';
import { Col, Container, Form, Pagination, Row } from 'react-bootstrap';
// import DatePicker from "react-datepicker";
import bsCustomFileInput from 'bs-custom-file-input';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import ReactDatatable from '@ashvin27/react-datatable';
import { addFaqCall, addFaqcontentCall, getFaqContentsList, getFaqList } from '../../api/cms';
import EditFaq from "../Faq/editfaq"
import { sanitizeHtml } from '../../lib/sanitizeHtml';
import EditFaqModal from '../../Modals/EditFaqModal';
import Header from '../../Components/Header';
import Sidebar from '../../Components/Sidebar';
import Select from 'react-select'


export function FaqList() {

    const history = useNavigate();
    var location = useLocation();
    console.log("locations", location);
    const { pathname, state } = location;
    const path = pathname.split("/")[1]
    console.log("pathname,stae", pathname, state, path)

    const [faqList, setFaqList] = useState([]);
    console.log('faqList', faqList);
    const [contents, setContents] = useState([]);
    const [editdata, setEditdata] = useState({})
    const [showEditFaq, setShowEditFaq] = useState(false);
    const [language, SetLanguage] = useState("english");
    const [limit, setLimit] = useState(5)
    const [currentpage, setCurrentPage] = useState(1)
    const [totalCount, settotalCount] = useState(0)
    const languageTypes = [
        { label: "English", value: "english" },
        { label: "Hindi", value: "hindi" },

        { label: "Spanish", value: "spanish" },
        { label: "Japanese", value: "japanese" },
        { label: "Portuguese", value: "portuguese" },
        { label: "Mandarin", value: "mandarin" },
        { label: "French", value: "french" },
        { label: "Italian", value: "italian" },
        { label: "Russian", value: "russian" },
        { label: "Nepalese", value: "nepalese" },
        { label: "Serbian", value: "serbian" }
    ]

    const handleShowEditFaq = (record) => {
        setShowEditFaq(true)
        setEditdata(record)
    }
    const handleCloseEditFaq = () => {
        setShowEditFaq(false)
    }

    useEffect(() => {
        bsCustomFileInput.init()

    }, [])



    const columns = [
        {
            key: "",
            text: "S.No",
            align: "center",
            className: "text-center w_80",
            sortable: true,
            cell: (record, index) =>
                <p className="text-center w_100">{index + 1}
                </p>
        },
        {
            key: "question",
            text: "Question",
            className: "text-center w_200",
            align: "center",
            sortable: true,
            cell: rec =>
                rec?.question?.length > 15 ? <>{rec?.question.slice(0, 15)}...</> : rec?.question

        },
        {
            key: "answer",
            text: "Answer",
            className: "text-center w_230",
            align: "center",
            sortable: true,
            cell: rec =>
                // rec?.question?.length > 15 ? <>{rec?.question.slice(0, 10)}...</> : rec?.question
                <div className='html_div' dangerouslySetInnerHTML={{ __html: sanitizeHtml(rec.answer.length > 80 ? rec.answer.slice(0, 80) + "..." : rec.answer) }}></div>

        },
        {
            key: "isAdmin",
            text: "Edit FAQ",
            className: "text-center w_200",
            align: "center",
            // sortable: true,
            cell: record => (<>
                {console.log("sdfgfdgh", record)}
                <div>
                    <button className='orange_primary_btn' type='button' onClick={() => handleShowEditFaq(record)}>Edit</button>
                </div>
            </>
            )
        },
        {
            key: "isAdmin",
            text: "Delete",
            className: "text-center w_200",
            align: "center",
            // sortable: true,
            cell: record =>
                <div><button className='cancel_button ' type='button' onClick={() => DeleteFaq(record, "delete")}>Delete</button></div>

        },


        // {
        //   key: "isAdmin",
        //   text: "Edit FAQ",
        //   className: "NFT IDT",
        //   align: "left",
        //   sortable: false,
        //   cell:record=>
        //   <div><Link to={{pathname:'/editfaq',state:record}}><button >EDIT</button></Link></div>

        // },
        // {
        //   key: "isAdmin",
        //   text: "Delete FAQ",
        //   className: "NFT IDT",
        //   align: "left",
        //   sortable: false,
        //   cell:record=>
        //   <div><button   onClick={()=>DeleteFaq(record,"delete")}>DELETE</button></div>

        // },






    ]
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
                    <i
                        className="glyphicon glyphicon-print fa fa-print"
                        aria-hidden="true"
                    ></i>
                </span>,
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
                    <i
                        className="glyphicon glyphicon-print fa fa-print"
                        aria-hidden="true"
                    ></i>
                </span>,
            ],
            onClick: (event) => {
                console.log(event);
            },
            onDoubleClick: (event) => {
                console.log("doubleClick");
            },
        },
    ];

    //   const columns_in = [

    //     {
    //       key: "faqcontent",
    //       text: "FAQcontents",
    //       className: "NFT IDT",
    //       align: "left",
    //       sortable: true,
    //       cell: rec =>
    //         <div dangerouslySetInnerHTML={{ __html: rec.faqcontent }}></div>

    //     },


    //     {
    //       key: "isAdmin",
    //       text: "Edit FAQ",
    //       className: "NFT IDT",
    //       align: "left",
    //       // sortable: true,
    //       cell: record =>
    //         <div><Link to={{ pathname: '/editfaq', state: record }}><button className='btn allbtn allbtns' type='button'>Edit</button></Link></div>

    //     },
    //     {
    //       key: "isAdmin",
    //       text: "Delete FAQ",
    //       className: "NFT IDT",
    //       align: "left",
    //       // sortable: true,
    //       cell: record =>
    //         <div><button className='btn allbtn allbtns' type='button' onClick={() => DeleteFaqcontent(record, "delete")}>Delete</button></div>

    //     },


    //   ]


    useEffect(() => {
        getFaqDetails();
        // getFaqContentsDetails();
    }, [language])
    console.log("y6666666666666", language);

    const getFaqDetails = async (page = 1, limit = 5) => {
        let payload = {
            languageType: language ? language : "english",
            page: page || 1,
            limit: limit || 5
        }
        var resp = await getFaqList(payload);
        console.log("respspss", resp);
        if (resp?.status)
        setFaqList(resp.data);
        settotalCount(resp.count)
        setCurrentPage(page)
    }

    const DeleteFaq = async (data, filter) => {

        console.log("dfsf", data, filter)
        var payload = {
            question: data.question,
            answer: data.answer,
            filter: filter
        }

        console.log("payload", payload)

        var resp = await addFaqCall(payload);
        if (resp?.status) {
            toast.success(resp.message)
            // setTimeout(() => {
            //     window.location.reload();
            // }, 1000);
            getFaqDetails()

        }
        else return toast.error(resp.message)
    }

    const handlechangeLanguage = async (e, data) => {
        console.log("dghhhhhhhhhhhh", e, data)
        SetLanguage(e)
    }
    const pagination = [1, 2, 3, 4, 5];

    return (

        <>
            {/* start of modal import */}

            <EditFaqModal show={showEditFaq} handleClose={handleCloseEditFaq} Faqlist={getFaqDetails} EditData={editdata} />

            {/* end of modal import */}

            <Header title="Faq Lists" />

            <div className=''>

                {path && path == "editfaq" ?
                    <EditFaq faq={state ? state : {}} /> :
                    <div>
                        <div className="page-header">
                            <nav aria-label="breadcrumb">

                            </nav>
                        </div>

                        <div className='d-flex justify-content-end'>
                            <Link to="/addfaq" >
                                <button className='orange_primary_btn' type='button'>Add FAQ</button>
                            </Link>
                        </div>

                        {/* <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                // isSearchable={true}
                                // id='categoryId'
                                value={languageTypes.find((val) => val.value == language)}
                                options={languageTypes}
                                onChange={(e) => handlechangeLanguage(e.value, "language")}
                            />
                        </div> */}
                        <div className="common_page_scroller mt-4">
                            <div className="exchange_table_holder dashboard_box rounded-3">
                                <ReactDatatable
                                    // className="tension"
                                    config={config}
                                    records={faqList}
                                    columns={columns}
                                    extraButtons={extraButtons}
                                />
                            </div>
                        </div>
                    </div>}
                <div className='primaryPagination mt-4'>

                    <Pagination>
                        <Pagination.Prev onClick={() => { getFaqDetails(currentpage - 1, limit) }} disabled={currentpage === 1 ? true : false} />
                        {
                            pagination.map((pg, i) => (
                                <Pagination.Item active={pg === currentpage} onClick={() => { getFaqDetails(pg, limit) }}>{pg}</Pagination.Item>
                            ))
                        }
                        <Pagination.Next onClick={() => { getFaqDetails(currentpage + 1, limit) }}
                            disabled={(totalCount / limit) > currentpage ? false : true}
                        />
                    </Pagination>


                </div>
            </div>
        </>

    )
}

export default FaqList;
