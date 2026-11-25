import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { adminAddcategory } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';

function EditCategory({ show, handleClose, EditData, editfunc }) {
    console.log("EditData", EditData);

    const initial = {
        "category": ""
    }
    const options = [
        {
            value: "active", label: "Active"
        },
        {
            value: "inactive", label: "Inactive"
        }
    ]
    const [category, setCategory] = useState(initial)
    console.log("category", category);

    useEffect(() => {
        setCategory(EditData?.category)

    }, [EditData])
    const [ValidateError, SetValidateError] = useState('')
    const Validation = () => {

        let ValidateError = {}


        if (!category) {
            ValidateError.category = "category is required";
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
                        categoryname: category,
                        type: "edit"
                    }
                    let resp = await adminAddcategory(payload)
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
                        <p className='cmn_modal_title'>Edit Category</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>



                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <input type='text' placeholder='Enter the Hobby' id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} className='rp_singleInput flex-grow-1'
                        />
                    </div>
                    {ValidateError && ValidateError.category && <span className="error_msg">{ValidateError.category}</span>}

                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <button className='orange_primary_btn mt-3' onClick={() => Editcategory()}>Update</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default EditCategory