
import { BACKENDURL, LOCALURL, ENKEY, GLEKEY, CDNURL } from '@env'
export const Base_Url = BACKENDURL + "v1"
export const Imageurl = CDNURL

// export const ChatImageurl = BACKENDURL + "/Chatimage/"
// export const BioImageurl = BACKENDURL + "/Bioimage/"
// export const GroupimgUrl = BACKENDURL + "/GroupImage/"

export const ChatImageurl = CDNURL
export const BioImageurl = BACKENDURL + "/Bioimage/"
export const GroupimgUrl = BACKENDURL + "/GroupImage/"
export const ENCODEKEY = ENKEY
export const GOOGLEAPIKEY = GLEKEY

export const Imageroute = {

    PersonalProfile: `${Imageurl}`,
    eventProfile: `${Imageurl}`,
    boiImagePath: `${Imageurl}`,
    groupBioImagePath: `${Imageurl}`,

}

export const Apiroutes = {

    //POST API//
    emailverify: `${Base_Url}/user/` + `${"userEmailverify"}`,
    loginverify: `${Base_Url}/user/` + `${"Userlogin"}`,
    otpverify: `${Base_Url}/user/` + `${"verifyEmail"}`,
    resendotp: `${Base_Url}/user/` + `${"ResendOtp"}`,
    persondetails: `${Base_Url}/user/` + `${"RegisterProfile"}`,
    hobbyaddapi: `${Base_Url}/user/` + `${"UserchooseHobbies"}`,
    profilelist: `${Base_Url}/user/` + `${"userprofilelist"}`,
    profileadd: `${Base_Url}/user/` + `${"UserAddBio"}`,
    addnewevent: `${Base_Url}/event/` + `${"AddNewEvent"}`,
    eventcommentlist: `${Base_Url}/event/` + `${"Getcommentslist"}`,
    eventaddcomment: `${Base_Url}/event/` + `${"EventComments"}`,
    eventdeletecomment: `${Base_Url}/event/` + `${"DeleteEventComments"}`,
    eventedit: `${Base_Url}/event/` + `${"EditEvent"}`,
    eventdelete: `${Base_Url}/event/` + `${"DeleteEvent"}`,
    eventwishlist: `${Base_Url}/event/` + `${"EventWhish"}`,
    logout: `${Base_Url}/user/` + `${"UserLogout"}`,
    pushnotification: `${Base_Url}/user/` + `${"pushnotification"}`,
    emailupdate: `${Base_Url}/user/` + `${"UserEnableDisableInEmailUpdate"}`,
    UserEnableDisableApi: `${Base_Url}/user/` + `${"UserEnableDisable"}`,
    feedback: `${Base_Url}/user/` + `${"Userfeedback"}`,
    deleteaccount: `${Base_Url}/user/` + `${"UserAccountDelete"}`,
    hobbydelete: `${Base_Url}/user/` + `${"UserHobbiesDeleteData"}`,
    editprofile: `${Base_Url}/user/` + `${"EditRegisterProfile"}`,
    gethelp: `${Base_Url}/user/` + `${"userHelp"}`,
    showgroup: `${Base_Url}/user/` + `${"ShowprofileGroups"}`,
    showinterest: `${Base_Url}/user/` + `${"ShowprofileInterest"}`,
    hidehobbiesInprofileApi: `${Base_Url}/user/` + `${"HidehobbiesInprofile"}`,
    hideEventsInprofileApi: `${Base_Url}/user/` + `${"HideEvents"}`,
    hideprofileApi: `${Base_Url}/user/` + `${"Hideprofile"}`,
    eventInterest: `${Base_Url}/event/` + `${"UserjoinUser"}`,
    userfollow: `${Base_Url}/user/` + `${"userfollow"}`,
    sendotp: `${Base_Url}/user/` + `${"SendOtp"}`,
    verifyOTP: `${Base_Url}/user/` + `${"VerifyOtpfunc"}`,
    forgotPass: `${Base_Url}/user/` + `${"ForgetPassword"}`,
    changePass: `${Base_Url}/user/` + `${"Userchangepassword"}`,

    otherUserGroup: `${Base_Url}/user/` + `${"eventAndGroupLists"}`,


    //GET API
    genderapi: `${Base_Url}/user/` + `${"Gendersearchlist"}`,
    hobbysearchapi: `${Base_Url}/user/` + `${"hobbysearch"}`,
    eventlist: `${Base_Url}/event/` + `${"UserCreateEventlist"}`,
    upcomingeventlist: `${Base_Url}/event/` + `${"upcomingEvents"}`,
    homelistsearch: `${Base_Url}/user/` + `${"UserslistSearchfunc"}`,
    getAllmemberes: `${Base_Url}/chat/` + `${"getInitialchatdata"}`,
    getSingleInitialchatdataApi: `${Base_Url}/chat/` + `${"getSingleInitialchatdata"}`,
    getFilteredGroupsApi: `${Base_Url}/chat/` + `${"UserSearchHobbyBasedGroupFilter"}`,
    createInstance: `${Base_Url}/chat/` + `${"Createchat"}`,
    getChatDataList: `${Base_Url}/chat/` + `${"getMessagesChat"}`,
    createMessageapi: `${Base_Url}/chat/` + `${"creatMessage"}`,
    getAllGroupMembers: `${Base_Url}/chat/` + `${"InstanceDetails"}`,
    PrivateGroupAcceptRejectApi: `${Base_Url}/chat/` + `${"PrivateGroupAcceptReject"}`,

    editMessageApi: `${Base_Url}/chat/` + `${"editMessage"}`,
    deleteMessageApi: `${Base_Url}/chat/` + `${"deleteMessage"}`,
    seenMessageApi: `${Base_Url}/chat/` + `${"SeenUser"}`,
    eventwishlistpage: `${Base_Url}/event/` + `${"EventWhishLists"}`,
    cmspages: `${Base_Url}/user/` + `${"GetAllCmsLists"}`,
    friendlist: `${Base_Url}/user/` + `${"UserslistSearchfunc"}`,

    createUpdateGroup: `${Base_Url}/chat/` + `${"Createchat"}`,
    addGroupAdmineApi: `${Base_Url}/chat/` + `${"AddGroupAdmin"}`,
    removeGroupAdminApi: `${Base_Url}/chat/` + `${"DeleteGroupAdmin"}`,
    removeFromGroupApi: `${Base_Url}/chat/` + `${"AddRemoveGroupMembers"}`,
    ExitGroupApi: `${Base_Url}/chat/` + `${"ExitGroup"}`,
    getAllMediaFiles: `${Base_Url}/user/` + `${"UserMediaDatas"}`,
    findNearByEvents: `${Base_Url}/event/` + `${"findUsersNearLocation"}`,
    activitylist: `${Base_Url}/user/` + `${"EventslistSearchfunc"}`,
    activityEventlist: `${Base_Url}/chat/` + `${"getInitialEventchatdata"}`,
    notificationApi: `${Base_Url}/user/` + `${"GetLikeFollowEventNotification"}`,
    userFollowbackApi: `${Base_Url}/user/` + `${"userfollow"}`,
    userUnFollowApi: `${Base_Url}/user/` + `${"userUnFollow"}`,

    UserlikeprofileApi: `${Base_Url}/user/` + `${"Userlikeprofile"}`,
    UserUnlikeprofileApi: `${Base_Url}/user/` + `${"UserUnlikeprofile"}`,
    privateUserAccFollowApi: `${Base_Url}/user/` + `${"privateUserAccFollow"}`,
    deleteInstanceApi: `${Base_Url}/chat/` + `${"InstanceDelete"}`,
    editGroupApi: `${Base_Url}/chat/` + `${"EditGroupchat"}`,
    UserCreateProfileDetailsApi: `${Base_Url}/user/` + `${"UserCreateProfileDetails"}`,
    AccountDeleteverifyApi: `${Base_Url}/user/` + `${"AccountDeleteverify"}`,
    ReportedApi: `${Base_Url}/user/` + `${"Reported"}`,
    ValidUsernameApi: `${Base_Url}/user/` + `${"ValidUsername"}`,
    UserEventNearbyLocationApi: `${Base_Url}/user/` + `${"UserEventNearbyLocation"}`,
    FilterEventsApi: `${Base_Url}/event/` + `${"FindNearbyEvents"}`,
    ResidentialAddressApi: `${Base_Url}/user/` + `${"ResidentialAddress"}`,
    getAdminDetailsApi: `${Base_Url}/user/` + `${"GetAdminDetails"}`,
    UserEditAccountApi: `${Base_Url}/user/` + `${"UsersecurityAccount"}`,

    GetlikeDataApi: `${Base_Url}/user/` + `${"UserLikelist"}`,
    GetUserfollowingApi: `${Base_Url}/user/` + `${"GetUserfollowing"}`,
    GetUserfollowerApi: `${Base_Url}/user/` + `${"GetUserfollower"}`,
    RequestedUserslistsApi: `${Base_Url}/user/` + `${"RequestedUserslists"}`,
    GetMyCreateGroupApi: `${Base_Url}/user/` + `${"GetMyCreateGroup"}`,
    GetJoinedGroupAndCreateGroupApi: `${Base_Url}/user/` + `${"GetJoinedGroupAndCreateGroup"}`,

    UserEmailTransfrerApi: `${Base_Url}/user/` + `${"UserEmailTransfrer"}`,
    transferEmailverifyApi: `${Base_Url}/user/` + `${"transferEmailverify"}`,
    ChangeEmailTransferApi: `${Base_Url}/user/` + `${"ChangeEmailTransfer"}`,
    TransferEmailCancelApi: `${Base_Url}/user/` + `${"TransferEmailCancel"}`,
    getChatersAndFollowersListApi: `${Base_Url}/chat/` + `${"getChatersAndFollowersList"}`,
    ClearchatApi: `${Base_Url}/chat/` + `${"Clearchat"}`,
    GroupJoinandUnjoinApi: `${Base_Url}/chat/` + `${"GroupJoinandUnjoin"}`,
    UserBlockandUnblockApi: `${Base_Url}/user/` + `${"UserBlockandUnblock"}`,
    newUserJoinerApi: `${Base_Url}/user/` + `${"newUserJoiner"}`,
    GetAllCmsListsApi: `${Base_Url}/user/` + `${"GetAllCmsLists"}`,
    eventDetailsApi: `${Base_Url}/event/` + `${"eventDetails"}`,
    CommonSearchApi: `${Base_Url}/user/` + `${"CommonSearchApi"}`,
    getfaqlistApi: `${Base_Url}/cms/` + `${"getfaqlist"}`,
    getcmslistApi: `${Base_Url}/cms/` + `${"cmslist"}`,
    UserPlanListsApi: `${Base_Url}/user/` + `${"UserPlanLists"}`,
    languageApi: `${Base_Url}/user/` + `${"update-language"}`,
    requesthobbyApi: `${Base_Url}/user/` + `${"hobbyRequest-add"}`,
    addOtherProfileHobbiesApi: `${Base_Url}/user/` + `${"addOtherProfileHobbies"}`,
    groupInfoApi: `${Base_Url}/user/` + `${"groupInfo"}`,

    //socket
    //socketURL: "http://localhost:8008",
    socketURL: "http://localhost:8008",
   

}


export const delay = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));
