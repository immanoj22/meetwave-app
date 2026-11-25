/** npm import */

import React, { useRef, useState, useEffect } from 'react'
import { Button, Col, Container, Pagination, Row } from 'react-bootstrap'
import ReactDatatable from '@ashvin27/react-datatable';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import { FaPlus, } from "react-icons/fa";
import { FaRegUser, FaPeopleGroup } from "react-icons/fa6";
import { MdBlock } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";

/** local file import */

import Header from '../Components/Header'
import Sidebar from '../Components/Sidebar'
import BlockedGroup from '../Modals/BlockedGroup';
import UnBlockGroup from '../Modals/UnBlockGroup';
import ViewAdmins from '../Modals/ViewAdmins';
import UserBlockedReason from '../Modals/UserBlockedReason';
import GroupBlockedReason from '../Modals/GroupBlockedReason';
import { BlockGrouplists, UnblockGrouplists } from '../api/api';
import Config from "../config/config"
import DefultImage from "../assets/images/emptyprofile.png"
import { LuSearch } from "react-icons/lu";
/** code start */

function Groups() {

    const navigate = useNavigate();

    const [groupType, setGroupType] = useState("ActiveGroups")
    const [showBlockGroup, setShowBlockGroup] = useState(false);
    const [showUnBlockGroup, setShowUnBlockGroup] = useState(false);
    const [showAdminsList, setShowAdminsList] = useState(false);
    const [adminData, setAdminData] = useState([]);
    const [showBlockedReason, setShowBlockedReason] = useState(false);
    const [unblockgroups, setUnblockgroups] = useState([])
    const [blockgroups, setBlockgroups] = useState([])
    const [block, setBlock] = useState({})
    console.log("blocvkeddata", block);
    const [BlockReason, setBlockReason] = useState("")
    const [UnblockUser, setUnblockUser] = useState({})
    const [currentpage, setCurrentPage] = useState({ unblock: 1, block: 1 })
    const [totalCount, settotalCount] = useState({ unblock: 0, block: 0 })
    const [limit, setLimit] = useState(5)

    useEffect(() => {
        getUnblockedGroups()
        getblockedGroups()
    }, [])

    const handleShowBlockGroup = (record) => {
        setShowBlockGroup(true)
        setBlock(record)

    };

    const handleCloseBlockGroup = (record) => {
        setShowBlockGroup(false)
    };
    const handleShowUnBlockGroup = (record) => {
        setShowUnBlockGroup(true)
        setUnblockUser(record)
    };

    const handleCloseUnBlockGroup = () => {
        setShowUnBlockGroup(false)
    };

    const handleShowAdminsList = (record) => {
        setShowAdminsList(true);
        setAdminData(record)
    }
    const handleCloseAdminsList = () => {
        setShowAdminsList(false)
    }
    const handleShowBlockedReason = (record) => {
        console.log("records", record);
        setShowBlockedReason(true)
        setBlockReason(record)
    };

    const handleHideBlockedReason = () => {
        setShowBlockedReason(false)
    };

    const [activeGroupList, setActiveGroupList] = useState([
        {
            id: 1,
            groupId: 124343534,
            groupName: "Music 11",
            createdDate: "13-02-2024",
            createdBy: "John Doe",
            admins: [
                "Smith", "John", "David"
            ],
            groupCategory: "Music",
            memberCount: 1243,
            averageActiveCount: 154,
            userCategory: [
                45,
                55
            ],
            ageCategory:
                [
                    55,
                    35,
                    10
                ],
            dailyActivities: 10
        },
        {
            id: 1,
            groupId: 124343534,
            groupName: "Music 11",
            createdDate: "13-02-2024",
            createdBy: "John Doe",
            admins: [
                "Smith", "John", "David"
            ],
            groupCategory: "Music",
            memberCount: 1243,
            averageActiveCount: 154,
            userCategory: [
                45,
                55
            ],
            ageCategory:
                [
                    55,
                    35,
                    10
                ],
            dailyActivities: 20
        }, {
            id: 1,
            groupId: 124343534,
            groupName: "Music 11",
            createdDate: "13-02-2024",
            createdBy: "John Doe",
            admins: [
                "Smith", "John", "David"
            ],
            groupCategory: "Music",
            memberCount: 1243,
            averageActiveCount: 154,
            userCategory: [
                45,
                55
            ],
            ageCategory:
                [
                    55,
                    35,
                    10
                ],
            dailyActivities: -5
        }, {
            id: 1,
            groupId: 124343534,
            groupName: "Music 11",
            createdDate: "13-02-2024",
            createdBy: "John Doe",
            admins: [
                "Smith", "John", "David"
            ],
            groupCategory: "Music",
            memberCount: 1243,
            averageActiveCount: 154,
            userCategory: [
                45,
                55
            ],
            ageCategory:
                [
                    55,
                    35,
                    10
                ],
            dailyActivities: 5
        },

    ]);

    const [BlockedGroupList, setBlockedGroupList] = useState([
        {
            id: 1,
            groupId: 124343534,
            groupName: "Music 11",
            createdDate: "13-02-2024",
            createdBy: "John Doe",
            admins: [
                "Smith", "John", "David"
            ],
            groupCategory: "Music",
            memberCount: 1243,
            averageActiveCount: 154,
            userCategory: [
                45,
                55
            ],
            ageCategory:
                [
                    55,
                    35,
                    10
                ],
            blockedReason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
            id: 1,
            groupId: 124343534,
            groupName: "Music 11",
            createdDate: "13-02-2024",
            createdBy: "John Doe",
            admins: [
                "Smith", "John", "David"
            ],
            groupCategory: "Music",
            memberCount: 1243,
            averageActiveCount: 154,
            userCategory: [
                45,
                55
            ],
            ageCategory:
                [
                    55,
                    35,
                    10
                ],
            blockedReason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        }, {
            id: 1,
            groupId: 124343534,
            groupName: "Music 11",
            createdDate: "13-02-2024",
            createdBy: "John Doe",
            admins: [
                "Smith", "John", "David"
            ],
            groupCategory: "Music",
            memberCount: 1243,
            averageActiveCount: 154,
            userCategory: [
                45,
                55
            ],
            ageCategory:
                [
                    55,
                    35,
                    10
                ],
            blockedReason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        }, {
            id: 1,
            groupId: 124343534,
            groupName: "Music 11",
            createdDate: "13-02-2024",
            createdBy: "John Doe",
            admins: [
                "Smith", "John", "David"
            ],
            groupCategory: "Music",
            memberCount: 1243,
            averageActiveCount: 154,
            userCategory: [
                45,
                55
            ],
            ageCategory:
                [
                    55,
                    35,
                    10
                ],
            blockedReason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },

    ]);




    const state = {
        records: [
            {
                "name": <div className='dash_table_left d-flex justify-content-start align-items-centre gap-2'>
                    <img src={require('../assets/images/greenarrow.svg').default} className='img-fluid dash_table_arrowImg' />
                    <div className='dash_table_statusHolder'>
                        <p className='dash_table_status'>Send</p>
                        <p className='dash_graymed_text'>Feb 03 . 1043 AM</p>
                    </div>
                </div>,
                "value": <div className='dash_table_left'>
                    <div className='dash_table_statusHolder text-end'>
                        <p className='dash_table_status'>+0.000253 </p>
                        <p className='dash_graymed_text'>Confirmed</p>
                    </div>
                </div>,

            },
            {
                "name": <div className='dash_table_left d-flex justify-content-start align-items-centre gap-2'>
                    <img src={require('../assets/images/redarrow.svg').default} className='img-fluid dash_table_arrowImg' />
                    <div className='dash_table_statusHolder'>
                        <p className='dash_table_status'>Receive</p>
                        <p className='dash_graymed_text'>Feb 03 . 1043 AM</p>
                    </div>
                </div>,
                "value": <div className='dash_table_left'>
                    <div className='dash_table_statusHolder text-end'>
                        <p className='dash_table_status'>+0.000253 </p>
                        <p className='dash_graymed_text'>Confirmed</p>
                    </div>
                </div>,

            },

        ]
    }

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
        // {
        //     key: "groupid",
        //     text: "Group ID",
        //     align: "center",
        //     className: "text-center w_100",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center'>{record?.groupId}
        //         </p>
        // },
        {
            key: "profile",
            text: "Group profile",
            align: "center",
            className: "text-center w_100 d-flex justify-content-center",
            // sortable: true,
            cell: (record, index) => {
                const imageFolder = (record?.iseventchat && record?.isGroupchat) ? "EventProfile" : "GroupImage";
                const imagePath = record?.Image
                    ? `${Config.AWS_CDN_URL}${record?.Image}`
                    : DefultImage;

                return (
                    <div className='user_image_wrapper'>
                        <img src={imagePath} alt='profile' />
                    </div>
                );
            }

        },
        {
            key: "groupname",
            text: "Group Name",
            align: "center",
            className: "text-center w_100",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.chatName}
                </p>
        },
        {
            key: "createdby",
            text: "Created By",
            align: "center",
            className: "text-center w_100",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.groupCreater?.username}
                </p>
        },
        {
            key: "createddate",
            text: "Created Date",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>

                <p className={`text-center `}>{
                    // `${new Date(record?.createdAt).toLocaleDateString().replace(/\//g, '-')}`
                    `${`${new Date(record?.createdAt).getDate() < 10 ? `0${new Date(record?.createdAt).getDate()}` : new Date(record?.createdAt).getDate()}-${new Date(record?.createdAt).getMonth() + 1 < 10 ? `0${new Date(record?.createdAt).getMonth() + 1}` : new Date(record?.createdAt).getMonth() + 1}-${new Date(record?.createdAt).getFullYear()}`}`
                }
                </p>
        },
        {
            key: "admin",
            text: "Admins",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>
                // <div className='d-flex flex-wrap align-items-center justify-content-center gap-2'>{record?.admins.map((value) => (
                //     <div className='group_value'>
                //         {value}
                //     </div>
                // ))}
                // </div>
                <button className='group_value border-0 outline-0' onClick={() => handleShowAdminsList(record)}>
                    View Admins
                </button>
        },
        // {
        //     key: "groupCategory",
        //     text: "Category",
        //     align: "center",
        //     className: "text-center w_80",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p >{record?.groupCategory}
        //         </p>
        // },
        {
            key: "membercount",
            text: "Member Count",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center green_text'>{record?.members?.length > 0 ? record?.members?.length : 0}
                </p>
        },
        {
            key: "Group",
            text: "Group",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center green_text'>{(record?.iseventchat && record?.isGroupchat) ? "Event Group" : "Group"}
                </p>
        },
        // {
        //     key: "averagecctivecount",
        //     text: "Avg. Active Count",
        //     align: "center",
        //     className: "text-center w_130",
        //     // sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center'>{record?.averageActiveCount}
        //         </p>
        // },
        // {
        //     key: "usercategory",
        //     text: "User Category",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         // <div>
        //         //     <p className='text-center'>Men {record?.userCategory[0]} %
        //         //     </p>
        //         //     <p className='text-center'>Women {record?.userCategory[1]} %
        //         //     </p>
        //         // </div>
        //         <div className='mx-auto ' >
        //             <div className='row'>
        //                 <div className='col-6 ps-3 text-start'>
        //                     Men
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 yellow_text text-end pe-3'>
        //                     {record?.userCategory[0]} %
        //                 </div>
        //             </div>

        //             <div className='row'>
        //                 <div className='col-6 ps-3 text-start'>
        //                     Women
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 yellow_text text-end pe-3'>
        //                     {record?.userCategory[1]} %
        //                 </div>
        //             </div>

        //         </div>

        // },
        // {
        //     key: "agecategory",
        //     text: "Age Category",
        //     align: "center",
        //     className: "text-center w_180",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <div className='mx-auto ' style={{ width: "85%" }}>
        //             <div className='row'>
        //                 <div className='col-6 ps-4 text-start'>
        //                     18 - 30
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 green_text text-end '>
        //                     {record?.ageCategory[0]} %
        //                 </div>
        //             </div>
        //             <div className='row'>
        //                 <div className='col-6 ps-4 text-start'>
        //                     30 - 50
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 green_text text-end '>
        //                     {record?.ageCategory[1]} %
        //                 </div>
        //             </div><div className='row'>
        //                 <div className='col-6 ps-4 text-start'>
        //                     &gt; 50
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 green_text text-end '>
        //                     {record?.ageCategory[2]} %
        //                 </div>
        //             </div>
        //             {/* <p className='text-center mb-1'>   : <span className='green_text'>{record?.ageCategory[0]} %</span>
        //             </p>
        //             <p className='text-center mb-1'>30 - 50 : <span className='green_text'>{record?.ageCategory[1]} %</span>
        //             </p> <p className='text-center'> &gt; 50 : <span className='green_text'>{record?.ageCategory[2]} %</span>
        //             </p> */}
        //         </div>
        // },
        // {
        //     key: "activities",
        //     text: "Activities",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         record?.dailyActivities > 0 ? <p className='text-center'>
        //             Increase by <span className='green_text'>{record?.dailyActivities} %</span>
        //         </p> : <p className='text-center'>
        //             Decrease by <span className='red_text'>{record?.dailyActivities} %</span>
        //         </p>


        // },

        {
            key: "action",
            text: "Action",
            align: "center",
            className: "text-center w_80",
            // sortable: true,
            cell: (record, index) =>
                <div className='d-flex align-items-center justify-content-center'>
                    <button
                        className='block_button'
                        onClick={() => handleShowBlockGroup(record)}
                    >
                        <MdBlock fill='#fff' />
                    </button>
                </div>
        },
    ];
    const BlockedGroupColumns = [
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
            key: "profile",
            text: "Group profile",
            align: "center",
            className: "text-center w_100 d-flex justify-content-center",
            // sortable: true,
            cell: (record, index) => {
                const imageFolder = record?.iseventchat ? "EventProfile" : "GroupImage";
                const imagePath = record?.Image
                    ? `${Config.AWS_CDN_URL}${record.Image}`
                    : DefultImage;

                return (
                    <div className='user_image_wrapper'>
                        <img src={imagePath} alt='profile' />
                    </div>
                );
            }

        },
        // {
        //     key: "groupid",
        //     text: "Group ID",
        //     align: "center",
        //     className: "text-center w_100",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center'>{record?.groupId}
        //         </p>
        // },
        {
            key: "groupname",
            text: "Group Name",
            align: "center",
            className: "text-center w_100",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.chatName}
                </p>
        },
        {
            key: "createdby",
            text: "Created By",
            align: "center",
            className: "text-center w_100",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.groupCreater?.username}
                </p>
        },
        {
            key: "createddate",
            text: "Created Date",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>

                <p className={`text-center `}>{
                    `${`${new Date(record?.createdAt).getDate() < 10 ? `0${new Date(record?.createdAt).getDate()}` : new Date(record?.createdAt).getDate()}-${new Date(record?.createdAt).getMonth() + 1 < 10 ? `0${new Date(record?.createdAt).getMonth() + 1}` : new Date(record?.createdAt).getMonth() + 1}-${new Date(record?.createdAt).getFullYear()}`}`
                }
                </p>
        },
        {
            key: "admin",
            text: "Admins",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>
                // <div className='d-flex flex-wrap align-items-center justify-content-center gap-2'>{record?.admins.map((value) => (
                //     <div className='group_value'>
                //         {value}
                //     </div>
                // ))}
                // </div>
                <button className='group_value border-0 outline-0' onClick={() => handleShowAdminsList(record)}>
                    View Admins
                </button>
        },
        // {
        //     key: "groupCategory",
        //     text: "Category",
        //     align: "center",
        //     className: "text-center w_80",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p >{record?.groupCategory}
        //         </p>
        // },
        {
            key: "membercount",
            text: "Member Count",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center green_text'>{record?.members?.length > 0 ? record?.members?.length : 0}
                </p>
        },
        // {
        //     key: "averagecctivecount",
        //     text: "Avg. Active Count",
        //     align: "center",
        //     className: "text-center w_130",
        //     // sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center'>{record?.averageActiveCount}
        //         </p>
        // },
        // {
        //     key: "usercategory",
        //     text: "User Category",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <div className='mx-auto ' >
        //             <div className='row'>
        //                 <div className='col-6 ps-3 text-start'>
        //                     Men
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 yellow_text text-end pe-3'>
        //                     {record?.userCategory[0]} %
        //                 </div>
        //             </div>

        //             <div className='row'>
        //                 <div className='col-6 ps-3 text-start'>
        //                     Women
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 yellow_text text-end pe-3'>
        //                     {record?.userCategory[1]} %
        //                 </div>
        //             </div>

        //         </div>

        // },
        // {
        //     key: "agecategory",
        //     text: "Age Category",
        //     align: "center",
        //     className: "text-center w_180",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <div className='mx-auto ' style={{ width: "85%" }}>
        //             <div className='row'>
        //                 <div className='col-6 ps-4 text-start'>
        //                     18 - 30
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 green_text text-end '>
        //                     {record?.ageCategory[0]} %
        //                 </div>
        //             </div>
        //             <div className='row'>
        //                 <div className='col-6 ps-4 text-start'>
        //                     30 - 50
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 green_text text-end '>
        //                     {record?.ageCategory[1]} %
        //                 </div>
        //             </div><div className='row'>
        //                 <div className='col-6 ps-4 text-start'>
        //                     &gt; 50
        //                 </div>
        //                 <div className='col-1 px-0'>
        //                     :
        //                 </div>
        //                 <div className='col-5 green_text text-end '>
        //                     {record?.ageCategory[2]} %
        //                 </div>
        //             </div>
        //             {/* <p className='text-center mb-1'>   : <span className='green_text'>{record?.ageCategory[0]} %</span>
        //     </p>
        //     <p className='text-center mb-1'>30 - 50 : <span className='green_text'>{record?.ageCategory[1]} %</span>
        //     </p> <p className='text-center'> &gt; 50 : <span className='green_text'>{record?.ageCategory[2]} %</span>
        //     </p> */}
        //         </div>
        // },
        {
            key: "Group",
            text: "Group",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center green_text'>{(record?.iseventchat && record?.isGroupchat) ? "Event Group" : "Group"}
                </p>
        },
        {
            key: "blockedreason",
            text: "Blocked Reason",
            align: "center",
            className: "text-center w_150",
            sortable: true,
            cell: (record, index) =>
                <div className='d-flex justify-content-center'>
                    <button className='light_red_button d-flex align-items-center gap-2 border-0 outline-0' onClick={() => handleShowBlockedReason(record)}>
                        View Reason <IoMdInformationCircleOutline />
                    </button>
                </div>
        },
        {
            key: "action",
            text: "Action",
            align: "center",
            className: "text-center w_80",
            // sortable: true,
            cell: (record, index) =>
                <div className='d-flex align-items-center justify-content-center'>
                <button
                    className='unblock_button'
                    onClick={() => handleShowUnBlockGroup(record)}
                >
                    <MdBlock fill='#fff' />
                </button>
                </div>
        },
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


    const handleTotalUserNavigate = () => {
        navigate('/total-users')
    }


    const getUnblockedGroups = async (page = 1, limit = 5) => {
        try {
            let payload = {
                page: page || 1,
                limit: limit || 5
            }
            let resp = await UnblockGrouplists(payload)
            console.log("ersponses", resp);
            setUnblockgroups(resp.data)
            settotalCount(prev => ({
                ...prev,
                unblock: resp.count
            }));
            setCurrentPage(prev => ({ ...prev, unblock: page }))
        } catch (error) {
            console.log("error", error);
        }
    }

    const getblockedGroups = async (page = 1, limit = 5) => {
        try {
            let payload = {
                page: page || 1,
                limit: limit || 5
            }
            let resp = await BlockGrouplists(payload)
            console.log("ersponses", resp);
            setBlockgroups(resp.data)
            settotalCount(prev => ({
                ...prev,
                block: resp.count
            }));
            setCurrentPage(prev => ({ ...prev, block: page }))
        } catch (error) {
            console.log("error", error);
        }
    }

    const GroupslistSearch = async (e) => {
        try {
            const payload = { searchtext: e.target.value };
            if (!e.target.value) {
                getUnblockedGroups(currentpage.unblock, limit);
                getblockedGroups(currentpage.block, limit);
                return;
            }
            if (groupType === "ActiveGroups") {
                const resp = await UnblockGrouplists(payload);
                setUnblockgroups(resp.data);
            } else {
                const resp = await BlockGrouplists(payload);
                setBlockgroups(resp.data);
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    const pagination = [1, 2, 3, 4, 5];

    return (
        <>

            {/* start of modal import */}

            <BlockedGroup show={showBlockGroup} handleClose={handleCloseBlockGroup} Blockgroup={block} Blockfunc={getblockedGroups} unblock={getUnblockedGroups} />
            <UnBlockGroup show={showUnBlockGroup} handleClose={handleCloseUnBlockGroup} UserUnblock={UnblockUser} Blockfunc={getblockedGroups} unblock={getUnblockedGroups} />
            <ViewAdmins show={showAdminsList} handleClose={handleCloseAdminsList} adminData={adminData} />
            <GroupBlockedReason show={showBlockedReason} handleClose={handleHideBlockedReason} BlockData={BlockReason} />

            {/* end of modal import */}

            <Header title="Groups" />

            <div div className='cn_dashboard' >
                <div className='cn_dashboard_grid autofill'>
                    <div
                        className={`dashboard_box user_green p-3 rounded-3 ${groupType === "ActiveGroups" ? "active" : ""} `}
                        onClick={() => setGroupType("ActiveGroups")}>
                        <div className='d-flex align-items-center justify-content-between '>
                            <div className='cn_dashboard_icon_wrapper user_green'>
                                <FaPeopleGroup />
                            </div>
                            {/* <div className='dash_greenvalues d-flex justify-content-end align-items-center gap-2'>
                                            <p className='dash_greentext'>10 %</p>
                                            <img src={require('../assets/images/greenthunder.svg').default} className='img-fluid' />
                                        </div> */}

                        </div>

                        <div className='mt-4'>
                            <p className='mb-0 dash_title text-center'>Active Groups</p>
                            <p className='cn_dashboard_count user_green text-center mb-0'>
                                <CountUp
                                    // start={754 - 300}
                                    end={totalCount?.unblock}
                                    duration={2.75}
                                // separator=" "
                                // decimals={4}
                                // decimal=","
                                // prefix="EUR "
                                // suffix=" left"
                                // onEnd={() => console.log('Ended! 👏')}
                                // onStart={() => console.log('Started! 💨')}
                                />
                                {/* <FaPlus className='mb-1' /> */}
                            </p>


                        </div>


                    </div>
                    <div
                        className={`dashboard_box blocked_red  p-3 rounded-3 ${groupType === "BlockedGroups" ? "active" : ""} `}
                        onClick={() => setGroupType("BlockedGroups")}>
                        <div className='d-flex align-items-center justify-content-between '>
                            <div className='cn_dashboard_icon_wrapper blocked_red'>
                                <FaPeopleGroup />
                            </div>
                            {/* <div className='dash_greenvalues d-flex justify-content-end align-items-center gap-2'>
                                            <p className='dash_redtext'>30 %</p>
                                            <img src={require('../assets/images/decrease.svg').default} className='img-fluid' />
                                        </div> */}

                        </div>

                        <div className='mt-4'>
                            <p className='mb-0 dash_title text-center'>Blocked Groups</p>
                            <p className='cn_dashboard_count blocked_red text-center mb-0'>
                                <CountUp
                                    // start={132 - 30}
                                    end={totalCount?.block}
                                    duration={2.75}
                                // separator=" "
                                // decimals={4}
                                // decimal=","
                                // prefix="EUR "
                                // suffix=" left"
                                // onEnd={() => console.log('Ended! 👏')}
                                // onStart={() => console.log('Started! 💨')}
                                />
                                {/* <FaPlus className='mb-1' /> */}
                            </p>


                        </div>


                    </div>

                </div>
                <div className='common_page_scroller mt-5'>
                    <div className='d-flex align-items-center justify-content-end mb-3'>
                        <div className='search_wrapper'>
                            <LuSearch color='#fff' /> <input placeholder='Search by group name or creator...'
                                onChange={(e) => { GroupslistSearch(e) }}
                            />
                        </div>
                    </div>
                    <div className='exchange_table_holder dashboard_box rounded-3'>


                        {/* {groupType == "ActiveGroups" ? <ReactDatatable
                                        config={config}
                                        records={activeGroupList}
                                        columns={columns}
                                        extraButtons={extraButtons}
                                    /> : <ReactDatatable
                                        config={config}
                                        records={BlockedGroupList}
                                        columns={BlockedGroupColumns}
                                        extraButtons={extraButtons}
                                    />} */}

                        {groupType === "ActiveGroups" && <ReactDatatable
                            config={config}
                            records={unblockgroups}
                            columns={columns}
                        // extraButtons={extraButtons}
                        />}
                        {groupType === "BlockedGroups" && <ReactDatatable
                            config={config}
                            records={blockgroups}
                            columns={BlockedGroupColumns}
                        // extraButtons={extraButtons}
                        />}


                    </div>
                </div>
                <div className='primaryPagination mt-4'>
                    {groupType === "ActiveGroups" ?
                        <>
                            <Pagination>
                                <Pagination.Prev onClick={() => { getUnblockedGroups(currentpage.unblock - 1, limit) }} disabled={currentpage.unblock === 1 ? true : false} />
                                {
                                    pagination.map((pg, i) => (
                                        <Pagination.Item active={pg === currentpage.unblock} onClick={() => { getUnblockedGroups(pg, limit) }}>{pg}</Pagination.Item>
                                    ))
                                }
                                <Pagination.Next onClick={() => { getUnblockedGroups(currentpage.unblock + 1, limit) }}
                                    disabled={(totalCount.unblock / limit) > currentpage.unblock ? false : true}
                                />
                            </Pagination>
                        </>
                        :
                        <>
                            <Pagination>
                                <Pagination.Prev onClick={() => { getblockedGroups(currentpage.block - 1, limit) }} disabled={currentpage.block === 1 ? true : false} />
                                {
                                    pagination.map((pg, i) => (
                                        <Pagination.Item active={pg === currentpage.block} onClick={() => { getblockedGroups(pg, limit) }}>{pg}</Pagination.Item>
                                    ))
                                }
                                <Pagination.Next onClick={() => { getblockedGroups(currentpage.block + 1, limit) }}
                                    disabled={(totalCount.block / limit) > currentpage.block ? false : true}
                                />
                            </Pagination>
                        </>
                    }
                </div>
            </div >
        </>
    )
}

export default Groups