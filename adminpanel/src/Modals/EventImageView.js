import React from 'react'
import { Modal } from 'react-bootstrap';
import Config from "../config/config"
function EventImageView({ show, handleClose, EventDesc }) {

    console.log('nameee', show, EventDesc)
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
                        <p className='cmn_modal_title'> <span className='yellow_text'>
                        </span>Event Images</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <div className='mt-4 p-3 mdl_value_wrapper d-flex align-items-center gap-2'>
                       

                        {EventDesc?.image ? EventDesc?.image?.map((img) => (
                            <div className='user_image_wrapper '>
                                <a href={`${Config.AWS_CDN_URL}${img}`} target='_blank'>
                                <img src={`${Config.AWS_CDN_URL}${img}`} alt='profile' />
                                </a>
                               

                            </div>
                        )) : "No set Image"}

                    </div>
             

                </Modal.Body>

            </Modal>
        </>
    )
}

export default EventImageView