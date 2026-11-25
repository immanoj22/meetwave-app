import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { PlansList, adminAddsubcategory, categorylistadmin } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';

function AddSubCategory({ show, handleClose, subcategorylistdata }) {
    const initial = {
        "subcategory": "",
        "description": "",
        "category": "",
        "plan": ""
    }

    const [list, setList] = useState(initial)
    console.log("lists", list);
    const [options, selectOptions] = useState([
        {
            value: "dancing", label: "Dancing"
        },
        {
            value: "singing", label: "Singing"
        },
        {
            value: "photography", label: "Photography"
        },
    ])

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
    console.log("planoptions", planoptions);


    useEffect(() => {
        getCategorylist()
        getPlanslists()
        setList({})
    }, [])

    const [ValidateError, SetValidateError] = useState('')
    const Validation = () => {

        let ValidateError = {}


        if (!list.subcategory) {
            ValidateError.subcategory = "Subcategory is required";
        }
        if (!list.description) {
            ValidateError.description = "Description is required";
        }
        if (!list.category) {
            ValidateError.category = "Category is required";
        }
        if (!list.plan) {
            ValidateError.plan = "Plan is required";
        }

        SetValidateError(ValidateError)
        return ValidateError
    }


    const handlechange = async (e, data) => {
        console.log("erererer", e, data);
        try {
            if (data == "subcategory") {
                setList({ ...list, ...{ "category": e._id } })
            }
            else if (data == "plan") {
                setList({ ...list, ...{ "plan": e._id } })

            }
            else {
                const { id, value } = e.target
                console.log("fsdgdg", id, value);
                setList({ ...list, ...{ [id]: value } })
            }

        } catch (error) {
            console.log("error", error);
        }
    }


    const getCategorylist = async () => {
        try {
            let resp = await categorylistadmin()
            console.log("categorylistadmin", resp.data);
            if (resp.status) {
                selectOptions(resp.data)
                subcategorylistdata()
            }
            else {
                toast.success(resp.message)
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    //plans
    const getPlanslists = async () => {
        try {
            let resp = await PlansList()
            console.log("PlansList", resp.data);
            if (resp.status) {
                setPlanoptions(resp.data)
                subcategorylistdata()
            }
            else {
                toast.success(resp.message)
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    const Addsubcategory = async () => {

        try {

            var errors = {};
            var value = Validation();

            if (!isEmpty(value)) {
                console.log("value", value);
                SetValidateError(value);
                toast.error("fix all validations");
            } else {
                if (Object.keys(errors).length == 0) {
                    let payload = {
                        plan: list.plan,

                        categoryId: list.category,
                        subcategory: list.subcategory,
                        description: list.description,
                        type: "add"
                    }
                    let resp = await adminAddsubcategory(payload)
                    console.log("reponses", resp);
                    if (resp.status) {
                        toast.success(resp.message)
                        setList(resp.data)
                        setTimeout(() => {
                            window.location.reload()
                            subcategorylistdata()
                            getCategorylist()
                            handleClose()
                        }, 1000)

                        // window.onload()
                    }
                    else {
                        toast.error(resp.message)

                    }
                }
            }
        } catch (error) {
            console.log("error", error);
        }

        // getCategorylist()
        // handleClose()
    }




    console.log("interrwrrt", options);
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
                        <p className='cmn_modal_title'>Add Sub Category</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>
                    <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Hobby</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                options={options}
                                onChange={(e) => handlechange(e, "subcategory")}
                            />
                        </div>
                    </div>
                    {ValidateError && ValidateError.category && <span className="error_msg">{ValidateError.category}</span>}




                    <div >
                        <p className='mdl_label mb-2'>Enter Sub Category</p>
                        <input type='text' placeholder='Enter the sub hobbies' id="subcategory" name="subcategory" className='mdl_input' value={list.subcategory} onChange={(e) => { handlechange(e) }}
                        />
                    </div>
                    {ValidateError && ValidateError.subcategory && <span className="error_msg">{ValidateError.subcategory}</span>}


                    {/* <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <input type='text' placeholder='Dancing' id="price" name="price" className='rp_singleInput flex-grow-1'
                        />
                    </div> */}
                    <div className='mt-3'>
                        <p className='mdl_label mb-2'>Enter Description</p>
                        <textarea type='text' placeholder='Description' id="description" name="description" className='mdl_textarea' value={list.description} onChange={(e) => { handlechange(e) }}
                        />
                    </div>
                    {ValidateError && ValidateError.description && <span className="error_msg">{ValidateError.description}</span>}


                    <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Plan</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                options={planoptions}
                                onChange={(e) => handlechange(e, "plan")}
                            />
                        </div>
                    </div>
                    {ValidateError && ValidateError.plan && <span className="error_msg">{ValidateError.plan}</span>}

                    <div className='mt-3'>

                    </div>
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <button className='orange_primary_btn mt-3' onClick={Addsubcategory}>Add</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default AddSubCategory