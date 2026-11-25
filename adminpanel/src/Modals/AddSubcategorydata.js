import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { adminAddSubcategory, adminAddcategory, categorylist } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';

function AddSubcategorydata({ show, handleClose, editfunc }) {

    const options = [
        {
            value: "active", label: "Active"
        },
        {
            value: "inactive", label: "Inactive"
        }
    ]
    const [subcategory, setSubcategory] = useState("")
    console.log("subcategory", subcategory);
    const [description, setDescription] = useState("")

    const [ValidateError, SetValidateError] = useState('')

    const [categorylists, setCategorylists] = useState([])

    const [categoryId, setCategoryId] = useState({})

    console.log("categoryId", categoryId, categorylists, ValidateError)

    useEffect(() => {
        GetCategogylists()
    }, [])

    const Validation = () => {

        let ValidateError = {}
        if (!categoryId) {
            ValidateError.categoryId = "category is required";
        }

        if (!subcategory) {
            ValidateError.subcategory = "subcategory name is required";
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
                // toast.error(Object.values(value));
            } else {
                if (Object.keys(errors).length == 0) {
                    let payload = {
                        subcategoryname: subcategory,
                        categoryId: categoryId ? categoryId?.value : "",
                        description: description,
                        type: "add"
                    }
                    let resp = await adminAddSubcategory(payload)
                    console.log("payload", resp);
                    if (resp.status) {
                        toast.success(resp.message)
                        editfunc()
                        handleClose()

                    }
                    else {
                        toast.error(resp.message)

                    }
                }

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
                        <p className='cmn_modal_title'>Add SubCategory</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>
                    <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Category</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={true}
                                options={categorylists}
                                onChange={(e) => setCategoryId(e)}
                            />
                        </div>
                        {/* {(categoryId == undefined || categoryId == "") ? <span className="errors_style" id="name-error" >{ValidateError &&  ValidateError.categoryId}</span> :""} */}

                    </div>

                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <input type='text' placeholder='Enter the subcategory name' id="hobby" name="hobby" className='rp_singleInput flex-grow-1' onChange={(e) => { setSubcategory(e.target.value) }}
                        />
                    </div>
                    {/* {ValidateError && ValidateError.subcategory && <span className="error_msg">{ValidateError.subcategory}</span>} */}
                    <span className="errors_style" id="name-error" >{ValidateError && ValidateError.subcategory}</span>
                    <br />
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    {/* <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <textarea type='text' placeholder='Enter the description' id="description" name="description" className='rp_singleInput flex-grow-1' onChange={(e) => { setDescription(e.target.value) }}
                        />
                    </div>
                    {ValidateError && ValidateError.description && <span className="error_msg">{ValidateError.description}</span>} */}
                    <button className='orange_primary_btn mt-3' onClick={Addcategory}>Add</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default AddSubcategorydata