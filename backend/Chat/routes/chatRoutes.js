import { Router } from "express";
import * as ChatCtrl from "../controller/chatcontroller";
import * as Validation from "../validations/validations"
import { cacheMiddleware, verifyToken } from "../../Helper/common";
const router = Router();

router.route('/Createchat').post(verifyToken, Validation.CreatechatValidation, ChatCtrl.Createchat)
router.route('/creatMessage').post(verifyToken, Validation.creatMessageValidation, ChatCtrl.creatMessage)
router.route('/getMessagesChat').post(verifyToken, Validation.getMessagesValidation, ChatCtrl.getMessages)
router.route('/editMessage').post(verifyToken, Validation.editMessageValidation, ChatCtrl.editMessage)
router.route('/deleteMessage').post(verifyToken, Validation.deleteMessageValidation, ChatCtrl.deleteMessage)
// router.route('/SeenUser').post(verifyToken,Validation.SeenUserValidation,ChatCtrl.SeenUser)
router.route('/getInitialchatdata').post(verifyToken, Validation.getInitialchatdataValidation, ChatCtrl.getInitialchatdata)
router.route('/AddGroupAdmin').post(verifyToken, Validation.AddGroupAdminValidation, ChatCtrl.AddGroupAdmin)
router.route('/EditGroupchat').post(verifyToken, Validation.EditGroupchatNameValidation, ChatCtrl.AddEditGroupchat)
router.route('/DeleteGroupAdmin').post(verifyToken, Validation.DeleteGroupAdminValidation, ChatCtrl.DeleteGroupAdmin)
router.route('/InstanceDetails').get(verifyToken, Validation.InstanceDetailsValidation, ChatCtrl.InstanceDetails)
// router.route('/EditMychatdescription').post(verifyToken,Validation.EditMydescriptionValidation,ChatCtrl.EditMychatdescription)
router.route('/AddRemoveGroupMembers').post(verifyToken, Validation.AddRemoveGroupMembersValidation, ChatCtrl.RemoveGroupMembers)
router.route('/ExitGroup').post(verifyToken, Validation.ExitGroupValidation, ChatCtrl.ExitGroup)
router.route('/InstanceDelete').post(verifyToken, Validation.InstanceDeleteValidation, ChatCtrl.InstanceDelete)
router.route('/getChatersAndFollowersList').post(verifyToken, Validation.getChatersAndFollowersListValidation, ChatCtrl.getChatersAndFollowersList)
router.route('/Clearchat').post(verifyToken, Validation.clearchatValidation, ChatCtrl.Clearchat)
router.route('/GroupJoinandUnjoin').post(verifyToken, Validation.GroupJoinandUnjoinValidation, ChatCtrl.GroupJoinandUnjoin)
router.route('/PrivateGroupAcceptReject').post(verifyToken, Validation.PrivateGroupAcceptRejectValidation, ChatCtrl.PrivateGroupAcceptReject)
router.route('/UserSearchHobbyBasedGroupFilter').post(verifyToken, Validation.UserSearchHobbyBasedGroupFilterValidation, ChatCtrl.UserSearchHobbyBasedGroupFilter)
router.route('/getSingleInitialchatdata').post(verifyToken, Validation.getSingleInitialchatdataValidation, ChatCtrl.getSingleInitialchatdata)

router.route('/getInitialEventchatdata').post(verifyToken, ChatCtrl.getInitialEventchatdata)

// router.route('/HideGroup').post(verifyToken,Validation.HideGroupValidation,ChatCtrl.HideGroup)

// router.route('/GroupInviteMembers').post(verifyToken,ChatCtrl.GroupInviteMembers)

// router.route('/MessagesCount').post(ChatCtrl.MessagesCount)

// router.route('/MembersDetails').post(Validation.ExitGroupValidation,ChatCtrl.MembersDetails)

// router.route('/NewGroupMembersAdd').post(Validation.NewGroupMembersAddValidation,ChatCtrl.NewGroupMembersAdd)

export default router;
