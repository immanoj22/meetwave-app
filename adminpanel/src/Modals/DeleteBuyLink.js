import React from 'react'
import {Modal} from 'react-bootstrap';

const DeleteBuyLink = ({show,handleClose}) => {
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
                <p className='cmn_modal_title'>Delete Buy List</p>
                <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark"/></button>
            </div>

            <div className='mt-3'>
            
            <p className='dash_graymed_text'>Are you sure delete the buy list.</p>
                <button className='orange_small_primary mt-5' onClick={handleClose}>Done</button>
            </div>
         
        </Modal.Body>
       
      </Modal>
    </>
  )
}

export default DeleteBuyLink