import React, { useRef, useState, useEffect } from 'react'
import Header from '../Components/Header'
import { Col, Container, Row } from 'react-bootstrap'
import Sidebar from '../Components/Sidebar'
import { useSelector, useDispatch } from 'react-redux'
import { FaRegUser, FaPeopleGroup } from "react-icons/fa6";
import CountUp from 'react-countup';
import { FaPlus, } from "react-icons/fa";
import { RiSecurePaymentLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { SlLike } from "react-icons/sl";
import { GetGroups, GetHobbies, GetTransactions, GetUsers } from '../api/cms';


function Dashboard() {

  const switcher = useSelector(state => state?.reducer?.switcher)
  const navigate = useNavigate();

  const [listPriceChart, setlistPriceChart] = useState({})

  const [chartData, setchartData] = useState([])
  const [lable, setlable] = useState()
  const [users, setUsers] = useState()
  const [groups, setGroups] = useState()

  const [interests, setInterests] = useState()

  const [transactions, setTransactions] = useState()

  useEffect(() => {

    getUsers();
    getGroups();
    getHobbies();
    getTransactions();
  }, [])




  const getUsers = async () => {
    try {
      let resp = await GetUsers()
      console.log("responses", resp);
      setUsers(resp?.data)
    } catch (error) {
      console.log("error");
    }
  }

  const getGroups = async () => {
    try {
      let resp = await GetGroups()
      console.log("responses", resp);
      setGroups(resp?.data)

    } catch (error) {
      console.log("error");
    }
  }
  const getHobbies = async () => {
    try {
      let resp = await GetHobbies()
      console.log("responses", resp);
      setInterests(resp?.data)

    } catch (error) {
      console.log("error");
    }
  }
  const getTransactions = async () => {
    try {
      let resp = await GetTransactions()
      setTransactions(resp?.data)

      console.log("responses", resp);
    } catch (error) {
      console.log("error");
    }
  }


  const handleTotalUserNavigate = () => {
    try {
      navigate('/users')

    } catch (error) {
      console.log("error", error)
    }
  }
  const handleTotalGroupNavigate = () => {
    try {
      navigate('/groups')

    } catch (error) {
      console.log("error", error)
    }
  }
  const handleInterestNavigate = () => {
    try {
      navigate('/Hobbieslists')

    } catch (error) {
      console.log("error", error)
    }
  }
  const handleTransactionsNavigate = () => {
    try {
      navigate('/userplanlist')

    } catch (error) {
      console.log("error", error)
    }
  }


  console.log("listPriceChart", listPriceChart, lable, chartData);

  return (
    <>
      <Header title="Dashboard" />
      <div div className='cn_dashboard ' >
        <div className='cn_dashboard_grid'>

          <div className='dashboard_box yellow p-3 rounded-3' onClick={handleTotalUserNavigate}>
            <div className='d-flex align-items-center justify-content-between '>
              <div className='cn_dashboard_icon_wrapper yellow'>
                <FaRegUser />
              </div>
              {/* <div className='dash_greenvalues d-flex justify-content-end align-items-center gap-2'>
                      <p className='dash_greentext'>10 %</p>
                      <img src={require('../assets/images/greenthunder.svg').default} className='img-fluid' />
                    </div> */}

            </div>

            <div className='mt-4'>
              <p className='mb-0 dash_title text-center'>Total Users</p>
              <p className='cn_dashboard_count yellow text-center mb-0'>
                <CountUp
                  // start={10423 - 300}
                  end={users}
                  duration={2.75}
                // separator=" "
                // decimals={4}
                // decimal=","
                // prefix="EUR "
                // suffix=" left"
                // onEnd={() => console.log('Ended! 👏')}
                // onStart={() => console.log('Started! 💨')}
                />
                {/* <FaPlus className='mb-1' /> */}
              </p>


            </div>


          </div>

          <div className='dashboard_box blue p-3 rounded-3' onClick={handleTotalGroupNavigate}>
            <div className='d-flex align-items-center justify-content-between '>
              <div className='cn_dashboard_icon_wrapper blue'>
                <FaPeopleGroup />
              </div>
              {/* <div className='dash_greenvalues d-flex justify-content-end align-items-center gap-2'>
                      <p className='dash_greentext'>30 %</p>
                      <img src={require('../assets/images/greenthunder.svg').default} className='img-fluid' />
                    </div> */}

            </div>

            <div className='mt-4'>
              <p className='mb-0 dash_title text-center'>Total Groups</p>
              <p className='cn_dashboard_count blue text-center mb-0'>
                <CountUp
                  // start={1245 - 300}
                  end={groups}
                  duration={2.75}
                // separator=" "
                // decimals={4}
                // decimal=","
                // prefix="EUR "
                // suffix=" left"
                // onEnd={() => console.log('Ended! 👏')}
                // onStart={() => console.log('Started! 💨')}
                />
                {/* <FaPlus className='mb-1' /> */}
              </p>


            </div>


          </div>
          <div className='dashboard_box violet p-3 rounded-3' onClick={handleInterestNavigate}>
            <div className='d-flex align-items-center justify-content-between '>
              <div className='cn_dashboard_icon_wrapper violet'>
                <SlLike />
              </div>
              {/* <div className='dash_greenvalues d-flex justify-content-end align-items-center gap-2'>
                      <p className='dash_redtext'>20 %</p>
                      <img src={require('../assets/images/decrease.svg').default} className='img-fluid' />
                    </div> */}

            </div>

            <div className='mt-4'>
              <p className='mb-0 dash_title text-center'>Hobbies</p>
              <p className='cn_dashboard_count violet text-center mb-0'>
                <CountUp
                  // start={32 - 25}
                  end={interests}
                  duration={2.75}
                // separator=" "
                // decimals={4}
                // decimal=","
                // prefix="EUR "
                // suffix=" left"
                // onEnd={() => console.log('Ended! 👏')}
                // onStart={() => console.log('Started! 💨')}
                />
                {/* <FaPlus className='mb-1' /> */}
              </p>


            </div>


          </div>

          <div className='dashboard_box green p-3 rounded-3' onClick={handleTransactionsNavigate}>
            <div className='d-flex align-items-center justify-content-between '>
              <div className='cn_dashboard_icon_wrapper green'>
                <RiSecurePaymentLine fontSize={20} />
              </div>
              {/* <div className='dash_greenvalues d-flex justify-content-end align-items-center gap-2'>
                      <p className='dash_greentext'>30 %</p>
                      <img src={require('../assets/images/greenthunder.svg').default} className='img-fluid' />
                    </div> */}

            </div>

            <div className='mt-4'>
              <p className='mb-0 dash_title text-center'>Transactions</p>
              <p className='cn_dashboard_count green text-center mb-0'>
                <CountUp
                  // start={7542 - 300}
                  end={transactions}
                  duration={2.75}
                // separator=" "
                // decimals={4}
                // decimal=","
                // prefix="EUR "
                // suffix=" left"
                // onEnd={() => console.log('Ended! 👏')}
                // onStart={() => console.log('Started! 💨')}
                />
                {/* <FaPlus className='mb-1' /> */}
              </p>


            </div>


          </div>
        </div>

      </div >
    </>
  )
}

export default Dashboard