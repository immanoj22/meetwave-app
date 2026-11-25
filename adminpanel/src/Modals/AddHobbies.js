import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { PlansList, adminAddGroupCategory, adminAddHobbies, adminAddSubcategory, adminAddcategory, categorylist, getGroupcategorylists, getsubcategorylist } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';

function AddHobbies({ show, handleClose, editfunc, EditData }) {
    console.log("AddGroupcategorydata", EditData)
    const options = [
        {
            value: "active", label: "Active"
        },
        {
            value: "inactive", label: "Inactive"
        }
    ]

    const initial = {
        "subcategoryId": "",
        "description": "",
        "categoryId": "",
        "plan": "",
        // "groupId":"",
        "hobbyname": ""
    }
    // const [Groupname, setGroupname] = useState("")
    // console.log("Groupname", Groupname);
    const [description, setDescription] = useState("")

    const [ValidateError, SetValidateError] = useState('')

    const [categorylists, setCategorylists] = useState([])
    const [subcategorylists, setSubCategorylists] = useState([])
    const [grouplists, setGrouplists] = useState([])


    console.log("subcategorylists", subcategorylists);

    const [categoryId, setCategoryId] = useState({})
    const [subcategoryId, setSubCategoryId] = useState({})
    const [groupId, setGroupId] = useState({})

    console.log("subcategoryId", subcategoryId)
    const [list, setList] = useState(initial)
    console.log("listlistlist", list)

    useEffect(() => {
        Getsubcategorylist()
        GetCategogylists()
        GetGrouplists()
        // getPlanslists()
    }, [EditData])

    const Validation = () => {

        let ValidateError = {}
        if (!list?.categoryId) {
            ValidateError.categoryId = "Category is required";
        }

        if (!list?.hobbyname) {
            ValidateError.hobbyname = "Hobby name is required";
        }
        // if (!list.description) {
        //     ValidateError.description = "description is required";
        // }
        // if (!list.plan) {
        //     ValidateError.plan = "Plan is required";
        // }
        // if (!description) {
        //     ValidateError.description = "description is required";
        // }

        SetValidateError(ValidateError)
        return ValidateError
    }
    const [planoptions, setPlanoptions] = useState([
        {
            value: "Free", label: "Free"
        },
        {
            value: "Gold", label: "Gold"
        },
        {
            value: "Silver", label: "Silver"
        },
        {
            value: "Diamond", label: "Diamond"
        },
    ])

    const handlechange = async (e, data) => {
        console.log("erererer", e, data);
        try {

            if (data == "subcategoryId") {
                setList({ ...list, ...{ "subcategoryId": e.value } })
            }
            else if (data == "categoryId") {
                setList({ ...list, ...{ "categoryId": e.value } })

            }
            else if (data == "groupId") {
                setList({ ...list, ...{ "groupId": e.value } })

            }
            // else if (data == "plan") {
            //     setList({ ...list, ...{ "plan": e._id } })

            // }
            else {
                const { id, value } = e.target
                console.log("fsdgdg", id, value);
                setList({ ...list, ...{ [id]: value } })
            }

        } catch (error) {
            console.log("error", error);
        }
    }

    const Addcategory = async () => {
        try {
            var errors = {};
            var value = Validation();

            if (!isEmpty(value)) {
                console.log("value", value);
                SetValidateError(value);
                // toast.error(Object.values(value));
            } else {
                if (Object.keys(errors).length == 0) {
                    let payload = {
                        hobbyname: list?.hobbyname,
                        categoryId: list?.categoryId ? list?.categoryId : "",
                        subcategoryId: list?.subcategoryId ? list?.subcategoryId : "",
                        // groupId:list?.groupId ? list?.groupId :"",
                        description: list?.description ? list?.description : "",
                        // plan: list?.plan ? list?.plan : "",
                        type: "add"
                    }
                    let resp = await adminAddHobbies(payload)
                    console.log("payload", payload);
                    if (resp.status) {
                        toast.success(resp.message)
                        editfunc()
                    }
                    else {
                        toast.error(resp.message)

                    }
                }
                handleClose()

            }

        } catch (error) {
            console.log("error", error);
        }
    }


    const GetCategogylists = async () => {
        try {


            let resp = await categorylist()
            console.log("responses", resp);
            if (resp.status) {
                const formattedCategories = resp.data.map((category) => ({
                    label: category.category, // Using the 'category' field for label
                    value: category._id, // Using the '_id' field as the value
                }));

                console.log("formattedCategories", formattedCategories)
                setCategorylists(formattedCategories);
            }
            else {
                toast.error(resp.message)

            }


        } catch (error) {
            console.log("error", error);
        }
    }


    const Getsubcategorylist = async () => {
        try {
            let resp = await getsubcategorylist();
            console.log("responses_setGroupcat", resp);

            if (resp.status) {
                // Transforming the subcategory data into the desired format
                const formattedCategories = resp.data.map((subcategoryItem) => {
                    console.log("Processing Subcategory Item:", subcategoryItem); // Log each item
                    return {
                        label: subcategoryItem.subcategory, // Assuming 'subcategory' contains the display name
                        value: subcategoryItem._id, // Assuming '_id' is the unique identifier
                        categoryId: subcategoryItem.categoryId
                    };
                });
                console.log("Formatted Categories:", formattedCategories);
                setSubCategorylists(formattedCategories); // Updating state with formatted data
            } else {
                toast.error(resp.message);
            }
        } catch (error) {
            console.log("error", error);
        }
    };

    const GetGrouplists = async () => {
        try {


            let resp = await getGroupcategorylists()
            console.log("responses_plans", resp);
            if (resp.status) {
                const formattedCategories = resp.data.map((groupItem) => ({
                    label: groupItem.group, // Using the 'category' field for label
                    value: groupItem._id, // Using the '_id' field as the value
                }));

                console.log("formattedCategories", formattedCategories)
                setGrouplists(formattedCategories);
            }
            else {
                toast.error(resp.message)

            }


        } catch (error) {
            console.log("error", error);
        }
    }
    //plans
    // const getPlanslists = async () => {
    //     try {
    //         let resp = await PlansList()
    //         console.log("PlansList", resp.data);
    //         if (resp.status) {
    //             setPlanoptions(resp.data)
    //             // subcategorylistdata()
    //         }
    //         else {
    //             toast.success(resp.message)
    //         }
    //     } catch (error) {
    //         console.log("error", error);
    //     }
    // }


    return (
        <>
            <Modal centered className='cmn_modal'
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                size='md'
            >
                <Modal.Body>
                    <div className='cmn_modal_header d-flex justify-content-between align-items-center'>
                        <p className='cmn_modal_title'>Add Hobbies</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>
                    <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Category</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={true}
                                // id='categoryId'
                                options={categorylists}
                                onChange={(e) => handlechange(e, "categoryId")}
                            />
                        </div>
                    {/* {ValidateError && ValidateError.categoryId && <span className="error_msg">{ValidateError.categoryId}</span>} */}
                    <span className="errors_style" id="name-error" >{ValidateError && ValidateError.categoryId && ValidateError.categoryId}</span>
                    </div>
                    <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select SubCategory (optional)</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={true}
                                // id='subcategoryId'
                                options={subcategorylists}
                                onChange={(e) => handlechange(e, "subcategoryId")}
                            />
                        </div>
                    </div>
                    {/* <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Group</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                // id='groupId'
                                options={grouplists}
                                onChange={(e) => handlechange(e,"groupId")}
                            />
                        </div>
                    </div> */}
                    <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Enter Hobby Name</p>
                        <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                            <input type='text' placeholder='Enter the hobby name' id="hobbyname" name="hobbyname" className='rp_singleInput flex-grow-1' onChange={(e) => { handlechange(e) }}
                            />
                        </div>
                    <span className="errors_style" id="name-error" >{ValidateError && ValidateError.hobbyname && ValidateError.hobbyname}</span>
                    </div>
                    {/* {ValidateError && ValidateError.hobbyname && <span className="error_msg">{ValidateError.hobbyname}</span>} */}
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    {/* <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <textarea type='text' placeholder='Enter the description' id="description" name="description" className='rp_singleInput flex-grow-1' onChange={(e) => { handlechange(e) }}
                        />
                    </div>
                    {ValidateError && ValidateError.description && <span className="error_msg">{ValidateError.description}</span>} */}

                    {/* <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Plan</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                options={planoptions}
                                onChange={(e) => handlechange(e, "plan")}
                            />
                        </div>
                        <span className="errors_style" id="name-error" >{ValidateError && ValidateError.plan && ValidateError.plan}</span>
                    </div> */}
               
                    <button className='orange_primary_btn mt-3' onClick={Addcategory}>Add</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default AddHobbies;