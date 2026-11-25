/** npm import */
import React, { useRef, useState, useEffect } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import ReactDatatable from '@ashvin27/react-datatable';
import CountUp from 'react-countup';
import { FaRegUser, FaPeopleGroup } from "react-icons/fa6";
import { FaPlus, } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";
import { MdBlock } from "react-icons/md"
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Pagination } from 'react-bootstrap';


/** local file import */

import Header from '../Components/Header'
import Sidebar from '../Components/Sidebar'
import BlockUser from '../Modals/BlockUser';
import UnBlockUser from '../Modals/UnBlockUser';
import InterestView from '../Modals/InterestView';
import GroupDetails from '../Modals/GroupDetails';
import { ADDRESS_KEY } from "../config/config"

import UserBlockedReason from '../Modals/UserBlockedReason';
import { GetBlockuserlists, GetUnBlockuserlists, Getuserlists } from '../api/api';
import { useDispatch, useSelector } from 'react-redux'
import ViewMapModal from "../Modals/Googlefindlocation"
import { formatDate, GetAddressBasedOnLatLng } from '../config/common';
import AddressView from "../Modals/Addressview"
import Config from "../config/config"
import DefultImage from "../assets/images/emptyprofile.png"
/** code start */
import { LuSearch } from "react-icons/lu";
import Table from "./drag"
function TotalUsers() {

    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { userlocation } = useSelector((state) => state.redux)
    console.log("userlocfdsgsdfg", userlocation);
    const [showBlockUser, setShowBlockUser] = useState(false);
    const [showUnBlockUser, setShowUnBlockUser] = useState(false);
    const [addloc, setAddloc] = useState(false);

    const [interestView, setInterestView] = useState(false);
    const [interestData, setInterestData] = useState([]);
    console.log("insterestsa", interestData);
    const [groupView, setGroupView] = useState(false);
    const [groupData, setGroupData] = useState([]);
    const [showBlockedReason, setShowBlockedReason] = useState(false);
    const [hobby, setHobby] = useState([])
    const [hobbyname, setHobbyname] = useState("")
    console.log("names", hobbyname);
    const [BlockReason, setBlockReason] = useState("")
    const [blockUser, setblockUser] = useState({})
    const [UnblockUser, setUnblockUser] = useState({})
    const [location, setLocation] = useState({})
    const [mapview, setmapview] = useState(false)
    const [Address, setAddress] = useState("")
    console.log("sfsfdsfffsdfff", Address);
    console.log("locations", location);
    // const [skip,setSkip] = useState(1)
    // const [limit,setLimit] = useState(5)
    const [page, setpage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [currentpage, setCurrentPage] = useState({ unblock: 1, block: 1 })
    const [totalCount, settotalCount] = useState({ unblock: 0, block: 0 })
    console.log("BNNNNNNN", currentpage, totalCount);

    // useEffect(()=>{

    // },[])

    useEffect(() => {
        getblockUserlist()
        getUnblockUserlist()
        data()

    }, [])
    let data = async () => {
        hobby?.map((val) => {
            console.log("values", val.hobbies);
            val?.hobbies?.map((item) => {

                console.log("hiobeeies", item.name);
                handleShowInterestView(item.name)
            })

        })
    }



    const handleShowBlockUser = (record) => {
        console.log("gsfrgdfgh", record);
        setShowBlockUser(true)
        setblockUser(record)
    };

    const handleCloseBlockUser = () => {

        setShowBlockUser(false)
    };
    const handleShowUnBlockUser = (record) => {
        console.log("gsfrgdfgh1111", record);
        setShowUnBlockUser(true)
        setUnblockUser(record)
    };

    const handleCloseUnBlockUser = () => {
        setShowUnBlockUser(false)
    };

    const handleShowInterestView = (records) => {
        console.log("records", records);
        setInterestView(true);
        setInterestData(records)
    };
    console.log("interestData", interestData)

    const handleCloseInterestView = () => {
        setInterestView(false)
    };

    const handleShowGroupView = (record) => {
        setGroupView(true);
        setGroupData(record)
    };

    const handleCloseGroupView = () => {
        setGroupView(false)
    };

    const handleShowBlockedReason = (record) => {
        console.log("BlockedReason", record);

        setShowBlockedReason(true)
        setBlockReason(record)
    };

    const handleHideBlockedReason = () => {
        setShowBlockedReason(false)
    };
    const handleclose = (data) => {
        setLocation(data); setmapview(true)

    }

    const handlelocation = async (record) => {
        console.log("rerererereoed", record);
        let address = await GetAddressBasedOnLatLng({
            lat: Number(record?.location?.coordinates?.[1]),
            lng: Number(record?.location?.coordinates?.[0]),
            key: ADDRESS_KEY
        })
        // setAddress(record)
        setAddress(address)
        setAddloc(true);

    }

    const handCloselelocation = async () => {

        setAddloc(false);

    }
    const [list, setList] = useState([]);
    console.log('listtt', list)
    const [blocklists, setBlocklists] = useState([])

    const [userType, setUserType] = useState("Activeusers")
    console.log("userstypes", userType);

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
        //     key: "userid",
        //     text: "User ID",
        //     align: "center",
        //     className: "text-center w_100",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center'>{record?._id}
        //         </p>
        // },
        {
            key: "profile",
            text: "Profile",
            align: "center",
            className: "text-center w_100 d-flex justify-content-center align-items-center",
            // sortable: true,
            cell: (record, index) =>
            (<>
                {console.log("sggdfhgfh", record, `${Config.AWS_CDN_URL}${record?.profile}`)}
                {record?.profile ?
                    <div className='user_image_wrapper '>
                        <img src={`${Config.AWS_CDN_URL}${record?.profile}`} alt='profile' />
                    </div>
                    :
                    <div className='user_image_wrapper '>
                        <img src={`${DefultImage}`} alt='profile' />
                    </div>

                }
            </>)

        },
        // {
        //     key: "username",
        //     text: "Name",
        //     align: "center",
        //     className: "text-center w_150",
        //     // sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center'>{record?.name ? record?.name : "No set name"}
        //         </p>
        // },
        {
            key: "username",
            text: "Username",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.username ? record?.username : "No set username"}
                </p>
        },
        {
            key: "email",
            text: "Email",
            align: "center",
            className: "text-center w_300",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.email}
                </p>
        },
        // {
        //     key: "transactions",
        //     text: "Transactions",
        //     align: "center",
        //     className: "text-center w_80",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className={`text-center ${record?.transactions === "Completed" ? "green_text" : "red_text"}`}>{record?.transactions}
        //         </p>
        // },
        {
            key: "age",
            text: "Age",
            align: "center",
            className: "text-center w_80",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.age ? record?.age : "Age not set"}
                </p>
        },
        {
            key: "gender",
            text: "Gender",
            align: "center",
            className: "text-center w_80",
            sortable: true,
            cell: (record, index) =>
                record?.gender ?
                    <p className={`${record?.gender === "male" ? "green_text" : "pink_text"}`}>{record?.gender ? record?.gender : "Gender not set"}
                    </p>
                    : "Gender not set"
        },
        {
            key: "dateofbirth",
            text: "Date Of Birth",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) => (
                <>
                    {console.log("dfgdfdfhfgjfgj", new Date(record?.dob).getMonth(), new Date(record?.dob).getDate())}
                    <p className='text-center'>{record?.dob ?
                        `${new Date(record?.dob).getDate() < 10 ? `0${new Date(record?.dob).getDate()}` : new Date(record?.dob).getDate()}-${new Date(record?.dob).getMonth() + 1 < 10 ? `0${new Date(record?.dob).getMonth() + 1}` : new Date(record?.dob).getMonth()}-${new Date(record?.dob).getFullYear()}`
                        : "DOB not set"
                    }

                        {/* //  (new Date(record?.dob).getDate() < 10 ?
                    //   "0"+new Date(record?.dob).getDate() :
                    //    new Date(record?.dob).getDate())+"-"+ new Date(record?.dob).getMonth() <10 ? "0"+new Date(record?.dob).getMonth() : new Date(record?.dob).getMonth()+"-"+ new Date(record?.dob).getFullYear() :"No set DOB"
                    //    } */}
                    </p>
                </>

            )

        },
        // {
        //     key: "location",
        //     text: "Location",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <button className='interest_value border-0 outline-0' onClick={() => handleclose(record)}>Address
        //         </button>
        // },



        // {
        //     key: "averageusetime",
        //     text: "Average Use Time",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center green_text'>{record?.averageusetime}
        //         </p>
        // },
        {
            key: "friendscount",
            text: "Friends Count",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center yellow_text'>{record?.followersCount}
                </p>
        },
        // {
        //     key: "likes",
        //     text: "Likes Count",
        //     align: "center",
        //     className: "text-center w_100",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center yellow_text'>{record?.likesCount}
        //         </p>
        // },
        {
            key: "location",
            text: "Location",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>

                <button className='interest_value border-0 outline-0' onClick={() => handlelocation(record)}>

                    View Address

                </button>
        },
        {
            key: "interests",
            text: "Hobbies",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>
                // <div className='d-flex flex-wrap align-items-center justify-content-center gap-2'>{record?.hobbies.map((value) => (
                //     <div className='interest_value'>
                //         {value.name}
                //     </div>


                // ))}
                <button className='interest_value border-0 outline-0' onClick={() => handleShowInterestView(record.hobbies.map((values) => (
                    values
                )))}>
                    View Hobbies
                </button>
            // </div>

        },
        {
            key: "Account",
            text: "Account",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center yellow_text'>{record?.delete == true ? "Deleted Account" : "Active"}
                </p>
        },
        // {
        //     key: "joinedgroups",
        //     text: "Joined Groups",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <div className='d-flex flex-wrap align-items-center justify-content-center gap-2'>{record?.joinedgroup.map((value) => (
        //             <div className='group_value'>
        //                 {value}
        //             </div>
        //         ))}
        //         <button className='group_value border-0 outline-0' onClick={() => handleShowGroupView(record)}>
        //             Click to view
        //         </button>
        //         </div>

        // },
        {
            key: "action",
            text: "Action",
            align: "center",
            className: "text-center w_100",
            // sortable: true,
            cell: (record, index) =>
                <div className='d-flex align-items-center justify-content-center'>
                    <button className='block_button' onClick={() => handleShowBlockUser(record)}>
                        <MdBlock fill='#fff' />
                    </button>
                </div>
        },
    ];
    const blockedUserColumns = [
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
            text: "Profile",
            align: "center",
            className: "text-center w_100 d-flex justify-content-center",
            // sortable: true,
            cell: (record, index) =>
            (<>
                {console.log("sggdfhgfh", record, `${Config.AWS_CDN_URL}${record?.profile}`)}
                {record?.profile ?
                    <div className='user_image_wrapper '>
                        <img src={`${Config.AWS_CDN_URL}${record?.profile}`} alt='profile' />
                    </div>
                    :
                    <div className='user_image_wrapper '>
                        <img src={`${DefultImage}`} alt='profile' />
                    </div>

                }
            </>)

        },

      /*   {
            key: "username",
            text: "Name",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.name ? record?.name : "No set name"}
                </p>
        }, */
        {
            key: "username",
            text: "Username",
            align: "center",
            className: "text-center w_150",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.username ? record?.username : "No set username"}
                </p>
        },
        {
            key: "email",
            text: "Email",
            align: "center",
            className: "text-center w_300",
            // sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.email}
                </p>
        },
        // {
        //     key: "transactions",
        //     text: "Transactions",
        //     align: "center",
        //     className: "text-center w_80",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className={`text-center ${record?.transactions === "Completed" ? "green_text" : "red_text"}`}>{record?.transactions}
        //         </p>
        // },
        {
            key: "age",
            text: "Age",
            align: "center",
            className: "text-center w_80",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.age ? record?.age : "No set age"}
                </p>
        },
        {
            key: "gender",
            text: "Gender",
            align: "center",
            className: "text-center w_80",
            sortable: true,
            cell: (record, index) =>
                record?.gender ?
                    <p className={`${record?.gender === "male" ? "green_text" : "pink_text"}`}>{record?.gender}
                    </p>
                    : "No set gender"
        },
        {
            key: "dateofbirth",
            text: "Date Of Birth",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center'>{record?.dob ?
                    `${new Date(record?.dob).getDate() < 10 ? `0${new Date(record?.dob).getDate()}` : new Date(record?.dob).getDate()}-${new Date(record?.dob).getMonth() + 1 < 10 ? `0${new Date(record?.dob).getMonth() + 1}` : new Date(record?.dob).getMonth()}-${new Date(record?.dob).getFullYear()}`
                    : "No set dob"
                }
                </p>
        },


        // {
        //     key: "location",
        //     text: "Location",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>

        //         <button className='interest_value border-0 outline-0' onClick={() => handleclose(record)}>

        //        Address

        //         </button>
        // },
        // {
        //     key: "professional",
        //     text: "Professional",
        //     align: "center",
        //     className: "text-center w_100",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center'>{record?.professional}
        //         </p>
        // },
        // {
        //     key: "averageusetime",
        //     text: "Average Use Time",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center green_text'>{record?.averageusetime}
        //         </p>
        // },
        {
            key: "friendscount",
            text: "Friends Count",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center yellow_text'>{record?.followersCount}
                </p>
        },
        // {
        //     key: "likes",
        //     text: "Likes Count",
        //     align: "center",
        //     className: "text-center w_100",
        //     sortable: true,
        //     cell: (record, index) =>
        //         <p className='text-center yellow_text'>{record?.likesCount}
        //         </p>
        // },
        {
            key: "location",
            text: "Location",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>

                <button className='interest_value border-0 outline-0' onClick={() => handlelocation(record)}>

                    View Address

                </button>
        },
        {
            key: "interests",
            text: "Hobbies",
            align: "center",
            className: "text-center w_130",
            sortable: true,
            cell: (record, index) =>
                // <div className='d-flex flex-wrap align-items-center justify-content-center gap-2'>{record?.interests.map((value) => (
                //     <div className='interest_value'>
                //         {value}
                //     </div>
                // ))}
                // </div>
                <button className='interest_value border-0 outline-0' onClick={() => handleShowInterestView(record.hobbies.map((value) => (
                    value
                )))}>
                    View Hobbies
                </button>
        },
        {
            key: "Account",
            text: "Account",
            align: "center",
            className: "text-center w_100",
            sortable: true,
            cell: (record, index) =>
                <p className='text-center yellow_text'>{record?.delete == true ? "Deleted Account" : "Active"}
                </p>
        },
        // {
        //     key: "joinedgroups",
        //     text: "Joined Groups",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         // <div className='d-flex flex-wrap align-items-center justify-content-center gap-2'>{record?.joinedgroup.map((value) => (
        //         //     <div className='group_value'>
        //         //         {value}
        //         //     </div>
        //         // ))}
        //         // </div>
        //         <button className='group_value border-0 outline-0' onClick={() => handleShowGroupView(record)}>
        //             Click to view
        //         </button>
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
            key: "action",
            text: "Action",
            align: "center",
            className: "text-center w_100",
            // sortable: true,
            cell: (record, index) =>
                <div className='d-flex align-items-center justify-content-center'>
                <button className='unblock_button' onClick={() => handleShowUnBlockUser(record)}>
                    <MdBlock fill='#000' />
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
            // info: "Showing _START_ to _END_ of _TOTAL_ records",
            // pagination: {
            //     first: "First",
            //     previous: "Previous",
            //     next: "Next",
            //     last: "Last",
            // },
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
            // info: "Showing _START_ to _END_ of _TOTAL_ records",
            // pagination: {
            //     first: "First",
            //     previous: "Previous",
            //     next: "Next",
            //     last: "Last",
            // },
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

    const getUnblockUserlist = async (page = 1, limit = 5) => {
        console.log("_page", page, limit);

        try {

            let payload = {
                page: page || 1,
                limit: limit || 5
            }
            console.log("status", payload)

            let resp = await GetUnBlockuserlists(payload)
            console.log("unblockdata", resp);


            if (resp.status) {

                setList(resp.data)
                settotalCount(prev => ({
                    ...prev,
                    unblock: resp.count
                }));
                setCurrentPage(prev => ({ ...prev, unblock: page }))
                // settotalCount({ unblock: resp.count })
                // setCurrentPage({ unblock: page })
                dispatch({
                    type: "unblockuserdata",
                    unblockuserdata: resp.data
                })
            }
            else {
                console.log("error");
            }



        } catch (error) {
            console.log("error", error);
        }
    }

    const getblockUserlist = async (page = 1, limit = 5) => {
        console.log("Hhhhhhh", page);

        try {
            let payload = {
                page: page || 1,
                limit: limit || 5
            }
            let resp = await GetBlockuserlists(payload)
            console.log("blockdata", resp);

            if (resp.status) {

                setBlocklists(resp.data)
                settotalCount(prev => ({
                    ...prev,
                    block: resp.count
                }));
                setCurrentPage(prev => ({ ...prev, block: page }))
                // settotalCount({ block: resp.count })
                // setCurrentPage({ block: page })
                dispatch({
                    type: "blockuserdata",
                    blockuserdata: resp.data
                })
            }
            else {
                console.log("error");
            }

        } catch (error) {
            console.log("errorr", error);
        }
    }

    const handleTotalUserNavigate = () => {
        navigate('/total-users')
    }

    const UserslistSearch = async (e) => {
        console.log("etargetvalue", e.target.value);
        try {
            let resp;
            let payload = {
                searchtext: e.target.value

            }
            if (userType == "Activeusers") {
                resp = await GetUnBlockuserlists(payload)
                console.log("responses", resp);
                setList(resp.data)

            }
            else {
                resp = await GetBlockuserlists(payload)
                console.log("responses123", resp);
                setBlocklists(resp.data)

            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const pagination = [1, 2, 3, 4, 5];

    const totalPages = Math.ceil(totalCount / 5);
    console.log("settotalCount", currentpage, page, totalCount, (totalCount / limit) > currentpage, userType);

    // const goToNextPage = () => {
    //     if (currentpage < totalPages) setCurrentPage(prev => prev + 1);
    // };

    // const goToPrevPage = () => {
    //     if (currentpage > 1) setCurrentPage(prev => prev - 1);
    // };

    // const goToFirstPage = () => setCurrentPage(1);
    // const goToLastPage = () => setCurrentPage(totalPages);

    return (
        <>

            {/* start of modal import */}

            <BlockUser show={showBlockUser} handleClose={handleCloseBlockUser} UserBlock={blockUser} Blockfunc={getblockUserlist} unblock={getUnblockUserlist} />
            <UnBlockUser show={showUnBlockUser} handleClose={handleCloseUnBlockUser} UserUnblock={UnblockUser} unBlockfunc={getUnblockUserlist} blockfunc={getblockUserlist} />
            <InterestView show={interestView} handleClose={handleCloseInterestView} interestData={interestData} />
            <GroupDetails show={groupView} handleClose={handleCloseGroupView} groupData={groupData} />
            <UserBlockedReason show={showBlockedReason} handleClose={handleHideBlockedReason} BlockData={BlockReason} />
            <AddressView show={addloc} handleClose={handCloselelocation} Address={Address} />
            {location && mapview &&
                <ViewMapModal show={mapview} handleClose={setmapview} location={location} />
            }

            {/* end of modal import */}

            <Header title="Total Users" />


            <div div className='cn_dashboard' >
                <div className='cn_dashboard_grid autofill'>
                    <div
                        className={`dashboard_box user_green p-3 rounded-3 ${userType === "Activeusers" ? "active" : ""} `}
                        onClick={() => setUserType("Activeusers")}>
                        <div className='d-flex align-items-center justify-content-between '>
                            <div className='cn_dashboard_icon_wrapper user_green'>
                                <FaRegUser />
                            </div>
                            {/* <div className='dash_greenvalues d-flex justify-content-end align-items-center gap-2'>
                                            <p className='dash_greentext'>10 %</p>
                                            <img src={require('../assets/images/greenthunder.svg').default} className='img-fluid' />
                                        </div> */}

                        </div>
                        <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3'>

                        </div >
                        <div className='mt-4'>
                            <p className='mb-0 dash_title text-center'>Active Users</p>
                            <p className='cn_dashboard_count user_green text-center mb-0'>
                                <CountUp
                                    // start={1000 - 1}
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
                        className={`dashboard_box blocked_red  p-3 rounded-3 ${userType === "Blockedusers" ? "active" : ""} `}
                        onClick={() => setUserType("Blockedusers")}>
                        <div className='d-flex align-items-center justify-content-between '>
                            <div className='cn_dashboard_icon_wrapper blocked_red'>
                                <FaRegUser />
                            </div>
                            {/* <div className='dash_greenvalues d-flex justify-content-end align-items-center gap-2'>
                                            <p className='dash_redtext'>30 %</p>
                                            <img src={require('../assets/images/decrease.svg').default} className='img-fluid' />
                                        </div> */}

                        </div>

                        <div className='mt-4'>
                            <p className='mb-0 dash_title text-center'>Blocked Users</p>
                            <p className='cn_dashboard_count blocked_red text-center mb-0'>
                                <CountUp
                                    // start={1000 - 1000}
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
                    {/* <div className='search_wrapper'>
                        <LuSearch color='#fff' /> <input placeholder='Search...' id="hobbyname"
                            onChange={(e) => { UserslistSearch(e) }}
                        />
                    </div> */}
                </div>

                <div className='common_page_scroller mt-5'>
                    <div className='d-flex align-items-center justify-content-end mb-3'>
                        <div className='search_wrapper'>
                            <LuSearch color='#fff' /> <input placeholder='Search...' id="hobbyname"
                                onChange={(e) => { UserslistSearch(e) }}
                            />
                        </div>
                    </div>
                    <div className='exchange_table_holder dashboard_box rounded-3 '>
                        {console.log('lisst', list)}

                        {userType === "Activeusers" &&
                            <ReactDatatable
                                config={config}
                                records={list}
                                columns={columns}
                                extraButtons={extraButtons}

                            />}
                        {userType === "Blockedusers" &&
                            <ReactDatatable
                                config={configTwo}
                                records={blocklists}
                                columns={blockedUserColumns}
                                extraButtons={extraButtons}
                                pagination={false}
                            />}
                    </div>
                </div>
                {/* <Table>Datas</Table> */}
                <div className='primaryPagination mt-4'>
                    {userType === "Activeusers" ?
                        <>
                            <Pagination>
                                <Pagination.Prev onClick={() => { getUnblockUserlist(currentpage.unblock - 1, limit) }} disabled={currentpage.unblock === 1 ? true : false} />
                                {
                                    pagination.map((pg, i) => (
                                        <Pagination.Item active={pg === currentpage.unblock} onClick={() => { getUnblockUserlist(pg, limit) }}>{pg}</Pagination.Item>
                                    ))
                                }
                                <Pagination.Next onClick={() => { getUnblockUserlist(currentpage.unblock + 1, limit) }}
                                    disabled={(totalCount.unblock / limit) > currentpage.unblock ? false : true}
                                />
                            </Pagination>
                        </>
                        :
                        <>
                            <Pagination>
                                <Pagination.Prev onClick={() => { getblockUserlist(currentpage.block - 1, limit) }} disabled={currentpage.block === 1 ? true : false} />
                                {
                                    pagination.map((pg, i) => (
                                        <Pagination.Item active={pg === currentpage.block} onClick={() => { getblockUserlist(pg, limit) }}>{pg}</Pagination.Item>
                                    ))
                                }
                                <Pagination.Next onClick={() => { getblockUserlist(currentpage.block + 1, limit) }}
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

export default TotalUsers