import axios from 'axios';
import config from "../config/config"
import { AppenData, DecryptData, EncryptData } from '../config/common';
const jwttoken = localStorage.getItem("token")
console.log("jwttoken", jwttoken);
export const Adminchangepwd = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axios({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/changepassword`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data":{data:EncryptData(data)} ? {data:EncryptData(data)} :data
          
        })
        console.log("respData", respData.data);
        let response = DecryptData(respData.data) ?DecryptData(respData.data) :respData.data
        return response;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const verifyEmail = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axios({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/verifyEmail`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data":{data:EncryptData(data)} ? {data:EncryptData(data)} :data
          
        })
        console.log("respData", respData.data);
        let response = DecryptData(respData.data) ?DecryptData(respData.data) :respData.data
        return response; 
    



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const Getadminprofile = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axios({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/Getadminprofile`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            // "data":data
          
        })
        console.log("respData", respData.data);
        let response = DecryptData(respData.data) ?DecryptData(respData.data) :respData.data
        return response;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const Editadminprofile = async (data) => {
    console.log("datadatadatadata", data);

    try {
        var formdata = AppenData(data)
        const respData = await axios({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/Editadminprofile`,
            "headers": {
               
                'Content-Type': 'multipart/form-data',
                'Authorization': jwttoken
            },
            // "data":{data:EncryptData(data)} ? {data:EncryptData(data)} :data
            "data":formdata[0]
          
        })
        console.log("respData", respData.data);
        let response = DecryptData(respData.data) ?DecryptData(respData.data) :respData.data
        return response;




    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}