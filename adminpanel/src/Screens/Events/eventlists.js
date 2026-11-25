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
import { FaEdit, FaTrash } from 'react-icons/fa';
/** local file import */
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux'
import Header from '../../Components/Header'
import Sidebar from '../../Components/Sidebar'
import { ADDRESS_KEY } from "../../config/config"




import { BlockGrouplists, EventDelete, GetEvents, GetblockEvents } from '../../api/api';
import { GetAddressBasedOnLatLng, formatTime } from '../../config/common';
import AddressView from '../../Modals/Addressview';
import EventdescView from '../../Modals/Eventdescription';
import BlockedEvent from '../../Modals/BlockedEvents';
import UnBlockEvent from '../../Modals/UnBlockEvents';
import EventsBlockedReason from '../../Modals/EventBlockReason';
import Config from "../../config/config"
import DefultImage from "../../assets/images/emptyprofile.png"
import { LuSearch } from "react-icons/lu";
import EventImageView from '../../Modals/EventImageView';
import { GetAdmindata, Hobbieslimit } from '../../api/cms';
/** code start */

function Eventlists() {
    let initialvalue = {
        "eventimagelimit": 0
    }
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { userdata, eventImage_limit } = useSelector((state) => state.redux)
    console.log("userlocfdsgsdfg_evt", userdata, eventImage_limit);

    const [groupType, setGroupType] = useState("ActiveGroups")
    const [showBlockGroup, setShowBlockGroup] = useState(false);
    const [showUnBlockGroup, setShowUnBlockGroup] = useState(false);
    const [showAdminsList, setShowAdminsList] = useState(false);
    const [adminData, setAdminData] = useState([]);
    const [showBlockedReason, setShowBlockedReason] = useState(false);
    const [Events, setEvents] = useState({})
    const [blockEvents, setBlockEvents] = useState([])

    const [blockgroups, setBlockgroups] = useState([])
    const [block, setBlock] = useState({})
    console.log("blocvkeddata", block);
    const [BlockReason, setBlockReason] = useState("")
    const [UnblockUser, setUnblockUser] = useState({})
    const [Address, setAddress] = useState("")
    const [addloc, setAddloc] = useState(false);
    const [descclose, setDescclose] = useState(false);
    const [eventimgclose, setEventimgclose] = useState(false);

    const [descriptions, setDescriptions] = useState({})
    const [EventImage, setEventImage] = useState({})
    const [EvtImagelimit, setEvtImagelimit] = useState(initialvalue)
    const [currentpage, setCurrentPage] = useState({ unblock: 1, block: 1 })
    const [totalCount, settotalCount] = useState({ unblock: 0, block: 0 })
    const [limit, setLimit] = useState(5)

    console.log("EvtImagelimit", EvtImagelimit)
    useEffect(() => {
        getblockedEventlists()
        getUnblockEventlists()
        GetadminData()
    }, [])

    const handleShowBlockGroup = (record) => {
        console.log("zfvgdfgdgf", record);
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

    const handlelocation = async (record) => {
        console.log("rerererereoed", record);
        let address = await GetAddressBasedOnLatLng({
            lat: Number(record?.location?.coordinates?.[1]),
            lng: Number(record?.location?.coordinates?.[0]),
            key: ADDRESS_KEY
        })
        setAddress(address)
        // setAddress(record)

        setAddloc(true);

    }
    const handCloselelocation = async () => {

        setAddloc(false);

    }

    const handClosedescription = async () => {

        setDescclose(false);

    }

    const handClosedEventimg = async () => {

        setEventimgclose(false);

    }

    const handdescription = async (record) => {
        setDescclose(true);

        setDescriptions(record);

    }

    const handEventimage = async (record) => {
        setEventimgclose(true);

        setEventImage(record);

    }

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





    const state = {
        records: [
            {
                "name": <div className='dash_table_left d-flex justify-content-start align-items-centre gap-2'>
                    <img src={require('../../assets/images/greenarrow.svg').default} className='img-fluid dash_table_arrowImg' />
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
                    <img src={require('../../assets/images/redarrow.svg').default} className='img-fluid dash_table_arrowImg' />
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

    const Eventinterest = (record) => {
        console.log("rerererer", record);

        let joincount = record.eventinterested.filter((val) => val.joinstatus == true).length
        let status = record.eventinterested.filter((val) => val.status == true).length


        console.log("resppsss", joincount, status);
        return {
            joincount, status
        }
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
        {
            key: "eventimage",
            text: "Event Images",
            align: "center",
            className: "text-center w_100 d-flex justify-content-center",
            // sortable: true,
            cell: (record, index) =>
                <button className='interest_value border-0 outline-0' onClick={() => handEventimage(record)}>

                    View Image

                </button>

        },

        {
            key: "eventtitle",
            text: "Event Title",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.eventTitle}
                </p>
        },
        {
            key: "eventdescription",
            text: "Event Description",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <button className='interest_value border-0 outline-0' onClick={() => handdescription(record)}>

                    Description

                </button>
            // <p className='text-center'>{record?.description.length > 30 ? record.description.slice(0,30)+"..." : record.description}
            // </p>
        },
        {
            key: "startdate",
            text: "Start Date",
            align: "center",
            className: "text-center w_180",
            // sortable: true,
            cell: (record, index) =>
                <p className={`text-center `}>{
                    `${`${new Date(record?.startDate).getDate() < 10 ? `0${new Date(record?.startDate).getDate()}` : new Date(record?.startDate).getDate()}-${new Date(record?.startDate).getMonth() + 1 < 10 ? `0${new Date(record?.startDate).getMonth() + 1}` : new Date(record?.startDate).getMonth() + 1}-${new Date(record?.startDate).getFullYear()}`} ${formatTime(new Date(record?.startDate))}`
                }
                </p>
        },
        {
            key: "enddate",
            text: "End Date",
            align: "center",
            className: "text-center w_180",
            sortable: true,
            cell: (record, index) =>

                <p className={`text-center `}>{
                    `${`${new Date(record?.endDate).getDate() < 10 ? `0${new Date(record?.endDate).getDate()}` : new Date(record?.endDate).getDate()}-${new Date(record?.endDate).getMonth() + 1 < 10 ? `0${new Date(record?.endDate).getMonth() + 1}` : new Date(record?.endDate).getMonth() + 1}-${new Date(record?.endDate).getFullYear()}`} ${formatTime(new Date(record?.endDate))}`
                }
                </p>
        },
        {
            key: "eventcreater",
            text: "Event Creater",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.userId?.username}
                </p>
        },
        {
            key: "location",
            text: "Location",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>

                <button className='interest_value border-0 outline-0' onClick={() => handlelocation(record)}>

                    View location

                </button>
        },

        {
            key: "membercount",
            text: "Joined Members",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) => {
                let datas = Eventinterest(record)
                console.log("datas", datas)

                return (<p className='text-center green_text'>{datas.joincount}

                </p>)
            }
        },

        // {
        //     key: "membercount",
        //     text: "Interest Members",
        //     align: "center",
        //     className: "text-center w_100",
        //     sortable: true,
        //     cell: (record, index) => {
        //         let datas = Eventinterest(record)
        //         console.log("datas", datas)

        //         return (<p className='text-center green_text'>{datas.status}

        //         </p>)
        //     }
        // },
        {
            key: "Reason",
            text: "Event status",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>


                <p className={`${record?.event_status === "started" ? "green_text" : record?.event_status === "finished" ? "red_text" : "pink_text"}`}>{record.event_status}

                </p>
        },


        {
            key: "action",
            text: "Action",
            align: "center",
            className: "text-center w_80",
            // sortable: true,
            cell: (record, index) =>
                <div className='d-flex justify-content-center'>
                    <button
                        className='delete_button'
                        onClick={() => handleShowBlockGroup(record)}
                    >
                        <MdBlock fill='#fff' />
                    </button>
                </div>
        },
        {
            key: "delete",
            text: "Delete",
            className: "text-center w_80",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <div className='d-flex justify-content-center'>

                    {
                        record?.event_status == "finished" ? <button className='delete_button' onClick={() => { DeleteValue(record) }}>
                            <FaTrash />
                        </button>

                            : "-"
                    }

                </div>
        },



    ];
    const BlockedEventColumns = [
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
            key: "eventimage",
            text: "Event Image",
            align: "center",
            className: "text-center w_100 d-flex justify-content-center",
            // sortable: true,
            cell: (record, index) =>
                <button className='interest_value border-0 outline-0' onClick={() => handEventimage(record)}>

                    View Image

                </button>

        },

        {
            key: "eventtitle",
            text: "Event Title",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.eventTitle}
                </p>
        },
        {
            key: "eventdescription",
            text: "Event Description",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <button className='interest_value border-0 outline-0' onClick={() => handdescription(record)}>

                    Description

                </button>
            // <p className='text-center'>{record?.description.length > 30 ? record.description.slice(0,30)+"..." : record.description}
            // </p>
        },
        {
            key: "startdate",
            text: "Start Date",
            align: "center",
            className: "text-center w_180",
            // sortable: true,
            cell: (record, index) =>
                <p className={`text-center `}>{`${`${new Date(record?.startDate).getDate() < 10 ? `0${new Date(record?.startDate).getDate()}` : new Date(record?.startDate).getDate()}-${new Date(record?.startDate).getMonth() + 1 < 10 ? `0${new Date(record?.startDate).getMonth() + 1}` : new Date(record?.startDate).getMonth() + 1}-${new Date(record?.startDate).getFullYear()}`} ${formatTime(new Date(record?.startDate))}`}
                </p>
        },
        {
            key: "enddate",
            text: "End Date",
            align: "center",
            className: "text-center w_180",
            sortable: true,
            cell: (record, index) =>

                <p className={`text-center `}>{
                    `${`${new Date(record?.endDate).getDate() < 10 ? `0${new Date(record?.endDate).getDate()}` : new Date(record?.endDate).getDate()}-${new Date(record?.endDate).getMonth() + 1 < 10 ? `0${new Date(record?.endDate).getMonth() + 1}` : new Date(record?.endDate).getMonth() + 1}-${new Date(record?.endDate).getFullYear()}`} ${formatTime(new Date(record?.endDate))}`
                }
                </p>
        },
        {
            key: "eventcreater",
            text: "Event Creater",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.userId?.username}
                </p>
        },
        {
            key: "location",
            text: "Location",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>

                <button className='interest_value border-0 outline-0' onClick={() => handlelocation(record)}>

                    View location

                </button>
        },

        {
            key: "membercount",
            text: "Joined Members",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) => {
                let datas = Eventinterest(record)
                console.log("datas", datas)

                return (<p className='text-center green_text'>{datas.joincount}

                </p>)
            }
        },

        // {
        //     key: "membercount",
        //     text: "Interest Members",
        //     align: "center",
        //     className: "text-center w_100",
        //     sortable: true,
        //     cell: (record, index) => {
        //         let datas = Eventinterest(record)
        //         console.log("datas", datas)

        //         return (<p className='text-center green_text'>{datas.status}

        //         </p>)
        //     }
        // },
        {
            key: "blockedreason",
            text: "Blocked Reason",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>
                <div className='d-flex justify-content-center'>
                    <button className='light_red_button d-flex align-items-center gap-2 border-0 outline-0' onClick={() => handleShowBlockedReason(record)}>
                        View Reason <IoMdInformationCircleOutline />
                    </button>
                </div>
        },
        {
            key: "Reason",
            text: "Event status",
            align: "center",
            className: "text-center w_80",
            sortable: true,
            cell: (record, index) =>
                <p className={`${record?.event_status === "started" ? "green_text" : record?.event_status === "finished" ? "red_text" : "pink_text"}`}>{record.event_status}

                </p>
        },

        {
            key: "action",
            text: "Action",
            align: "center",
            className: "text-center w_80",
            // sortable: true,
            cell: (record, index) =>
                <button
                    className='block_button'
                    onClick={() => handleShowUnBlockGroup(record)}
                >
                    <MdBlock fill='#fff' />
                </button>
        },

        {
            key: "delete",
            text: "Delete",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <div className='d-flex justify-content-center'>
                    <button className='delete_button' onClick={() => { DeleteValue(record) }}>
                        <FaTrash />
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



    const getUnblockEventlists = async (page = 1, limit = 5) => {
        try {
            let payload = {
                page: page || 1,
                limit: limit || 5
            }
            let resp = await GetEvents(payload)
            console.log("ersponses", resp);
            setEvents(resp.data)
            settotalCount(prev => ({
                ...prev,
                unblock: resp.count
            }));
            setCurrentPage(prev => ({ ...prev, unblock: page }))
        } catch (error) {
            console.log("error", error);
        }
    }

    const getblockedEventlists = async (page = 1, limit = 5) => {
        try {
            let payload = {
                page: page || 1,
                limit: limit || 5
            }
            let resp = await GetblockEvents(payload)
            console.log("ersponses", resp);
            setBlockEvents(resp.data)
            settotalCount(prev => ({
                ...prev,
                block: resp.count
            }));
            setCurrentPage(prev => ({ ...prev, block: page }))
        } catch (error) {
            console.log("error", error);
        }
    }

    const EventslistSearch = async (e) => {
        try {
            const payload = { searchtext: e.target.value };
            if (!e.target.value) {
                getUnblockEventlists(currentpage.unblock, limit);
                getblockedEventlists(currentpage.block, limit);
                return;
            }
            if (groupType === "ActiveGroups") {
                const resp = await GetEvents(payload);
                setEvents(resp.data);
            } else {
                const resp = await GetblockEvents(payload);
                setBlockEvents(resp.data);
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    const DeleteValue = async (record) => {
        console.log("records", record);
        try {
            let payload = {
                eventId: record._id,
            }
            const confirm = window.confirm("Are you sure to delete in?")
            if (confirm) {
                let resp = await EventDelete(payload)
                console.log("respmses", resp);
                if (resp.status) {
                    toast.success(resp.message)
                    getUnblockEventlists()
                    getblockedEventlists()
                }
                else {
                    toast.error(resp.message)
                }
            }
            // else {
            //     toast.success("Cancelled")

            // }

        } catch (error) {
            console.log("error", error);
        }
    }

    const handleEventImagelimit = async () => {
        try {
            if (!EvtImagelimit) {
                toast.error("Give the limit")
            }
            else {
                let payload = {
                    type: "event",
                    id: userdata?.userId,
                    limit: Number(EvtImagelimit)
                }
                console.log("paylodas", payload)
                let resp = await Hobbieslimit(payload)
                console.log("responses", resp);
                if (resp.status) {
                    // setEvtImagelimit(resp.data.eventImage_limit)
                    GetadminData()
                    dispatch({ type: "eventimagelimit", eventimagelimit: resp.data.eventImage_limit })
                    toast.success(resp.message)

                }
                else {
                    toast.error(resp.message)
                }
            }



        } catch (error) {
            console.log("error", error);
        }
    }

    const GetadminData = async () => {
        try {
            let resp = await GetAdmindata()
            console.log("getadmin", resp);
            if (resp.status) {
                setEvtImagelimit(resp.data[0].eventImage_limit)
            }
            else {
                console.log("something error");
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    return (
        <>

            {/* start of modal import */}
            <BlockedEvent show={showBlockGroup} handleClose={handleCloseBlockGroup} Blockgroup={block} Blockfunc={getblockedEventlists} unblock={getUnblockEventlists} />
            <UnBlockEvent show={showUnBlockGroup} handleClose={handleCloseUnBlockGroup} UserUnblock={UnblockUser} Blockfunc={getblockedEventlists} unblock={getUnblockEventlists} />
            <EventsBlockedReason show={showBlockedReason} handleClose={handleHideBlockedReason} BlockData={BlockReason} />

            <AddressView show={addloc} handleClose={handCloselelocation} Address={Address} />
            <EventdescView show={descclose} handleClose={handClosedescription} EventDesc={descriptions} />
            <EventImageView show={eventimgclose} handleClose={handClosedEventimg} EventDesc={EventImage} />

            {/* <GroupBlockedReason show={showBlockedReason} handleClose={handleHideBlockedReason} BlockData={BlockReason} /> */}

            {/* <UnBlockGroup show={showUnBlockGroup} handleClose={handleCloseUnBlockGroup} UserUnblock={UnblockUser} Blockfunc={getblockedGroups} unblock={getUnblockedGroups} /> */}
            {/* <ViewAdmins show={showAdminsList} handleClose={handleCloseAdminsList} adminData={adminData} /> */}
            {/* <GroupBlockedReason show={showBlockedReason} handleClose={handleHideBlockedReason} BlockData={BlockReason} /> */}

            {/* end of modal import */}

            <Header title="Event List" />


            <div className='cn_dashboard ' >
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
                            <p className='mb-0 dash_title text-center'>Active Events</p>
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
                            <p className='mb-0 dash_title text-center'>Blocked Events</p>
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

                <div className='mt-4'>
                    <p className='mb-0 dash_title '>Event Images Limit:</p>
                    <input type="number" id="eventimagelimit" className='mdl_input mt-2' value={EvtImagelimit} onChange={(e) => setEvtImagelimit(e.target.value)}></input>
                </div>
                <button className='orange_primary_btn d-flex align-items-center gap-2 mt-3' onClick={() => handleEventImagelimit()}>submit</button>
                <div className='common_page_scroller mt-5'>
                    <div className='d-flex align-items-center justify-content-end mb-3'>
                        <div className='search_wrapper'>
                            <LuSearch color='#fff' /> <input placeholder='Search by event title, location, or creator...'
                                onChange={(e) => { EventslistSearch(e) }}
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
                            records={Events}
                            columns={columns}
                        // extraButtons={extraButtons}
                        />}
                        {groupType === "BlockedGroups" && <ReactDatatable
                            config={config}
                            records={blockEvents}
                            columns={BlockedEventColumns}
                        // extraButtons={extraButtons}
                        />}


                    </div>
                </div>
                <div className='primaryPagination mt-4'>
                    {groupType === "ActiveGroups" ?
                        <>
                            <Pagination>
                                <Pagination.Prev onClick={() => { getUnblockEventlists(currentpage.unblock - 1, limit) }} disabled={currentpage.unblock === 1 ? true : false} />
                                {
                                    [1, 2, 3, 4, 5].map((pg, i) => (
                                        <Pagination.Item active={pg === currentpage.unblock} onClick={() => { getUnblockEventlists(pg, limit) }}>{pg}</Pagination.Item>
                                    ))
                                }
                                <Pagination.Next onClick={() => { getUnblockEventlists(currentpage.unblock + 1, limit) }}
                                    disabled={(totalCount.unblock / limit) > currentpage.unblock ? false : true}
                                />
                            </Pagination>
                        </>
                        :
                        <>
                            <Pagination>
                                <Pagination.Prev onClick={() => { getblockedEventlists(currentpage.block - 1, limit) }} disabled={currentpage.block === 1 ? true : false} />
                                {
                                    [1, 2, 3, 4, 5].map((pg, i) => (
                                        <Pagination.Item active={pg === currentpage.block} onClick={() => { getblockedEventlists(pg, limit) }}>{pg}</Pagination.Item>
                                    ))
                                }
                                <Pagination.Next onClick={() => { getblockedEventlists(currentpage.block + 1, limit) }}
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

export default Eventlists