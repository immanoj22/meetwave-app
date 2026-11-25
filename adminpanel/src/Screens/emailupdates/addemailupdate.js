import React, { Component, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config/config.js'

import { Button, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Sidebar from '../../Components/Sidebar.js';
import ReactDatatable from '@ashvin27/react-datatable';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';
// import excel from '../../assets/excel/mail.xlsx'

import { addbulkusers } from '../../api/api.js';
import { isEmpty } from '../../config/common.js';




export default function Addbulkusrs() {

    const history = useNavigate();

    const [file, setFile] = useState({})
    // const exceldata=[{email : "test@gmail.com"},{email : "test1@gmail.com"},{email :"test2@gmail.com"},{email : 'test3@gmail.com'}]
    //   var location = useLocation();
    //   const{pathname,state}=location;
    //   const path = pathname.split("/")[1]
    //   console.log("pathname,stae",pathname,state,path)


    //   const Wallet_Details = useSelector((state)=>state.wallet_detail)
    //   const [subscriberList,setSubscriberList] = useState([])


    // const columns = [

    //   {
    //     key: "email",
    //     text: "subscriber mail",
    //     className: "NFT NAME",
    //     align: "left",
    //     sortable: true,


    //   },

    //   {
    //     key: "select",
    //     text: "select subscribers",
    //     className: "NFT NAME",
    //     align: "left",
    //     sortable: true,
    //     cell : record =>
    //     <div><input type="checkbox" checked={record.maySent} onClick={()=>setMaySent(record)}/></div>


    //   },





    // ]

    // const downloadTxtFile = () => {
    //     const element = document.createElement("a");
    //     const file = new Blob([document.getElementById("input").value], {
    //       type: "text/plain;charset=utf-8}"
    //     });
    //     element.href = "./Files/one.csv";
    //     element.download = "one.csv";
    //     element.click();
    //   };

    const onChangehandler = async (e) => {
        var file = e.target.files[0]
        console.log(file, "file")
        setFile(file)
    }


    const addusers = async () => {
        console.log("fileeeee", file)
        if (isEmpty(file)) {
            var formdata = new FormData()
            formdata.append("excel", file)
            var resp = await addbulkusers(formdata);
            console.log("rerererererere", resp);

            if (resp?.status) {
                toast.success(resp?.message)
                setFile({})
                setTimeout(() => {
                    history('/emailupdatelists')
                }, 1000);
            }
            else {
                toast.error(resp?.message)
            }
        }
        else {
            toast.error("Please Select the File")
        }


    }

    return (

        <>

            <div>
                <div className="page-header">
                    <button className='btn mt-2 allbtn' type='button' onClick={() => history('/emailupdatelists')} >Back</button>
                    <nav aria-label="breadcrumb">
                    </nav>
                </div>
                <div className="row">

                    <div className="col-lg-12 grid-margin stretch-card">

                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">ADD USERS</h4>
                                <input type="file" className='btn mt-2 allbtn' onChange={(e) => {
                                    onChangehandler(e)
                                }} style={{ flexDirection: 'row-reverse', }} />

                                {/* <div>
                <p>Example File</p>
                <a download href={excel} > Download excel </a>
             </div> */}

                                <div className="table-responsive">
                                    <button className='btn mt-2 allbtn' onClick={() => addusers()} >Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>



        </>

    )

}
