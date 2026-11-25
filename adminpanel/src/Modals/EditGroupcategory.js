import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { adminAddGroupCategory, adminAddSubcategory, adminAddcategory, categorylist, getsubcategorylist } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';
// import { set } from 'mongoose';

function EditGroupcategory({ show, handleClose, EditData, editfunc }) {
    console.log("EditData", EditData);

    const initial = {
        "groupname": ""
    }
    const options = [
        {
            value: "active", label: "Active"
        },
        {
            value: "inactive", label: "Inactive"
        }
    ]
    const [Groupcat, setGroupcat] = useState(initial)
    console.log("Groupcat", Groupcat);
    const [subcategorylists, setSubCategorylists] = useState([])
    const [categoryId, setCategoryId] = useState({})
    const [subcategoryId, setSubCategoryId] = useState({})

    console.log("setSubCategoryIdsetSubCategoryId", subcategoryId);

    useEffect(() => {
        setGroupcat(EditData?.group)
        Getsubcategorylist()
        // setSubCategoryId({ label: EditData?.subcategorylist[0]?.subcategory, value: EditData?.subcategorylist[0]?._id })
    }, [EditData])
    const [ValidateError, SetValidateError] = useState('')
    const Validation = () => {

        let ValidateError = {}


        if (!Groupcat) {
            ValidateError.Groupcat = "groupname is required";
        }


        SetValidateError(ValidateError)
        return ValidateError
    }
    const Editcategory = async () => {
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
                        id: EditData?._id,
                        groupname: Groupcat,
                        // categoryId: categoryId ? categoryId.value : "",
                        // subcategoryId: subcategoryId ? subcategoryId?.value:"",
                        type: "edit"
                    }
                    let resp = await adminAddGroupCategory(payload)
                    console.log("payload", resp);
                    if (resp.status) {
                        toast.success(resp.message)
                        editfunc()
                    }
                    else {
                        toast.error(resp.message)

                    }
                }
            }
        } catch (error) {
            console.log("error", error);
        }
        handleClose()
    }




    // const GetCategogylists = async () => {
    //     try {


    //         let resp = await categorylist()
    //         console.log("responses", resp);
    //         if (resp.status) {
    //             const formattedCategories = resp.data.map((category) => ({
    //                 label: category.category, // Using the 'category' field for label
    //                 value: category._id, // Using the '_id' field as the value
    //             }));

    //             console.log("formattedCategories", formattedCategories)
    //             setCategorylists(formattedCategories);
    //         }
    //         else {
    //             toast.error(resp.message)

    //         }


    //     } catch (error) {
    //         console.log("error", error);
    //     }
    // }

    const Getsubcategorylist = async () => {
        try {


            let resp = await getsubcategorylist()
            console.log("responses_setGroupcat", resp);
            if (resp.status) {
                const formattedCategories = resp.data.map((subcategory) => ({
                    label: subcategory.subcategory, // Using the 'category' field for label
                    value: subcategory._id, // Using the '_id' field as the value
                }));

                console.log("formattedCategories", formattedCategories)
                setSubCategorylists(formattedCategories)
            }
            else {
                toast.error(resp.message)

            }


        } catch (error) {
            console.log("error", error);
        }
    }


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
                        <p className='cmn_modal_title'>Edit Subcategory</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>


                    {/* <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Category</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                value={subcategoryId}
                                options={subcategorylists}
                                onChange={(e) => setSubCategoryId(e)}
                            />
                        </div>
                    </div> */}
                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>

                        <input type='text' placeholder='Enter the Group' id="Groupcat" name="Groupcat" value={Groupcat} onChange={(e) => setGroupcat(e.target.value)} className='rp_singleInput flex-grow-1'
                        />
                    </div>
                    {ValidateError && ValidateError.Groupcat && <span className="error_msg">{ValidateError.Groupcat}</span>}

                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <button className='orange_primary_btn mt-3' onClick={() => Editcategory()}>Update</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default EditGroupcategory