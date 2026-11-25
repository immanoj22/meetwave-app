/** npm import */
import React, { useRef, useState, useEffect } from 'react'
import { Button, Col, Container, Nav, Pagination, Row } from 'react-bootstrap'
import ReactDatatable from '@ashvin27/react-datatable';
import CountUp from 'react-countup';
import { FaRegUser, FaPeopleGroup } from "react-icons/fa6";
import { FaPlus, } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";
import { MdBlock } from "react-icons/md"
import { IoMdInformationCircleOutline } from "react-icons/io";


/** local file import */

import Header from '../Components/Header'
import Sidebar from '../Components/Sidebar'
import BlockUser from '../Modals/BlockUser';
import UnBlockUser from '../Modals/UnBlockUser';
import InterestView from '../Modals/InterestView';
import GroupDetails from '../Modals/GroupDetails';
import { ADDRESS_KEY } from "../config/config"

import UserBlockedReason from '../Modals/UserBlockedReason';
import { GetBlockuserlists, GetReportData, GetUnBlockuserlists, Getuserlists } from '../api/api';
import { useDispatch, useSelector } from 'react-redux'
import ViewMapModal from "../Modals/Googlefindlocation"
import { GetAddressBasedOnLatLng } from '../config/common';
import AddressView from "../Modals/Addressview"
import Config from "../config/config"
import DefultImage from "../assets/images/emptyprofile.png"
import ReportBlock from "../Modals/ReportBlock"
import ReportView from "../Modals/ReportView"
/** code start */

function ReportList() {

    const { userlocation } = useSelector((state) => state.redux)
    console.log("userlocfdsgsdfg", userlocation);
    const [showReporterUser, setshowReporterUser] = useState(false);
    const [ReportDetails, setReportDetails] = useState([])
    const [ReportRecords, setReportRecords] = useState({})
    const [showreportView, setshowReportView] = useState(false)
    console.log("fgdfg", ReportRecords, ReportDetails);
    const [activeTab, setActiveTab] = useState("All");
    useEffect(() => {
        getReportDatalist()


    }, [])




    const handleShowBlockUser = (record) => {
        console.log("gsfrgdfgh", record);
        setshowReporterUser(true)
        setReportRecords(record)
    };


    const handleCloseBlockUser = () => {

        setshowReporterUser(false)
    };

    const handleShowInterestView = (record) => {
        console.log("records", record);
        setshowReportView(true);
        setReportRecords(record)
    };

    const handleCloseUnBlockUser = () => {

        setshowReportView(false)
    };


    let Report = [
        { label: "All", value: "All" },
        // { label: "User", value: "user" },
        { label: "User", value: "singlechat" },
        { label: "Group", value: "group" },
        { label: "Event", value: "event" },
    ]

    const handleSelect = (selectedKey) => {
        console.log("dfgdfgsdfgsdfg", selectedKey);
        setActiveTab(selectedKey);
    };

    const columns = [
        {
            key: "sno",
            text: "S.No",
            align: "center",
            className: "text-center w_80",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{index + 1}
                </p>
        },
        {
            key: "type",
            text: "Type",
            align: "center",
            className: "text-center w_100",
            // sortable: true,
            cell: (record, index) =>

                <p className='text-center'>{record.type}
                </p>


        },

        // {
        //     key: "report",
        //     text: "Reported to name",
        //     align: "center",
        //     className: "text-center w_100",
        //     // sortable: true,
        //     cell: (record, index) =>

        //         <p className='text-center'>{record?.type == "event" ? record?.reporter_to?.name : record?.type == "user" ? record?.reporter_to?.name : record?.type == "group" ? record?.reporter_to?.name : record?.type == "singlechat" ? record?.reporter_to?.name : ""}
        //         </p>


        // },

        {
            key: "report",
            text: "Reported to",
            align: "center",
            className: "text-center w_250",
            // sortable: true,
            cell: (record, index) =>

                <p className='text-center'>{record?.type == "event" ? record?.eventDetails?.eventTitle : record?.type == "user" ? record?.UserDetails?.email : record?.type == "group" ? record?.instanceDetails?.chatName : record?.type == "singlechat" ? record?.reporter_to?.username : "-"}
                </p>


        },

        // {
        //     key: "report",
        //     text: "Reported by name",
        //     align: "center",
        //     className: "text-center w_250",
        //     // sortable: true,
        //     cell: (record, index) =>

        //         <p className='text-center'>{record?.type == "event" ? record?.eventDetails?.eventTitle : record?.type == "user" ? record?.UserDetails?.email : record?.type == "group" ? record?.instanceDetails?.chatName : record?.type == "singlechat" ? record?.reporter_to?.name : ""}
        //         </p>


        // },

        {
            key: "reports",
            text: "Reported by",
            align: "center",
            className: "text-center w_150",
            sortable: true,
            cell: (record, index) =>
                <div className='d-flex justify-content-center'>
                    <button className='light_red_button d-flex align-items-center gap-2 border-0 outline-0' onClick={() => handleShowInterestView(record)}>
                        View Reports <IoMdInformationCircleOutline />
                    </button>
                </div>
        },
        {
            key: "report",
            text: "Block status",
            align: "center",
            className: "text-center w_250",
            // sortable: true,
            cell: (record, index) =>

                <p className='text-center'>{record?.type == "event" ? record?.eventDetails?.isblocked : record?.type == "user" ? record?.UserDetails?.blockStatus : record?.type == "group" ? '-' : record?.type == "singlechat" ? '-' : ""}
                </p>


        },
        {
            key: "action",
            text: "Block",
            align: "center",
            className: "text-center w_100",
            // sortable: true,
            cell: (record, index) =>
            (
                <div className='d-flex align-items-center justify-content-center'>
                    {record?.type === "group" || record?.type === "singlechat" ?
                        (
                            <button className='block_button' onClick={() => handleShowBlockUser(record)}>
                                <MdBlock fill='#fff' />
                            </button>
                        )
                        :
                        (
                            <span>-</span>
                        )
                    }
                </div>
            )

        },
        // {
        //     key: "action",
        //     text: "Delete",
        //     align: "center",
        //     className: "text-center w_100",
        //     // sortable: true,
        //     cell: (record, index) =>
        //     (
        //         <div>
        //             {record.type === "group" || record.type === "singlechat" ? (
        //                 <span>-</span>
        //             ) : (
        //                 <button className='block_button' onClick={() => handleShowBlockUser(record)}>
        //                     <MdBlock fill='#fff' />
        //                 </button>
        //             )}
        //         </div>
        //     )

        // },
    ];

    const config = {
        page_size: 5,
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
    const configTwo = {
        page_size: 5,
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
        show_pagination: true,
        show_info: true,
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

    const getReportDatalist = async (record) => {
        console.log("records", record);
        try {
            const queryData = record ? record : "All";
            let resp = await GetReportData({ Data: queryData })
            console.log("GetReportData_details", resp.data);

            if (resp.status) {

                setReportDetails(resp.data)

            }
            else {
                setReportDetails("No data found")
                console.log("error");
            }



        } catch (error) {
            console.log("error", error);
        }
    }


    const [activeKey, setActiveKey] = useState('tab-0');

    const handleSelectActiveTab = (selectedKey, value) => {
        setActiveKey(selectedKey);
        getReportDatalist(value);
    };

    const pagination = [1, 2, 3, 4, 5];

    return (
        <>


            <ReportBlock show={showReporterUser} handleClose={handleCloseBlockUser} blockfunc={getReportDatalist} Report={ReportRecords} />
            {ReportRecords && <ReportView show={showreportView} handleClose={handleCloseUnBlockUser} ReportViwew={ReportRecords} />}

            <Header title="Report List" />

            <div className='cn_dashboard' >
                <div className='cn_dashboard_grid autofill'>



                </div>
                <Col sm={12}>
                    <Nav variant="pills" activeKey={activeKey} className="custom_table_tabs  mb-5">
                        {Report.map((item, index) => (
                            <Nav.Item className='mb-3 mb-sm-0' key={index}>
                                <Nav.Link
                                    eventKey={`tab-${index}`}
                                    onClick={() => handleSelectActiveTab(`tab-${index}`, (item?.value).toString())}
                                >
                                    <span>{item?.label}</span>
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>
                    {/* <Nav variant="pills" className="custom_table_tabs  mb-5"
                    // activeKey={activeTab}
                    >
                        {
                            Report.map((item, index) => (
                                <>
                                    {console.log("itemds", item.value)}
                                    <Nav.Item className='mb-3 mb-sm-0' key={index}>
                                        <Nav.Link eventKey={`tab-${index}`} onClick={() => { getReportDatalist((item?.value).toString()) }}><span>{item?.label}</span></Nav.Link>
                                    </Nav.Item>
                                </>))
                        }
                    </Nav> */}
                </Col>
                <div className='common_page_scroller mt-5'>
                    <div className='exchange_table_holder dashboard_box rounded-3'>
                        {console.log('ReportDetails', ReportDetails)}

                        <ReactDatatable
                            config={config}
                            records={ReportDetails}
                            columns={columns}

                        />


                    </div>
                </div>
                {/* <div className='primaryPagination mt-4'>

                    <Pagination>
                        <Pagination.Prev 
                        // onClick={() => { Gethelplists(currentpage - 1, limit) }} 
                        // disabled={currentpage === 1 ? true : false} 
                        />
                        {
                            pagination.map((pg, i) => (
                                <Pagination.Item 
                                // active={pg === currentpage} 
                                // onClick={() => { Gethelplists(pg, limit) }}
                                >
                                    {pg}</Pagination.Item>
                            ))
                        }
                        <Pagination.Next 
                        // onClick={() => { Gethelplists(currentpage + 1, limit) }}
                        //     disabled={(totalCount / limit) > currentpage ? false : true}
                        />
                    </Pagination>
                </div> */}
            </div >
        </>
    )
}

export default ReportList