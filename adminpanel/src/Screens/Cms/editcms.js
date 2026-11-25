import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';

import RichTextEditor from '../../Components/RichTextEditor';


import config from '../../config/config'
import { getCmsEdit, getcmslistData } from '../../api/cms';
function EditcmsModal({ show, handleClose, editData, getSettings }) {
    console.log("EditCmscontent", show, editData);

    const [mapimage, setMapimage] = useState([])
    const [formData, setFormData] = useState({})
    console.log("formsDats", formData, mapimage);

    const [MyContent, setMyContent] = useState("")
    console.log("MyContent", MyContent);

    useEffect(() => {
        setFormData(editData)
        setMyContent(editData?.Content)
        GetCmsAll()
    }, [])

    // const DataContent = async (e) => {
    //     // console.log("DataContent",e.taget.value);
    //     try {
    //         let cmscnt = e.target.value
    //         if (cmscnt == "") {
    //             setMyContent(" ")

    //         }
    //         else {
    //             setMyContent(cmscnt)

    //         }
    //     } catch (error) {
    //         console.log("error", error);
    //     }
    // }

    const onEditordata = async (content_text) => {
        try {
            setMyContent(content_text)
        } catch (error) {
            console.log("error", error);
        }
    }


    const GetCmsAll = async () => {
        try {
            let resp = await getcmslistData({ data: editData?.identifier })
            console.log("response", resp.data.image);
            setMapimage(resp.data.image)
        } catch (error) {
            console.log("error", error);
        }
    }

    const handleedit = async () => {
        try {
            // let Formdatas = new FormData()
            // Formdatas.append("id", formData._id)
            // Formdatas.append("identifier", formData.identifier)
            // Formdatas.append("Title", formData.Title)
            // Formdatas.append("Link", formData.Link)

            // Formdatas.append("Content", MyContent)
            // mapimage.map((item) => {
            //     console.log("fgfgfgfgfg", item);
            //     Formdatas.append("file", item)
            // })
            let payload = {
                "id": formData._id,
                "identifier": formData.identifier,
                "Title": formData.Title,
                "Link": formData.Link,

                "Content": MyContent
            }
            let result = await getCmsEdit(payload);

            console.log("result", result?.data?.data)
            if (result?.status) {
                toast.success(result?.message)
                handleClose();
                getSettings()
            }
            else {
                toast.error(result?.message)

            }
        } catch (error) {
            console.log("error", error);
        }

    }

    const handleChange = async (e) => {
        console.log(e.target.files);
        try {
            console.log("valuess", e.target.value);

            const { id } = e.target
            if (id == "file") {
                let file = e.target.files
                setMapimage([...file])
            }

            else {
                const { id, value } = e.target
                console.log("idvalues", id, value);
                setFormData({ ...formData, ...{ [id]: value } })
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
            >

                <Modal.Body>
                    <div className='cmn_modal_header d-flex justify-content-between align-items-center'>
                        <p className='cmn_modal_title'>Edit CMS</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>

                    <div className='mt-4'>

                        <div className='rp_singleinput_holder mb-3'>
                            <p className='rp_label mb-2'>Identifier</p>
                            <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                <input type='text' placeholder='Identifier' readOnly className='rp_singleInput flex-grow-1' disabled={true} name='identifier' id='Identifier'
                                    value={formData?.identifier} onChange={(e) => handleChange(e)}
                                />
                            </div>
                        </div>


                        <div className='rp_singleinput_holder mb-3'>
                            <p className='rp_label mb-2'>Title</p>
                            <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                <input type='text' placeholder='title' className='rp_singleInput flex-grow-1' name='title' id="Title"
                                    value={formData?.Title} onChange={(e) => handleChange(e)}
                                />
                            </div>
                        </div>

                        {formData.identifier == "videointro" ? <>

                            <div className='rp_singleinput_holder mb-3'>
                                <p className='rp_label mb-2'>Link</p>
                                <div className='rp_input_holder rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                                    <input type='text' placeholder='link' className='rp_singleInput flex-grow-1' name='link' id="Link"
                                        value={formData?.Link} onChange={(e) => handleChange(e)}
                                    />
                                </div>
                            </div>
                            <h6 className='rp_label mb-2'>Just paste to youtube video Link</h6>
                        </>
                            : ""}





                        {formData?.identifier &&

                            <div className='rp_singleinput_holder mb-3'>
                                <p className='rp_label mb-2'>Content</p>
                                <RichTextEditor
                                    value={MyContent}
                                    onChange={onEditordata}
                                    editorKey={formData?.identifier}
                                />
                            </div>

                        }

                        <div className='rp_singleinput_holder mb-4'>
                            {formData.identifier == "Partner" ? <>
                                <p className='rp_label mb-2'>Image</p>
                                <div className='browseinput'>





                                    <input type='file' id="file" className='form-control' multiple onChange={(e) => handleChange(e)} />
                                    <button className='orange_small_primary'>Upload Images</button>
                                    {mapimage?.map((val) => {
                                        { console.log("uytutrutr", typeof (val), val) }
                                        return (

                                            <img
                                                className='objectimg'
                                                src={val
                                                    ? typeof val == "object"
                                                        ? window.URL.createObjectURL(val)
                                                        : `${config.IMG_URL}/cmsimages/${val}`
                                                    : ""
                                                }
                                                width={100}
                                            />

                                        )

                                    })}
                                    <br />
                                </div>
                            </>
                                : ""
                            }

                            {/* <img src={file} className='img-fluid fileimg mt-3' /> */}
                        </div>




                        <div className='text-end mt-4 pb-3'>
                            <button className='orange_small_primary' onClick={() => { handleedit() }}>Submit</button>
                        </div>
                    </div>

                </Modal.Body>

            </Modal>
        </>
    )
}

export default EditcmsModal