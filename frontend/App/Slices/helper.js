import { createSlice } from '@reduxjs/toolkit'
import { c } from '../Utilities/colors'
import { getAllMembersapi, getSingleInitialchatdata } from '../Actions/hooks'
import { GetItem } from '../Actions/localstorage'
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { NativeModules } from "react-native";


export const initialState = {
    isLogin: false,
    isOnline: false,
    networkVisible: true,
    isfilter: false,
    peopleFilter: false,
    activityFilter: false,
    commonFilter: false,
    isGroupFilter: false,
    statusbarcolor: c.primary,
    instancegroupcalldata: null,
    persondetailpath: "",
    hobbiepath: "",
    hideprofiledetails: {},
    hiideinterest: {},
    filterBysearch: {                // Combined object for search and activeTab
        search: '',
        activeTab: 'People',
    },
    followingsDetails: {},
    followStatus: "",
    islocationfilter: false,
    isreportfilter: false,
    filterDistance: 0,
    filterByGender: [],
    seenMsg: "Unseen",
    peoplGenderFilter: [],
    peopleFilterAge: [18, 30],
    peopleFilterHobbies: [],
    groupFilterHoobies: [],
    eventFilterHoobies: [],
    profileHobbies: [],
    chatFilterHoobies: [],
    myPeople: [],
    notification: [],
    myEvents: [],
    savedEvents: [],
    updateActivities: null,
    hobbieList: [],
    popularHobbieList: [],
    chatMembersList: [],
    eventChatList: [],
    singleChatMembersList: [],
    notificationRender: "",
    activitiesFilterHobbies: [],
    activitiesDistance: 0,
    fetchProfileId: null,
    eventStatus: {},
    fetchChat: null,
    fetchSingleChat: null,
    filtered: false,
    commonLocation: "",
    commonLocAdd: "",
    // Advanced search payloads, stored per tab (People/Groups/Events/Activities/etc.)
    // Shape: { [tabName: string]: payloadObject }
    commonFilterPayload: {},
    singleChatCount: 0,
    eventChatCount: 0,
    hobbyLimitCount: null,
    selectedHobbiesList: [],
    changeCurrentLoc: "",
    changeTempLoc: "",
    foregroundnotification: null,
    notificationChatCount: 0,
}

const helper = createSlice({
    name: "helper",
    initialState,
    reducers: {
        update_IsLogin: (state, { payload }) => {
            state.isLogin = payload
        },
        update_IsOnline: (state, { payload }) => {
            state.isOnline = payload
        },
        update_NetworkVisible: (state, { payload }) => {
            state.networkVisible = payload
        },
        update_Isfilter: (state, { payload }) => {
            state.isfilter = payload
        },
        update_PeopleFilter: (state, { payload }) => {
            state.peopleFilter = payload
        },
        update_ActivityFilter: (state, { payload }) => {
            state.activityFilter = payload
        },
        update_CommonFilter: (state, { payload }) => {
            state.commonFilter = payload
        },
        update_GroupFilter: (state, { payload }) => {
            state.isGroupFilter = payload
        },
        update_statusbarcolor: (state, { payload }) => {
            state.statusbarcolor = payload
        },
        update_instancegroupcall: (state, { payload }) => {
            state.instancegroupcalldata = payload
        },

        update_persondetailpath: (state, { payload }) => {
            state.persondetailpath = payload
        },
        update_hobbiepath: (state, { payload }) => {
            state.hobbiepath = payload
        },
        update_SeenMsg: (state, { payload }) => {
            state.seenMsg = payload
        },
        update_NotificationRender: (state, { payload }) => {
            state.notificationRender = payload
        },
        update_FetchChat: (state, { payload }) => {
            state.fetchChat = payload
        },
        update_SingleFetchChat: (state, { payload }) => {
            state.fetchSingleChat = payload
        },
        update_Filtered: (state, { payload }) => {
            state.filtered = payload
        },
        update_hideprofiledetails: (state, { payload }) => {
            state.hideprofiledetails = payload
        },
        update_hideinterest: (state, { payload }) => {
            state.hiideinterest = payload
        },
        update_filterBySearch: (state, { payload }) => {
            state.filterBysearch = { ...state.filterBysearch, ...payload }
        },
        update_followingsDetails: (state, { payload }) => {
            const { id, newDetails } = payload;
            state.followingsDetails[id] = newDetails; // Update or replace the followings details for the user
        },
        update_followStatus: (state, { payload }) => {
            state.followStatus = payload;
        },
        update_Islocationfilter: (state, { payload }) => {
            // alert(`Update is location filter payload: ${payload}`);
            state.islocationfilter = payload;
        },
        update_Isreportfilter: (state, { payload }) => {
            state.isreportfilter = payload
        },
        update_FilterDistance: (state, { payload }) => {
            state.filterDistance = payload
        },
        update_FilterByGender: (state, { payload }) => {
            state.filterByGender = payload
        },

        update_PeoplGenderFilter: (state, { payload }) => {
            state.peoplGenderFilter = payload
        },
        update_PeopleFilterAge: (state, { payload }) => {
            state.peopleFilterAge = payload
        },
        update_PeopleFilterHobbies: (state, { payload }) => {
            state.peopleFilterHobbies = payload
        },
        update_GroupFilterHoobies: (state, { payload }) => {
            state.groupFilterHoobies = payload
        },
        update_EventFilterHoobies: (state, { payload }) => {
            state.eventFilterHoobies = payload
        },
        update_ProfileHobbies: (state, { payload }) => {
            state.profileHobbies = payload
        },
        update_ChatFilterHoobies: (state, { payload }) => {
            state.chatFilterHoobies = payload
        },
        update_MyPeople: (state, { payload }) => {
            state.myPeople = payload
        },
        update_Notification: (state, { payload }) => {
            state.notification = payload
        },
        update_MyEvents: (state, { payload }) => {
            state.myEvents = payload
        },
        update_SavedEvents: (state, { payload }) => {
            state.savedEvents = payload
        },
        update_UpdateActivities: (state, { payload }) => {
            state.updateActivities = payload
        },
        update_HobbieList: (state, { payload }) => {
            state.hobbieList = payload
        },
        update_PopularHobbieList: (state, { payload }) => {
            state.popularHobbieList = payload
        },
        update_ChatMembersList: (state, { payload }) => {
            state.chatMembersList = payload
        },
        update_ChatMembersOrderList: (state, { payload }) => {

            let orderDetails = [...state.chatMembersList];

            let updatelist = orderDetails?.map((list) => {
                if (list?._id == payload) {
                    return { ...list, UnreadMessageCount: 0 };
                }

                return list
            })

            state.chatMembersList = updatelist
        },
        update_SingleChatMembersList: (state, { payload }) => {
            state.singleChatMembersList = payload
        },
        update_SingleOrderChatMembersList: (state, { payload }) => {
            let orderDetails = [...state.singleChatMembersList];

            let updatelist = orderDetails?.map((list) => {
                if (list?._id == payload) {
                    return { ...list, UnreadMessageCount: 0 };
                }

                return list
            })

            state.singleChatMembersList = updatelist
        },
        update_EventChatList: (state, { payload }) => {
            state.eventChatList = payload
        },
        update_EventChatOrderList: (state, { payload }) => {

            let orderDetails = [...state.eventChatList];

            let updatelist = orderDetails?.map((list) => {
                if (list?._id == payload) {
                    return { ...list, UnreadMessageCount: 0 };
                }

                return list
            })

            state.eventChatList = updatelist
        },
        update_ActivitiesFilterHobbies: (state, { payload }) => {
            state.activitiesFilterHobbies = payload
        },
        update_ActivitiesDistance: (state, { payload }) => {
            state.activitiesDistance = payload
        },
        update_FetchProfileId: (state, { payload }) => {
            state.fetchProfileId = payload
        },
        update_EventStatus: (state, { payload }) => {
            state.eventStatus = payload
        },
        update_CommonLocation: (state, { payload }) => {
            state.commonLocation = payload
        },
        update_CommonLocAdd: (state, { payload }) => {
            state.commonLocAdd = payload
        },
        update_CommonFilterPayload: (state, { payload }) => {
            // Backward-compatible reducer:
            // - If payload has `activeTab`, store it under that tab key.
            // - If payload has `{ activeTab, clear: true }`, clear only that tab.
            // - If payload is `{}`, clear all tabs (fallback).
            const tab = payload?.activeTab;
            if (!state.commonFilterPayload || typeof state.commonFilterPayload !== "object") {
                state.commonFilterPayload = {};
            }

            if (payload && tab && payload.clear === true) {
                delete state.commonFilterPayload[tab];
                return;
            }

            if (payload && tab) {
                state.commonFilterPayload[tab] = payload;
                return;
            }

            if (payload && Object.keys(payload).length === 0) {
                state.commonFilterPayload = {};
            }
        },
        update_SingleChatCount: (state, { payload }) => {
            state.singleChatCount = payload
        },
        update_EventChatCount: (state, { payload }) => {
            state.eventChatCount = payload
        },
        update_HobbyLimit: (state, { payload }) => {
            state.hobbyLimitCount = payload
        },
        update_SelectedHobbiesList: (state, { payload }) => {
            state.selectedHobbiesList = payload
        },
        update_ChangeCurrentLoc: (state, { payload }) => {
            state.changeCurrentLoc = payload
        },
        update_ChangeTempLoc: (state, { payload }) => {
            state.changeTempLoc = payload
        },
        setForegroundnotifiication: (state, { payload }) => {
            state.foregroundnotification = payload
        },
        update_notificationCount: (state, { payload }) => {
            state.notificationChatCount = payload
        },

    }
})

export const {
    update_IsLogin,
    update_IsOnline,
    update_NetworkVisible,
    update_Isfilter,
    update_PeopleFilter,
    update_ActivityFilter,
    update_CommonFilter,
    update_GroupFilter,
    update_statusbarcolor,
    update_instancegroupcall,
    update_persondetailpath,
    update_hobbiepath,
    update_SeenMsg,
    update_hideprofiledetails,
    update_hideinterest,
    update_filterBySearch,
    update_followingsDetails,
    update_followStatus,
    update_Islocationfilter,
    update_Isreportfilter,
    update_FilterDistance,
    update_FilterByGender,
    update_PeoplGenderFilter,
    update_PeopleFilterAge,
    update_PeopleFilterHobbies,
    update_GroupFilterHoobies,
    update_EventFilterHoobies,
    update_ChatFilterHoobies,
    update_MyPeople,
    update_ActivitiesFilterHobbies,
    update_ActivitiesDistance,
    update_FetchProfileId,
    update_EventStatus,
    update_Notification,
    update_MyEvents,
    update_SavedEvents,
    update_UpdateActivities,
    update_HobbieList,
    update_PopularHobbieList,
    update_ChatMembersList,
    update_SingleChatMembersList,
    update_NotificationRender,
    update_FetchChat,
    update_SingleFetchChat,
    update_Filtered,
    update_CommonLocation,
    update_CommonLocAdd,
    update_CommonFilterPayload,
    update_SingleOrderChatMembersList,
    update_ProfileHobbies,
    update_ChatMembersOrderList,
    update_SingleChatCount,
    update_EventChatList,
    update_EventChatOrderList,
    update_HobbyLimit,
    update_SelectedHobbiesList,
    update_ChangeCurrentLoc,
    update_ChangeTempLoc,
    update_EventChatCount,
    setForegroundnotifiication,
    update_notificationCount

} = helper.actions
export const helperSelector = state => state.helper
export default helper.reducer



export function GetAllchat(count) {
    return async dispatch => {
        try {

            let payload = {
                userId: GetItem("UserId"),
                type: "groupchat",
                page: count,
                limit: 10
            };

            const result = await getAllMembersapi(payload);
            if (result?.data) {
                const local = Array.isArray(result.data) ? [...result.data] : result.data;
                dispatch(update_ChatMembersList(local));
            }

        } catch (error) {
            console.log("Error on GetAllchat : ", error)
        }
    };
}



export function GetSingleChats(count) {

    return async dispatch => {
        try {

            let payload = {
                userId: GetItem("UserId"),
                searchText: "",
                page: count,
                limit: 10
            };

            const result = await getSingleInitialchatdata(payload);

            if (result?.data) {
                const local = Array.isArray(result.data) ? [...result.data] : result.data;
                dispatch(update_SingleChatMembersList(local));
            }

        } catch (error) {
            console.log("Error on GetSingleChats : ", error)
        }

    };
}


// export async function requestNotificationPermission() {
//     if (Platform.OS === 'ios') {
//         const authStatus = await messaging().requestPermission();
//         return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//     }

//     if (Platform.OS === 'android' && Platform.Version >= 33) {
//         const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }

//     return true;
// }

export async function requestNotificationPermission() {
    if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission({
            alert: true,
            badge: true,   // 👈 IMPORTANT
            sound: true,
            provisional: false,
        });

        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled;
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
}

const { AudioRecorder } = NativeModules;


export const startRecording = async () => {
    return await AudioRecorder.startRecording();
};

export const stopRecording = async () => {
    const path = await AudioRecorder.stopRecording();
    console.log("Recorded file:", path);
    return path;
};
