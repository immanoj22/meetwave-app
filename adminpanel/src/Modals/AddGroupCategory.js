import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { adminAddGroupCategory, adminAddSubcategory, adminAddcategory, categorylist, getsubcategorylist } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';

function AddGroupcategorydata({ show, handleClose, editfunc, EditData }) {
    console.log("AddGroupcategorydata", EditData)
    const options = [
        {
            value: "active", label: "Active"
        },
        {
            value: "inactive", label: "Inactive"
        }
    ]
    const [Groupname, setGroupname] = useState("")
    console.log("Groupname", Groupname);
    const [description, setDescription] = useState("")

    const [ValidateError, SetValidateError] = useState('')

    const [categorylists, setCategorylists] = useState([])
    const [subcategorylists, setSubCategorylists] = useState([])

    console.log("subcategorylists", subcategorylists);

    const [subcategoryId, setSubCategoryId] = useState({})
    console.log("subcategoryId", subcategoryId)

    useEffect(() => {
        Getsubcategorylist()
    }, [EditData])

    const Validation = () => {

        let ValidateError = {}


        if (!Groupname) {
            ValidateError.Groupname = "Groupname is required";
        }
        // if (!description) {
        //     ValidateError.description = "description is required";
        // }

        SetValidateError(ValidateError)
        return ValidateError
    }
    const Addcategory = async () => {
        try {
            var errors = {};
            var value = Validation();

            if (!isEmpty(value)) {
                console.log("value", value);
                SetValidateError(value);
                toast.error(Object.values(value));
            } else {
                if (Object.keys(errors).length == 0) {
                    let payload = {
                        groupname: Groupname,
                        categoryId: subcategoryId?.categoryId ? subcategoryId?.categoryId?._id : "",
                        subcategoryId: subcategoryId ? subcategoryId?.value : "",
                        description: description,
                        type: "add"
                    }
                    let resp = await adminAddGroupCategory(payload)
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


    // const GetCategogylists = async()=>{
    //     try {


    //             let resp = await categorylist()
    //             console.log("responses",resp);
    //             if(resp.status){
    //                 const formattedCategories = resp.data.map((category) => ({
    //                     label: category.category, // Using the 'category' field for label
    //                     value: category._id, // Using the '_id' field as the value
    //                 }));

    //                 console.log("formattedCategories",formattedCategories)
    //                 setCategorylists(formattedCategories);
    //             }
    //             else{
    //                 toast.error(resp.message)

    //             }


    //     } catch (error) {
    //         console.log("error",error);
    //     }
    // }


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
                        categoryId:subcategoryItem.categoryId
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
                        <p className='cmn_modal_title'>Add Group</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>
                    <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Category</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                options={subcategorylists}
                                onChange={(e) => setSubCategoryId(e)}
                            />
                        </div>
                    </div>

                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <input type='text' placeholder='Enter the Groupname' id="Groupname" name="Groupname" className='rp_singleInput flex-grow-1' onChange={(e) => { setGroupname(e.target.value) }}
                        />
                    </div>
                    {ValidateError && ValidateError.Groupname && <span className="error_msg">{ValidateError.Groupname}</span>}
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <textarea type='text' placeholder='Enter the description' id="description" name="description" className='rp_singleInput flex-grow-1' onChange={(e) => { setDescription(e.target.value) }}
                        />
                    </div>
                    {ValidateError && ValidateError.description && <span className="error_msg">{ValidateError.description}</span>}
                    <button className='orange_primary_btn mt-3' onClick={Addcategory}>Add</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default AddGroupcategorydata