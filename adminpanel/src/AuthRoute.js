
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken } from './lib/localStorage';
import isEmpty from 'is-empty';

export function AuthRoute({ children }) {
console.log("dsfdgfdrtgy",children)
  // the user verification logic is up to your application
  // this is an example based on your code above 
  const rememberMe = localStorage.getItem('token');
  console.log("rememberMe",rememberMe)

     if (!isEmpty(rememberMe)) {
      return <Navigate to={'/login'} />;
      }
  if (isEmpty(rememberMe)) {
    // render the wrapped page
    return children;
  }
  else {
    // user not logged in, redirect to the Login page which is unprotected
    return <Navigate to={'/dashboard'} />;
  }
}