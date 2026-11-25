import React, { Component, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Col, Container, Pagination, Row } from "react-bootstrap";
import { Button, ProgressBar, } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Sidebar from '../../Components/Sidebar';
import ReactDatatable from '@ashvin27/react-datatable';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Header from "../../Components/Header";
import { LuSearch } from "react-icons/lu";


import 'react-toastify/dist/ReactToastify.css';
import { Getuserlists, changeMaySent, getSubscribers } from '../../api/api';

// import EditCms from '../cmscontent/editcms.js'

// import * as tokenFunctions from '../../axioscalls/token.js'
// import * as userFunctions from '../../axioscalls/user.js'

// import wallet_details from '../../redux/action';
// import config from '../../lib/config.js';

// toast.configure();


export default function CmsList(props) {

  var location = useLocation();
  const { pathname, state } = location;
  const path = pathname.split("/")[1]
  console.log("pathname,stae", pathname, state, path)

  const [subscriberList, setSubscriberList] = useState([])
  const [allcheck, setAllcheck] = useState(false);
  const [MailUsers, setMailUsers] = useState([])
  const [searchUser, setSearchUser] = useState("")
  console.log("searchUser", searchUser)
  const [limit, setLimit] = useState(5)
  const [currentpage, setCurrentPage] = useState(1)
  const [totalCount, settotalCount] = useState(0)
  const columns = [
    // {
    //   key: 'select',

    //   className: "text-center w_100",
    //   align: "center",
    //   sortable: false,
    // },
    {
      key: "select",
      text: <div className='d-flex align-items-center justify-content-center gap-2'>
        <input type="checkbox" className='selectall ml-2' checked={allcheck} onChange={(e) => setMaySent(e)} />
        Select all
      </div>,
      className: "text-center w_100",
      align: "center",
      // sortable: true,
      cell: record => (
        <>
          {console.log("recordslogs", record)}

          <div>
            <input type="checkbox" checked={record.maySent} onClick={() => setMaySent(record)} />
          </div>
        </>
      )
    },

    {
      key: "S.No",
      text: "S.No",
      className: "text-center w_100",
      align: "center",
      sortable: true,
      cell: (record, index) => index + 1

    },
    {
      key: "email",
      text: "Subscriber Mail",
      className: "text-center w_100",
      align: "center",
      sortable: true,


    },
  ]

  useEffect(() => {
    getSubscriberList();
  }, [searchUser])


  const getSubscriberList = async (page = 1, limit = 5) => {
    let payload;
    if (searchUser) {
      payload = { email: searchUser }
    }
    else {
      payload = {
        page: page || 1,
        limit: limit || 5
      }
    }

    var resp = await getSubscribers(payload);
    console.log("dffgemmaa", resp)
    if (resp?.status) {
      setSubscriberList(resp.data)
      settotalCount(resp.count)
      setCurrentPage(page)

    }
  }


  const setMaySent = async (data) => {
    console.log("sdfdffffffffff", data)
    setMailUsers(data)
    if (data?.target) {
      if (subscriberList.length > 0) {
        console.log('kdhhgkdjkgd', data.target, data.target.checked)

        var resp = await changeMaySent({ all: data.target.checked });
        console.log("maysend", resp);
        if (resp?.status) {
          setAllcheck(!allcheck)
          console.log("resp success")
          toast.success(resp?.message)
          setTimeout(() => {
            getSubscriberList();
          }, 1000);
        }
        else
          toast.error(resp.message)
      } else {
        toast.error("Subscribers are not yet")
      }
    } else {
      var payload = {
        email: data.email,
        maySent: !data.maySent
      }

      var resp = await changeMaySent(payload);
      console.log("sdsads", resp);
      if (resp?.status) {

        console.log("resp success")
        toast.success(resp?.message)
        setTimeout(() => {
          getSubscriberList();
        }, 1000);
      }
      else
        toast.error(resp.message)
    }

  }

  const config = {
    page_size: 10,
    length_menu: [10, 20, 50],
    filename: "Emailtemplates",
    no_data_text: "No Email Templates found!",
    language: {
      length_menu: "Show _MENU_ result per page",
      filter: "Filter in records...",
      info: "Showing _START_ to _END_ of _TOTAL_ records",
      pagination: {
        first: "First",
        previous: "Previous",
        next: "Next",
        last: "Last",
      },
    },
    show_length_menu: false,
    show_filter: false,
    show_pagination: false,
    show_info: false,
  };
  const extraButtons = [
    {
      className: "btn btn-primary buttons-pdf",
      title: "Export TEst",
      children: [
        <span>
          <i
            className="glyphicon glyphicon-print fa fa-print"
            aria-hidden="true"
          ></i>
        </span>,
      ],
      onClick: (event) => {
        console.log(event);
      },
    },
    {
      className: "btn btn-primary buttons-pdf",
      title: "Export TEst",
      children: [
        <span>
          <i
            className="glyphicon glyphicon-print fa fa-print"
            aria-hidden="true"
          ></i>
        </span>,
      ],
      onClick: (event) => {
        console.log(event);
      },
      onDoubleClick: (event) => {
        console.log("doubleClick");
      },
    },
  ];
  const pagination = [1, 2, 3, 4, 5];

  return (

    <>
      <Header title="Email Update List" />

      <div className=''>
        <div className="page-header">
          <nav aria-label="breadcrumb">
          </nav>
        </div>
        <h4 className="cmn_modal_title">SUBSCRIBERS LIST</h4>
        <div>
          {/* <div><Link to="/addemailupdate">
                    <button className='btn mt-0 mb-4 allbtn'>Add Bulk Users</button>
                  </Link></div> */}

          {subscriberList.length > 0 ?
            <div className='mt-3'>
              <Link to="/sendemail">
                <button className='orange_primary_btn' type='button'>Send Mail</button>
              </Link>
            </div>
            :

            <button className='orange_primary_btn' type='button'>Send Mail
            </button>
          }

        </div>
        <div className="table-responsive mt-2">

          <div className=" mt-4">
            <div className="exchange_table_holder dashboard_box rounded-3">
              <div className='d-flex align-items-center justify-content-end my-3 me-3'>
                <div className='search_wrapper'>
                  <LuSearch color='#fff' />
                  <input
                    placeholder='Filter in Search Email...'
                    id="subcategoryname"
                    onChange={(e) => { setSearchUser(e.target.value) }}
                  />
                </div>
              </div>
              <ReactDatatable
                records={subscriberList}
                columns={columns}
                config={config}
                extraButtons={extraButtons}
              />
            </div>
          </div>
        </div>
        <div className='primaryPagination mt-4'>

          <Pagination>
            <Pagination.Prev onClick={() => { getSubscriberList(currentpage - 1, limit) }} disabled={currentpage === 1 ? true : false} />
            {
              pagination.map((pg, i) => (
                <Pagination.Item active={pg === currentpage} onClick={() => { getSubscriberList(pg, limit) }}>{pg}</Pagination.Item>
              ))
            }
            <Pagination.Next onClick={() => { getSubscriberList(currentpage + 1, limit) }}
              disabled={(totalCount / limit) > currentpage ? false : true}
            />
          </Pagination>
        </div>
      </div>
    </>

  )

}


