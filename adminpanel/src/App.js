import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom';
import Dashboard from './Screens/Dashboard';
import '../src/assets/css/Style.css'
import jwt_decode from "jwt-decode";

import ResetPassword from './Screens/ResetPassword';
import Profile from './Screens/Profile';
import Subscription from './Screens/Subscription';

import AddSubscription from './Screens/AddSubscription';
import Plans from './Screens/Plans';
import AddPlans from './Screens/AddPlans';
import Login from './Screens/Login';
import ForgotPassword from './Screens/ForgotPassword';

import isEmpty from "is-empty";
// lib
import { getAuthToken } from "./lib/localStorage";
// import constant

import { useDispatch } from 'react-redux';
// import  {toast,ToastContainer} from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import { PrivateRoute } from './PrivateRoutes';
import { AuthRoute } from './AuthRoute';
import TotalUsers from './Screens/TotalUsers';
import Groups from './Screens/Groups';
import Interests from './Screens/Category';
import TermsAndConditions from './Screens/TermsAndConditions';
import About from './Screens/About';
import PrivacyPolicy from './Screens/PrivacyPolicy';
import Category from './Screens/Category';
import SubCategory from './Screens/SubCategory';
import PlanDetails from './Screens/PlanDetails';
import Gender from './Screens/Gender';
import Emailupdatelists from './Screens/emailupdates/emailupdatelists'
import Sendemail from './Screens/emailupdates/sendemail'
import Addemailupdate from './Screens/emailupdates/addemailupdate'
import Editcms from "./Screens/Cms/editcms"
import Cmslists from "./Screens/Cms/cmslists"
import Addfaq from "./Screens/Faq/addfaq"
import Editfaq from "./Screens/Faq/editfaq"
import Listfaq from "./Screens/Faq/faqlists"
import HelpLists from './Screens/helplists';
import Feedbacklists from "./Screens/feedbacklists"
import EmailTemplateEdit from './Screens/emailtemplate/emailtemplateEdit';
import EmailTemplateList from './Screens/emailtemplate/emailtemplatelist';
import Userplan from './Screens/UserplanDetail/userplanlist'
import Eventlists from "./Screens/Events/eventlists"
import ReportList from "./Screens/Reportlist"
import AuthForgotPassword from './Screens/AuthForgotPassword';
import Groupcategory from './Screens/Groupcategorylist';
import HobbiesLists from './Screens/Hobbieslists';
import Privacy from "./Modals/Privacypolicy";
import DeletionAccount from "./Modals/DeleteAccount";
import Tables from "./Screens/drag"
function App() {

  // console.log=()=>{};
  // console.warning = ()=>{}
  // console.error=()=>{}
  // console.info =()=>{}

  const dispatch = useDispatch()
  useEffect(() => {

    let token = getAuthToken();
    if (!isEmpty(token)) {
      token = token.replace("Bearer ", "");
      const decoded = jwt_decode(token);
      console.log("decodeddecoded", decoded);
      if (decoded) {
        dispatch({
          type: "userdata",
          userdata: {
            isAuth: true,
            userId: decoded._id,
            email: decoded.email,
            name: decoded.name,
            hobby_limit: decoded.hobby_limit,
            eventimagelimit: decoded.eventImage_limit
          },
        });
      }
    }

  }, [])


  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={
          <AuthRoute >
            <Login />
          </AuthRoute >} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-Password' element={<AuthForgotPassword />} />
        <Route path='/privacy-policy' element={<Privacy />} />
        <Route path='/Deletion-account' element={<DeletionAccount />} />

        <Route path='/' element={<PrivateRoute />}>
          <Route path='/forgotPassword' element={<ForgotPassword />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/subscription' element={<Subscription />} />
          <Route path='/resetPassord' element={<ResetPassword />} />
          <Route path='/addSubscription' element={<AddSubscription />} />
          <Route path='/plans' element={<Plans />} />
          <Route path='/addPlans' element={<AddPlans />} />
          <Route path='/users' element={<TotalUsers />} />
          <Route path='/groups' element={<Groups />} />
          <Route path='/category' element={<Category />} />
          <Route path='/sub-category' element={<SubCategory />} />
          <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
          <Route path='/about' element={<About />} />
          <Route path='/privacypolicy' element={<PrivacyPolicy />} />
          <Route path='/plan-details' element={<PlanDetails />} />
          <Route path='/gender' element={<Gender />} />
          <Route path='/emailupdatelists' element={<Emailupdatelists />} />
          <Route path='/sendemail' element={<Sendemail />} />
          <Route path='/addemailupdate' element={<Addemailupdate />} />
          <Route path='/editcms' element={<Editcms />} />
          <Route path='/cmslists' element={<Cmslists />} />
          <Route path='/addfaq' element={<Addfaq />} />
          <Route path='/editfaq' element={<Editfaq />} />
          <Route path='/faqlists' element={<Listfaq />} />
          <Route path='/helplists' element={<HelpLists />} />
          <Route path='/feedbacklists' element={<Feedbacklists />} />
          <Route path='/emailtemplatelist' element={<EmailTemplateList />} />
          <Route path='/emailtemplateEdit/:slug' element={<EmailTemplateEdit />} />
          <Route path='/userplanlist' element={<Userplan />} />
          <Route path='/eventlists' element={<Eventlists />} />
          <Route path='/reportlist' element={<ReportList />} />
          <Route path='/Groupcategorylist' element={<Groupcategory />} />
          <Route path='/Hobbieslists' element={<HobbiesLists />} />

          <Route path='/Tables' element={<Tables />} />


        </Route>
      </Routes>


    </>
  );
}

export default App;