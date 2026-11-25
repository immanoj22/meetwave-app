import Axios from "axios";
import { Apiroutes } from "./constant";
import { GetItem } from "./localstorage";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { EncryptData, DecryptData, AppendData } from "./encrypt";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import RNFS from 'react-native-fs';
import { showwarningmessage } from "./config";
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CameraRoll from "@react-native-camera-roll/camera-roll";

const token = GetItem("Authtoken")
const Language = GetItem("CurrentLanguage")


console.log("UserLanguage ==> ", Language)

export const Prettyalert = async (payload) => {
  alert(JSON.stringify(payload, null, 2))
}


export const Prettylog = async (payload, key) => {
  console.log(key, JSON.stringify(payload, null, 2));
}


export const Createapi = async (payload) => {

  console.log("RegisterAPI ==> ", `${Apiroutes.emailverify}`)
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.emailverify}`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "Createapi")

  } catch (error) {
    return false
  }
}


export const OtpVerify = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.otpverify}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "OtpVerify")

  } catch (error) {
    return false
  }
}


export const ResendOtpVerify = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.resendotp}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'ResendOtpVerify')

  } catch (error) {
    return false
  }
}

export const persondetailsapi = async (payload, token) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.persondetails}`,
      headers: {
        'Content-Type': 'multipart/form-data', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
      },
      data: AppendData(payload)
    })
    return DecryptData(response?.data, "persondetailsapi")

  } catch (error) {
    return false
  }
}



export const genderlistapi = async (payload) => {
  try {

    const response = await Axios({
      method: "get",
      url: `${Apiroutes.genderapi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'genderlistapi')

  } catch (error) {
    return false
  }
}


export const hobbydatasearch = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.hobbysearchapi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + GetItem("Authtoken"),
      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'hobbydatasearch')

  } catch (error) {
    return false
  }
}


export const hobbydataadd = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.hobbyaddapi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + GetItem("Authtoken"),
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'hobbydataadd')

  } catch (error) {
    return false
  }
}



export const profilelistapi = async (payload, token) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.profilelist}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'profilelistapi')

  } catch (error) {
    return false
  }
}


export const profileaddapi = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.profileadd}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'profileaddapi')

  } catch (error) {
    return false
  }
}

export const addneweventapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.addnewevent}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'multipart/form-data',
      },

      data: AppendData(payload)
    })
    return DecryptData(response?.data, 'addneweventapi')

  } catch (error) {
    return false
  }
}



export const eventlistapi = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.eventlist}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'eventlistapi')

  } catch (error) {
    return false
  }
}

export const eventcommentlistapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.eventcommentlist}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'eventcommentlistapi')

  } catch (error) {
    return false
  }
}

export const eventaddcommentapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.eventaddcomment}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'eventaddcommentapi')

  } catch (error) {
    return false
  }
}


export const eventdeletecommentapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.eventdeletecomment}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'eventdeletecommentapi')

  } catch (error) {
    return false
  }
}

export const homelistsearchapi = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.homelistsearch}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'homelistsearchapi')

  } catch (error) {
    return false
  }
}

export const DateTimeMerge = (date, time) => {
  let inst = new Date(date).getTime();
  return new Date(new Date(inst).setHours(new Date(time).getHours(), new Date(time).getMinutes(), new Date(time).getSeconds(), new Date(time).getMilliseconds())).toISOString()
}


export const eventeditapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.eventedit}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'multipart/form-data',
      },

      data: AppendData(payload)
    })
    return DecryptData(response?.data, 'eventeditapi')

  } catch (error) {
    return false
  }
}


export const eventdeleteapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.eventdelete}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'eventdeleteapi')

  } catch (error) {
    return false
  }
}

export const eventwishlistapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.eventwishlist}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'eventwishlistapi')

  } catch (error) {
    return false
  }
}


export const eventwishlistpageapi = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.eventwishlistpage}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'eventwishlistpageapi')

  } catch (error) {
    return false
  }
}


export const logoutapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.logout}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'logoutapi')

  } catch (error) {
    return false
  }
}

export const pushnotificationapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.pushnotification}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'pushnotificationapi')

  } catch (error) {
    return false
  }
}


export const emailupdateapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.emailupdate}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'emailupdateapi')

  } catch (error) {
    return false
  }
}
export const UserEnableDisable = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.UserEnableDisableApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserEnableDisable')

  } catch (error) {
    return false
  }
}

export const cmspagesapi = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.cmspages}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'cmspagesapi')

  } catch (error) {
    return false
  }
}

export const feedbackapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.feedback}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'feedbackapi')

  } catch (error) {
    return false
  }
}


export const deleteaccountapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.deleteaccount}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'deleteaccountapi')

  } catch (error) {
    return false
  }
}


export const hobbiedeleteapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.hobbydelete}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'hobbiedeleteapi')

  } catch (error) {
    return false
  }
}

export const editProfileapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.editprofile}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'multipart/form-data',
      },

      data: AppendData(payload)
    })
    return DecryptData(response?.data, 'editProfileapi')

  } catch (error) {
    return false
  }
}

export const gethelpapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.gethelp}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'gethelpapi')

  } catch (error) {
    return false
  }
}

export const showgroupapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.showgroup}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'showgroupapi')

  } catch (error) {
    return false
  }
}

export const showinterestapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.showinterest}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'showinterestapi')

  } catch (error) {
    return false
  }
}

export const hideHobbies = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.hidehobbiesInprofileApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'hideHobbies')

  } catch (error) {
    return false
  }
}

export const HideEventsInprofile = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.hideEventsInprofileApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'HideEventsInprofile')

  } catch (error) {
    return false
  }
}

export const HideProfile = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.hideprofileApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'HideProfile')

  } catch (error) {
    return false
  }
}


export const friendlistapi = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.friendlist}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'friendlistapi')

  } catch (error) {
    return false
  }
}

export const activitylistapi = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.activitylist}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },
      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'activitylistapi')

  } catch (error) {
    return false
  }
}


export const eventInterestapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.eventInterest}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'eventInterestapi')

  } catch (error) {
    return false
  }
}

export const userfollowapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.userfollow}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'userfollowapi')

  } catch (error) {
    return false
  }
}


export const Loginapi = async (payload) => {
  console.log("LoginAPI ==> ", `${Apiroutes.loginverify}`)
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.loginverify}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })

    // console.log("LoginResponse22==> ", response)

    return DecryptData(response?.data, 'Loginapi')

  } catch (error) {
    return false
  }
}

export const getAllMembersapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.getAllmemberes}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'getAllMembersapi')

  } catch (error) {
    return false
  }
}


export const getAllEventChatapi = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.activityEventlist}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'getAllEventChatapi')

  } catch (error) {
    return false
  }
}



export const getSingleInitialchatdata = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.getSingleInitialchatdataApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'getSingleInitialchatdata')

  } catch (error) {
    return false
  }
}

export const createNewInstance = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.createInstance}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'createNewInstance')

  } catch (error) {
    return false
  }
}

export const getChatDataList = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.getChatDataList}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'getChatDataList')

  } catch (error) {
    return false
  }
}

export const createMessage = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.createMessageapi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'multipart/form-data',
      },

      data: AppendData(payload)
    })
    return DecryptData(response?.data, 'createMessage')

  } catch (error) {
    return false
  }
}

export const getAllGroupMembers = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.getAllGroupMembers}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "getAllGroupMembers")

  } catch (error) {
    return false
  }
}

export const getAllMediaApi = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.getAllMediaFiles}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'getAllMediaApi')

  } catch (error) {
    return false
  }
}

export const editMessage = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.editMessageApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'editMessage')

  } catch (error) {
    return false
  }
}

export const deleteMessage = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.deleteMessageApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'deleteMessage')

  } catch (error) {
    return false
  }
}

export const userSeenMessage = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.seenMessageApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'userSeenMessage')

  } catch (error) {
    return false
  }
}


export const Imagepicker = async (type) => {
  try {
    var options = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 4,
    };
    if (type == "library") {
      const result = await launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera picker');
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          console.log('Camera not available on device');
          return;
        } else if (response.errorCode == 'permission') {
          console.log('Permission not satisfied');
          return;
        } else if (response.errorCode == 'others') {
          console.log(response.errorMessage);
          return;
        }
      });

      return result.assets
    }
    else if (type == "camera") {
      const result = await launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera picker');
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          console.log('Camera not available on device');
          return;
        } else if (response.errorCode == 'permission') {
          console.log('Permission not satisfied');
          return;
        } else if (response.errorCode == 'others') {
          console.log(response.errorMessage);
          return;
        }
      });

      return result.assets
    }
  } catch (error) {
  }
}

export const createGroupMembers = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.createUpdateGroup}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + (token || GetItem("Authtoken")),
        'Content-Type': 'multipart/form-data',
      },

      data: AppendData(payload)
    })
    return DecryptData(response?.data, 'createGroupMembers')

  } catch (error) {
    return false
  }
}

export const UpdateGroupMembers = async (payload) => {
  console.log("CallMsgPayload==> ", payload)
  console.log("CallMsgPayloadUrl==> ", `${Apiroutes.createUpdateGroup}`)

  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.createUpdateGroup}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UpdateGroupMembers')

  } catch (error) {
    console.log("Error on UpdateGroupMembers: ", error);
    return false
  }
}
export const AddGroupAdmin = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.addGroupAdmineApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'AddGroupAdmin')

  } catch (error) {
    return false
  }
}

export const RemoveGroupAdmin = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.removeGroupAdminApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'RemoveGroupAdmin')

  } catch (error) {
    return false
  }
}

export const RemoveFromGroup = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.removeFromGroupApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'RemoveFromGroup')

  } catch (error) {
    return false
  }
}

export const ExitGroup = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.ExitGroupApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'ExitGroup')

  } catch (error) {
    return false
  }
}

export const EditGroupDetails = async (payload) => {

  console.log("EditGroupDetails Payload==>", payload);
  console.log("EditGroupDetails Url==>", `${Apiroutes.editGroupApi}`);
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.editGroupApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'multipart/form-data',
      },

      data: AppendData(payload)
    })
    return DecryptData(response?.data, 'EditGroupDetails')

  } catch (error) {
    return false
  }
}
export const FindEventsNearBy = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.findNearByEvents}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'FindEventsNearBy')

  } catch (error) {
    return false
  }
}


export const GetAllNotification = async (payload) => {
  console.log("GetAllNotification Url==>", `${Apiroutes.notificationApi}`);
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.notificationApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GetAllNotification')

  } catch (error) {
    return false
  }
}

export const UserFollowBack = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.userFollowbackApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserFollowBack')

  } catch (error) {
    return false
  }
}


export const UserUnFollow = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.userUnFollowApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserUnFollow')

  } catch (error) {
    return false
  }
}

export const UserProfilelike = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.UserlikeprofileApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserProfilelike')

  } catch (error) {
    return false
  }
}

export const UserUnlikeprofile = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.UserUnlikeprofileApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserUnlikeprofile')

  } catch (error) {
    return false
  }
}

export const PrivateUserAccFollow = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.privateUserAccFollowApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'PrivateUserAccFollow')

  } catch (error) {
    return false
  }
}

export const DeleteInstance = async (payload) => {

  console.log("DeleteGG==> ", payload)
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.deleteInstanceApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'DeleteInstance')

  } catch (error) {
    return false
  }
}

export const PersonalDetails = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.UserCreateProfileDetailsApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'PersonalDetails')

  } catch (error) {
    return false
  }
}

export const AccountDeleteverify = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.AccountDeleteverifyApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'AccountDeleteverify')

  } catch (error) {
    return false
  }
}
export const ReportToAdmin = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.ReportedApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'ReportToAdmin')

  } catch (error) {
    return false
  }
}

export const getValidUserName = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.ValidUsernameApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'getValidUserName')

  } catch (error) {
    return false
  }
}

export const UserEventNearbyLocation = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.UserEventNearbyLocationApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserEventNearbyLocation')

  } catch (error) {
    return false
  }
}
export const FilterEventsByHobbies = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.FilterEventsApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'FilterEventsByHobbies')

  } catch (error) {
    return false
  }
}

export const ResidentialAddress = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.ResidentialAddressApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'ResidentialAddress')

  } catch (error) {
    return false
  }
}


export const getAdminDetails = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.getAdminDetailsApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'getAdminDetails')

  } catch (error) {
    return false
  }
}

export const UserEditAccount = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.UserEditAccountApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserEditAccount')

  } catch (error) {
    return false
  }
}

//like, follow, following, group
export const GetlikeData = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.GetlikeDataApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GetlikeData')

  } catch (error) {
    return false
  }
}
export const GetUserfollowing = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.GetUserfollowingApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GetUserfollowing')

  } catch (error) {
    return false
  }
}
export const GetUserfollower = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.GetUserfollowerApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GetUserfollower')

  } catch (error) {
    return false
  }
}

export const RequestedUserslists = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.RequestedUserslistsApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'RequestedUserslists')

  } catch (error) {
    return false
  }
}

export const GetMyCreateGroup = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.GetMyCreateGroupApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GetMyCreateGroup')

  } catch (error) {
    return false
  }
}

export const GetJoinedGroup = async (payload) => {
  console.log("GetJoinedGroup Url==>", `${Apiroutes.GetJoinedGroupAndCreateGroupApi}`);
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.GetJoinedGroupAndCreateGroupApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GetJoinedGroup')

  } catch (error) {
    return false
  }
}



export const UserEmailTransfrer = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.UserEmailTransfrerApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserEmailTransfrer')

  } catch (error) {
    return false
  }
}

export const transferEmailverify = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.transferEmailverifyApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }

    })
    return DecryptData(response?.data, 'transferEmailverify')


  } catch (error) {
    return false
  }
}

export const ChangeEmailTransfer = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.ChangeEmailTransferApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }

    })
    return DecryptData(response?.data, 'ChangeEmailTransfer')


  } catch (error) {
    return false
  }
}

export const getChatersAndFollowersList = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.getChatersAndFollowersListApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }

    })

    return DecryptData(response?.data, 'getChatersAndFollowersList')

  } catch (error) {
    return false
  }
}
export const ClearchatFn = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.ClearchatApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })

    return DecryptData(response?.data, 'ClearchatFn')

  } catch (error) {
    return false
  }
}

export const GroupJoinandUnjoin = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.GroupJoinandUnjoinApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GroupJoinandUnjoin')

  } catch (error) {
    return false
  }
}

export const UserBlockandUnblock = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.UserBlockandUnblockApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'UserBlockandUnblock')

  } catch (error) {
    return false
  }
}

export const GetFilteredGroups = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.getFilteredGroupsApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GetFilteredGroups')

  } catch (error) {
    return false
  }
}

export const PrivateGroupAcceptReject = async (payload) => {

  console.log("Accept or Reject Payload:", payload);
  console.log("Accept Url:", `${Apiroutes.PrivateGroupAcceptRejectApi}`);
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.PrivateGroupAcceptRejectApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    console.log("Accept or Reject Response:", response?.data);
    return DecryptData(response?.data, 'PrivateGroupAcceptReject')

  } catch (error) {
    console.log("Error on PrivateGroupAcceptReject: ", error);
    return false
  }
}

export const newUserJoiner = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.newUserJoinerApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }

    })

    return DecryptData(response?.data, 'newUserJoiner')

  } catch (error) {
    return false
  }
}

export const TransferEmailCancel = async (payload) => {
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.TransferEmailCancelApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'TransferEmailCancel')

  } catch (error) {
    return false
  }
}

export const SendOTPApi = async (payload) => {

  var token = GetItem("Authtoken")
  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.sendotp}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })


    return DecryptData(response?.data, 'SendOTPApi')

  } catch (error) {
    console.log("Error on SendOTPApi: ", error);
    return false
  }
}

export const VerifyOTP = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.verifyOTP}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "OtpVerify")

  } catch (error) {
    return false
  }
}

export const ForgotPassword = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.forgotPass}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "ForgotPassword")

  } catch (error) {
    return false
  }
}

export const ChangePassApi = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.changePass}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "ChangePassApi")

  } catch (error) {
    return false
  }
}

export const GetAllCmsLists = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.GetAllCmsListsApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'GetAllCmsLists')

  } catch (error) {
    return false
  }
}

export const EventDetails = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.eventDetailsApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "EventDetails")

  } catch (error) {
    return false
  }
}

export const CommonSearch = async (payload) => {
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.CommonSearchApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "CommonSearch")

  } catch (error) {
    return false
  }
}

export const UserPlanLists = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.UserPlanListsApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },

      params: { data: EncryptData(payload) }
    })

    return DecryptData(response?.data, 'UserPlanLists')

  } catch (error) {
    console.log("Error on UserPlanLists: ", error);
    return false
  }
}

export const Getfaqlist = async (payload) => {
  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.getfaqlistApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',

      },

      params: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, 'Getfaqlist')

  } catch (error) {
    console.log("Error on Getfaqlist: ", error);
    return false
  }
}

export const LanguageChange = async (payload) => {

  console.log("LangUageResult ==> ", payload)
  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.languageApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "CommonSearch")

  } catch (error) {
    return false
  }
}

export const GetCMSpages = async () => {

  console.log("GetCMSRequestUrl ==> ", `${Apiroutes.getcmslistApi}`)

  try {

    const response = await Axios({
      method: "get",
      url: `${Apiroutes.getcmslistApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      //data: { data: EncryptData() }
    })
    return DecryptData(response?.data, "CommonSearch")

  } catch (error) {
    return false
  }
}
export const GetGroupInfo = async (payload) => {

  console.log("GetGroupInfo ==> ", `${Apiroutes.groupInfoApi}`)

  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.groupInfoApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "GetGroupInfo")

  } catch (error) {
    return false
  }
}

export const callRequestHobby = async (payload) => {

  console.log("RequestHobbyUrl ==> ", `${Apiroutes.requesthobbyApi}`)

  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.requesthobbyApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "RequestHobby")

  } catch (error) {
    return false
  }
}


export const callAddRequestHobby = async (payload) => {

  console.log("RequestAddYourHobbyUrl ==> ", `${Apiroutes.addOtherProfileHobbiesApi}`)

  try {

    const response = await Axios({
      method: "post",
      url: `${Apiroutes.addOtherProfileHobbiesApi}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }
    })
    return DecryptData(response?.data, "HomeDetail")

  } catch (error) {
    return false
  }
}


// export const getAllGroupMembers = async (payload) => {
//   try {
//     const response = await Axios({
//       method: "get",
//       url: `${Apiroutes.getAllGroupMembers}`,
//       headers: {
//         Accept: 'application/json', 'accept-language': Language,
//         "Authorization": "Bearer " + GetItem("Authtoken"),
//         'Content-Type': 'application/json',
//       },

//       params: { data: EncryptData(payload) }
//     })
//     return DecryptData(response?.data, "getAllGroupMembers")

//   } catch (error) {
//     return false
//   }
// }

export const Upcominglistapi = async (payload) => {

  console.log("UpcomingUrl ==>", `${Apiroutes.upcomingeventlist}`)

  try {
    const response = await Axios({
      method: "get",
      url: `${Apiroutes.upcomingeventlist}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      params: { data: EncryptData(payload) }

    })

    console.log("response?==>", response)
    return DecryptData(response?.data, 'upcomingevent')


  } catch (error) {
    return false
  }
}


// export const otherUserGroupapi = async () => {

//   console.log("UpcomingUrl ==>", `${Apiroutes.otherUserGroup}`)

//   try {
//     const response = await Axios({
//       method: "post",
//       url: `${Apiroutes.otherUserGroup}`,
//       headers: {
//         Accept: 'application/json', 'accept-language': Language,
//         "Authorization": "Bearer " + GetItem("Authtoken"),
//         'Content-Type': 'application/json',
//       },
//       data: { data: EncryptData(payload) }

//     })
//     return DecryptData(response?.data, 'HomeDetail')


//   } catch (error) {
//     return false
//   }
// }

export const otherGroupapi = async (payload) => {

  console.log("OtherGroupUrl ==>", `${Apiroutes.otherUserGroup}`)

  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.otherUserGroup}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }

    })
    return DecryptData(response?.data, 'HomeDetail')


  } catch (error) {
    return false
  }
}

export const otherJoinGroupapi = async (payload) => {

  console.log("OtherJoinGroupUrl ==>", `${Apiroutes.otherUserGroup}`)

  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.otherUserGroup}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }

    })
    return DecryptData(response?.data, 'HomeDetail')


  } catch (error) {
    return false
  }
}

export const otherJoinEventapi = async (payload) => {

  console.log("OtherJoinEvUrl ==>", `${Apiroutes.otherUserGroup}`)

  try {
    const response = await Axios({
      method: "post",
      url: `${Apiroutes.otherUserGroup}`,
      headers: {
        Accept: 'application/json', 'accept-language': Language,
        "Authorization": "Bearer " + GetItem("Authtoken"),
        'Content-Type': 'application/json',
      },
      data: { data: EncryptData(payload) }

    })
    return DecryptData(response?.data, 'HomeDetail')


  } catch (error) {
    return false
  }
}




// export const downloadImage = async (imageUrl) => {
//   const res = await requestPhotoPermission();
//   console.log(res, "await requestPhotoPermission();");


//   try {
//     const fileName = imageUrl.split('/').pop();

//     console.log(fileName, "filename");

//     const destPath = `${RNFS.DocumentDirectoryPath}/image_${Date.now()}_` + fileName;

//     const result = await RNFS.downloadFile({
//       fromUrl: imageUrl,
//       toFile: destPath,
//       background: true,
//     }).promise;

//     if (result.statusCode === 200) {
//       console.log('✅ Image downloaded to:', destPath);
//       showwarningmessage("Downloaded")
//       saveToCameraRoll(destPath)
//       return true;
//     } else {
//       console.warn('⚠️ Download failed:', result.statusCode);
//       return null;
//     }
//   } catch (error) {
//     console.error('❌ Download error:', error);
//     return null;
//   }
// };


// const saveToCameraRoll = async (filePath) => {
//   try {
//     console.log(filePath, "filePathfilePath");

//     if (Platform.OS === 'android') {
//       const permission = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
//       );
//       if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('Storage permission not granted');
//         return;
//       }
//     }

//     await CameraRoll.save('file:/' + filePath, { type: 'photo' });
//     console.log('✅ Image saved to Photos successfully!');
//   } catch (error) {
//     console.error('❌ Error saving image to Photos:', error);
//   }
// };

// const requestPhotoPermission = async () => {
//   if (Platform.OS === 'ios') {
//     const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
//     console.log(result, "res");

//     return result === RESULTS.GRANTED;
//   } else if (Platform.OS === 'android') {
//     if (Platform.Version >= 33) {
//       // Android 13+
//       const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
//       return result === RESULTS.GRANTED;
//     } else {
//       // Android 12 and below
//       const result = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
//       );
//       return result === PermissionsAndroid.RESULTS.GRANTED;
//     }
//   }
//   return false;


// };

export const downloadImage = async (imageUrl) => {
  const hasPermission = await requestPhotoPermission();
  if (!hasPermission) {
    console.warn('Permission denied — cannot save image');
    return;
  }

  try {
    let fileName = imageUrl.split('/').pop() || `image_${Date.now()}.jpg`;
    if (!/\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
      fileName += '.jpg';
    }

    const destPath = `${RNFS.DocumentDirectoryPath}/image_${Date.now()}_${fileName}`;
    const result = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: destPath,
    }).promise;

    if (result.statusCode === 200) {
      const exists = await RNFS.exists(destPath);
      const stats = await RNFS.stat(destPath);
      console.log('✅ Downloaded:', destPath, 'size:', stats.size);

      if (exists && stats.size > 0) {
        saveToCameraRoll(destPath);
        console.log('📸 Saved successfully!');
        showwarningmessage('Saved successfully!')
      } else {
        console.warn('⚠️ File missing or empty');
      }
    } else {
      console.warn('⚠️ Download failed with code:', result.statusCode);
    }
  } catch (error) {
    console.error('❌ Download error:', error);
  }
};


const saveToCameraRoll = async (filePath) => {
  try {
    const exists = await RNFS.exists(filePath);
    const stats = await RNFS.stat(filePath);
    console.log('File exists:', exists, 'size:', stats.size);

    if (!exists || stats.size === 0) {
      console.warn('File missing or empty, not saving.');
      return;
    }

    // ensure valid extension
    let pathToSave = filePath;
    if (!/\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
      const newPath = `${filePath}.jpg`;
      await RNFS.moveFile(filePath, newPath);
      pathToSave = newPath;
    }

    const fileUri = 'file://' + pathToSave;
    console.log('Saving from:', fileUri);

    await CameraRoll.save(fileUri, { type: 'photo' });
    console.log('✅ Saved to Photos/Gallery successfully!');
  } catch (error) {
    console.error('❌ Error saving image to Photos:', error);
  }
};


const requestPhotoPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
      console.log('iOS permission result:', result);
      return result === RESULTS.GRANTED;
    } else {
      if (Platform.Version >= 33) {
        const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        return result === RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
  } catch (e) {
    console.error('Permission error:', e);
    return false;
  }
};