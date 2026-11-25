import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { Editplans, adminAddcategory } from '../api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { isEmpty } from '../config/common';
import { FaMinus } from 'react-icons/fa6';

function EditPlanDetails({ show, handleClose, EditData, Data }) {
    console.log("datasss", EditData, Data);
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
    const [formdata, setFormdata] = useState(EditData)
    console.log("category", formdata);
    const [ValidateError, SetValidateError] = useState({})
    console.log("ValidateError", ValidateError)
    const navigate = useNavigate();

    useEffect(() => {
        setFormdata(EditData)
    }, [EditData])


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
    const handleChange = async (e) => {
        try {
            const { id, value } = e.target
            console.log("fdgdgfdbh", id, value);
            setFormdata({ ...formdata, ...{ [id]: value } })
        } catch (error) {
            console.log("error", error);
        }
    }
    const handleBenefitChange = (e, index) => {
        const { value } = e.target;
        const updatedBenefits = [...formdata.plansBenifits];
        updatedBenefits[index].benefit = value;
        setFormdata({ ...formdata, plansBenifits: updatedBenefits });
    };

    const AddplanArray = async () => {
        try {
            var errors = {};

            let value = validation();
            console.log("value", value)
            if (formdata?.plansBenifits?.some(b => !b.benefit || b.benefit.trim() === "")) {
                return toast.error("All benefits must be filled out");
            }
            if (!isEmpty(value)) {
                SetValidateError(value);
                toast.error("fix all validation");
            }
            else {
                if (Object.keys(errors).length == 0) {
                    let payload = {
                        planid: Data?._id,
                        planinId: formdata?._id,
                        planDays: formdata?.planDays,
                        planPrice: formdata?.planPrice,
                        bonuswords: formdata?.bonuswords ?? "none",
                        plansBenifits: formdata?.plansBenifits,
                        type: "editplan"
                    }
                    console.log("dfgdfgdfgdfgdfgdfg", payload);
                    let resp = await Editplans(payload)
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

    const handleDeleteInput = (index) => {
        const updatedBenefits = [...formdata.plansBenifits];
        updatedBenefits.splice(index, 1);
        setFormdata({ ...formdata, plansBenifits: updatedBenefits });
    };


    const handleBenefitStatusChange = (index, value) => {
        const updatedBenefits = [...formdata.plansBenifits];
        updatedBenefits[index].benefitStatus = value; // or toggle: !updatedBenefits[index].benefitStatus
        setFormdata({ ...formdata, plansBenifits: updatedBenefits });
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
                        <p className='cmn_modal_title'>Edit Plan Details</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>



                    {/* <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        <input type='text' placeholder='Days' id="hobby" name="hobby" className='rp_singleInput flex-grow-1' onChange={(e)=>{setCategory(e.target.value)}}
                        />
                    </div> */}

                    <div >
                        <p className='mdl_label my-3'>Plan Days</p>
                        <input type='text' placeholder='2' id="planDays" name="subcategory" className='mdl_input' value={formdata?.planDays} onChange={(e) => { handleChange(e) }}
                        />
                    </div>
                    {ValidateError && ValidateError.planDays && <span className="error_msg">{ValidateError.planDays}</span>}

                    <div >
                        <p className='mdl_label mb-2 my-3'>Plan Price</p>
                        <input type='text' placeholder='2000' id="planPrice" name="subcategory" className='mdl_input' value={formdata?.planPrice} onChange={(e) => { handleChange(e) }}
                        />
                    </div>
                    {ValidateError && ValidateError.planPrice && <span className="error_msg">{ValidateError.planPrice}</span>}
                    {formdata?.plansBenifits?.length > 0 && formdata?.plansBenifits.map((val, i) => {
                        return (
                            <div key={i}>
                                <p className='mdl_label mb-2 my-3'>{`${i + 1}. Benefit`}</p>

                                <div className='d-flex align-items-end gap-3'>
                                <textarea
                                    type='text'
                                    placeholder='Enter Benefit'
                                    className='mdl_input'
                                    value={val.benefit}
                                    onChange={(e) => handleBenefitChange(e, i)}
                                />
                           {/*      <label className='text-light'>
                                    <input
                                        type="checkbox"
                                        checked={val.benefitStatus}
                                        onChange={(e) => handleBenefitStatusChange(i, e.target.checked)}
                                    /> {val.benefitStatus ? "Disable" : "Enable"}
                                </label> */}
                                {formdata.plansBenifits.length > 1 && (
                                    <button type="button" className='delete_button' onClick={() => handleDeleteInput(i)}> <FaMinus /></button>
                                )}
                                </div>
                            </div>
                        );
                    })}
                    {/* <div >
                        <p className='mdl_label mb-2 my-3'>Bonus Words</p>
                        <input type='text' placeholder='Enter Bonus Words    ' id="bonuswords" name="subcategory" className='mdl_input' value={formdata?.bonuswords} onChange={(e) => { handleChange(e) }}
                        />
                    </div> */}
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <button className='orange_primary_btn mt-3' onClick={AddplanArray}>Update</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default EditPlanDetails