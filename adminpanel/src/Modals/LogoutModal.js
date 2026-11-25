import React from 'react'
import {Modal} from 'react-bootstrap';
import {logoutUser} from '../lib/localStorage'
import { NavLink ,useNavigate } from 'react-router-dom'

function LogoutModal({show,handleClose}) {
  const navigate = useNavigate();

 const  onLogoutClicks = (e) => {
    e.preventDefault();
    logoutUser();
    localStorage.clear();
    navigate('/')
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
                <p className='cmn_modal_title'>Logout</p>
                <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark"/></button>
            </div>

            <div className='mt-3'>
            
            <p className='dash_graymed_text'>Are you sure to logout?</p>
                <button className='orange_small_primary mt-5' onClick={(e)=>{onLogoutClicks(e)}}>Logout</button>
            </div>
         
        </Modal.Body>
       
      </Modal>

   </>
  )
}

export default LogoutModal