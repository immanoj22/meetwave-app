import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { Addplans, adminAddcategory } from '../api/api';
import toast from 'react-hot-toast';
import { NavLink, useNavigate } from 'react-router-dom'
import { isEmpty } from '../config/common';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { FaMinus } from 'react-icons/fa6';

function AddPlanDetails({ show, handleClose, AddData }) {
    console.log("initialinitial",AddData, AddData._id);
    const navigate = useNavigate();

    const options = [
        {
            value: "active", label: "Active"
        },
        {
            value: "inactive", label: "Inactive"
        }
    ]
    const initial = {

        "planDays": "",
        "planPrice": "",
        "bonuswords": ""
    }
    const [formdata, setFormdata] = useState(initial)
    console.log("category", formdata);
    const [ValidateError, SetValidateError] = useState({})
    console.log("ValidateError", ValidateError)
    const [inputs, setInputs] = useState([""]);

    const validation = () => {

        var Errors = {}


        if (!(formdata.planDays)) {
            Errors.planDays = "planDays cannot be empty"

        }

        if (!(formdata.planPrice)) {
            Errors.planPrice = "planPrice cannot be empty"

        }

        console.log('valueeeeedddddd', Errors)
        SetValidateError(Errors)
        return Errors
    }


    const handleChangeBenefit = (e, index) => {
        const newInputs = [...inputs];
        newInputs[index] = e.target.value;
        setInputs(newInputs);
    };


    const handleAddInput = () => {
        if (inputs[inputs.length - 1].trim() !== "") {
            setInputs([...inputs, ""]);
        } else {
            toast.error("Please fill the current benefit before adding a new one.");
        }
    };

    const handleDeleteInput = (index) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    };


    const handleChange = async (e) => {
        try {
            const { id, value } = e.target
            console.log("fdgdgfdbh", id, value);
            setFormdata({ ...formdata, ...{ [id]: value } })
        } catch (error) {
            console.log("error", error);
        }
    }
    console.log("inputs", inputs);

    // const Addcategory = async()=>{
    //     try {
    //         let payload={
    //             category:category,
    //             type:"add"
    //         }
    //         let resp = await adminAddcategory(payload)
    //         console.log("payload",resp);
    //         if(resp.status){
    //             toast.success(resp.message)
    //         }
    //         else{
    //             toast.error(resp.message)

    //         }
    //     } catch (error) {
    //         console.log("error",error);
    //     }
    //     handleClose()
    // }



    const AddplanArray = async () => {
        try {
            var errors = {};

            let value = validation();
            console.log("value", value)
            console.log("rdfgerdfertetre", inputs.filter((val => val == "")));

            if (inputs?.some(val => val.trim() === "")) {
                return toast.error("Please fill out all benefit fields.");
            }

            if (!isEmpty(value)) {
                SetValidateError(value);
                toast.error("fix all validation");
            }
            else {
                if (Object.keys(errors).length == 0) {
                    let payload = {
                        planid: AddData?._id,
                        planDays: formdata?.planDays,
                        planPrice: formdata?.planPrice,
                        bonuswords: formdata?.bonuswords ?? "none",
                        plansBenifits: inputs,
                        type: "planDaysAdd"
                    }
                    console.log("dfgdfgdfgdfgdfgdfg", payload);
                    let resp = await Addplans(payload)
                    console.log("responses", resp.data);
                    if (resp.status) {
                        // setFormdata(resp.data)
                        toast.success(resp.message)
                        navigate('/plans')

                        // setPlandays(resp.data.plan_days)
                    }
                }
            }


        } catch (error) {
            console.log("error_planlist", error);
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
                        <p className='cmn_modal_title'>Add Plan Details</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>



                    {/* <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <input type='text' placeholder='Days' id="hobby" name="hobby" className='rp_singleInput flex-grow-1' onChange={(e)=>{setCategory(e.target.value)}}
                        />
                    </div> */}

                    <div >
                        <p className='mdl_label my-3'>Plan Days</p>
                        <input type='text' placeholder='Enter plan days' id="planDays" name="subcategory" className='mdl_input' onChange={(e) => { handleChange(e) }}
                        />
                    </div>
                    {ValidateError && ValidateError.planDays && <span className="error_msg">{ValidateError.planDays}</span>}

                    <div >
                        <p className='mdl_label mb-2 my-3'>Plan Price</p>
                        <input type='text' placeholder='Enter plan price' id="planPrice" name="subcategory" className='mdl_input' onChange={(e) => { handleChange(e) }}
                        />
                    </div>
                    {ValidateError && ValidateError.planPrice && <span className="error_msg">{ValidateError.planPrice}</span>}
                    <div>
                        <p className='mdl_label mb-2 my-3'>Add Benefits</p>
                        {inputs.map((item, index) => (
                            <div key={index} className='d-flex gap-2 align-items-end mb-3'>
                                <textarea
                                    type='text'
                                    placeholder='Enter benefit'
                                    className='mdl_input'
                                    value={item}
                                    onChange={(e) => handleChangeBenefit(e, index)}
                                />
                                {index === inputs.length - 1 && (
                                    <button type="button" className='green_edit_button' onClick={handleAddInput}><FaPlus className='ms-1' /></button>
                                )}
                                {inputs.length > 1 && (
                                    <button className='delete_button' type="button" onClick={() => handleDeleteInput(index)}> <FaMinus /></button>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* {Array.isArray(inputs) && inputs.map((item, index) => (
                        <div key={index} className='d-flex align-items-center gap-2 mb-2'>
                            <input
                                type='text'
                                placeholder='Enter benefit'
                                className='mdl_input'
                                value={item.plansBenifits}
                                onChange={(e) => handleBenefitChange(e, index)}
                            />
                            {index === inputs.length - 1 && (
                                <button type="button" onClick={handleAddInput}>Add</button>
                            )}
                            {inputs.length > 1 && (
                                <button type="button" onClick={() => handleDeleteInput(index)}>Delete</button>
                            )}
                        </div>
                    ))} */}
                    {/* <div >
                        <p className='mdl_label mb-2 my-3'>Bonus Words</p>
                        <input type='text' placeholder='Enter Bonus Words    ' id="bonuswords" name="subcategory" className='mdl_input' onChange={(e) => { handleChange(e) }}
                        />
                    </div> */}
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <button className='orange_primary_btn mt-3' onClick={AddplanArray}>Add</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default AddPlanDetails