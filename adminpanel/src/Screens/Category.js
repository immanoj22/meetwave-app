import React, { useState, useEffect } from 'react'

import Header from "../Components/Header";

import { adminAddcategory, categorylist } from '../api/api'

import { FaEdit } from 'react-icons/fa';

import AddCategory from '../Modals/AddCategory';
import { FaPlus } from "react-icons/fa6";
import toast from 'react-hot-toast';
import InterestView from "../Modals/Hobbieslist"

// import {
//     DndContext,
//     KeyboardSensor,
//     PointerSensor,
//     useSensor,
//     useSensors,
//     closestCorners,
// } from "@dnd-kit/core";
// import { arrayMove, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import CategoryDrag from "./DragAndDrop/CategoryDrag"
import { CategorieslistRearrange } from '../api/cms';
function Category() {

    const [interestData, setInterestData] = useState([]);
    const [interestView, setInterestView] = useState(false);

    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [showcategory, setShowcategory] = useState({})
    const [rearrange, setrearrange] = useState(false)
    const [draggedRowIndex, setDraggedRowIndex] = useState(null);

    const handleShowAddCategory = () => {
        setShowAddCategory(true)
    }
    const handleCloseAddCategory = () => {
        setShowAddCategory(false)

    }

    const handleShowEditCategory = (record) => {
        console.log("records", record);
        setShowEditCategory(true)
        setShowcategory(record)
    }

    const handleCloseInterestView = () => {
        setInterestView(false)
    };
    const [interestList, setInterestList] = useState([
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
    console.log("interestList", interestList);

    // const getTaskPos = (id) => interestList.findIndex((task) => {
    //     console.log("wefrwerfewrwerwerewrewe", task._id === id);
    //     setrearrange(task._id === id)
    //     return task._id === id
    // });

    // const id = ""
    // const { attributes, listeners, setNodeRef, transform, transition } =
    //     useSortable({ id });

    // const handleDragEnd = (event) => {
    //     console.log("🚀 ~ handleDragEnd ~ event:", event)

    //     const { active, over } = event;

    //     if (active.id === over.id) return;
    //     const originalPos = getTaskPos(active.id);
    //     const newPos = getTaskPos(over.id);
    //     console.log("🚀 ~ handleDragEnd ~ originalPos:", originalPos,newPos)

    //     setInterestList(arrayMove(interestList, originalPos, newPos));
    // }
    // const handleDragEnd = (event) => {
    //     const { active, over } = event;
    //     if (over && active.id !== over.id) {
    //         setInterestList((items) => {
    //         const oldIndex = items.findIndex((item) => item.id === active.id);
    //         const newIndex = items.findIndex((item) => item.id === over.id);
    //         return arrayMove(items, oldIndex, newIndex);
    //       });
    //     }
    //   };
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
            text: "category",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <p className=" text-center">{record?.category}</p>,
        },
        // {
        //     key: "subcategory",
        //     text: "Sub Hobbies",
        //     align: "center",
        //     className: "text-center w_130",
        //     sortable: true,
        //     cell: (record, index) =>
        //        <>
        //         {console.log("recordssssssssssss",record)}
        //         <button className='interest_value border-0 outline-0' onClick={() => handleShowInterestView(record)}>
        //             Click to view
        //         </button>
        //         </>
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
        {
            key: "status",
            text: "Status",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                <p className={`${record?.hideshow === "visible" ? "green_text" : "red_text"}`}>{record?.hideshow}</p>,
        },
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
        {
            key: "action",
            text: "Hide/Show",
            className: "text-center w_100",
            align: "center",
            sortable: false,
            cell: (record, index) =>
                // <p className=" text-center">{record?.category}</p>,
                <div className="custom_toggle custom_toggle_secondary">
                    <label class="switch">
                        {/* <button
                            type="checkbox" onClick={()=>hideshowchange(record.hideshow == "visible" ? "hidden" : "visible", record._id)}
                        ></button> */}
                        <input
                            checked={record.hideshow == "visible" ? false : true}
                            type="checkbox" onChange={() => hideshowchange(record.hideshow == "visible" ? "hidden" : "visible", record._id)}
                        />
                        <span class="slider round"></span>
                    </label>
                </div>
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
        show_pagination: true,
        show_info: true,
    };

    // const sensors = useSensors(
    //     useSensor(PointerSensor),
    //     useSensor(KeyboardSensor, {
    //         coordinateGetter: sortableKeyboardCoordinates,
    //     })
    // );

    useEffect(() => {

        GetCategogylists()
        // hideshowchange()
    }, [])




    const hideshowchange = async (filter, record) => {
        console.log("reecoredsa", filter, record);

        try {

            let payload = {
                id: record,
                hideshow: filter,
                type: "hide"
            }
            let resp = await adminAddcategory(payload)
            console.log("responses", resp);
            if (resp.status) {
                toast.success(resp.message)
                setInterestList(resp.data)
            }
            else {
                toast.error(resp.message)

            }
            GetCategogylists()
        } catch (error) {
            console.log("errror", error);
        }
    }

    const GetCategogylists = async () => {
        try {
            let resp = await categorylist()
            console.log("responses", resp);
            if (resp.status) {
                setInterestList([...resp.data])
            }
            else {
                toast.error(resp.message)
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    const handleReorderCategory = async () => {
        let id = toast.loading("Loading...");

        try {
            const resp = await CategorieslistRearrange({ CategoriesOrder: JSON.stringify(interestList) })
            console.log("Response:", resp, resp?.message);

            toast.dismiss(id); // Remove loading toast

            if (resp.status) {
                setrearrange(false);
                toast.success(resp?.message || "Reordered successfully!");
            } else {
                toast.error(resp?.message || "Failed to reorder");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.dismiss(id);
            toast.error("Something went wrong!");
        }
    };

    // const handleChange = async(record,filter)=>{
    //     try {

    // const handleChange = async(record,filter)=>{
    //     try {

    //     } catch (error) {
    //         console.log("error",error);
    //     }
    // }

    const handleDragStart = (e, index) => {
        setDraggedRowIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Allows drop
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        if (draggedRowIndex === index) return; // No change if dropped on itself

        const updatedRows = [...interestList];
        const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
        updatedRows.splice(index, 0, draggedRow);

        setInterestList(updatedRows);
        setDraggedRowIndex(null);
        setrearrange(true)

    };
    return (
        <>

            {/* start of modal imports */}

            {showAddCategory && <AddCategory show={showAddCategory} handleClose={handleCloseAddCategory} editfunc={GetCategogylists} />}
            <InterestView show={interestView} handleClose={handleCloseInterestView} interestData={interestData} />

            {/* <EditCategory show={showEditCategory} handleClose={handleCloseEditCategory} EditData = {showcategory} editfunc={GetCategogylists}/> */}
            {/* <EditCategory show={showEditCategory} handleClose={handleCloseEditCategory} EditData={showcategory} editfunc={GetCategogylists} /> */}

            {/* end of modal imports */}

            <Header title="Category" />

            <div className='d-flex justify-content-end pt-5'>
                <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={handleShowAddCategory}><FaPlus />Add Category</button>

            </div>

            <div className='drag-table__card pb-3 mt-4' >
                {/* <DndContext
                                sensors={sensors}
                                collisionDetection={closestCorners}
                                onDragEnd={handleDragEnd}
                            > */}
                {/* <SortableContext items={interestList} strategy={verticalListSortingStrategy}> */}
                <div className='drag-table__container table-responsive'>
                    <table className="drag-table table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Hide/Show</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interestList?.map((records, index) => (
                                //  <SortableItem key={records?._id} id={records?._id}>
                                <CategoryDrag
                                    index={index}
                                    records={records}
                                    GetCategogylists={GetCategogylists}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                />
                                // </SortableItem>
                            )
                            )}
                        </tbody>

                    </table>
                </div>
                {/* </SortableContext> */}
                {/* </DndContext> */}


            </div>
            <button
                className='orange_primary_btn mt-4'
                onClick={() => handleReorderCategory()}
                // className='orange_primary_btn d-flex align-items-center gap-2'
                disabled={!rearrange}
            >
                Update re-arrange
            </button>



        </>
    );
}

export default Category;
