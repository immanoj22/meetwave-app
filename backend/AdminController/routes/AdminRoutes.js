import { Router } from "express";
import * as AdminCtrl from "../controller/admincontroller";
import * as validaton from "../validations/validation"
import { DecryptData, DecryptDatas, verifyAdminToken } from "../../Helper/common";
const router = Router();

router.route('/AdminUserLogin').post(validaton.AdminLoginValidation,AdminCtrl.loginAdmin)
router.route('/categorylist').get(verifyAdminToken,AdminCtrl.categorylist)
// router.route('/adminAddsubcategory').post(verifyAdminToken,validaton.adminAddsubcategoryValidation,AdminCtrl.adminAddsubcategory)
router.route('/subcategorylist').get(verifyAdminToken,AdminCtrl.subcategorylist)
router.route('/Adminblockusers').post(verifyAdminToken,AdminCtrl.Adminblockusers)
router.route('/blockeduser').get(verifyAdminToken,AdminCtrl.blockeduser)
router.route('/unblockeduser').get(verifyAdminToken,AdminCtrl.unblockeduser)
router.route('/categorylistadmin').get(verifyAdminToken,AdminCtrl.categorylistadmin)
router.route('/verifyEmail').post(verifyAdminToken,validaton.AdminEmailverifyValidation,AdminCtrl.verifyEmail)
router.route('/ForgetPassword').post(validaton.AdminForgetValidation,AdminCtrl.ForgetPassword)
router.route('/subcategorylists').get(verifyAdminToken,AdminCtrl.subcategorylists)
router.route('/planAdd').post(verifyAdminToken,AdminCtrl.planAdd)
router.route('/planEdit').post(verifyAdminToken,AdminCtrl.planEdit)
router.route('/planDelete').post(verifyAdminToken,validaton.planDeleteValidation,AdminCtrl.planDelete)
router.route('/plansLists').get(verifyAdminToken,AdminCtrl.plansLists)
router.route('/plansListsAdmin').get(verifyAdminToken,AdminCtrl.plansListsAdmin)
router.route('/hideshowplan').post(verifyAdminToken,validaton.hideshowplanValidation,AdminCtrl.hideshowplan)
router.route('/AddEditGender').post(verifyAdminToken,AdminCtrl.AddEditGender)
router.route('/Genderlists').get(verifyAdminToken,AdminCtrl.Genderlists)
// router.route("/exceltomail").post(verifyAdminToken,AdminCtrl.getemailfromexcel)
router.route("/changemaysent").post(verifyAdminToken,AdminCtrl.changeMaySent);
router.route('/sendSubscribeMail').post(verifyAdminToken,AdminCtrl.SendMails);
router.route('/getSubscribers').get(verifyAdminToken,AdminCtrl.getSubscriberList);
router.route('/getHelplists').get(verifyAdminToken,AdminCtrl.helplist);
router.route('/SendMailsinissueUser').post(verifyAdminToken,validaton.SendMailsinissueUserValidation,AdminCtrl.SendMailsinissueUser);
router.route('/getfeedbacklist').get(verifyAdminToken,AdminCtrl.feedbacklist);
router.route('/UserHelpdelete').post(verifyAdminToken,AdminCtrl.UserHelpdelete);
router.route('/Userfeedbackdelete').post(verifyAdminToken,AdminCtrl.UserFeedbackdelete);
router.route('/UnblockGrouplists').get(verifyAdminToken,AdminCtrl.UnblockGrouplists);
router.route('/BlockGrouplists').get(verifyAdminToken,AdminCtrl.BlockGrouplists);
router.route('/Adminblockgroups').post(verifyAdminToken,AdminCtrl.Adminblockgroups)
router.route('/editemailtemplate').post(verifyAdminToken,AdminCtrl.editEmailTemplateList);
router.route('/getEmailTemplateList').get(verifyAdminToken,AdminCtrl.getEmailTemplateList);
router.route('/userplanlists').get(verifyAdminToken,AdminCtrl.UserplanDetails);
router.route('/plansubscribelistdelete').post(verifyAdminToken,AdminCtrl.plansubscribelistdelete)
router.route('/changepassword').post(verifyAdminToken,validaton.AdminResetpassword,AdminCtrl.changepassword);
// router.route('/AdminChangePassword').post(Validation.ForgetPasswordvalidate, AdminCtrl.AdminChangePassword)
router.route('/planlistDelete').post(verifyAdminToken,validaton.planlistDeleteValidation,AdminCtrl.planlistDelete);
router.route('/Getadminprofile').get(verifyAdminToken,AdminCtrl.Getadminprofile);
router.route('/Editadminprofile').post(verifyAdminToken,AdminCtrl.Editadminprofile);
router.route('/GetUsers').get(verifyAdminToken,AdminCtrl.GetUsers)
router.route('/GetGroups').get(verifyAdminToken,AdminCtrl.GetGroups)
router.route('/GetHobbies').get(verifyAdminToken,AdminCtrl.GetHobbies)
router.route('/GetTransactions').get(verifyAdminToken,AdminCtrl.GetTransactions)
router.route('/AdminHobbylimit').post(verifyAdminToken,AdminCtrl.AdminHobbylimit)
router.route('/GetAdmindata').get(verifyAdminToken,AdminCtrl.GetAdmindata)
router.route('/Eventlists').get(verifyAdminToken,AdminCtrl.Eventlists)
router.route('/eventdelete').post(verifyAdminToken,AdminCtrl.EventDelete)
router.route('/BlockEventlists').get(verifyAdminToken,AdminCtrl.BlockEventlists)
router.route('/Adminblockevents').post(verifyAdminToken,AdminCtrl.Adminblockevents)
router.route('/HobbiesDelete').post(verifyAdminToken,AdminCtrl.HobbiesDelete)
router.route('/getReportData').get(verifyAdminToken, AdminCtrl.getReportData)
// router.route('/getReportersDetails').get(verifyAdminToken, AdminCtrl.getReportersDetails)
router.route('/GroupReport').post(verifyAdminToken, AdminCtrl.GroupReport)
router.route('/adminAddHobbies').post(verifyAdminToken, AdminCtrl.adminAddHobbies)
router.route('/adminAddGroupCategory').post(verifyAdminToken, AdminCtrl.adminAddGroupCategory)
router.route('/adminAddSubcategory').post(verifyAdminToken, AdminCtrl.adminAddSubcategory)
router.route('/adminAddcategory').post(verifyAdminToken,AdminCtrl.adminAddcategory)
router.route('/Groupcategorylists').get(verifyAdminToken,AdminCtrl.Groupcategorylists)
// router.route('/ReportDelete').post(verifyAdminToken, AdminCtrl.ReportDelete)
router.route('/Hobbieslists').get(verifyAdminToken,AdminCtrl.Hobbieslists)
router.route('/CategorySelectHobbiesSubHobbieslists').post(verifyAdminToken,AdminCtrl.CategorySelectHobbiesSubHobbieslists)

//re-order update Api's
router.route('/HobbiesUpdateRearrange').post(verifyAdminToken,AdminCtrl.HobbieslistUpdateRearrange)
router.route('/CategorieslistUpdateRearrange').post(verifyAdminToken,AdminCtrl.CategorieslistUpdateRearrange)
router.route('/SubcategorylistUpdateRearrange').post(verifyAdminToken,AdminCtrl.SubcategorylistUpdateRearrange)

router.route('/refundUpdate').post(verifyAdminToken,AdminCtrl.refundUpdate)

export default router;
