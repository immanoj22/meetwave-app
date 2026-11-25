import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { PlansList, adminAddGroupCategory, adminAddHobbies, adminAddSubcategory, adminAddcategory, categorylist, getsubcategorylist } from '../api/api';
import toast from 'react-hot-toast';
import { isEmpty } from '../config/common';
// import { set } from 'mongoose';

function EditHobbies({ show, handleClose, EditData, editfunc }) {
    console.log("EditData", EditData);


    const [list, setList] = useState({})
    console.log("ferrrrrrrrrrr", list)
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
            value: "free", label: "free"
        },
        {
            value: "premium", label: "premium"
        },
        {
            value: "Silver", label: "Silver"
        },
        {
            value: "Diamond", label: "Diamond"
        },
    ])
    console.log("planoptionsplanoptions", planoptions);

    const [Hobbyname, setHobbyname] = useState({})
    console.log("Hobbyname", Hobbyname);
    const [subcategorylists, setSubCategorylists] = useState([])
    const [categoryId, setCategoryId] = useState({})
    const [subcategoryId, setSubCategoryId] = useState({})

    console.log("setSubCategoryIdsetSubCategoryId", subcategorylists);

    useEffect(() => {

        let data = { ...EditData }
        console.log("fdfddaaaaaaaaaaaaaaaaaaaaaaa", data);

        // data.plan = planoptions?.find(val => val?.planType == data?.plan)?._id
        // console.log("fdfddaaaaaaaaaaaaaaaaaaaaaaa_123", data);

        setList(data)
        Getsubcategorylist()
        // getPlanslists()




        // setSubCategoryId({ label: EditData?.subcategorylist[0]?.subcategory, value: EditData?.subcategorylist[0]?._id })
    }, [EditData])
    const [ValidateError, SetValidateError] = useState('')
    const Validation = () => {

        let ValidateError = {}


        if (!list?.hobbyname) {
            ValidateError.hobbyname = "hobbyname is required";
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
                        hobbyname: list?.hobbyname,
                        // categoryId: categoryId ? categoryId.value : "",
                        subcategoryId: list?.subcategoryId ? list?.subcategoryId : "",
                        // plan: list?.plan ? list?.plan : "",
                        type: "edit"
                    }
                    let resp = await adminAddHobbies(payload)
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
    const handlechange = async (e, data) => {
        console.log("erererer", e, data);
        try {
            if (data == "hobbyname") {
                setList({ ...list, ...{ "hobbyname": e.target.value } })
            }
            // else if (data == "plan") {
            //     setList({ ...list, ...{ "plan": e._id } })

            // }
            else if (data == "subcategoryId") {
                setList({ ...list, ...{ "subcategoryId": e.value } })
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
                        <p className='cmn_modal_title'>Edit Hobbies</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>


                    {/* <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select SubCategory</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                value={subcategorylists.find(option => String(option?.value) == String(list?.subcategoryId)) || 
                                    { 
                                        label:subcategorylists.find(option => String(option?.value) == String(list?.subcategoryId)), 
                                        value: subcategorylists.find(option => String(option?.value) == String(list?.subcategoryId)) }}
                                options={subcategorylists}
                                onChange={(e) => handlechange(e,"subcategoryId")}
                            />
                        </div>
                    </div> */}
                    <p className='mdl_label mb-2'>Hobby Name</p>
                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>

                        <input type='text' placeholder='Enter the Hobbyname' id="hobbyname" name="hobbyname" value={list?.hobbyname} onChange={(e) => handlechange(e, "hobbyname")} className='rp_singleInput flex-grow-1'
                        />
                    </div>
                    {ValidateError && ValidateError.hobbyname && <span className="error_msg">{ValidateError.hobbyname}</span>}
                 {/*    <div className='rp_singleinput_holder mt-3 mb-3'>
                        <p className='mdl_label mb-2'>Select Plan</p>
                        <div className='select_wrapper w-100'>
                            <Select
                                classNamePrefix="custom_rct_slt"
                                isSearchable={false}
                                options={planoptions}
                                // value={list?.plan}
                                value={planoptions.find(option => String(option?._id) == String(list?.plan)) ||
                                {
                                    label: planoptions.find(option => String(option?._id) == String(list?.plan)),
                                    value: planoptions.find(option => String(option?._id) == String(list?.plan))
                                }}
                                onChange={(e) => handlechange(e, "plan")}
                            />
                        </div>
                    </div> */}
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <button className='orange_primary_btn mt-3' onClick={() => Editcategory()}>Update</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default EditHobbies;