
import React, { useState, useEffect } from 'react'

import { useSortable } from "@dnd-kit/sortable";

import Header from "../Components/Header";

import { adminAddHobbies, getHobbieslists } from '../api/api'

import { FaEdit } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux'
import { FaPlus, FaTrash } from "react-icons/fa6";
import toast from 'react-hot-toast';
import InterestView from "../Modals/Hobbieslist"
import { GetAdmindata, Hobbieslimit, HobbiesRearrange } from '../api/cms';
import AddHobbies from '../Modals/AddHobbies';
// import {
//     DndContext,
//     KeyboardSensor,
//     PointerSensor,
//     useSensor,
//     useSensors,
//     closestCorners,
// } from "@dnd-kit/core";
// import { arrayMove, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import Task from "./DragAndDrop/HobbiesTaskDrag"
function Hobbieslists() {
    let initialvalue = {
        "hobbylimit": 0
    }
    const dispatch = useDispatch()
    const { userdata, hobbielimit } = useSelector((state) => state.redux)
    console.log("userlocfdsgsdfg", userdata, hobbielimit);

    const [interestData, setInterestData] = useState([]);
    const [interestView, setInterestView] = useState(false);
    const [formvalue, setformvalue] = useState(initialvalue)
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [showcategory, setShowcategory] = useState({})
    console.log("formvalue", formvalue);
    const [rearrange, setrearrange] = useState(false)
    const [draggedRowIndex, setDraggedRowIndex] = useState(null);
    console.log("efrearrange", rearrange);


    useEffect(() => {

        GetadminData()
    }, [])

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


    const handlechanges = async (e) => {
        try {
            const { id, value } = e.target
            setformvalue({ ...formvalue, ...{ [id]: value } })
        } catch (error) {
            console.log("errror", error);
        }
    }

    const [hobbieslists, setHobbieslists] = useState([
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
    console.log("hhohohohohohoh", hobbieslists, hobbieslists.find((val) => val.hobbyname == "Go"), hobbieslists.findIndex((val) => val.hobbyname == "Go"));

    // const getTaskPos = (id) => hobbieslists.findIndex((task) => {
    //     setrearrange(task._id === id)
    //     return task._id === id
    // });

    // const id = ""
    // const { attributes, listeners, setNodeRef, transform, transition } =
    //     useSortable({ id });

    // const handleDragEnd = (event) => {
    //     const { active, over } = event;
    //     console.log("🚀 ~ handleDragEnd ~ event:", event)

    //     if (active?.id === over?.id) return;

    //     const originalPos = getTaskPos(active.id);
    //     const newPos = getTaskPos(over?.id);
    //     console.log("originalPos", originalPos, newPos);

    //     setHobbieslists(arrayMove(hobbieslists, originalPos, newPos));
    // };

    // const sensors = useSensors(
    //     useSensor(PointerSensor),
    //     useSensor(KeyboardSensor, {
    //         coordinateGetter: sortableKeyboardCoordinates,
    //     })
    // );

    // console.log(state.records[0].status.props,"asdfasfasdfasdf");

    useEffect(() => {
        GetgetHobbieslists()
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

    const GetgetHobbieslists = async () => {
        try {


            let resp = await getHobbieslists()
            console.log("responses_getHobbieslists", resp);
            if (resp.status) {
                setHobbieslists(resp.data)
            }
            else {
                toast.error(resp.message)

            }


        } catch (error) {
            console.log("error", error);
        }
    }


    const sethobbylimit = async () => {
        try {
            if (formvalue && !formvalue.hobbylimit) {
                toast.error("Hobbies limit is required.")
            }
            else {
                let payload = {
                    type: "admin",
                    id: userdata?.userId,
                    limit: Number(formvalue?.hobbylimit)
                }
                let resp = await Hobbieslimit(payload)
                console.log("responses", resp);
                if (resp.status) {
                    setformvalue(resp.data.hobby_limit)
                    GetadminData()
                    dispatch({ type: "hobbielimit", limit: resp.data.hobby_limit })
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
                setformvalue({ ...formvalue, hobbylimit: resp.data[0].hobby_limit, count: resp.hobbycount })
            }
            else {
                console.log("something error");
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
    const handleReorderHobby = async () => {
        let id = toast.loading("Loading...");

        try {
            const resp = await HobbiesRearrange({ HobbiesOrder: JSON.stringify(hobbieslists) });
            console.log("Response:", resp, resp?.message);

            toast.dismiss(id); // Remove loading toast

            if (resp.status) {
                setrearrange(false);
                toast.success(resp?.message || "Re-ordered successfully!");
            } else {
                toast.error(resp?.message || "Failed to reorder");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.dismiss(id);
            toast.error("Something went wrong!");
        }
    };

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

        const updatedRows = [...hobbieslists];
        const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
        updatedRows.splice(index, 0, draggedRow);

        setHobbieslists(updatedRows);
        setDraggedRowIndex(null);
        setrearrange(true)

    };
    // old code
    return (
        <>

            {/* start of modal imports */}
            {showAddCategory &&
                <AddHobbies show={showAddCategory} handleClose={handleCloseAddCategory} editfunc={GetgetHobbieslists} EditData={showcategory} />
            }
            <InterestView show={interestView} handleClose={handleCloseInterestView} interestData={interestData} />

            {/* <EditHobbies show={showEditCategory} handleClose={handleCloseEditCategory} EditData={showcategory} editfunc={GetgetHobbieslists} /> */}

            {/* end of modal imports */}

            <Header title="Hobbies Lists" />

            <div className='d-flex justify-content-end mb-3'>
                <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={handleShowAddCategory} ><FaPlus />Add Hobbies</button>

            </div>
            <div >
                <p className='cmn_modal_title'>Hobbies limit to Unpaid User</p>
                <input
                    type='number'
                    placeholder='limit'
                    id="hobbylimit"
                    name="hobbylimit"
                    className='mdl_input mt-2'
                    value={formvalue.hobbylimit}
                    onChange={(e) => { handlechanges(e) }}
                />
            </div>
            <br />
            <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={() => sethobbylimit()}>submit</button>
            {/* <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3'>
                            <div className='search_wrapper'>
                                <LuSearch color='#fff' /> <input placeholder='Search...' id="hobbyname" onChange={(e) => { subcategorylistdata(e) }} />
                            </div>
                        </div > */}
            <p className='cmn_modal_title'>*A hobby can be added using either (category + hobby name) or (category + subcategory + hobby name). If a hobby already exists under one structure, adding it under the other structure is not allowed to avoid conflicts.</p>
            <div className="common_page_scroller mt-4">
                {/* <Row>
                                <Col xs={12} lg={7} md={8} sm={10} className='mb-4'>
                                </Col>
                            </Row> */}

                {/* <div className="exchange_table_holder dashboard_box rounded-3">
                                <ReactDatatable
                                    config={config}
                                    records={hobbieslists}
                                    columns={columns}
                                    extraButtons={extraButtons}
                                />
                            </div> */}

                <div className='drag-table__card pb-3'>
                    {/* <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragEnd={handleDragEnd}
                    > */}
                    {/* <SortableContext items={hobbieslists} strategy={verticalListSortingStrategy}> */}
                    <div className='drag-table__container table-responsive'>
                        <table className="drag-table table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Category</th>
                                    <th>Subcategory</th>
                                    <th>Hobby Name</th>
                                    {/* <th>Plan Status</th> */}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hobbieslists?.map((records, index) => (
                                    <Task
                                        index={index}
                                        key={records._id}
                                        records={records}
                                        GetgetHobbieslists={GetgetHobbieslists}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                    />
                                )
                                )}
                            </tbody>

                        </table>
                    </div>
                    {/* </SortableContext> */}
                    {/* </DndContext> */}

                    {/* <div className='drag-table__pagination'>
                        <div className='drag-table__pageSelect'>
                            <Select
                                // menuIsOpen
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                options={paginationOptions}
                            // onChange={(e) => setSubCategoryId(e)}
                            />
                        </div>
                        <p className='drag-table__pages'>
                            1 - 2 of 2
                        </p>
                        <div className='drag-table__pagination-buttons'>
                            <button><MdKeyboardDoubleArrowLeft /></button>
                            <button><MdKeyboardArrowLeft /></button>
                            <button><MdKeyboardArrowRight /></button>
                            <button><MdKeyboardDoubleArrowRight /></button>
                        </div>
                    </div> */}
                </div>
                <button
                    className='orange_primary_btn mt-4'
                    onClick={() => handleReorderHobby()}
                    // className='orange_primary_btn d-flex align-items-center gap-2'
                    disabled={!rearrange}
                >
                    Update re-arrange
                </button>

            </div>
        </>
    );

}

export default Hobbieslists;
