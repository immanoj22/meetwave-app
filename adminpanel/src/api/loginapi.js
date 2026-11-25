// import config
import axios from 'axios';
// import { setAuthorization } from '../config/axios';
// import { setAuthToken } from '../lib/localStorage';
// import { decodeJwt } from '../actions/jsonWebToken';
import config from "../config/config"
import { axiosFunc } from '../config/common';
const jwttoken = localStorage.getItem("token")
console.log("jwttoken",jwttoken);
export const login = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/AdminUserLogin`,
            'data': data,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
    
            },
        })
      
        console.log("msggggggg", respData);
     
        return respData;
            

        
    } catch (err) {
        console.log(err, "login__err")
        return {
            status: false,
            message: err?.response?.data,
        }
    }

}