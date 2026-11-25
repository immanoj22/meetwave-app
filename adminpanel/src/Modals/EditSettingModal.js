import React, { useState, useEffect } from 'react'
import {Modal} from 'react-bootstrap';
import { EditSelllink } from '../api/sellLink'
import { toastAlert } from "../lib/toastAlert";

function EditSettingModal({show,handleClose,editData,getList}) {
  console.log("editDatasss",editData);
  const [errors, setErrors] = useState('')
  const [formValue, setFormValue] = useState({});

  useEffect(() => {
    setFormValue({
        id: editData?._id,
        preference: editData.preference,
        selLink: editData.selLink 
    })

}, [editData])

const handlechange = (e) => {
  setErrors({})
  const { name, value } = e.target;
  if (name == 'preference') {
    if (formValue.selLink.length < value && value != '') {
      return false
    }
  }

  setFormValue({ ...formValue, [name]: value });
}

const handledit = async () => {

  let { status, loading, error, message, result } = await EditSelllink(formValue);
  if (status) {
      toastAlert("success", message);
      setErrors({})
      getList()
      handleClose()
  } else {
      if (error) {
          setErrors(error);
      } else if (message) {
            toastAlert("error", message);
      }
  }

}
  return (
    <>
    <Modal centered className='cmn_modal'
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        
        <Modal.Body>
            <div className='cmn_modal_header d-flex justify-content-between align-items-center'>
                <p className='cmn_modal_title'>Edit Sell List</p>
                <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark"/></button>
            </div>

            <div className='mt-4'>
            <div className='rp_singleinput_holder mb-3'>
                    <p className='rp_label mb-2'>Link</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type='text' placeholder='Enter Link' className='rp_singleInput flex-grow-1'
                         name="selLink"
                         value={formValue?.selLink} 
                         onChange={(e) => { handlechange(e) }}
                        />
                    </div>
                </div>

                <div className='rp_singleinput_holder mb-3'>
                    <p className='rp_label mb-2'>Preference</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type='text' placeholder='Name' className='rp_singleInput flex-grow-1' 
                        name="preference"
                        value={formValue?.preference} 
                        onChange={(e) => { handlechange(e) }}
                        />
                    </div>
                </div>

                <button className='orange_small_primary'  onClick={()=>{handledit()}}>Submit</button>
            </div>
         
        </Modal.Body>
       
      </Modal>
    </>
  )
}

export default EditSettingModal