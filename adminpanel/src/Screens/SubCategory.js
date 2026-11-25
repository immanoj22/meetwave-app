// import React, { useState, useEffect } from 'react'
// import { Col, Container, Row } from "react-bootstrap";
// import Sidebar from "../Components/Sidebar";
// import Header from "../Components/Header";
// import Select from "react-select";
// import ReactDatatable from "@ashvin27/react-datatable";
// import { toastAlert } from "../lib/toastAlert";
// import { SubhobbyDelete, adminAddsubcategory, categorylistadmin, subcategorylist } from '../api/api'
// import { useDispatch, useSelector } from 'react-redux'
// import { CKEditor } from "ckeditor4-react";
// import { FaEdit, FaTrash } from 'react-icons/fa';
// import { FaPlus } from "react-icons/fa6";
// import { LuSearch } from "react-icons/lu";


// import AddSubCategory from '../Modals/AddSubCategory';
// import EditSubCategory from '../Modals/EditSubCategory';
// import toast from 'react-hot-toast';
// import { GetAdmindata, Hobbieslimit } from '../api/cms';

// function SubCategory() {
//     let initialvalue = {
//         "hobbylimit": 0
//     }
//     const dispatch = useDispatch()
//     const [list, setList] = useState([])
//     const [errors, setError] = useState();
//     const [showAddSubCategory, setShowAddSubCategory] = useState(false);
//     const [showEditSubCategory, setShowEditSubCategory] = useState(false);
//     const [showsubcat, setShowsubcat] = useState({})
//     const [hobbylimit, setHobbylimit] = useState(initialvalue)
//     console.log("fdfdfdfd", hobbylimit);
//     const [formvalue, setformvalue] = useState(initialvalue)
//     const { userdata, hobbielimit } = useSelector((state) => state.redux)
//     console.log("userlocfdsgsdfg", userdata, hobbielimit);
//     console.log("formvalue", formvalue);

//     const handleShowAddSubCategory = () => {
//         setShowAddSubCategory(true)
//     }
//     const handleCloseAddSubCategory = () => {
//         setShowAddSubCategory(false)
//     }
//     const handleShowEditSubCategory = (record) => {
//         setShowEditSubCategory(true)
//         setShowsubcat(record)
//     }
//     const handleCloseEditSubCategory = () => {
//         setShowEditSubCategory(false)
//     }

//     const handlechanges = async (e) => {
//         try {
//             const { id, value } = e.target
//             setformvalue({ ...formvalue, ...{ [id]: value } })
//         } catch (error) {
//             console.log("errror", error);
//         }
//     }


//     const [interestList, setInterestList] = useState([
//         // {
//         //     id: 1,
//         //     category: "Dancing",
//         //     subCategory: "Dance Subcategory 1",
//         //     status: "Active"
//         // },
//         // {
//         //     id: 1,
//         //     category: "Dancing",
//         //     subCategory: "Dance Subcategory 2",
//         //     status: "Active"
//         // },
//         // {
//         //     id: 1,
//         //     category: "Dancing",
//         //     subCategory: "Dance Subcategory 3",
//         //     status: "Inactive"
//         // },
//         // {
//         //     id: 1,
//         //     category: "Dancing",
//         //     subCategory: "Dance Subcategory 4",
//         //     status: "Active"
//         // },

//     ])
//     const selectOptions = [
//         {
//             value: "dancing", label: "Dancing"
//         },
//         {
//             value: "singing", label: "Singing"
//         },
//         {
//             value: "photography", label: "Photography"
//         },
//     ]



//     const columns = [

//         {
//             key: "sno",
//             text: "S.No",
//             className: "text-center  w_80",
//             align: "center",
//             sortable: true,
//             cell: (record, index) =>
//                 <p className=" text-center">{index + 1}</p>,
//         },
//         {
//             key: "category",
//             text: "Hobbies",
//             className: "text-center w_100",
//             align: "center",
//             sortable: false,
//             cell: (record, index) =>
//                 <p className=" text-center">{record?.category[0]?.category}</p>,
//         },

//         // {
//         //     key: "category",
//         //     text: "Category",
//         //     className: "text-center w_100",
//         //     align: "center",
//         //     sortable: false,
//         //     cell: (record, index) =>
//         //         <p className=" text-center">{record?.category}</p>,
//         // },
//         // {
//         //     key: "changeCategory",
//         //     text: "Change Category",
//         //     className: "text-center w_100",
//         //     align: "center",
//         //     sortable: false,
//         //     cell: (record, index) =>
//         //         // <p className=" text-center">{record?.category}</p>,
//         //         <div className='select_wrapper mx-auto'>
//         //             <Select
//         //                 classNamePrefix="custom_rct_slt"
//         //                 isSearchable={false}
//         //                 options={selectOptions} />
//         //         </div>
//         // },
//         {
//             key: "subcategory",
//             text: "Sub Hobbies",
//             className: "text-center w_150",
//             align: "center",
//             sortable: false,
//             cell: (record, index) =>
//                 <p className=" text-center">{record?.subcategory}</p>,
//         },
//         {
//             key: "plan",
//             text: "plan",
//             className: "text-center w_150",
//             align: "center",
//             sortable: false,
//             cell: (record, index) =>
//                 <p className=" text-center">{record?.plan}</p>,
//         },
//         {
//             key: "status",
//             text: "Status",
//             className: "text-center w_100",
//             align: "center",
//             sortable: false,
//             cell: (record, index) =>
//                 <p className={`${record?.hideshow === "visible" ? "green_text" : "red_text"}`}>{record?.hideshow}</p>,
//         },
//         {
//             key: "edit",
//             text: "Action",
//             className: "text-center w_150",
//             align: "center",
//             sortable: false,
//             cell: (record, index) =>
//                 <div className='d-flex justify-content-center align-items-center gap-3'>
//                     <button className='green_edit_button' onClick={() => handleShowEditSubCategory(record)}>
//                         <FaEdit className='ms-1' />
//                     </button>
//                     <button className='delete_button' onClick={() => { DeleteValue(record) }}>
//                         <FaTrash />
//                     </button>
//                 </div>
//         },
//         {
//             key: "action",
//             text: "Hide/Show",
//             className: "text-center w_100",
//             align: "center",
//             sortable: false,
//             cell: (record, index) =>
//                 // <p className=" text-center">{record?.category}</p>,
//                 <div className="custom_toggle custom_toggle_secondary">
//                     <label class="switch">
//                         <input
//                             checked={record.hideshow == "visible" ? false : true}
//                             type="checkbox" onChange={() => hideshowchange(record.hideshow == "visible" ? "hidden" : "visible", record._id)}
//                         />
//                         <span class="slider round"></span>
//                     </label>
//                 </div>
//         },

//     ];

//     const config = {
//         page_size: 10,
//         length_menu: [10, 20, 50],
//         filename: "Emailtemplates",
//         no_data_text: "No Email Templates found!",
//         language: {
//             length_menu: "Show _MENU_ result per page",
//             filter: "Filter in records...",
//             info: "Showing _START_ to _END_ of _TOTAL_ records",
//             pagination: {
//                 first: "First",
//                 previous: "Previous",
//                 next: "Next",
//                 last: "Last",
//             },
//         },
//         show_length_menu: false,
//         show_filter: false,
//         show_pagination: true,
//         show_info: true,
//     };

//     const extraButtons = [
//         {
//             className: "btn btn-primary buttons-pdf",
//             title: "Export TEst",
//             children: [
//                 <span>
//                     <i
//                         className="glyphicon glyphicon-print fa fa-print"
//                         aria-hidden="true"
//                     ></i>
//                 </span>,
//             ],
//             onClick: (event) => {
//                 console.log(event);
//             },
//         },
//         {
//             className: "btn btn-primary buttons-pdf",
//             title: "Export TEst",
//             children: [
//                 <span>
//                     <i
//                         className="glyphicon glyphicon-print fa fa-print"
//                         aria-hidden="true"
//                     ></i>
//                 </span>,
//             ],
//             onClick: (event) => {
//                 console.log(event);
//             },
//             onDoubleClick: (event) => {
//                 console.log("doubleClick");
//             },
//         },
//     ];
//     useEffect(() => {
//         subcategorylistdata()
//         GetadminData()
//     }, [])


//     const DeleteValue = async (record) => {
//         console.log("records", record);
//         try {
//             let payload = {
//                 subId: record._id,
//             }
//             let resp = await SubhobbyDelete(payload)
//             console.log("respmses", resp);
//             if (resp.status) {
//                 toast.success(resp.message)
//                 subcategorylistdata()
//             }
//             else {
//                 toast.error(resp.message)

//             }
//         } catch (error) {
//             console.log("error", error);
//         }
//     }



//     const hideshowchange = async (filter, record) => {
//         console.log("reecoredsa", filter, record);

//         try {

//             let payload = {
//                 id: record,
//                 hideshow: filter,
//                 type: "hide"
//             }
//             let resp = await adminAddsubcategory(payload)
//             console.log("responses", resp);
//             if (resp.status) {
//                 toast.success(resp.message)
//                 setInterestList(resp.data)
//             }
//             else {
//                 toast.error(resp.message)

//             }
//             subcategorylistdata()
//         } catch (error) {
//             console.log("errror", error);
//         }
//     }


//     const subcategorylistdata = async (e) => {
//         try {
//             console.log("ssssssssssssss");
//             const { id, value } = e?.target ?? { id: "subcategoryname", value: "" }
//             console.log("iddvalues", id, value);
//             const initial = value ? value : ""
//             console.log("initialsss", initial);
//             let resp = await subcategorylist({ [id]: initial })
//             console.log("resp", resp);
//             if (resp.status) {
//                 setInterestList([...resp.data])
//             }
//             else {
//                 toast.error(resp.message)
//             }
//         } catch (error) {
//             console.log("error", error);
//         }
//     }

//     const sethobbylimit = async () => {
//         try {
//             if (!formvalue.hobbylimit) {
//                 toast.error("Give the limit")
//             }
//             else {
//                 let payload = {
//                     type:"admin",
//                     id: userdata?.userId,
//                     limit: Number(formvalue?.hobbylimit)
//                 }
//                 let resp = await Hobbieslimit(payload)
//                 console.log("responses", resp);
//                 if (resp.status) {
//                     setformvalue(resp.data.hobby_limit)
//                     GetadminData()
//                     dispatch({ type: "hobbielimit", limit: resp.data.hobby_limit })
//                     toast.success(resp.message)

//                 }
//                 else {
//                     toast.error(resp.message)
//                 }
//             }



//         } catch (error) {
//             console.log("error", error);
//         }
//     }

//     const GetadminData = async () => {
//         try {
//             let resp = await GetAdmindata()
//             console.log("getadmin", resp);
//             if (resp.status) {
//                 setformvalue({ ...formvalue, hobbylimit: resp.data[0].hobby_limit, count: resp.hobbycount })
//             }
//             else {
//                 console.log("something error");
//             }
//         } catch (error) {
//             console.log("error", error);
//         }
//     }

//     return (
//         <>

//             {/* modal */}

//             <AddSubCategory show={showAddSubCategory} handleClose={handleCloseAddSubCategory} subcategorylistdata={subcategorylistdata} />
//             <EditSubCategory show={showEditSubCategory} handleClose={handleCloseEditSubCategory} subcategorylistdata={subcategorylistdata} editData={showsubcat} />

//             <Container fluid className="common_bg position-relative">
//                 <div className="liner"></div>
//                 <Row>
//                     <Col xl={2} lg={0} className='p-0 d-none d-xl-block'>
//                         <Sidebar />
//                     </Col>
//                     <Col xl={10} lg={12}>
//                         <Header title={'Sub category'} />

//                         <div className=' py-5'>
//                             {/* <div className='d-flex align-items-center justify-content-end mb-3'>
//                                 <div className='search_wrapper'>
//                                     <LuSearch color='#fff' /> <input placeholder='Search...' id="subcategoryname" onChange={(e) => { subcategorylistdata(e) }} />
//                                 </div>
//                             </div> */}
//                             <div >
//                                 <p className='cmn_modal_title'>Hobbies limit to Unpaid User</p>
//                                 <input
//                                     type='number'
//                                     placeholder='limit'
//                                     id="hobbylimit"
//                                     name="hobbylimit"
//                                     className='mdl_input mt-2'
//                                     value={formvalue.hobbylimit}
//                                     onChange={(e) => { handlechanges(e) }}
//                                 />
//                             </div><br />
//                             <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={() => sethobbylimit()}>submit</button>

//                             {/* <div >
//                                 <p className='cmn_modal_title'>Free Hobbies</p>
//                                 <input type='number' placeholder='limit' className='mdl_input' disabled value={formvalue.count}
//                                 />
//                             </div> */}
//                             <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3'>
//                             <div className='search_wrapper'>
//                                     <LuSearch color='#fff' /> <input placeholder='Search...' id="subcategoryname" onChange={(e) => { subcategorylistdata(e) }} />
//                                 </div>
//                                 <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={handleShowAddSubCategory}><FaPlus />Add Subcategory</button>
//                             </div >
//                             <div className=" mt-4">
//                                 <div className="exchange_table_holder dashboard_box rounded-3">
//                                     <ReactDatatable
//                                         config={config}
//                                         records={interestList}
//                                         columns={columns}
//                                         extraButtons={extraButtons}
//                                     />
//                                 </div>

//                             </div>
//                         </div>

//                     </Col >
//                 </Row >
//             </Container >
//         </>
//     );
// }

// export default SubCategory;


import React, { useState, useEffect } from 'react'

import Header from "../Components/Header";

import { adminAddcategory, adminAddsubcategory, getsubcategorylist } from '../api/api'
import { FaPlus } from "react-icons/fa6";
import toast from 'react-hot-toast';
import InterestView from "../Modals/Hobbieslist"

import AddSubcategorydata from '../Modals/AddSubcategorydata';
import EditSubcategory from '../Modals/EditSubcategory';
import SubcategoryDrag from "./DragAndDrop/SubcategoryDrag"

// import {
//     DndContext,
//     KeyboardSensor,
//     PointerSensor,
//     useSensor,
//     useSensors,
//     closestCorners,
// } from "@dnd-kit/core";
// import { arrayMove, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { SubcategorylistRearrange } from '../api/cms';

function SubCategory() {

    const [interestData, setInterestData] = useState([]);
    const [interestView, setInterestView] = useState(false);

    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [showcategory, setShowcategory] = useState({});
    const [rearrange, setrearrange] = useState(false)
    const [draggedRowIndex, setDraggedRowIndex] = useState(null);

    const handleShowAddCategory = () => {
        setShowAddCategory(true)
    }
    const handleCloseAddCategory = () => {
        setShowAddCategory(false)
    }
    const handleShowEditCategory = (record) => {
        setShowcategory(record)
        setShowEditCategory(true)
    }
    const handleCloseEditCategory = () => {
        setShowEditCategory(false)
    }


    const handleCloseInterestView = () => {
        setInterestView(false)
    };
    const [subcategoryLists, setSubcategoryLists] = useState([
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


    useEffect(() => {
        Getsubcategorylist()
        // hideshowchange()
    }, [])


    // const getTaskPos = (id) => subcategoryLists.findIndex((task) => {
    //     console.log("wefrwerfewrwerwerewrewe", task._id === id);
    //     setrearrange(task._id === id)
    //     return task._id === id
    // });

    // const id = ""
    // const { attributes, listeners, setNodeRef, transform, transition } =
    //     useSortable({ id });

    // const handleDragEnd = (event) => {
    //     const { active, over } = event;

    //     if (active.id === over.id) return;

    //     // setSubcategoryLists((tasks) => {
    //     const originalPos = getTaskPos(active.id);
    //     const newPos = getTaskPos(over.id);

    //     //     return arrayMove(tasks, originalPos, newPos);
    //     // });
    //     setSubcategoryLists(arrayMove(subcategoryLists, originalPos, newPos));

    // };

    // const sensors = useSensors(
    //     useSensor(PointerSensor),
    //     useSensor(KeyboardSensor, {
    //         coordinateGetter: sortableKeyboardCoordinates,
    //     })
    // );



    const Getsubcategorylist = async () => {
        try {


            let resp = await getsubcategorylist()
            console.log("responses", resp);
            if (resp.status) {
                setSubcategoryLists(resp.data)
            }
            else {
                toast.error(resp.message)

            }
        } catch (error) {
            console.log("error", error);
        }
    }

    // }
    const handleReorderSubcat = async () => {
        let id = toast.loading("Loading...");
        try {
            const resp = await SubcategorylistRearrange({ SubCategoriesOrder: JSON.stringify(subcategoryLists) })
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

        const updatedRows = [...subcategoryLists];
        const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
        updatedRows.splice(index, 0, draggedRow);

        setSubcategoryLists(updatedRows);
        setDraggedRowIndex(null);
        setrearrange(true)

    };
    return (
        <>

            {/* start of modal imports */}
            {showAddCategory &&
                <AddSubcategorydata show={showAddCategory} handleClose={handleCloseAddCategory} editfunc={Getsubcategorylist} />
            }
            <InterestView show={interestView} handleClose={handleCloseInterestView} interestData={interestData} />

            <EditSubcategory show={showEditCategory} handleClose={handleCloseEditCategory} EditData={showcategory} editfunc={Getsubcategorylist} />

            {/* end of modal imports */}

            <Header title="Subcategory" />

            <div className='d-flex justify-content-end pt-5'>
                <button className='orange_primary_btn d-flex align-items-center gap-2' onClick={handleShowAddCategory}><FaPlus />Add Subcategory</button>

            </div>
            <div className='drag-table__card pb-3 mt-4'>
                {/* <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                > */}
                    {/* <SortableContext items={subcategoryLists} strategy={verticalListSortingStrategy}> */}
                        <div className='drag-table__container table-responsive'>
                            <table className="drag-table table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Category Name</th>
                                        <th>Subcategory Name</th>
                                        <th>Hide/Show</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subcategoryLists?.map((records, index) => (
                                        <SubcategoryDrag
                                            index={index}
                                            key={records._id}
                                            records={records}
                                            Getsubcategorylistdata={Getsubcategorylist}
                                            onEdit={handleShowEditCategory}
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

            </div>
            <button
                className='orange_primary_btn mt-4'
                onClick={() => handleReorderSubcat()}
                // className='orange_primary_btn d-flex align-items-center gap-2'
                disabled={!rearrange}
            >
                Update re-arrange
            </button>

        </>
    );
}

export default SubCategory;
