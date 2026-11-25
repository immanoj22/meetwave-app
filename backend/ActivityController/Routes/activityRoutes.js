import { Router } from "express";
import * as ActivityCtrl from "../controller/activitycontroller";
import { verifyToken } from "../../Helper/common";
import * as validaton from "../validations/validation";

const router = Router();

router.route('/AddNewEvent').post(verifyToken, validaton.UserEventAddValidation, ActivityCtrl.AddNewEvent)
router.route('/EditEvent').post(verifyToken, validaton.UserEventEditValidation, ActivityCtrl.EditEvent)
router.route('/DeleteEvent').post(verifyToken, validaton.DeleteEventValidation, ActivityCtrl.DeleteEvent)
// router.route('/eventInterest').post(verifyToken, validaton.UserEventinterestValidation, ActivityCtrl.eventInterest)
// router.route('/Eventlists').get(verifyToken, ActivityCtrl.Eventlists)
router.route('/UserjoinUser').post(verifyToken, validaton.UserEventjoinValidation, ActivityCtrl.UserjoinUser)
// router.route('/findEventsNearLocation').post(validaton.UserFilterValidation,verifyToken,ActivityCtrl.FilterUsersNearLocation)
// findUsersNearLocation
router.route('/findUsersNearLocation').post(verifyToken, validaton.FilterUsersNearLocationValidation, ActivityCtrl.FilterUsersNearLocation)
// router.route('/hobbysearch').post(verifyToken,ActivityCtrl.hobbysearch) //admin
// router.route('/EventPublicOrPrivate').post(verifyToken, ActivityCtrl.EventPublicOrPrivate)
router.route('/EventComments').post(verifyToken, validaton.UserEventCommentsValidation, ActivityCtrl.EventComments)
router.route('/Getcommentslist').post(verifyToken, validaton.UserGetcommentslistValidation, ActivityCtrl.Getcommentslist)
router.route('/DeleteEventComments').post(verifyToken, validaton.UserDeleteEventCommentsValidation, ActivityCtrl.DeleteEventComments)
router.route('/EventJoinedMemberslist').post(verifyToken, ActivityCtrl.EventJoinedMemberslist)
router.route('/UserCreateEventlist').get(verifyToken, validaton.UserEventCreatedlistsValidation, ActivityCtrl.UserCreateEventlist)
router.route('/EventWhish').post(verifyToken, validaton.UserEventWhishValidation, ActivityCtrl.EventWhish)
router.route('/EventWhishLists').get(verifyToken, validaton.UserEventWhishListsValidation, ActivityCtrl.EventWhishLists)
// router.route('/ImageDelete').post(verifyToken, validaton.EventImageDeleteValidation, ActivityCtrl.ImageDelete)
router.route('/FindNearbyEvents').post(verifyToken, validaton.UserFilterValidation, ActivityCtrl.FindNearbyEvents)
// router.route('/MyEventCreateLists').post(verifyToken, ActivityCtrl.MyEventCreateLists)
router.route('/eventDetails').post(verifyToken,validaton.EventDetailsValidation, ActivityCtrl.eventDetails)

router.route('/upcomingEvents').get(verifyToken, ActivityCtrl.upcomingEvents)

// router.route('/addOtherProfileOwnHobbies').post(verifyToken, ActivityCtrl.addOtherProfileOwnHobbies)

export default router;
