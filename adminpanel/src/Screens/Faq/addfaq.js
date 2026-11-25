import React, { Component, useEffect, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
// import DatePicker from "react-datepicker";
import bsCustomFileInput from 'bs-custom-file-input';
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import RichTextEditor from '../../Components/RichTextEditor';
import { addFaqCall } from '../../api/cms';
import Sidebar from '../../Components/Sidebar';
import Header from '../../Components/Header';

import Select from 'react-select'


export function AddFaq() {

  const history = useNavigate();

  useEffect(() => {
    bsCustomFileInput.init()

  }, [])



  const initData = {
    "question": "",
    "answer": "",
    "language": ""
  }

  const [formData, setFormData] = useState(initData)
  const [question, SetQuestion] = useState("");
  const [answer, SetAnswer] = useState("");
  const [language, SetLanguage] = useState("");



  var form = formData
  console.log("languagelanguage", language)
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

  const handlechange = async (e, type) => {

    // e.preventDefault();
    console.log("type", type);

    const { id, value } = e.target;
    console.log("value", value, "formdata", formData)
    //   let formdata = { ...formData, ...{ ["question"]: value } }
    //   console.log("formdata updated:",formdata)
    //  // setFormData(formdata);
    SetQuestion(value);
    // form.question=question;
    // console.log("Question",formData)
  }

  const onEditorChange = (description_text) => {
    SetAnswer(description_text)
  }


  const handleSubmit = async () => {
    var form = formData;
    form.question = question;
    form.answer = answer;
    form.language = language
    console.log("handle form : ", form)
    setFormData(form)
    console.log("Form Data : ", formData)
    var errors = {};
    if (!formData.question) {
      errors.question = "question cannot be empty"
      return toast.error("question cannot be empty")
    }

    if (!formData.answer) {
      errors.answer = "answer cannot be empty"
      return toast.error("answer cannot be empty")
    }

    if (Object.keys(errors).length == 0) {

      console.log("erro length", Object.keys(errors).length, formData)

      var payload = {
        question: formData.question,
        answer: formData.answer,
        languageType: formData.language,
        action: "add"
      }

      console.log("payload", payload)

      var resp = await addFaqCall(payload);
      if (resp?.status) {
        toast.success(resp.message)

        history("/faqlists")


      }
      else return toast.error(resp.message)

    }
  }

  const handlechangeLanguage = async (e, data) => {
    console.log("dghhhhhhhhhhhh", e, data)
    SetLanguage(e)
  }


  return (
    <>
      <Header title="Add Faq" />
      <div className='login__formHolder rounded-3 p-4 '>
        <div className='d-flex justify-content-end'>
          <button className='orange_primary_btn' type='button' onClick={() => history("/faqlists")} >Back</button>
        </div>
        <div className="row mt-2">
          <div className="col-12 col-sm-11 col-md-9 col-lg-8 col-xl-7 col-xxl-6">
            <div >
              {/* <div className='select_wrapper w-100'>
                <Select
                  classNamePrefix="custom_rct_slt"
                  // isSearchable={true}
                  // id='categoryId'
                  options={languageTypes}
                  onChange={(e) => handlechangeLanguage(e.value, "language")}
                />
              </div> */}
              <div className='rp_singleinput_holder mb-2 mt-4'>
                <p className='rp_label mb-2'>Name</p>
                <div className='rp_input_holder rp_max_width_unset rounded-2 py-2 px-3 d-flex justify-content-start align-items-center gap-2'>
                  <input type="text" className="rp_singleInput flex-grow-1" id="question" placeholder="Enter question" value={question} onChange={(e) => handlechange(e)} />
                </div>
              </div>
              <div className='rp_singleinput_holder mb-2 mt-4'>
                <p className='rp_label mb-2'>content</p>
                <div>
                  {
                    // formData?.answer&& 
                    <RichTextEditor
                      value={answer}
                      onChange={onEditorChange}
                    />}
                </div>
              </div>
              <div className='d-flex justify-content-start mt-4'>
                <button className='orange_primary_btn' type='button' onClick={() => handleSubmit()}>SUBMIT</button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  )

}


export default AddFaq;


