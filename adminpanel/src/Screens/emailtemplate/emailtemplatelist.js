import React, { Component, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


import ReactDatatable from '@ashvin27/react-datatable';

import { EmailTemplateEdit } from './emailtemplateEdit.js';
import { getemailTemplateList } from '../../api/api.js';
import { Col, Container, Pagination, Row } from 'react-bootstrap';
import Header from '../../Components/Header.js';
import Sidebar from '../../Components/Sidebar.js';
import { sanitizeHtml } from '../../lib/sanitizeHtml';


export default function EmailTemplateList(props) {


  const navigate = useNavigate();
  var location = useLocation();
  console.log("locations", location);
  const { pathname, state } = location;
  const path = pathname.split("/")[1]
  console.log("pathname,stae", pathname, state, path)
  const [limit, setLimit] = useState(5)
  const [currentpage, setCurrentPage] = useState(1)
  const [totalCount, settotalCount] = useState(0)

  const [emailTemplateList, setEmailTemplateList] = useState([])


  const userInfo = (record) => {
    console.log("useRres", record);
    navigate(`/emailtemplateEdit/${record.Type}`, { state: record });
  }

  const columns = [
    {
      key: "",
      text: "S.no",
      className: "text-center w_80",
      align: "center",
      sortable: true,
      cell: (record, index) =>
        <div>{index + 1}
        </div>

    },
    {
      key: "Type",
      text: "Type",
      className: "text-center w_150 default_font",
      align: "center",
    },
    {
      key: "Content",
      text: "Content",
      className: "text-center w_500 html_div",
      align: "center",
      cell: record => (
        record.Content.length > 80 ?
          <div className='d-flex align-items-center justify-content-center gap-2'
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(record.Content.slice(0, 80) + "...") }}></div>
          :
          <div className='d-flex justify-content-center emailTemplateContent' dangerouslySetInnerHTML={{ __html: sanitizeHtml(record.Content) }}></div>

      )
    },


    {
      key: "Edit",
      text: "Edit",
      className: "text-center w_130",
      align: "center",
      cell: record =>
        <di>{console.log("records", record)}<button className='orange_small_primary ' onClick={() => userInfo(record)} >Edit</button></di>
    },

  ]

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

  useEffect(() => {
    getUsers();
  }, [])

  const getUsers = async (page = 1, limit = 5) => {
    let payload = {
      page: page || 1,
      limit: limit || 5
    }
    var resp = await getemailTemplateList(payload);
    console.log("responsesss", resp);
    if (resp.data) {
      setEmailTemplateList(resp.data);
      settotalCount(resp.count)
      setCurrentPage(page)
    }
  }

  const pagination = [1, 2, 3, 4, 5];


  return (

    <>
      <Header title="Email Template List" />
      <div className=''>
        <div className="page-header">
          <nav aria-label="breadcrumb">
          </nav>
        </div>
        <div className="common_page_scroller mt-4">
          <div className="exchange_table_holder dashboard_box rounded-3">
            <ReactDatatable
              config={config}
              records={emailTemplateList}
              columns={columns}
              extraButtons={extraButtons}
            />
          </div>
        </div>
        <div className='primaryPagination mt-4'>

          <Pagination>
            <Pagination.Prev onClick={() => { getUsers(currentpage - 1, limit) }} disabled={currentpage === 1 ? true : false} />
            {
              pagination.map((pg, i) => (
                <Pagination.Item active={pg === currentpage} onClick={() => { getUsers(pg, limit) }}>{pg}</Pagination.Item>
              ))
            }
            <Pagination.Next onClick={() => { getUsers(currentpage + 1, limit) }}
              disabled={(totalCount / limit) > currentpage ? false : true}
            />
          </Pagination>


        </div>
      </div>
    </>

  )

}
