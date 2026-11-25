import React, { useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'
import SubscriptionCard from '../Components/SubscriptionCard'
import ReactDatatable from '@ashvin27/react-datatable';
import { NavLink } from 'react-router-dom'

function Subscription() {
    const [subscriptData, setSubsciptData] = useState([
        {
            price: 24,
            days: 90,
            blueCheck: require('../assets/images/bluecheck.svg'),
            greenCheck: require('../assets/images/greencheck.svg'),
            contents: [
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
            ]
        },
        {
            price: 10,
            days: 30,
            blueCheck: require('../assets/images/bluecheck.svg'),
            greenCheck: require('../assets/images/greencheck.svg'),
            contents: [
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
                {
                    title: 'Lorem ipsum dolor sit amet, consetetur'
                },
            ]
        }
    ])


    const state = {
        records: [
            {
                'id': <p className='exchange_table_values text-center'>1</p>,
                "provider": <p className='exchange_table_values text-center'>Provider</p>,
                "subscriptions": <p className='exchange_table_values text-center'>Premium Plan</p>,
                "paymentId": <p className='exchange_table_values text-center'>KI451354AGTU</p>,
                "plan": <div>
                    <p className='subsciption_table_greenText text-center mb-1'>$24</p>
                    <p className='exchange_table_values text-center'>90 Days</p>
                </div>,
                "total": <p className='subsciption_table_greenText text-center mb-1'>$24</p>,
                "status": <div className='text-center'><button className='subs_table_greenBtn rounded-2'>Paid</button></div>,
                "cancelled": <div className='text-center'><button className='subs_table_redBtn rounded-2'>No</button></div>,

            },
            {
                'id': <p className='exchange_table_values text-center'>1</p>,
                "provider": <p className='exchange_table_values text-center'>Provider</p>,
                "subscriptions": <p className='exchange_table_values text-center'>Premium Plan</p>,
                "paymentId": <p className='exchange_table_values text-center'>KI451354AGTU</p>,
                "plan": <div>
                    <p className='subsciption_table_greenText text-center mb-1'>$24</p>
                    <p className='exchange_table_values text-center'>90 Days</p>
                </div>,
                "total": <p className='subsciption_table_greenText text-center mb-1'>$24</p>,
                "status": <div className='text-center'><button className='subs_table_greenBtn rounded-2'>Paid</button></div>,
                "cancelled": <div className='text-center'><button className='subs_table_redBtn rounded-2'>No</button></div>,

            },

        ]
    }

    const columns = [
        {
            key: "id",
            text: "Id",
            className: "id",
            align: "center",
            sortable: false,
        },
        {
            key: "provider",
            text: "Provider",
            className: "provider",
            align: "center",
            sortable: false,
        },
        {
            key: "subscriptions",
            text: "Subscriptions",
            className: "subscriptions",
            align: "center",
            sortable: false,
        },
        {
            key: "paymentId",
            text: "Payment ID",
            className: "paymentId",
            align: "center",
            sortable: false,

        },
        {
            key: "plan",
            text: "Plan",
            className: "plan",
            align: "center",
            sortable: false,

        },
        {
            key: "total",
            text: "Total",
            className: "total",
            align: "center",
            sortable: false,

        },
        {
            key: "status",
            text: "Status",
            className: "status",
            align: "center",
            sortable: false,

        },
        {
            key: "cancelled",
            text: "Is Cancelled ?",
            className: "cancelled",
            align: "center",
            sortable: false,

        },
        //    {
        //         key: "action",
        //         text: "Action",
        //         className: "activity",
        //         align: "center",
        //         sortable: false,
        //         cell : (style) => {
        //             return (
        //                 <p className='exchange_activity text-center'><i class="fa-solid fa-eye"/></p>
        //             )
        //         }
        //     },
    ];

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
                    <i className="glyphicon glyphicon-print fa fa-print" aria-hidden="true"></i>
                </span>
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
                    <i className="glyphicon glyphicon-print fa fa-print" aria-hidden="true"></i>
                </span>
            ],
            onClick: (event) => {
                console.log(event);
            },
            onDoubleClick: (event) => {
                console.log("doubleClick")
            }
        },
    ]
    return (
        <>
            <Header title="Subscription" />
            <div className='common_page_scroller pe-2'>
                <Row>
                    <div className='text-end mb-4'>
                        <NavLink to='/addSubscription' className="sidebar_links">
                            <button className='orange_small_primary'>Add</button>
                        </NavLink >
                    </div >
                    {
                        subscriptData.map((item) =>
                            <Col xxl={3} lg={4} sm={6} className='mb-3 mb-sm-0'>
                                <SubscriptionCard data={item} />
                            </Col>
                        )
                    }
                </Row >

                <div className='mt-4'>
                    <p className='dash_valuewhite_text'>Subscription History</p>
                    <div className='exchange_table_holder dashboard_box rounded-3 mt-4 mb-4'>
                        <ReactDatatable
                            config={config}
                            records={state.records}
                            columns={columns}
                            extraButtons={extraButtons}
                        />
                    </div>
                </div>

            </div >
        </>
    )
}

export default Subscription