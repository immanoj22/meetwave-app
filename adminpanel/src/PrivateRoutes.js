import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Col, Container, Row } from "react-bootstrap";
import React from 'react';
import isEmpty from 'is-empty';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';


export function PrivateRoute() {

  // the user verification logic is up to your application
  // this is an example based on your code above 
  const loggedin = useSelector(state => state.loggedin);
  const rememberMe = localStorage.getItem('token');

  //    if (!isEmpty(rememberMe)) {
  //     return <Navigate to={'/home'} />;
  //     }
  if (!isEmpty(rememberMe)) {
    // render the wrapped page
    return (
      <>
        <Container fluid className="common_bg position-relative px-0">
          <div className="liner"></div>
          <div className='layout_container'>
            <Sidebar />
            {/* <Header /> */}
            <div className='layout_right'>
              <Outlet />
            </div>
          </div>
        </Container >
      </>
    )
  }
  else {
    // user not logged in, redirect to the Login page which is unprotected
    return <Navigate to={'/'} />;
  }
}