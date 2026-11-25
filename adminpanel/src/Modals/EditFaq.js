import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { AddEditGender, adminAddcategory } from '../api/api';
import toast from 'react-hot-toast';

function EdiFaq({ show, handleClose, EditData, editfunc,getGender }) {
    console.log("EditData", EditData, show);
    const [category, setCategory] = useState("")
    console.log("category", category);

    useEffect(() => {
        if (EditData?.gendername) {
            setCategory(EditData?.gendername)
        }




    }, [EditData])


    const updateReferral = async () => {
        console.log("dfgfdgdfg");
        try {
            var removeData = await AddEditGender({ type: "edit", id: EditData._id, gendername: category })
            if (removeData.status) {
                toast.success(removeData.message)
                getGender()
            } else {
                toast.success(removeData.message)
            }
        } catch (error) {
            console.log("error", error);
        }
        handleClose()

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
                        <p className='cmn_modal_title'>Edit Gender</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>



                    <div className='rp_input_holder w-75  rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2 mt-3'>
                        {console.log('gendernamegendername', category)}

                        <input type='text' placeholder='Enter the Gender' id="gendername" value={category || ''} onChange={(e) => setCategory(e.target.value)} className='rp_singleInput flex-grow-1' />




                    </div>
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <button className='orange_primary_btn mt-3' onClick={() => updateReferral()}>Update</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default EdiFaq