import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { PlansList, adminAddsubcategory, categorylistadmin } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';

function EditSubCategory({ show, handleClose, EditData, editfunc }) {

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
    console.log("optionsoptions", options);
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
    const initial = {
        "subcategory": "",
        "description": "",
        "category": "",
        "plan": ""
    }
    const [list, setList] = useState(initial)

    useEffect(() => {
        if (!EditData?._id) return;

        let data = { ...EditData };
        data.plan = planoptions.find(val => val.planType == data?.plan)?._id;
        setList(data);
    }, [EditData])

   

   
    console.log("lists", list);
    const [ValidateError, SetValidateError] = useState('')
    const Validation = () => {

        let ValidateError = {}


        if (!list.subcategory) {
            ValidateError.subcategory = "subcategory is required";
        }
        if (!list.description) {
            ValidateError.description = "description is required";
        }
        if (!list.category) {
            ValidateError.category = "category is required";
        }
        if (!list.plan) {
            ValidateError.plan = "plan is required";
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
    useEffect(() => {
        if (!show) return;
        getCategorylist()
        getPlanslists()
    }, [show])

    const getCategorylist = async () => {
        try {
            let resp = await categorylistadmin()
            if (resp.status) {
                selectOptions(resp.data)
            }
            else {
                toast.error(resp.message)
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    const getPlanslists = async () => {
        try {
            let resp = await PlansList()
            if (resp.status) {
                setPlanoptions(resp.data)
            }
            else {
                toast.error(resp.message)
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
                        plan: planoptions.find(val=>val._id == list?.plan )?._id  ,
                        id: list?._id,
                        subcategory: list?.subcategory,
                        description: list?.description,
                        type: "edit"
                    }
                    console.log("dsfsdgdfg", payload);
                    let resp = await adminAddsubcategory(payload)
                    console.log("reponses", resp);
                    if (resp.status) {
                        toast.success(resp.message)
                        setList(resp.data)
                        editfunc?.()
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
                        <p className='cmn_modal_title'>Edit Sub Hobbies</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>
                    <div className='rp_singleinput_holder mt-3 mb-3'>
                        {console.log("options",list.category?.length,options,list.category,options.find((option) => (option._id) == (list.category)))}
                        <p className='mdl_label mb-2'>Hobby</p>
                        <div className='select_wrapper w-100'>
                        <input type='text' placeholder='Enter the sub hobbies' id="Hobbies" name="Hobbies" value={Array.isArray(list.category) ?list?.category[0]?.category:""} disabled={true} className='mdl_input'
                        />

                            {/* <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                options={options}
                                // value={list?.subcategory}
                                value={ Array.isArray(list.category) ?
                                    {
                                        label: list?.category[0]?.category,
                                        value: list?.category[0]?.category
                                    } :
                                    {
                                        label: options.find(option => (option._id) == (list.category))?.category,
                                        value: options.find(option => (option._id) == (list.category))?.category
                                    }
                                }

                                // value={options.find(option => String(option._id) == String(list.category)) &&  { label: options.find(option => String(option._id) == String(list.category))?.category, value: options.find(option => String(option._id) == String(list.category))?.category } || { label: list[0]?.category, value: list[0]?.category }}
                                onChange={(e) => handlechange(e, "subcategory")} /> */}
                        </div>
                    </div>
                    {ValidateError && ValidateError.category && <span className="error_msg">{ValidateError.category}</span>}

                    <div >
                        <p className='mdl_label mb-2'>Enter Sub Hobbies</p>
                        <input type='text' placeholder='Dancing' id="subcategory" name="subcategory" value={list?.subcategory} onChange={(e) => handlechange(e)} className='mdl_input'
                        />
                    </div>
                    {ValidateError && ValidateError.subcategory && <span className="error_msg">{ValidateError.subcategory}</span>}

                    {/* <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <input type='text' placeholder='Dancing' id="price" name="price" className='rp_singleInput flex-grow-1'
                        />
                    </div> */}
                    <div className='mt-3'>
                        <p className='mdl_label mb-2'>Enter Description</p>
                        <textarea type='text' placeholder='Description' id="description" name="description" value={list?.description} onChange={(e) => handlechange(e)} className='mdl_textarea'
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
                                // value={list?.plan}
                                value={planoptions.find(option => String(option?._id) === String(list?.plan)) || 
                                    { 
                                        label:planoptions.find(option => String(option?._id) === String(list?.plan)), 
                                        value: planoptions.find(option => String(option?._id) === String(list?.plan)) }}
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
                    <button className='orange_primary_btn mt-3' onClick={Addsubcategory}>Update</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default EditSubCategory