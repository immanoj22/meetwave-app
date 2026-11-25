import { createSlice } from '@reduxjs/toolkit'
import { Apiroutes } from '../Actions/constant'
import { GetItem } from '../Actions/localstorage'
import Axios from 'axios'
import { DecryptData, EncryptData } from '../Actions/encrypt'


export const initialState = {
    profile: "",
    blockedSts: false,
}

const profile = createSlice({
    name: "profile",
    initialState,
    reducers: {
        update_profile: (state, { payload }) => {
            state.profile = payload
        },
        clear_Redux: (state, { payload }) => {
            state.profile = ""
        },


    }
})

export const {
    update_profile,
    clear_Redux,
} = profile.actions
export const profileSelector = state => state.profile
export default profile.reducer


export function Fetchprofile(userid) {
    return async dispatch => {
        try {

            const payload = {
                "userId": userid
            }

            const response = await Axios({
                method: "post",
                url: `${Apiroutes.profilelist}`,
                headers: {
                    Accept: 'application/json',
                    "Authorization": "Bearer " + GetItem("Authtoken"),
                },
                data: { data: EncryptData(payload) }
            })

            const resp = DecryptData(response?.data, "Fetchprofile_Fetchprofile_");

            if (resp?.status) {
                dispatch(update_profile(resp?.data))
            }

        } catch (error) {
            console.log("Error on Fetchprofile : ", error)
        }
    }
}