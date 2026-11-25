import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import Select from 'react-select'
import { AddEditGender, adminAddcategory } from '../api/api';
import toast from 'react-hot-toast';
import RichTextEditor from '../Components/RichTextEditor';
import { addFaqCall } from '../api/cms';
import { useNavigate } from 'react-router-dom'

function EditFaqModal({ show, handleClose, EditData, Faqlist, editfunc, getGender }) {
    console.log("EditData", EditData, show);
    const [category, setCategory] = useState("")
    console.log("category", category);
    const [content, setContent] = useState("")
    console.log("content", content);
    const [language, setLanguage] = useState("")

    const history = useNavigate()
    const languageTypes = [
        { label: "English", value: "english" },
        { label: "Hindi", value: "hindi" },
        { label: "Spanish", value: "spanish" },
        { label: "Japanese", value: "japanese" },
        { label: "Portuguese", value: "portuguese" },
        { label: "Mandarin", value: "mandarin" },
        { label: "French", value: "french" },
        { label: "Italian", value: "italian" },
        { label: "Russian", value: "russian" },
        { label: "Nepalese", value: "nepalese" },
        { label: "Serbian", value: "serbian" }
    ]
    useEffect(() => {
        if (EditData) {
            setCategory(EditData?.question)
            setContent(EditData?.answer)
            setLanguage(EditData?.languageType)
        }

    }, [EditData])

    const onEditorChange = (description_text) => {
        setContent(description_text)
    }

    const handleSubmit = async () => {
        var errors = {};

        if (!content) {
            errors.answer = "answer cannot be empty"
            return toast.error("answer cannot be empty")
        }

        if (Object.keys(errors).length == 0) {

            console.log("erro length", Object.keys(errors).length)

            var payload = {
                id: EditData?._id,
                question: category,
                answer: content,
                languageType: language,
                action: "edit"
            }

            console.log("payload", payload)

            var resp = await addFaqCall(payload);
            if (resp?.status) {
                toast.success(resp.message)
                // setTimeout(() => {
                //   history("/faqlists")
                // }, 1000);
                Faqlist()
                handleClose()
            }
            else return toast.error(resp.message)

        }
    }


    const handlechangeLanguage = (value, key) => {
        console.log("tttttttttttttt", value, key);
        setLanguage(value);
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
                   {/*  <div className='select_wrapper w-100'>
                        <Select
                            classNamePrefix="custom_rct_slt"
                            // isSearchable={true}
                            value={languageTypes.find((val) => val.value == language)}
                            options={languageTypes}
                            onChange={(e) => handlechangeLanguage(e.value, "language")}
                            placeholder="Select Language"
                        />
                    </div> */}
                    <div className='cmn_modal_header d-flex justify-content-between align-items-center'>
                        <p className='cmn_modal_title'>Edit Faq</p>
                        <button className='cmn_modal_closer rounded-5' onClick={handleClose}><i class="fa-solid fa-xmark" /></button>
                    </div>


                    <div className='rp_singleinput_holder mb-2 mt-4'>
                        <p className='rp_label mb-2'>Question</p>
                        <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                            <input type='text' placeholder='Enter the Faq' id="gendername" value={category || ''} onChange={(e) => setCategory(e.target.value)} className='rp_singleInput flex-grow-1' />
                        </div>
                    </div>

                    <div className='rp_singleinput_holder mb-3'>
                        <p className='rp_label mb-2'>Content</p>
                        <RichTextEditor
                            value={content}
                            onChange={onEditorChange}
                            editorKey={EditData?._id}
                        />
                    </div>
                    {/* <div className='mt-3'>
                        <Select options={options} />
                    </div> */}
                    <button className='orange_primary_btn mt-3' onClick={() => handleSubmit()}>Update</button>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default EditFaqModal