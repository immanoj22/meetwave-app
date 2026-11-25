import { combineReducers } from "redux"

const Initial_State = {
    userdata: {
        isAuth: false,
        userId: "",
        email: "",
        name: "",
        hobby_limit: 0,
        eventimagelimit: 0
    },
    userlocation: {}

}


function redux(state = Initial_State, action) {
    console.log("reduxstores==============>", action);
    switch (action.type) {

        case "userdata":
            return {
                ...state, ...action
            }
        case "blockuserdata":
            return {
                ...state, ...action.data
            }
        case "unblockuserdata":
            return {
                ...state, ...action.data
            }
        case "loginauth":
            return {
                ...state, ...action.data
            }
        case "userlocation":
            return {
                ...state.userlocation, ...action
            }
        case "hobbielimit":
            return {
                ...state, ...action
            }
        case "eventimagelimit":
            return {
                ...state, ...action
            }
        default:
            return state
    }
}

const meetingapp = combineReducers({ redux: redux })

export default meetingapp;