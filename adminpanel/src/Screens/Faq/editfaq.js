import React, { Component, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
// import DatePicker from "react-datepicker";
import bsCustomFileInput from 'bs-custom-file-input';

import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import RichTextEditor from '../../Components/RichTextEditor';
import { addFaqCall } from '../../api/cms';




export function EditFaqModal(props) {
  console.log("dfgdgdf", props);
  const history = useNavigate();

  const { faq } = props;
  console.log(faq, "faqqq")

  // useEffect(()=>{
  //     bsCustomFileInput.init()

  // },[])


  useEffect(() => {
    setFormData(faq)
    setAnswer(faq?.answer)
    setQuestion(faq?.question)
    setId(faq?._id)

  }, [])


  const onEditorChange = (description_text) => {
    setAnswer(description_text)
  }
  const initData = {
    "question": "",
    "answer": ""
  }

  const [formData, setFormData] = useState(initData)
  const [Answer, setAnswer] = useState('')
  const [question, setQuestion] = useState("")
  const [id, setId] = useState("")







  const handlechange = async (e) => {
    try {
      e.preventDefault();
      const { id, value } = e.target;
      setQuestion(value)
    } catch (err) {
      console.log(err, 'handlechange__er')
    }
  }

  const handleSubmit = async () => {
    var errors = {};

    if (!formData.answer) {
      errors.answer = "answer cannot be empty"
      return toast.error("answer cannot be empty")
    }

    if (Object.keys(errors).length == 0) {

      console.log("erro length", Object.keys(errors).length, formData)

      var payload = {
        id: id,
        question: question,
        answer: Answer,
        action: "edit"
      }

      console.log("payload", payload)

      var resp = await addFaqCall(payload);
      if (resp?.status) {
        toast.success(resp.message)
        setTimeout(() => {
          history("/faqlists")
        }, 1000);

      }
      else return toast.error(resp.message)

    }
  }






  return (
    <div>

      <div className="row">

        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <button className='btn mb-3 allbtn' type='button' onClick={() => history("/faqlists")} >Back</button>

              <h4 className="card-title mt-3">EDIT FAQ</h4>
              <form className="forms-sample">
                <Form.Group>
                  <label htmlFor="exampleInputName1">question</label>
                  <Form.Control type="text" className="form-control" id="question" value={question} onChange={(e) => handlechange(e)} />
                </Form.Group>
                <Form.Group>
                  <label htmlFor="exampleInputName1">content</label>
                  {
                    // Answer &&
                    <RichTextEditor
                      value={Answer}
                      onChange={onEditorChange}
                      editorKey={id}
                    />}
                </Form.Group>



              </form>
              <button className='btn mb-2 allbtn' type='button' onClick={() => handleSubmit()}>SUBMIT</button>

            </div>
          </div>
        </div>

      </div>
    </div>
  )

}

export default EditFaqModal;
