
import React, { useState, useEffect } from 'react'
import { Col, Container, Row } from "react-bootstrap";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Select from "react-select";
import ReactDatatable from "@ashvin27/react-datatable";
import { toastAlert } from "../lib/toastAlert";
import { adminAddSubcategory, adminAddcategory, categorylist, getGroupcategorylists, getsubcategorylist } from '../api/api'

import { FaEdit } from 'react-icons/fa';
import EditCategory from '../Modals/EditCategory';
import AddCategory from '../Modals/AddCategory';
import { FaPlus } from "react-icons/fa6";
import toast from 'react-hot-toast';
import InterestView from "../Modals/Hobbieslist"
import EditSubcategory from '../Modals/EditSubcategory';
import AddSubcategory from '../Modals/AddSubcategorydata';
import AddSubcategorydata from '../Modals/AddSubcategorydata';
import AddGroupcategorydata from '../Modals/AddGroupCategory';
import EditGroupcategory from '../Modals/EditGroupcategory';
function Groupcategory() {

    const [list, setList] = useState([])
    const [errors, setError] = useState();
    const [interestData, setInterestData] = useState([]);
    const [interestView, setInterestView] = useState(false);

    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [showcategory, setShowcategory] = useState({})
    const handleShowAddCategory = () => {
        setShowAddCategory(true)
    }
    const handleCloseAddCategory = () => {
        setShowAddCategory(false)
    }

    const handleShowInterestView = (records) => {
        console.log("records", records);
        setInterestView(true);
        setInterestData(records)
    };


    const handleShowEditCategory = (record) => {
        console.log("records", record);
        setShowEditCategory(true)
        setShowcategory(record)
    }
    const handleCloseEditCategory = () => {
        setShowEditCategory(false)
    }

    const handleCloseInterestView = () => {
        setInterestView(false)
    };
    const [Groupcategorylists, setGroupcategorylists] = useState([
        // {
        //     id: 1,
        //     name: "Dancing",
        //     category: "Popular ",
        //     status: "Active"
        // },
        // {
        //     id: 2,
        //     name: "Singing",
        //     category: "Popular ",
        //     status: "Inactive"
        // },
        // {
        //     id: 3,
        //     name: "Travel",
        //     category: "Normal ",
        //     status: "Active"
        // }, {
        //     id: 4,
        //     name: "Politics",
        //     category: "Others ",
        //     status: "Inactive"
        // },

    ])
    // console.log("interestList",interestList);
    const selectOptions = [
        {
            value: "popular", label: "Popular"
        },
        {
            value: "trending", label: "Trending"
        },
        {
            value: "others", label: "Others"
        },
    ]

    const state = [
        {
            name: <p className="exchange_table_values text-center">Demo</p>,
            userId: <p className="exchange_table_values text-center">2523153</p>,
            network: <p className="exchange_table_values text-center">BTC</p>,
            address: (
                <p className="exchange_table_values exchange_table_address text-center">
                    yu676869669869
                </p>
            ),
            created: (
                <p className="exchange_table_values text-center">
                    08/02/2024 , 15:24:35 PM
                </p>
            ),
            status: <p className="exchange_table_values text-center">Completed</p>,
        },
        {
            name: <p className="exchange_table_values text-center">Demo</p>,
            userId: <p className="exchange_table_values text-center">2523153</p>,
            network: <p className="exchange_table_values text-center">BTC</p>,
            address: (
                <p className="exchange_table_values exchange_table_address text-center">
                    yu676869669869
                </p>
            ),
            created: (
                <p className="exchange_table_values text-center">
                    08/02/2024 , 15:24:35 PM
                </p>
            ),
            status: <p className="exchange_table_values text-center">Failed</p>,
        },
        {
            name: <p className="exchange_table_values text-center">Demo</p>,
            userId: <p className="exchange_table_values text-center">2523153</p>,
            network: <p className="exchange_table_values text-center">BTC</p>,
            address: (
                <p className="exchange_table_values exchange_table_address text-center">
                    yu676869669869
                </p>
            ),
            created: (
                <p className="exchange_table_values text-center">
                    08/02/2024 , 15:24:35 PM
                </p>
            ),
            status: <p className="exchange_table_values text-center">Pending</p>,
        },
    ];

    // console.log(state.records[0].status.props,"asdfasfasdfasdf");

    const columns = [
        {
            key: "sno",
            text: "S.No",
            className: "text-center w_100",
            align: "center",
            sortable: true,
            cell: (record, index) =>
                <p className=" text-center">{index + 1}</p>,
        },
        {
            key: "category",
            text: "Category name",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <>

                    {console.log("dfdddddddddd", record)}
                    <p className=" text-center">{record?.categorylist?.[0]?.category}</p>
                </>
        },
        {
            key: "Subcategory",
            text: "Subcategory name",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <p className=" text-center">{record?.subcategorylist?.[0]?.subcategory}</p>,
        },
        {
            key: "Group",
            text: "Group name",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <p className=" text-center">{record?.group}</p>,
        },
        // {
        //     key: "subcategory",
        //     text: "Sub Hobbies",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //         // <div className='d-flex flex-wrap align-items-center justify-content-center gap-2'>{record?.interests.map((value) => (
        //         //     <div className='interest_value'>
        //         //         {value}
        //         //     </div>
        //         // ))}
        //         // </div>
        //         <button className='interest_value border-0 outline-0' onClick={() => handleShowInterestView(record.subcategoryId.map((value) => (
        //             value
        //         )))}>
        //             Click to view
        //         </button>
        // },
        // {
        //     key: "category",
        //     text: "Category",
        //     className: "text-center w_100",
        //     align: "center",
        //     sortable: false,
        //     cell: (record, index) =>
        //         <p className=" text-center">{record?.category}</p>,
        // },
        // {
        //     key: "changeCategory",
        //     text: "Change Category",
        //     className: "text-center w_100",
        //     align: "center",
        //     sortable: false,
        //     cell: (record, index) =>
        //         // <p className=" text-center">{record?.category}</p>,
        //         <div className='select_wrapper mx-auto'>
        //             <Select
        //                 classNamePrefix="custom_rct_slt"
        //                 isSearchable={false}
        //                 options={selectOptions} />
        //         </div>
        // },
        // {
        //     key: "status",
        //     text: "Status",
        //     className: "text-center w_100",
        //     align: "center",
        //     sortable: false,
        //     cell: (record, index) =>
        //         <p className={`${record?.hideshow === "visible" ? "green_text" : "red_text"}`}>{record?.hideshow}</p>,
        // },
        {
            key: "edit",
            text: "Edit",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <div className='d-flex justify-content-center'>
                    <button className='green_edit_button' onClick={() => handleShowEditCategory(record)}>
                        <FaEdit className='ms-1' />
                    </button>
                </div>
        },
        // {
        //     key: "action",
        //     text: "Hide/Show",
        //     className: "text-center w_100",
        //     align: "center",
        //     sortable: false,
        //     cell: (record, index) =>
        //         // <p className=" text-center">{record?.category}</p>,
        //         <div className="custom_toggle custom_toggle_secondary">
        //             <label class="switch">
        //                 {/* <button
        //                     type="checkbox" onClick={()=>hideshowchange(record.hideshow == "visible" ? "hidden" : "visible", record._id)}
        //                 ></button> */}
        //                     <input
        //                     checked={record.hideshow == "visible" ? false : true}
        //                     type="checkbox" onChange={()=>hideshowchange(record.hideshow == "visible" ? "hidden" : "visible", record._id)}
        //                />
        //                 <span class="slider round"></span>
        //             </label>
        //         </div>
        // },

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
        show_pagination: true,
        show_info: true,
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
    useEffect(() => {

        GetGroupcategorylists()
        // hideshowchange()
    }, [])





    // const hideshowchange = async (filter, record) => {
    //     console.log("reecoredsa", filter, record);

    //     try {

    //         let payload = {
    //             id: record,
    //             hideshow: filter,
    //             type: "hide"
    //         }
    //         let resp = await adminAddSubcategory(payload)
    //         console.log("responses", resp);
    //         if (resp.status) {
    //             toast.success(resp.message)
    //             setSubcategoryLists(resp.data)
    //         }
    //         else {
    //             toast.error(resp.message)

    //         }
    //         GetGroupcategorylists()
    //     } catch (error) {
    //         console.log("errror", error);
    //     }
    // }

    const GetGroupcategorylists = async () => {
        try {


            let resp = await getGroupcategorylists()
            console.log("responses_getGroupcategorylists", resp);
            if (resp.status) {
                setGroupcategorylists(resp.data)
            }
            else {
                toast.error(resp.message)

            }


        } catch (error) {
            console.log("error", error);
        }
    }


    // const handleChange = async(record,filter)=>{
    //     try {

    //     } catch (error) {
    //         console.log("error",error);
    //     }
    // }
    return (
        <>

            {/* start of modal imports */}
            {/* {showAddCategory && */}
            <AddGroupcategorydata show={showAddCategory} handleClose={handleCloseAddCategory} editfunc={GetGroupcategorylists} EditData={showcategory} />
            {/* } */}
            <InterestView show={interestView} handleClose={handleCloseInterestView} interestData={interestData} />

            <EditGroupcategory show={showEditCategory} handleClose={handleCloseEditCategory} EditData={showcategory} editfunc={GetGroupcategorylists} />

            {/* end of modal imports */}

            <Header title="Group Category List" />

            <div className='d-flex justify-content-end pt-5'>
                <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={handleShowAddCategory} ><FaPlus />Add Group</button>
                {/* <div className='rp_singleinput_holder'>
                                        <p className='rp_label mb-2'>Add Category</p>
                                        <div className='d-flex align-items-center gap-3 '>

                                            <div className='rp_input_holder w-100 rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                                <input type='text' placeholder='Dancing' id="price" name="price" className='rp_singleInput flex-grow-1'
                                                // value={formValue.price}
                                                // onChange={(event) => handlechange(event)}
                                                />

                                            </div>
                                            <button className='orange_primary_btn' onClick={handleShowAddCategory}>Add</button>
                                        </div>
                                        <span className="errors_style" id="price-error" >error</span>
                                    </div> */}
                {/* <div className='rp_singleinput_holder mt-4'>
                                        <p className='rp_label mb-2'>Add New Category</p>
                                        <div className='d-flex align-items-center gap-3 '>

                                            <div className='rp_input_holder w-100 rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                                <input type='text' placeholder='Popular' id="price" name="price" className='rp_singleInput flex-grow-1'

                                                />

                                            </div>
                                            <button className='orange_primary_btn'>Add</button>
                                        </div>
                                    </div> */}
            </div>

            <div className="common_page_scroller mt-4 pe-2">
                <Row>
                    <Col xs={12} lg={7} md={8} sm={10} className='mb-4'>

                        {/* <div className="mt_2rem">
                                        <CKEditor
                                            config={{
                                                //extraAllowedContent: 'div(*)',
                                                allowedContent: true,
                                                height: 500,
                                            }}
                                            initData="<p>This is an example CKEditor 4 WYSIWYG editor instance.</p>"
                                        // onChange={handleEditorChange}
                                        />
                                    </div> */}
                    </Col>
                </Row>

                <div className="exchange_table_holder dashboard_box rounded-3">
                    <ReactDatatable
                        config={config}
                        records={Groupcategorylists}
                        columns={columns}
                        extraButtons={extraButtons}
                    />
                </div>

            </div>

        </>
    );
}

export default Groupcategory;
