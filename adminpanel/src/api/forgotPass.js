// import config
import axios from 'axios';
import config from "../config/config"
import { axiosFunc } from '../config/common';
const jwttoken = localStorage.getItem("token")
console.log("jwttoken", jwttoken);

// export const sendForgotMail = async (data) => {
//     console.log("datadatadatadata", data);

//     try {
//         const respData = await axios({
//             'url': `/admin/ForgotSend-mail`,
//             'method': 'post',
//             data
//         })
//         console.log("respDatadata",respData);
      
//         return {
//             status: respData.data.status,
//             message: respData.data.message,
//             result: respData.data.result
//         }
//     } catch (err) {
//         console.log(err, "login__err")
//         return {
//             status: 'error',
//             message: err.response,
//         }
//     }

// }
// export const ForgotPasswords = async (data) => {
//     console.log("datadata",data);
//     try {
//         let respData = await axios({
//             'method': 'post',
//             'url': `/admin/forgot-password`,
//             data

//         });

//         return {
//             status: respData.data.status,
//             loading: false,
//             message: respData.data.message,
//             result: respData.data.result,
//             error: respData.data.errors
//         }
//     } catch (err) {
//         return {
//             status: 'error',
//             message: err.response,
//         }
//     }
// }


export const Adminforgetpwd = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/ForgetPassword`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': "skip"

            },
            "data":data
          
        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const verifyEmail = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/verifyEmail`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': "skip"
            },
            "data":data
          
        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}