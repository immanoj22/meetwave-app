import express from "express";

import * as cmsController  from "./cmscontroller";
// import * as pushNotifiy from '../pushnotification'

const router = express.Router();

router.route("/cmslist").get(cmsController.getcmslist);
router.route("/cmsedit").post(cmsController.CmsEdit);
router.route("/cmslistdata").get(cmsController.getcmslistData)
router.route('/getfaqlist').get(cmsController.getFaqList);
// router.route("/sendNotification").get(pushNotifiy.sendNotification);
router.route("/addfaq").post(cmsController.AddEditDeleteFAq);
// routers.route('/addfaqcontent').post(userCtrl.AddDelEditFAqcontent);

module.exports = router;
