import React, { useEffect, useRef, useState } from 'react'
import { Modal } from 'react-bootstrap';
// import { EditProfiles } from '../api/api'
import defaultProfile from '../assets/images/emptyprofile.png'
import { FaEdit } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import { Editadminprofile } from '../api/resetPass';

import toast from 'react-hot-toast';
import config from "../config/config"
function EditProfile({ show, handleClose, editData, getAdminDetails }) {
  console.log("editData", editData);
  const [errors, setErrors] = useState('')
  const [formValue, setFormValue] = useState('');
  const [profileImage, setProfileImage] = useState()
  console.log("profileImage", profileImage);
  const editProfileRef = useRef(null);

  const handlechange = (e) => {
    setErrors({})
    const { name } = e.target;
    if (name == "file") {

      setProfileImage(e.target.files[0])
    } else {
      const { name, value } = e.target;
      console.log('handlechange', name, value)
      setFormValue({ ...formValue, [name]: value });
    }

  }
  useEffect(() => {
    setFormValue({
      adminname: editData.adminname,
      email: editData.email,
      image: editData.image
    })

  }, [editData]);



  const handleedit = async () => {

    // let payload = {
    //   id: editData?._id,
    //   adminname: formValue.adminname,
    //   email: formValue.email,
    //   image: profileImage
    // }

    // var formData
    // if (profileImage) {
    //   formData = new FormData()
    //   formData.append("id", editData?._id)
    //   formData.append("adminname", formValue.adminname)

    //   formData.append("email", formValue.email)

    //   formData.append("image", profileImage)
    // }
    // else {
    //   formData = new FormData()
    //   formData.append("id", editData?._id)
    //   formData.append("adminname", formValue.adminname)

    //   formData.append("email", formValue.email)

    //   formData.append("image", editData?.image)
    // }
    let fromDate;
    if (profileImage) {
      fromDate = {
        "id": editData?._id,
        "adminname": formValue.adminname,
        "email": formValue.email,
        "image": profileImage
      }
    }
    else {
      fromDate = {
        "id": editData?._id,
        "adminname": formValue.adminname,
        "email": formValue.email,
        "image": editData?.image
      }
    }

    let resp = await Editadminprofile(fromDate);
    if (resp.status) {
      toast.success(resp.message)
      handleClose()
      getAdminDetails()
    } else {
      toast.error(resp.message)

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
            <p className='cmn_modal_title'>Edit Profile</p>
            <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
          </div>

          <div className='mt-4'>

            <div className='profile_wrapper position-relative mb-3'>

              {<img
                className=' objectimg'
                src={profileImage
                  ? typeof profileImage == "object"
                    ? window.URL.createObjectURL(profileImage)
                    : defaultProfile
                  : `${config.AWS_CDN_URL}${editData?.image}`
                }
                width={100}
              />}
              <div><input className='d-none' ref={editProfileRef} type="file" name="file" onChange={(e) => handlechange(e)} /></div>

              <button className='position-absolute border-0 outline-0  edit_circle' onClick={() => editProfileRef.current.click()}>
                <MdEdit />
              </button>
            </div>

            <div className='rp_singleinput_holder mb-3'>
              <p className='rp_label mb-2'>Name</p>
              <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                <input type='text' placeholder='Name' name="adminname" className='rp_singleInput flex-grow-1'
                  value={formValue?.adminname}
                  onChange={(e) => { handlechange(e) }}
                />
              </div>
            </div>
            {/* <div className='rp_singleinput_holder mb-3'>
              <p className='rp_label mb-2'>Email</p>
              <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                <input type='email' placeholder='Email' name="email" className='rp_singleInput flex-grow-1'
                  value={formValue?.email}
                  onChange={(e) => { handlechange(e) }}
                  readOnly
                />
              </div>
            </div> */}

            {/* <div className='rp_singleinput_holder mb-3'>
                    <p className='rp_label mb-2'>Email</p>
                    <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                        <input type='email' placeholder='Email' className='rp_singleInput flex-grow-1' />
                    </div>
                </div> */}

            <button className='orange_small_primary' onClick={() => { handleedit() }}>Update</button>
          </div>

        </Modal.Body>

      </Modal >
    </>
  )
}

export default EditProfile