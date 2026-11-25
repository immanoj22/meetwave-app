
import {
  setDefaults,
  fromAddress,
  fromLatLng,
  setKey

} from "react-geocode";
import crypto from 'crypto-js'
import config from "./config"
import axios from 'axios';

export const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0);


export const GetAddressBasedOnLatLng = async ({ lat, lng, key }) => {

  console.log("GetAddressBasedOnLatLng", lat, lng, key);
  try {
    // let datas = setKey(key)
    // console.log("data",datas);
    var { results } = await fromLatLng(lat, lng, key)
    console.log("resultsss", results);
    var add = {},
      stret = {};
    await results[0].address_components.map((inArea) => {
      if (inArea?.types?.includes("street_number")) {
        add.Doornumber = inArea?.long_name;
      }
      if (inArea?.types?.includes("route")) {
        add.Street = inArea?.long_name;
      }
      if (inArea?.types?.includes("locality")) {
        stret.Street2 = inArea?.long_name;
      }
      if (inArea?.types?.includes("administrative_area_level_2")) {
        add.City = inArea?.long_name;
      }
      if (inArea?.types?.includes("administrative_area_level_3")) {
        add.City = inArea?.long_name;
      }
      if (inArea?.types?.includes("administrative_area_level_1")) {
        add.State = inArea?.long_name;
      }
      if (inArea?.types?.includes("country")) {
        add.Area = inArea?.long_name;
      }
      if (inArea?.types?.includes("postal_code") || inArea.types.includes("post_code")) {
        add.Zipcode = inArea?.long_name;
      }

      return add;
    });
    console.log("resultsaaaaendd", add, results[0]?.formatted_address)
    return results[0].formatted_address
    // return add
  }
  catch (e) {
    console.log('resultsaaaaerror', e)
    return false
  }

};


export const AppenData = (data) => {
  var formdata = new FormData()
  var SendDta = Object.entries(data).map((item) => {
    if (Array.isArray(item[1])) {
      var come = item[1].map((data) => {
        if (data?.type && data?.size) {
          //file
          formdata.append(item[0], data)
        }
        else {
          formdata.append(item[0], EncryptData(data))

        }
        return formdata
      })
      return come

    }
    else {
      if (item[1]?.type && item[1]?.size) {
        //file type
        formdata.append(item[0], item[1])
      }
      else {
        formdata.append(item[0], EncryptData(item[1]))

      }
      return formdata
    }
  })
  return SendDta
}


export const EncryptData = (data) => {
  try {

    if (typeof (data) == 'string') {
      return crypto.AES.encrypt(data, config.SECRET_KEY).toString();

    }
    else {
      return crypto.AES.encrypt(JSON.stringify(data), config.SECRET_KEY).toString();
    }
  }
  catch (error) {

    return false;
  }

}

export const DecryptData = (data) => {
  console.log("dataasssssssss", data, config.SECRET_KEY, config.DecryptKey);

  try {
    var bytes = crypto.AES.decrypt(data, config.DecryptKey);
    var decryptedData;
    try {
      decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));
    }
    catch (err) {
      console.log('catchhh1111errorrr', err)

      try {
        decryptedData = bytes.toString(crypto.enc.Utf8);
        console.log('decryptedData66666666666', decryptedData)

      }
      catch (dcpterr) {
        console.log("dddddddddddddddddddddddddd", dcpterr);
        return false;
      }
    }
    console.log("decryptedData", decryptedData);
    return decryptedData;
  }
  catch (error) {

    return false;
  }
}

export function formatTime(date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format, handle midnight as 12
  hours = String(hours).padStart(2, '0'); // Ensure two digits
  return `${hours}:${minutes} ${ampm}`;
}

export const axiosFunc = async (data) => {
  console.log("dafasfasfafa", JSON.stringify(data));
  try {
    let Resp = {};
    // if(false){
    if (data?.params) {
      data.params = { data: EncryptData(data.params) }
    }
    else if (data?.data) {
      if (!(data?.data instanceof FormData)) {
        data.data = { data: EncryptData(data.data) }
      }
    }
    // }
    Resp = await axios(data)

    if (Resp?.data) {
      Resp.data = (typeof (DecryptData(Resp.data)) == 'string' && DecryptData(Resp.data) == '') ? Resp.data : DecryptData(Resp.data)
    }


    return Resp;
  }
  catch (e) {

    return { success: 'error', msg: null }
  }
}

export const formatDate = async (date) =>{
  const dob = new Date(date);

const day = dob.getDate() < 10 ? `0${dob.getDate()}` : dob.getDate();
const month = dob.getMonth() + 1 < 10 ? `0${dob.getMonth() + 1}` : dob.getMonth() + 1;
const year = dob.getFullYear();

// Return formatted date (e.g., "dd-mm-yyyy")
return `${day}-${month}-${year}`;

}
// export const jwttoken = async () => {
//   try {
//     const jwtToken = localStorage.getItem("token")
//     console.log("jwttoken_func",jwtToken);
//     return jwtToken;

//   } catch (error) {
//     return { success: 'error', msg: null }
//   }
// }