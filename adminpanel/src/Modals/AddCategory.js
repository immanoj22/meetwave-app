import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { adminAddcategory } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';

function AddCategory({ show, handleClose, editfunc }) {
   
    const options = [
        {
            value: "active", label: "Active"
        },
        {
            value: "inactive", label: "Inactive"
        }
    ]
    const [category, setCategory] = useState("")
    console.log("category", category);
    const [description, setDescription] = useState("")

    const [ValidateError, SetValidateError] = useState('')
    const Validation = () => {

        let ValidateError = {}


        if (!category) {
            ValidateError.category = "Category is required";
        }
        if (!description) {
            ValidateError.description = "Description is required";
        }

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
                        categoryname: category,
                        description: description,
                        type: "add"
                    }
                    let resp = await adminAddcategory(payload)
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
                        <p className='cmn_modal_title'>Add Category</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>


                    {/* <p className='cmn_modal_title'>Category</p> */}
                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>

                        <input type='text' placeholder='Enter the category name' id="hobby" name="hobby" className='rp_singleInput flex-grow-1' onChange={(e) => { setCategory(e.target.value) }}
                        />
                    </div>
                    {/* {ValidateError && ValidateError.category && <span className="error_msg">{ValidateError.category}</span>} */}
                    <span className="errors_style" id="name-error" >{ValidateError && ValidateError.category}</span>
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <textarea type='text' placeholder='Enter the description (optional)' id="description" name="description" className='rp_singleInput flex-grow-1' onChange={(e) => { setDescription(e.target.value) }}
                        />
                    </div>
                    {/* {ValidateError && ValidateError.description && <span className="error_msg">{ValidateError.description}</span>} */}
                    <span className="errors_style" id="name-error" >{ValidateError && ValidateError.description}</span>
                    <br />
                    <button className='orange_primary_btn mt-3' onClick={Addcategory}>Add</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default AddCategory