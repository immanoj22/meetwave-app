import axios from 'axios';
import config from "../config/config"
import { axiosFunc } from '../config/common';
const jwttoken = localStorage.getItem("token")
console.log("jwttoken_admin", jwttoken);


// export const sendSubscriberMail = async (data) => {
//     console.log("sklfs",data)
//   try { 
//       let respData = await axiosFunc({
//           'method': 'post',
//           'url': `${config.ADMIN_URL}/sendSubscribeMail`,
//           "headers":{
//             "Content-Type": 'application/json',

//         },
//         "data":data,
//       });

//     //   let response = Decryptdata(respData?.data)
//       return respData.data;
//   }catch (error) {
//     console.log('add token err',error)

//   }
// }

export const getCmslists = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.COMMON_URL}/cms/cmslist`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "params":data
            
        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}


export const getCmsEdit = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'POST',
            'url': `${config.COMMON_URL}/cms/cmsedit`,
            "headers": {
                "Content-Type": 'application/json',
                'Authorization': jwttoken
            },
            'data': data
        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}


export const getcmslistData = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'POST',
            'url': `${config.COMMON_URL}/cms/cmslistdata`,
            "headers": {
                "Content-Type": 'application/json',
                'Authorization': jwttoken
            },
            'data': data
        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

//faq
export const addFaqCall = async (data) => {
    console.log("token data", data)
    try {
        var resp = await axiosFunc({
            "method": "POST",
            "url": `${config.COMMON_URL}/cms/addfaq`,
            "headers": {
                "Content-Type": 'application/json',
                'Authorization': jwttoken
            },
            "data": data,
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}

export const getFaqContentsList = async () => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.COMMON_URL}/cms/getfaqcontentslist`,
            "headers": {
                "Content-Type": 'application/json',
                'Authorization': jwttoken
            },
        })
        console.log("tokonwer resp", resp.data)
        // let response = Decryptdata(resp?.data)

        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const addFaqcontentCall = async (data) => {
    console.log("token data", data)
    try {
        var resp = await axiosFunc({
            "method": "POST",
            "url": `${config.COMMON_URL}/cms/addfaqcontent`,
            "headers": {
                "Content-Type": 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}

export const getFaqList = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.COMMON_URL}/cms/getfaqlist`,
            "headers": {
                "Content-Type": 'application/json',
                'Authorization': jwttoken
            },
            "params":data
        })
        console.log("tokonwer resp", resp.data)
        // let response = Decryptdata(resp?.data)

        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const GetUsers = async () => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/GetUsers`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
        })
        console.log("tokonwer resp", resp.data)
        // let response = Decryptdata(resp?.data)

        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const GetGroups = async () => {
console.log("JwtTokens",jwttoken);
    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/GetGroups`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
        })
        console.log("tokonwer resp", resp.data)
        // let response = Decryptdata(resp?.data)

        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const GetHobbies = async () => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/GetHobbies`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
        })
        console.log("tokonwer resp", resp.data)
        // let response = Decryptdata(resp?.data)

        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const GetTransactions = async () => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/GetTransactions`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
        })
        console.log("tokonwer resp", resp.data)
        // let response = Decryptdata(resp?.data)

        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const Hobbieslimit = async (data) => {
    console.log("token data", data)
    try {
        var resp = await axiosFunc({
            "method": "POST",
            "url": `${config.ADMIN_URL}/AdminHobbylimit`,
            "headers": {
                "Content-Type": 'application/json',
            'Authorization': jwttoken
            },
            "data": data
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}

export const GetAdmindata = async (data) => {
    console.log("token data", data)
    try {
        var resp = await axiosFunc({
            "method": "GET",
            "url": `${config.ADMIN_URL}/GetAdmindata`,
            "headers": {
                "Content-Type": 'application/json',
                'Authorization': jwttoken
            },
            "params": data
       
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}

export const EventImagelimit = async (data) => {
    console.log("EventImagelimit", data)
    try {
        var resp = await axiosFunc({
            "method": "POST",
            "url": `${config.ADMIN_URL}/AdminHobbylimit`,
            "headers": {
                "Content-Type": 'application/json',
            'Authorization': jwttoken
            },
            "data": data
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}
//hobbies re-order axios

export const HobbiesRearrange = async (data) => {
    console.log("EventImagelimit", data)
    try {
        var resp = await axiosFunc({
            "method": "POST",
            "url": `${config.ADMIN_URL}/HobbiesUpdateRearrange`,
            "headers": {
                "Content-Type": 'application/json',
            'Authorization': jwttoken
            },
            "data": data
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}

export const CategorieslistRearrange = async (data) => {
    console.log("CategorieslistRearrange", data)
    try {
        var resp = await axiosFunc({
            "method": "POST",
            "url": `${config.ADMIN_URL}/CategorieslistUpdateRearrange`,
            "headers": {
                "Content-Type": 'application/json',
            'Authorization': jwttoken
            },
            "data": data
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}

export const SubcategorylistRearrange = async (data) => {
    console.log("SubcategorylistRearrange", data)
    try {
        var resp = await axiosFunc({
            "method": "POST",
            "url": `${config.ADMIN_URL}/SubcategorylistUpdateRearrange`,
            "headers": {
                "Content-Type": 'application/json',
            'Authorization': jwttoken
            },
            "data": data
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}

export const getAdminDetails = async (data) => {
    console.log("token data", data)
    try {
        var resp = await axiosFunc({
            "method": "GET",
            "url": `${config.ADMIN_URL}/GetAdmindata`,
            "headers": {
                "Content-Type": 'application/json',
                'Authorization': "skip"
            },
            "params": data
       
        })

        // let response = Decryptdata(resp?.data)
        return resp?.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}