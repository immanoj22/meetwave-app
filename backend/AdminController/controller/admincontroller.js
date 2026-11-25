import { AddRemoveCreateGroup, DecryptData, EncryptData, ForgetPasswordfunc, ImageAddFunc, Node_Mailer, ParsingFunc, bcryptcompare, catchErrorResponse, changepasswordfunc, escapeRegex, isEmpty, jasonwebtoken, passwordcreationfunc, sendMailNodeMailer, verifyemailfunc } from "../../Helper/common";
import Admin from "../Models/admin_schema";
// import config from "../../Config/config"

import User from "../../UserController/Models/user_schema"
import Block from "../Models/blockmessage_schema"
import Blockgroup from "../Models/blockgroups_schema"
import Blockevent from "../Models/blockevents"

import Plan from "../Models/plan_schema"
import Gender from "../Models/gender_schema"
import Subscribers from "../Models/emailupdate_schema"
import Help from "../../UserController/Models/help_schema"
import Feedback from "../../UserController/Models/feedback_schema"
import EmailTemplate from "../Models/emailtemplate_schema"
import Userplan from "../../UserController/Models/userplan_schema"
import Event from "../../ActivityController/Models/event_schema"
import mongoose from "mongoose"
// const reader = require('xlsx')
// import fs from "fs"
import ChatModel from "../../Chat/Models/instance_schema";
import Report from "../../commonSchema/report_schema"
// import Group from "../../Chat/Models/instance_schema"
import { ReportsData, SubcategoryLists, UserHobbysearch, UserPlandetails } from "../../Helper/mongooseHelper";
import { sendPushNotification } from "../../pushnotification";
// import Hobby from "../../UserController/Models/hobbies_schema"
import Category from "../Models/category_schema"
import Subcategory from "../Models/subcategory_schema"
import Groupcategory from "../Models/groupCategory.schema"
import HobbiesAddAdmin from "../Models/Hobbiesadmin.schema"
import categoryModel from "../Models/category_schema"


const ObjectId = mongoose.Types.ObjectId

/*
 * METHOD : POST
 * BODY: (email,password)
 * URL : /v1/admin/loginAdmin
 */
export const loginAdmin = async (req, res) => {
    console.log("ReqfffBody", req.body);

    try {
        var ReqBody = req.body
        console.log("ReqBody", ReqBody);

        var checkPassword = ReqBody?.password;
        const user = await Admin.findOne({ email: ReqBody?.email })
        console.log("svgdfgdfgdf", user);
        // if(user?.islogin == true){
        //     return res.status(200).json({status:false,message:"Already logged in"})
        // }
        if (user) {
            console.log("user", user)

            const match = await bcryptcompare(checkPassword, user.password);
            if (match) {
                var payload = { "email": ReqBody?.email, "password": user?.hashpassword, "name": user?.name, "_id": user?._id, "hobby_limit": user?.hobby_limit, "eventImage_limit": user?.eventImage_limit }
                console.log("payload", payload)

                var tokenhash = await jasonwebtoken(payload)
                var token = `Bearer ${tokenhash}`

                return res.status(200).json(EncryptData({ "status": true, "message": "Successfully logged in", "token": token }))
            }
            else {
                return res.status(200).json(EncryptData({ "status": false, "message": "Incorrect password" }))
            }

        } else { return res.status(200).json(EncryptData({ "status": false, "message": "This email user not found" })) }

    }
    catch (e) {
        catchErrorResponse(res, e)
    }
}

/*
 * METHOD : POST
 * BODY: (categoryname, id, hideshow, type, description)
 * URL : /v1/admin/adminAddcategory
 */
export const adminAddcategory = async (req, res) => {
    // console.log("requests", req.body);
    try {
        const { categoryname, id, hideshow, type, description } = req.body
        if (type == "add") {
            let existcategory = await Category.findOne({ category: categoryname })
            if (existcategory) {
                return res.status(200).json(EncryptData({ status: false, message: "This category already exists" }))

            }
            else {
                let existcategory = await Category.find({})
                console.log("existcategory", existcategory.length);

                let payload = {
                    category: categoryname.trim(),
                    description: description,
                    order: existcategory?.length + 1
                }
                let data = new Category(payload)
                let resp = await data.save()
                console.log("responses", resp);
                if (resp) {
                    return res.status(200).json(EncryptData({ status: true, message: "Category Added", data: resp }))
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }

        }
        else if (type == "edit") {
            let resp = await Category.findOneAndUpdate({ _id: id }, { $set: { category: categoryname.trim(), description: description } }, { new: true })
            console.log("responses", resp);
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: "Category updated", data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
        else if (type == "hide") {
            let resp = await Category.findOneAndUpdate({ _id: id }, { hideshow: hideshow }, { new: true })
            console.log("responses", resp);
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: `Category ${hideshow}`, data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (categoryId, id, type, subcategoryname, description)
 * URL : /v1/admin/adminAddSubcategory
 */
export const adminAddSubcategory = async (req, res) => {
    console.log("requests", req.body);
    try {
        const { categoryId, id, hideshow, type, subcategoryname, description } = req.body
        if (type == "add") {
            if (!categoryId) {
                return res.status(200).json({ status: false, message: "Category is required" })
            }
            let existcategory = await Subcategory.findOne({ categoryId: categoryId, subcategory: subcategoryname })
            console.log("ExistCategorys", existcategory);
            if (existcategory) {
                return res.status(200).json(EncryptData({ status: false, message: "This subcategory name already exists" }))

            }
            else {
                let existcategory = await Subcategory.find({})
                console.log("existcategory", existcategory.length);

                let payload = {
                    subcategory: subcategoryname.trim(),
                    categoryId: categoryId ? new ObjectId(categoryId) : "",
                    description: description,
                    order: existcategory?.length + 1
                }
                let data = new Subcategory(payload)
                let resp = await data.save()
                console.log("responses", resp);
                if (resp) {
                    return res.status(200).json(EncryptData({ status: true, message: "Subcategory Added", data: resp }))
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }

        }
        else if (type == "edit") {
            let resp = await Subcategory.findOneAndUpdate({ _id: id }, { $set: { subcategory: subcategoryname.trim(), description: description, categoryId: categoryId ?? "" } }, { new: true })
            console.log("responses", resp);
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: "Subcategory updated", data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
        else if (type == "hide") {
            let resp = await Subcategory.findOneAndUpdate({ _id: id }, { hideshow: hideshow }, { new: true })
            console.log("redfsponses", resp);
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: `Subcategory ${hideshow}`, data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
        // else if (type == "hide") {
        //     let resp = await Subcategory.findOneAndUpdate({ _id: id }, { hideshow: hideshow }, { new: true })
        //     console.log("responses", resp);
        //     if (resp) {
        //         return res.status(200).json(({ status: true, message: `subcategory ${hideshow}`, data: resp }))
        //     }
        //     else {
        //         return res.status(200).json(({ status: false, message: "Something error" }))
        //     }
        // }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (categoryId, subcategoryId, id, type, groupname, description)
 * URL : /v1/admin/adminAddGroupCategory
 */
export const adminAddGroupCategory = async (req, res) => {
    // console.log("requests", req.body);
    try {
        const { categoryId, subcategoryId, id, hideshow, type, groupname, description } = req.body
        if (type == "add") {
            let existcategory = await Groupcategory.findOne({ group: groupname })
            if (existcategory) {
                return res.status(200).json(EncryptData({ status: false, message: "This group name already exists" }))

            }
            else {
                let payload = {
                    group: groupname.trim(),
                    categoryId: categoryId ? new ObjectId(categoryId) : "",
                    subcategoryId: subcategoryId ? new ObjectId(subcategoryId) : "",
                    description: description
                }
                let data = new Groupcategory(payload)
                let resp = await data.save()
                console.log("responses", resp);
                if (resp) {
                    return res.status(200).json(EncryptData({ status: true, message: "Groupcategory Added", data: resp }))
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }

        }
        else if (type == "edit") {
            let resp = await Groupcategory.findOneAndUpdate({ _id: id }, { $set: { group: groupname, description: description } }, { new: true })
            console.log("responses", resp);
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: "Groupcategory updated", data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
        // else if (type == "hide") {
        //     let resp = await Groupcategory.findOneAndUpdate({ _id: id }, { hideshow: hideshow }, { new: true })
        //     console.log("responses", resp);
        //     if (resp) {
        //         return res.status(200).json(({ status: true, message: `Groupcategory ${hideshow}`, data: resp }))
        //     }
        //     else {
        //         return res.status(200).json(({ status: false, message: "Something error" }))
        //     }
        // }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (subcategoryId, categoryId, hobbyname, description, plan, type, id)
 * URL : /v1/admin/adminAddHobbies
 */
export const adminAddHobbies = async (req, res) => {
    console.log("responses_admin", req.body);
    try {
        const { subcategoryId, categoryId, hobbyname, description, hideshow, plan, type, id } = req.body

        let findplan = await Plan.findOne({ _id: new ObjectId(plan) })
        console.log("findplan", findplan)
        const DEFAULT_SUBCATEGORY = "000000000000000000000000";
        if (type !== "delete" && type !== "edit") {
            const findHobby = await HobbiesAddAdmin.findOne({
                categoryId: categoryId
            });
            console.log("🚀 ~ adminAddHobbies ~ findHobby:", findHobby)
            if ((findHobby.categoryId && findHobby.subcategoryId !== DEFAULT_SUBCATEGORY) && (isEmpty(subcategoryId))) {
                return res.status(200).json(EncryptData({ status: false, message: "Hobby already exists in another structure." }))
            }
            if ((findHobby.categoryId && findHobby.subcategoryId == DEFAULT_SUBCATEGORY) && (!isEmpty(subcategoryId))) {
                return res.status(200).json(EncryptData({ status: false, message: "Hobby already exists in another structure." }))
            }
        }
        let planstatus = findplan?.planType == "free" ? false : true
        if (type == "add") {
            let existsubcategory = await HobbiesAddAdmin.findOne({ categoryId: categoryId, subcategoryId: subcategoryId, hobbyname: hobbyname })
            if (existsubcategory) {
                return res.status(200).json(EncryptData({ status: false, message: "This hobbyname already exists" }))
            }
            else {
                let findHobbiesLength = await HobbiesAddAdmin.find({})
                console.log("findHobbiesLength", findHobbiesLength.length);

                let payload = {
                    hobbyname: hobbyname.trim(),
                    subcategoryId: subcategoryId ? new ObjectId(subcategoryId) : "000000000000000000000000",
                    categoryId: categoryId ? new ObjectId(categoryId) : "000000000000000000000000",
                    // groupId: groupId ? new ObjectId(groupId) :new ObjectId("0x0000000000000000000000"),
                    description: description,
                    plan: findplan?.planType,
                    // planId:plan? new ObjectId(plan) : null,
                    planStatus: planstatus ? planstatus : "",
                    paid_level: findplan?.level,
                    order: findHobbiesLength?.length + 1
                }
                let data = new HobbiesAddAdmin(payload)
                let resp = await data.save()
                console.log("responses", resp);

                if (resp) {
                    return res.status(200).json(EncryptData({ status: true, message: "Hobbies Added", data: resp }))
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }

        }
        else if (type == "edit") {
            // planId: plan ?plan :null
            let resp = await HobbiesAddAdmin.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { hobbyname: hobbyname.trim(), subcategoryId: subcategoryId, description: description, plan: findplan?.planType, planStatus: planstatus ? planstatus : "", paid_level: findplan?.level } }, { new: true })
            console.log("responses", resp);

            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: "Hobbies updated", data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
        else if (type == "delete") {
            // let resp = await HobbiesAddAdmin.findOneAndDelete({ _id: new ObjectId(id) }, { new: true })
            let resp = await HobbiesAddAdmin.findOneAndUpdate({ _id: new ObjectId(id) }, { hideshow: "hidden" }, { new: true })
            console.log("responses", resp);
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: `Hobbies deleted`, data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}
// export const adminAddcategory = async (req,res)=>{
//     console.log("reqaddcategory",req.body)
//     try {

//     } catch (error) {
//         catchErrorResponse(res,error)
//     }
// }


export const categorylist = async (req, res) => {
    try {
        let resp = await Category.find({}).sort({ order: 1 })
        console.log("resposne", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: `Category lists`, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (subcategory, categoryId, description, hideshow, plan, type, id)
 * URL : /v1/admin/adminAddsubcategory
 */
// export const adminAddsubcategory = async (req, res) => {
//     console.log("responses", req.body);
//     try {
//         const { subcategory, categoryId, description, hideshow, plan, type, id } = req.body


//         let findplan = await Plan.findOne({ _id: plan })
//         let planstatus = findplan?.planType == "free" ? false : true
//         if (type == "add") {
//             let existsubcategory = await Subcategory.findOne({ subcategory: subcategory })
//             if (existsubcategory) {
//                 res.status(200).json(EncryptData({ status: false, message: "This subcategory already exists" }))

//             }
//             else {
//                 let payload = {
//                     subcategory: subcategory,
//                     description: description,
//                     plan: findplan?.planType,
//                     planId: plan,
//                     planStatus: planstatus,
//                     paid_level: findplan?.level
//                 }
//                 let data = new Subcategory(payload)
//                 let resp = await data.save()
//                 console.log("responses", resp);

//                 let findata = await Category.findOneAndUpdate({ _id: categoryId }, { $push: { "subcategoryId": resp._id } }, { new: true })
//                 console.log("findatafindata", findata);
//                 if (resp) {
//                     return res.status(200).json(EncryptData({ status: true, message: "Subcategory Added", data: resp }))
//                 }
//                 else {
//                     return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
//                 }
//             }

//         }
//         else if (type == "edit") {
//             let resp = await Subcategory.findOneAndUpdate({ _id: new ObjectId(id) }, { subcategory: subcategory, description: description, planId: plan, plan: findplan?.planType, planStatus: planstatus, paid_level: findplan?.level }, { new: true })
//             console.log("responses", resp);

//             if (resp) {
//                 return res.status(200).json(EncryptData({ status: true, message: "Subcategory updated", data: resp }))
//             }
//             else {
//                 return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
//             }
//         }
//         else if (type == "hide") {
//             let resp = await Subcategory.findOneAndUpdate({ _id: new ObjectId(id) }, { hideshow: hideshow }, { new: true })
//             console.log("responses", resp);
//             if (resp) {
//                 return res.status(200).json(EncryptData({ status: true, message: `Subcategory ${hideshow}`, data: resp }))
//             }
//             else {
//                 return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
//             }
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }


export const subcategorylist = async (req, res) => {
    try {
        let resp = await Subcategory.find({}).sort({ order: 1 }).populate("categoryId")
        console.log("resposne", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: `Subcategory lists`, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

//block message
/*
 * METHOD : POST
 * BODY: (userId, blockedReason, type)
 * URL : /v1/admin/Adminblockusers
 */
export const Adminblockusers = async (req, res) => {
    console.log("resopnses", req.body);
    try {
        const { userId, blockedReason, type, id } = req.body
        if (type == "block") {
            let finduser = await Block.findOne({ userId: userId }).populate({ path: "userId" })
            console.log("users", finduser);
            if (finduser) {
                let updateblockuser = await Block.findOneAndUpdate({ userId: userId }, { $set: { blockStatus: "blocked", blockedReason: blockedReason } }, { new: true })
                let updateuser = await User.findOneAndUpdate({ _id: userId }, { $set: { blockStatus: "blocked", blockedReason: blockedReason } }, { new: true })

                if (updateuser && updateblockuser) {

                    res.status(200).json(EncryptData({ status: true, message: "User blocked successfully", data: updateuser }))
                    if (finduser?.userId?.pushNotification) {
                        await sendPushNotification({
                            type: "blocked",
                            tokens: finduser?.userId?.fcmToken,
                            title: "Blocked",
                            content: blockedReason
                        });
                    }
                }
                else {
                    res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }
            else {

                let payload = {
                    userId: userId,
                    blockedReason: blockedReason,
                    blockStatus: "blocked"
                }
                let data = new Block(payload)
                let resp = await data.save()
                console.log("responses", resp);
                let updateuser = await User.findOneAndUpdate({ _id: userId }, { $set: { blockStatus: "blocked", blockedReason: resp.blockedReason } }, { new: true })
                console.log("updateuser", updateuser);
                if (resp) {

                    res.status(200).json(EncryptData({ status: true, message: "User blocked successfully", data: updateuser }))
                    if (updateuser?.pushNotification) {
                        await sendPushNotification({
                            type: "blocked",
                            tokens: updateuser?.fcmToken,
                            title: "Blocked",
                            content: resp?.blockedReason
                        });
                    }
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }

        }
        else if (type == "unblock") {
            let resp = await Block.findOneAndUpdate({ userId: userId }, { $set: { blockStatus: "unblocked" } }, { new: true }).populate("userId")
            let updateuser = await User.findOneAndUpdate({ _id: userId }, { $set: { blockStatus: "unblocked", blockedReason: "" } }, { new: true })
            console.log("updateuser_unblock", updateuser);
            if (resp) {

                res.status(200).json(EncryptData({ status: true, message: "User unblocked successfully", data: updateuser }))
                if (resp?.userId?.pushNotification) {
                    await sendPushNotification({
                        type: "unblocked",
                        tokens: resp?.userId?.fcmToken,
                        title: "Unblocked",
                        content: "Your is unblocked"
                    });
                }
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : GET
 * BODY: (searchtext)
 * URL : /v1/admin/blockeduser
 */
export const blockeduser = async (req, res) => {
    try {
        console.log("searchFunctionsdggggg", req.query)
        const { page, limit } = req.query
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        let resp, count;
        const regex = `^${escapeRegex(req.query.searchtext)}`;
        if (req.query.searchtext) {
            resp = await User.find({
                blockStatus: "blocked", delete: false, $or: [
                    { name: { $regex: regex, $options: 'i' } },
                    { username: { $regex: regex, $options: 'i' } },
                    { email: { $regex: regex, $options: 'i' } }]
            }).populate("hobbies").sort({ "createdAt": -1 })
        }
        else {
            resp = await User.find({ blockStatus: "blocked", delete: false }).skip(skip).limit(limit).populate({ path: "hobbies", select: "_id hobbyname plan hideshow" }).sort({ "createdAt": -1 })
            count = await User.countDocuments({ blockStatus: "blocked", delete: false })

        }
        console.log("blockuser", resp);

        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Blocked users lists", data: resp, count: count }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : GET
 * BODY: (searchtext)
 * URL : /v1/admin/unblockeduser
 */
export const unblockeduser = async (req, res) => {
    try {
        const { page, limit } = req.query
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        console.log("_123unblockeduser", req.query)
        let resp, count;
        const regex = `^${escapeRegex(req.query.searchtext)}`;
        if (req.query.searchtext) {
            resp = await User.find({
                blockStatus: "unblocked", delete: false, $or: [
                    { name: { $regex: regex, $options: 'i' } },
                    { username: { $regex: regex, $options: 'i' } },
                    { email: { $regex: regex, $options: 'i' } }
                ]
            }).populate({ path: "hobbies", select: "_id hobbyname plan hideshow" }).sort({ "createdAt": -1 })
        }
        else {
            resp = await User.find({ blockStatus: "unblocked", delete: false }).skip(skip).limit(limit).populate({ path: "hobbies", select: "_id hobbyname plan hideshow" }).sort({ "createdAt": -1 })
            count = await User.countDocuments({ blockStatus: "unblocked", delete: false })
        }
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Unblocked users lists", data: resp, count: count }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}




export const categorylistadmin = async (req, res) => {
    try {
        let resp = await Category.find({ hideshow: "visible" }, { category: 1, _id: 1, label: "$category", value: "$category" }).populate("subcategoryId")
        console.log("resposne", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: `Category lists`, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)  
    }
}

/*
 * METHOD : POST
 * BODY: (email,OTP)
 * URL : /v1/admin/verifyEmail
 */
export const verifyEmail = async (req, res) => {
    try {
        await verifyemailfunc(req, res, Admin, "forgetotp")
    } catch (error) {
        // console.log("verifyEmail_error", error);
        // res.status(500).json({ status: false, message: "Something went error in verify" })
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (email,OTP,Newpassword,Confirmpassword)
 * URL : /v1/admin/ForgetPassword
 */
export const ForgetPassword = async (req, res) => {
    try {
        await ForgetPasswordfunc(req, res, Admin)
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : GET
 * BODY: (hobbyname)
 * URL : /v1/admin/subcategorylists
 */
export const subcategorylists = async (req, res) => {
    console.log("dfgfdgfdbghh", req.query);
    try {
        const { hobbyname } = req.query
        // let regex = new RegExp(hobbyname, "i"); 
        // let resp = await HobbiesAddAdmin.find({ hobbyname: { $regex: regex } })
        const Matchfinddata = await UserHobbysearch({ DbName: categoryModel, hobbyname: hobbyname })

        // console.log("responsesssss", Matchfinddata);
        if (Matchfinddata) {
            return res.status(200).json(EncryptData({ status: true, message: "All subcategory data", data: Matchfinddata.data }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (planType, level, plan_description, planDays, planPrice, bonuswords, planid, type)
 * URL : /v1/admin/planAdd
 */
export const planAdd = async (req, res) => {
    console.log("requests_plan", req.body);
    try {
        const { planType, level, plan_description, planDays, planPrice, bonuswords, planid, plansBenifits, planinId, type, status } = req.body
        let findData = await Plan.findOne({ _id: planid })
        console.log("findData", findData);
        let findDataexist = await Plan.findOne({ level: level })
        if (findDataexist) {
            return res.status(200).json(EncryptData({ status: false, message: "This level already exists" }))
        }
        else {
            let payload = {
                planType: planType?.toLowerCase(),
                plan_description: plan_description,
                level: level
            }
            console.log("payloads", payload);
            if (type == "planDaysAdd") {
                if (findData) {
                    // let setData = {plansBenifits:[]}
                    // setData.planDays = planDays
                    // setData.planPrice = planPrice
                    // setData.bonuswords = bonuswords ?? "",
                    // setData.plansBenifits.push({
                    //     benifit:plansBenifits,
                    //     benifitStatus:true
                    // }) 
                    const setData = {
                        planDays,
                        planPrice,
                        bonuswords: bonuswords ?? "",
                        plansBenifits: plansBenifits.map((benefit) => {
                            // console.log('Mapping benefit:', benefit);
                            return {
                                benefit: benefit,
                                benefitStatus: true,
                                uniqId: (Math.floor(100000 + Math.random() * 900000)).toString(),
                            };
                        }),
                    };

                    let resp = await Plan.findOneAndUpdate({ _id: planid }, { $push: { "plan_days": setData } }, { new: true })
                    if (resp) {
                        res.status(200).json(({ status: true, message: "Plan saved", data: resp }))
                    }
                    else {
                        res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                    }
                }
            }
            else {
                let record = new Plan(payload)
                let resp = await record.save()
                console.log("responses", resp);

                if (resp) {
                    return res.status(200).json(EncryptData({ status: true, message: "Plan saved", data: resp }))
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (planType, level, plan_description, planDays, planPrice, bonuswords, planid, planinId, type)
 * URL : /v1/admin/planEdit
 */
export const planEdit = async (req, res) => {
    console.log("requests_plan", req.body);
    try {
        const { planType, level, plan_description, planDays, planPrice, bonuswords, planid, planinId, type, plansBenifits, status } = req.body
        // let findData = await Plan.findOne({ _id: planid })
        if (type == "editplan") {
            const getData = await Plan.findOneAndUpdate({ "plan_days._id": planinId, _id: new ObjectId(planid) }, {
                $set: {
                    'plan_days.$.planPrice': planPrice,
                    'plan_days.$.bonuswords': bonuswords,
                    'plan_days.$.planDays': planDays,
                    'plan_days.$.plansBenifits': plansBenifits
                }
            }, { new: true })
            console.log("getData", getData);
            if (getData) {
                return res.status(200).json(EncryptData({ status: true, message: "Plan updated", data: getData }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
        else {
            // let findDataexist = await Plan.findOne({ level: level })
            // if (findDataexist) {
            //     res.status(200).json({ status: false, message: "This level already exists" })
            // }
            // else {
            let payload = {
                planType: planType?.toLowerCase(),
                plan_description: plan_description,
                level: level
            }
            console.log("payloads", payload);
            let resp = await Plan.findOneAndUpdate({ _id: new ObjectId(planid) }, { $set: payload }, { new: true })

            console.log("responses", resp);
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: "Plan updated", data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
            // }
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (planid,planinId)
 * URL : /v1/admin/planDelete
 */
export const planDelete = async (req, res) => {
    console.log("requests_plan", req.body);
    try {
        // let resp = await Plan.findOneAndUpdate({ _id: req.body.planid }, { delete: true }, { new: true })
        // console.log("responses", resp);
        const getData = await Plan.findOneAndUpdate({ _id: req.body.planid }, { $pull: { plan_days: { _id: req.body.planinId } } }, { new: true })
        console.log("getData", getData);
        // if (resp) {
        //     res.status(200).json({ status: true, message: "plan deleted", data: resp })
        // }
        if (getData) {
            return res.status(200).json(EncryptData({ status: true, message: "Plan deleted", data: getData }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (planid)
 * URL : /v1/admin/planlistDelete
 */
export const planlistDelete = async (req, res) => {
    console.log("requests_plan", req.body);
    try {
        // let resp = await Plan.findOneAndUpdate({ _id: req.body.planid }, { delete: true }, { new: true })
        // console.log("responses", resp);
        const getData = await Plan.findOneAndDelete({ _id: req.body.planid })
        console.log("getData", getData);
        // if (resp) {
        //     res.status(200).json({ status: true, message: "plan deleted", data: resp })
        // }
        if (getData) {
            return res.status(200).json(EncryptData({ status: true, message: "Plan deleted", data: getData }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


export const plansListsAdmin = async (req, res) => {
    console.log("requests_plan", req.body);
    try {
        let resp = await Plan.find({})
        console.log("responses", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Plans", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

//subcategory hobbies
export const plansLists = async (req, res) => {
    console.log("requests_plan", req.body);
    try {
        let resp = await Plan.find({ delete: false }, { planType: 1, _id: 1, label: "$planType", value: "$planType" })
        console.log("responsedddddddddds", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Plans", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (planId,hideshow)
 * URL : /v1/admin/hideshowplan
 */
export const hideshowplan = async (req, res) => {
    console.log("resfsdfsdfs", req.body);
    try {
        let resp = await Plan.findOneAndUpdate({ _id: req.body.planId }, { hideshow: req.body.hideshow })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: `${req.body.hideshow} successfully`, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


//Gender
/*
 * METHOD : POST
 * BODY: (type, gendername, id)
 * URL : /v1/admin/AddEditGender
 */
export const AddEditGender = async (req, res) => {
    console.log("request", req.body);
    try {
        const { type, gendername, id } = req.body
        if (type == "add") {
            let payload = { gendername: gendername }
            let data = new Gender(payload)
            let resp = await data.save()
            console.log("reponses", resp);
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: "Gender added", data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
        else if (type == "edit") {
            let resp = await Gender.findOneAndUpdate({ _id: id }, { $set: { gendername: gendername } }, { new: true })
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: "Gender updated", data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
        else {
            let resp = await Gender.findOneAndDelete({ _id: id }, { new: true })
            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: "Gender deleted", data: resp }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}


export const Genderlists = async (req, res) => {
    console.log("erswerwerwer", req.body);
    try {
        let resp = await Gender.find({})

        if (resp) {
            // let tresp = EncryptData({ status: true, message: "gender lists", data: resp })
            // console.log("rewrwerwerwerwer",tresp,"Deffffff",DecryptData(tresp));
            return res.status(200).json(EncryptData({ status: true, message: "Gender lists", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

//email update
export const changeMaySent = async (req, res) => {
    try {
        console.log("all", req?.body?.all);
        if (req?.body?.all == false || req.body.all) {
            console.log('ksjfkjskfgjs', req.body.all)
            const resp = await Subscribers.updateMany({}, { $set: { maySent: req.body.all } });
            if (resp) {
                console.log("resp after cms", resp)
                return res.status(200).json(EncryptData({ "status": true, "message": "Action Successful" }))
            }
            else
                return res.status(200).json(EncryptData({ "status": false, "message": "Action failed" }))

        } else {
            console.log("cahnge status maysent")
            console.log("reqnody", req.body)

            var resp = await Subscribers.findOneAndUpdate({ "email": req.body.email }, { $set: { "maySent": req.body.maySent } }, { new: true });
            if (resp) {
                console.log("resp after cms", resp)
                return res.status(200).json(EncryptData({ "status": true, "message": "Action Successful" }))
            }
            else
                return res.status(200).json(EncryptData({ "status": false, "message": "Action failed" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}
// export const getemailfromexcel = async (req, res) => {
//     console.log("eccecelce", req.files, req.body);
//     try {

//         var data = []
//         var excelfile = req?.files?.excel;
//         var path = "./public/bulkListing/"
//         console.log("excel ", excelfile);
//         await fs.mkdir(path, { recursive: true }, async function (err) {
//             if (err) {
//                 return false;
//             }
//             else {
//                 var type = excelfile?.name.includes('.xlsx')
//                 console.log("type", type)
//                 if (excelfile?.name.includes('.xlsx')) {
//                     excelfile?.mv(path + excelfile?.name, function (err) {
//                         if (err) {
//                             console.log("errexcel", err)
//                         } else {
//                             const file = reader.readFile(path + excelfile?.name)
//                             // console.log("file",file);
//                             const sheets = file.SheetNames
//                             // console.log("sheets",sheets);
//                             for (let i = 0; i < sheets.length; i++) {
//                                 const temp = reader.utils.sheet_to_json(
//                                     file.Sheets[file.SheetNames[i]])
//                                 // console.log("temp",temp);
//                                 temp.forEach((res) => {
//                                     console.log("res", res);
//                                     res?.email && data.push(res?.email)

//                                 })
//                             }
//                             data.map(async (item) => {
//                                 var detail = await Subscribers.findOne({ email: item });
//                                 if (detail === null || undefined) {
//                                     var resp = new Subscribers({ email: item });
//                                     resp.save()
//                                 }

//                             })
//                             res.json(EncryptData({
//                                 status: true,
//                                 subscribers: data,
//                                 message: "users Added Succesfully"
//                             }))
//                         }
//                     })
//                 }
//                 else {
//                     res.json(EncryptData({ status: false, message: "please select only .xlsx file only" }))
//                 }


//             }

//         });
//     }
//     catch (err) {
//         console.log("err", err)
//         catchErrorResponse(res, err)
//     }
// }

/*
 * METHOD : POST
 * BODY: (boc, subject)
 * URL : /v1/admin/SendMails
 */
export const SendMails = async (req, res) => {
    console.log("sendmailsss", req.body)
    try {
        let reqBody = req.body;
        let bodyOfContent = reqBody.boc;
        let subject = reqBody.subject;
        // let subscribers = await Subscribers.find({ maySent: false }, { _id: 0, email: 1 });
        let subscribers = await Subscribers.find({}, { _id: 0, email: 1 });
        console.log("subscriberws to send ", subscribers, subscribers.length)
        // let SubscribeUsers = await User.find({email:{$in:subscribers}})
        // console.log("SubscribeUsers",SubscribeUsers);
        var all = []
        await Promise.all(
            subscribers.map(async (item) => {
                console.log("dfgdgggggg", item);
                // var data = await sendMailNodeMailer({ toEmail: item.email, htmlContent: bodyOfContent, subject: subject || 'News Letter' })
                var data = await Node_Mailer({ Type: "subscribersmailsend", EmailId: item.email, Content: bodyOfContent, Subject: subject || 'News Letter' })

                all.push(data)
            })
        )
        var finds = all.filter(item => item.maySent == false)
        console.log("all_1232324", finds);
        // let data = await sendMailNodeMailer({ toEmail: emails, htmlContent: bodyOfContent, subject: subject || 'News Letter' });
        return res.status(200).json(EncryptData({ status: true, data: finds.length == 0 ? all[0] : finds[0] }));
    } catch (err) {
        console.log("mailerr", err);
        catchErrorResponse(res, err)
    }
}

/*
 * METHOD : POST
 * BODY: (email, boc, subject,type(help or feedback))
 * URL : /v1/admin/SendMailsinissueUser
 */
export const SendMailsinissueUser = async (req, res) => {
    try {
        let reqBody = req.body;
        let bodyOfContent = reqBody.boc;
        let subject = reqBody.subject;
        let emailuser = await User.findOne({ email: reqBody.email })
        console.log("emailuser", emailuser);
        if (emailuser) {
            if (reqBody.type == "help") {
                let findtoupdate = await Help.findOneAndUpdate({ _id: reqBody.id }, { $set: { maySent: "success" } }, { new: true })
            }
            else {
                let findtoupdate = await Feedback.findOneAndUpdate({ _id: reqBody.id }, { $set: { maySent: "success" } }, { new: true })
            }
            const Type = reqBody.type == "help" ? "helpmail" : "feedbackmail"

            const data = await Node_Mailer({ Type: Type, username: emailuser?.username, Eventcreatermail: emailuser?.email, Subject: subject, Content: bodyOfContent })
            return res.status(200).json(EncryptData({ status: true, data: data.message }));
        }
        else {
            return res.status(200).json(EncryptData({ status: false, data: "User not found" }));
        }
    } catch (err) {
        console.log("mailerr", err);
        catchErrorResponse(res, err)

    }

}

/*
 * METHOD : POST
 * BODY: (email)
 * URL : /v1/admin/getSubscriberList
 */
export const getSubscriberList = async (req, res) => {
    console.log("eamilsdata", req.query)
    try {
        const { page, limit } = req.query
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        console.log("get subscroiber controller")
        const { email } = req.query
        let query = email ? { email: { $regex: new RegExp(`^${escapeRegex(email)}`, "i") } } : {};
        var [resp, count] = await Promise.all([
            Subscribers.find(query).skip(skip).limit(limit),
            Subscribers.countDocuments({})
        ])
        if (resp) {
            console.log("data", resp)
            return res.status(200).json(EncryptData({ "status": true, "data": resp, count: count }))
        }
        else
            return res.status(200).json(EncryptData({ "status": false, "data": resp }))
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const helplist = async (req, res) => {
    try {
        const { page, limit } = req.query
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        let [resp, count] = await Promise.all([
            Help.find({ status: false }).skip(skip).limit(limit).sort({ updatedAt: -1 }),
            Help.countDocuments({ status: false })
        ])
        console.log("resposness0", resp);
        if (resp) {
            console.log("data", resp)
            return res.status(200).json(EncryptData({ "status": true, "data": resp, count: count }))
        }
        else
            return res.status(200).json(EncryptData({ "status": false, "data": resp }))

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const feedbacklist = async (req, res) => {
    try {
        const { page, limit } = req.query
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        // let resp = await Feedback.find({ status: false }).sort({ updatedAt: -1 })
        let [resp, count] = await Promise.all([
            Feedback.find({ status: false }).skip(skip).limit(limit).sort({ updatedAt: -1 }),
            Feedback.countDocuments({ status: false })
        ])
        console.log("resposness1", resp);
        if (resp) {
            console.log("data", resp)
            return res.status(200).json(EncryptData({ "status": true, "data": resp, count: count }))
        }
        else
            return res.status(200).json(EncryptData({ "status": false, "data": resp }))
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (id)
 * URL : /v1/admin/UserHelpdelete
 */
export const UserHelpdelete = async (req, res) => {
    try {
        let resp = await Help.findOneAndUpdate({ _id: req.body.id }, { status: true }, { new: true })
        if (resp) {
            console.log("data", resp)
            return res.status(200).json(EncryptData({ "status": true, "message": "Deleted", "data": resp }))
        }
        else
            return res.status(200).json(EncryptData({ "status": false, "message": "Not deleted", "data": resp }))

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (id)
 * URL : /v1/admin/UserFeedbackdelete
 */
export const UserFeedbackdelete = async (req, res) => {
    try {
        let resp = await Feedback.findOneAndUpdate({ _id: req.body.id }, { status: true }, { new: true })
        if (resp) {
            console.log("data", resp)
            return res.status(200).json(EncryptData({ "status": true, "message": "Deleted", "data": resp }))
        }
        else
            return res.status(200).json(EncryptData({ "status": false, "message": "Not deleted", "data": resp }))

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

const buildGroupListFilter = async (isblocked, searchtext) => {
    const baseFilter = { isblocked, isGroupchat: true, iseventchat: false };
    if (!searchtext) {
        return baseFilter;
    }
    const regex = new RegExp(`^${escapeRegex(searchtext)}`, 'i');
    const matchingUsers = await User.find({
        $or: [
            { name: { $regex: regex } },
            { username: { $regex: regex } }
        ]
    }).select('_id').lean();
    const userIds = matchingUsers.map((user) => user._id);
    const orConditions = [{ chatName: { $regex: regex } }];
    if (userIds.length) {
        orConditions.push({ groupCreater: { $in: userIds } });
    }
    return { ...baseFilter, $or: orConditions };
};

const buildEventListFilter = async (isblocked, searchtext) => {
    const baseFilter = { isblocked, delete: false };
    if (!searchtext) {
        return baseFilter;
    }
    const regex = new RegExp(`^${escapeRegex(searchtext)}`, 'i');
    const matchingUsers = await User.find({
        $or: [
            { name: { $regex: regex } },
            { username: { $regex: regex } }
        ]
    }).select('_id').lean();
    const userIds = matchingUsers.map((user) => user._id);
    const orConditions = [
        { eventTitle: { $regex: regex } },
        { eventAddress: { $regex: regex } }
    ];
    if (userIds.length) {
        orConditions.push({ userId: { $in: userIds } });
    }
    return { ...baseFilter, $or: orConditions };
};

export const UnblockGrouplists = async (req, res) => {
    console.log("UnblockGrouplists", req.query);
    try {
        const { page, limit, searchtext } = req.query
        const userPopulate = {
            select: "_id username name"
        };
        const filter = await buildGroupListFilter("unblocked", searchtext);
        let resp, count;
        if (searchtext) {
            resp = await ChatModel.find(filter)
                .populate([
                    { path: "members", ...userPopulate },
                    { path: "groupAdmin", ...userPopulate },
                    { path: "groupCreater", ...userPopulate }
                ])
                .sort({ "createdAt": -1 });
        } else {
            const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit);
            [resp, count] = await Promise.all([
                ChatModel.find(filter)
                    .skip(skip).limit(limit)
                    .populate([
                        { path: "members", ...userPopulate },
                        { path: "groupAdmin", ...userPopulate },
                        { path: "groupCreater", ...userPopulate }
                    ])
                    .sort({ "createdAt": -1 }),
                ChatModel.countDocuments(filter)
            ]);
        }
        console.log("resps", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Unblocked group lists", data: resp, count: count }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error", data: resp }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const BlockGrouplists = async (req, res) => {
    console.log("BlockGrouplists", req.query);
    try {
        const { page, limit, searchtext } = req.query
        const userPopulate = {
            select: "_id username name"
        };
        const filter = await buildGroupListFilter("blocked", searchtext);
        let resp, count;
        if (searchtext) {
            resp = await ChatModel.find(filter)
                .populate([
                    { path: "members", ...userPopulate },
                    { path: "groupAdmin", ...userPopulate },
                    { path: "groupCreater", ...userPopulate }
                ])
                .sort({ "createdAt": -1 });
        } else {
            const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit);
            [resp, count] = await Promise.all([
                ChatModel.find(filter)
                    .skip(skip).limit(limit)
                    .populate([
                        { path: "members", ...userPopulate },
                        { path: "groupAdmin", ...userPopulate },
                        { path: "groupCreater", ...userPopulate }
                    ])
                    .sort({ "createdAt": -1 }),
                ChatModel.countDocuments(filter)
            ]);
        }
        console.log("resps", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Blocked group lists", data: resp, count: count }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error", data: resp }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


/*
 * METHOD : POST
 * BODY: (groupId, blockedReason, type(block or unblock))
 * URL : /v1/admin/Adminblockgroups
 */
export const Adminblockgroups = async (req, res) => {
    console.log("resopnses", req.body);
    try {
        const { body: { groupId, blockedReason, type }, user } = req
        if (type == "block") {
            let finduser = await Blockgroup.findOne({ groupId: groupId }).populate({ path: "groupId", populate: { path: "groupCreater" } })
            console.log("users_groups", finduser);
            if (finduser) {
                let updateblockuser = await Blockgroup.findOneAndUpdate({ groupId: groupId }, { blockStatus: "blocked", blockedReason: blockedReason })
                let updateuser = await ChatModel.findOneAndUpdate({ _id: groupId }, { isblocked: "blocked", blockedReason: blockedReason })

                if (updateuser && updateblockuser) {
                    res.status(200).json(EncryptData({ status: true, message: "Blocked group successfully", data: updateuser }))
                    if (finduser?.groupId?.groupCreater?.pushNotification) {
                        await sendPushNotification({
                            type: "blocked",
                            tokens: finduser?.groupId?.groupCreater?.fcmToken,
                            title: "Your group has been blocked.",
                            content: `reason: ${blockedReason}`
                        });
                    }
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }
            else {

                let payload = {
                    userId: new ObjectId(user?._id),
                    groupId: groupId,
                    blockedReason: blockedReason,
                    blockStatus: "blocked"
                }
                let data = new Blockgroup(payload)
                let resp = await data.save()
                console.log("responses_Groups", resp);
                let updateuser = await ChatModel.findOneAndUpdate({ _id: groupId }, { isblocked: "blocked", blockedReason: resp.blockedReason }).populate("groupCreater")
                console.log("updateuser_creater", updateuser);
                if (resp) {
                    res.status(200).json(EncryptData({ status: true, message: "Blocked", data: updateuser }))
                    if (updateuser?.groupCreater?.pushNotification) {
                        await sendPushNotification({
                            type: "blocked",
                            tokens: updateuser?.groupCreater?.fcmToken,
                            title: "Your group has been blocked",
                            content: `reason: ${blockedReason}`
                        });
                    }
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }

        }
        else if (type == "unblock") {
            let resp = await Blockgroup.findOneAndUpdate({ groupId: groupId }, { blockStatus: "unblocked" }).populate({ path: "groupId", populate: { path: "groupCreater" } })
            console.log("resp", resp);

            let updateuser = await ChatModel.findOneAndUpdate({ _id: groupId }, { isblocked: "unblocked", blockedReason: "" }).populate({ path: "groupCreater" })
            console.log("updateuser", updateuser);
            if (resp) {

                res.status(200).json(EncryptData({ status: true, message: "Unblocked group successfully", data: updateuser }))
                if (updateuser?.groupCreater?.pushNotification) {
                    await sendPushNotification({
                        type: "unblocked",
                        tokens: updateuser?.groupCreater?.fcmToken,
                        title: "Your group has been Unblocked.",
                        content: "Your Group is Unblocked"
                    });
                }
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (Type,Content)
 * URL : /v1/admin/editEmailTemplateList
 */
export const editEmailTemplateList = async (req, res) => {
    try {
        console.log(req.body);
        let resp = await EmailTemplate.findOneAndUpdate({ Type: req.body.Type }, { Content: req.body.Content, subject: req.body.subject }, { new: true })
        console.log(resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Email template updated successfully.", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Not Email template updated successfully.", data: resp }))

        }
    } catch (err) { console.log('eetlll', err) }
}

export const getEmailTemplateList = async (req, res) => {
    try {
        const { page, limit } = req.query
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
        var [resp, count] = await Promise.all([
            EmailTemplate.find({}).skip(skip).limit(limit),
            EmailTemplate.countDocuments({})
        ])
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Emailtemplate lists", data: resp, count: count }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error", data: resp }))
        }
    } catch (err) { console.log("gettt", err) }
}

export const UserplanDetails = async (req, res) => {
    console.log("UserplanDetails", req.query);

    try {
        const { page, limit, searchtext } = req.query
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
        let resp = await UserPlandetails({
            DBName: Userplan,
            page: skip, limit,
            searchtext: searchtext || ""
        })

        console.log("resp", JSON.stringify(resp, null, 2));
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "User get plans details", data: resp.data[0] }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const plansubscribelistdelete = async (req, res) => {
    console.log("reqweqweq", req.body);
    try {
        const { id } = req.body
        let resp = await Userplan.findOneAndUpdate({ _id: id }, { delete: true }, { new: true })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Deleted", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))

        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD: POST
 * BODY : (password,newpassword,confirmpassword,email)
 * URL :/v1/admin/changepassword
 */
export const changepassword = async (req, res) => {
    try {
        await changepasswordfunc(req, res, Admin)
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const Getadminprofile = async (req, res) => {
    try {
        let resp = await Admin.findOne({})
        console.log("responses", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Admin profile", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


/*
 * METHOD: POST
 * BODY : (adminname,email,image)
 * URL :/v1/admin/Editadminprofile
 */
export const Editadminprofile = async (req, res) => {
    // console.log("requests", req.body, req.files);
    try {
        let payload;
        if (!req.files) {
            payload = {
                adminname: req.body.adminname,
                // email: req.body.email,
                image: req.body.image
            }
        }
        else {
            let file = req.files.image
            let image = await ImageAddFunc([
                {
                    files: file,
                    filePath: "adminProfile",
                },
            ]);
            payload = {
                adminname: req.body.adminname,
                // email: req.body.email,
                image: image
            }
        }

        let resp = await Admin.findOneAndUpdate({ _id: req.body.id }, payload, { new: true })
        console.log("responses", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Profile updated", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

// Dashboard page lists
export const GetUsers = async (req, res) => {
    console.log("requsers");
    try {
        let resp = await User.countDocuments({})
        console.log("reponses", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Users lists", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}
// Dashboard page lists
export const GetGroups = async (req, res) => {
    try {
        let resp = await ChatModel.countDocuments({ isGroupchat: true, iseventchat: false })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Groups lists", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}
// Dashboard page lists
export const GetHobbies = async (req, res) => {
    try {
        let resp = await HobbiesAddAdmin.countDocuments({})
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Hobbies lists", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

// Dashboard page lists
export const GetTransactions = async (req, res) => {
    try {
        let resp = await Userplan.countDocuments({})
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Transactions lists", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (id, limit, type)
 * URL : /v1/admin/AdminHobbylimit
 */
export const AdminHobbylimit = async (req, res) => {
    // console.log("requests", req.body);
    try {
        const { id, limit, type } = req.body
        console.log("limits", id, limit);
        if (!limit && limit == 0) {
            return res.status(200).json(EncryptData({ status: false, message: "Please enter valid limit" }))
        }
        let resp;
        if (type == "admin") {
            resp = await Admin.findOneAndUpdate({ _id: id }, { $set: { hobby_limit: limit } }, { new: true })

        }
        else if (type == "event") {
            resp = await Admin.findOneAndUpdate({ _id: id }, { eventImage_limit: limit }, { new: true })

        }
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: `Limit set successfully`, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const GetAdmindata = async (req, res) => {
    try {
        const { type } = req.query;
        let resp, freehobbycount;
        if (type != "adminDetail") {
            resp = await Admin.find({});
            freehobbycount = await Subcategory.countDocuments({ plan: "free" });
        }
        else {
            resp = await Admin.find({});
        }
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Admin details", data: resp, hobbycount: freehobbycount }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


export const Eventlists = async (req, res) => {
    try {
        const { page, limit, searchtext } = req.query
        const filter = await buildEventListFilter("unblocked", searchtext);
        let resp, count;
        if (searchtext) {
            resp = await Event.find(filter)
                .populate({ path: "userId", select: "_id name username profile randomIndex location" })
                .sort({ "createdAt": -1 });
        } else {
            const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit;
            [resp, count] = await Promise.all([
                Event.find(filter)
                    .skip(skip).limit(limit)
                    .populate({ path: "userId", select: "_id name username profile randomIndex location" })
                    .sort({ "createdAt": -1 }),
                Event.countDocuments(filter)
            ]);
        }

        console.log("responses", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Users Eventlists", data: resp, count: count }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


export const BlockEventlists = async (req, res) => {
    try {
        const { page, limit, searchtext } = req.query
        const filter = await buildEventListFilter("blocked", searchtext);
        let resp, count;
        if (searchtext) {
            resp = await Event.find(filter)
                .populate({ path: "userId", select: "_id name username profile randomIndex location" })
                .sort({ "createdAt": -1 });
        } else {
            const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit;
            [resp, count] = await Promise.all([
                Event.find(filter)
                    .skip(skip).limit(limit)
                    .populate({ path: "userId", select: "_id name username profile randomIndex location" })
                    .sort({ "createdAt": -1 }),
                Event.countDocuments(filter)
            ]);
        }
        console.log("responses", resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Users Eventlists", data: resp, count: count }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId,eventId, blockedReason, type)
 * URL : /v1/admin/Adminblockevents
 */
export const Adminblockevents = async (req, res) => {
    console.log("resopnses", req.body);
    try {
        const { userId, eventId, blockedReason, type } = req.body
        if (type == "block") {
            let finduser = await Blockevent.findOne({ userId: userId }).populate({ path: "userId" })
            console.log("users", finduser);
            if (finduser) {
                let updateblockuser = await Blockevent.findOneAndUpdate({ userId: userId }, { $set: { isblocked: "blocked", blockedReason: blockedReason } }, { new: true })
                let updateuser = await Event.findOneAndUpdate({ _id: eventId }, { isblocked: "blocked", blockedReason: blockedReason })

                if (updateuser && updateblockuser) {

                    res.status(200).json(EncryptData({ status: true, message: "Blocked", data: updateuser }))
                    if (finduser?.userId?.pushNotification) {
                        await sendPushNotification({
                            type: "blocked",
                            tokens: finduser?.userId?.fcmToken,
                            title: "Event Blocked",
                            content: blockedReason
                        });
                    }
                }
                else {
                    res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }
            else {

                let payload = {
                    userId: userId,
                    eventId: eventId,
                    blockedReason: blockedReason,
                    isblocked: "blocked"
                }
                let data = new Blockevent(payload)
                let resp = await data.save()
                console.log("responses", resp);
                let updateuser = await Event.findOneAndUpdate({ _id: eventId }, { $set: { isblocked: "blocked", blockedReason: resp.blockedReason } }, { new: true })
                console.log("updateuser", updateuser);
                if (resp) {

                    res.status(200).json(EncryptData({ status: true, message: "Blocked", data: updateuser }))
                    if (updateuser?.pushNotification) {
                        await sendPushNotification({
                            type: "blocked",
                            tokens: updateuser?.fcmToken,
                            title: "Event Blocked",
                            content: "Your Event is blocked"
                        });
                    }
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }
            }

        }
        else if (type == "unblock") {
            let resp = await Blockevent.findOneAndUpdate({ userId: userId }, { isblocked: "unblocked" }).populate("userId")
            console.log("resp1111", resp);

            let updateuser = await Event.findOneAndUpdate({ _id: eventId }, { isblocked: "unblocked", blockedReason: "" })
            console.log("updateuser_unblock", updateuser);
            if (resp) {
                res.status(200).json(EncryptData({ status: true, message: "Unblocked", data: updateuser }))
                if (resp?.userId?.pushNotification) {
                    await sendPushNotification({
                        type: "unblocked",
                        tokens: resp?.userId?.fcmToken,
                        title: "Event Unblocked",
                        content: "Your Event is unblocked"
                    });
                }
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
            }
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (eventId)
 * URL : /v1/admin/EventDelete
 */
export const EventDelete = async (req, res) => {
    console.log("reqweqweq", req.body);
    try {
        const { eventId } = req.body
        // let resp = await Event.findOneAndUpdate({ _id: eventId }, { delete: true }, { new: true })
        let resp = await Event.findOneAndDelete({ _id: eventId })

        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Deleted", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (subId)
 * URL : /v1/admin/HobbiesDelete
 */
export const HobbiesDelete = async (req, res) => {
    console.log("erwrererwrwear", req.body);
    try {
        const { subId } = req.body
        let subcategorydelete = await Subcategory.findOneAndDelete({ _id: new ObjectId(subId) })
        console.log("subcategorydelete", subcategorydelete);
        let categorydelete = await Category.findOneAndUpdate({ "subcategoryId": { $in: [new ObjectId(subId)] } }, { $pull: { "subcategoryId": new ObjectId(subId) } })
        console.log("categorydelete", categorydelete);
        if (subcategorydelete && categorydelete) {
            return res.status(200).json(EncryptData({ status: true, message: "Subhobbies deleted" }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : GET
 * BODY: (Data)
 * URL : /v1/admin/getReportData
 */
export const getReportData = async (req, res) => {
    console.log("repngetReportData", req.query);
    try {
        const { Data } = req.query
        const Query = await ReportsData({ Data: Data, DbName: Report })

        console.log("getreport_records", Query);
        if (Query.status) {
            return res.status(200).json(EncryptData({ status: true, message: "Report Details", data: Query.data }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "No Reports." }))
        }
    } catch (e) {
        catchErrorResponse(res, e)
    }
}

// export const ReportDelete = async (req, res) => {
//     console.log("reqweqweq", req.body);
//     try {
//         const { reportId } = req.body
//         let resp = await Report.findOneAndUpdate({ _id: reportId }, { delete: true }, { new: true })
//         if (resp) {
//             return res.status(200).json(EncryptData({ status: true, message: "Deleted", data: resp }))
//         }
//         else {
//             return res.status(200).json(EncryptData({ status: false, message: "Something error" }))

//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }
// export const getReportersDetails = async (req, res) => {
//     console.log("reereerererererer", req.query);
//     try {
//         const { id,type } = req.query
//         // let resp = await Report.find({report_to:id})
//         let query = [
//             {
//                 $match: {
//                     $expr: {
//                         $and: [
//                             {
//                                 $eq: ["$report_to", new ObjectId(id)]

//                             },
//                             {
//                                 $eq: ["$type", type]

//                             }
//                         ]
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "report_from",
//                     foreignField: "_id",
//                     as: "reporter"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$reporter", preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "report_to",
//                     foreignField: "_id",
//                     as: "UserDetails"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$UserDetails", preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "events",
//                     localField: "report_to",
//                     foreignField: "_id",
//                     as: "eventDetails"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$eventDetails", preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "Instance",
//                     localField: "report_to",
//                     foreignField: "_id",
//                     as: "instanceDetails"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$instanceDetails", preserveNullAndEmptyArrays: true
//                 }
//             }

//         ]
//         let getreporter = await Report.aggregate(query)
//         console.log("getreporter", getreporter);
//         if (getreporter) {
//             return res.status(200).json({ status: true, message: "Reporter Details", data: getreporter })
//         }
//         else {
//             return res.status(200).json({ status: false, message: "Reporter not Details" })
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)

//     }
// }

/*
 * METHOD : POST
 * BODY: (instanceId, userId)
 * URL : /v1/admin/GroupReport
 */
export const GroupReport = async (req, res) => {
    console.log("reqGroupReport", req.body);
    try {
        // const io = req.app.get("io")

        const { instanceId, userId } = req.body;

        await AddRemoveCreateGroup({ userId: userId, isGroupchats: true, instanceId: instanceId, messageData: "left" })

        const findUser = await User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: "User not found" }));
        }

        const Exitgroup = await ChatModel.findOneAndUpdate(
            { _id: instanceId, "members": { $in: [new ObjectId(userId)] } },
            { $pull: { "members": new ObjectId(userId) } },
            { new: true }
        )

        if (Exitgroup) {
            // io.sockets.in(instanceId.toString()).emit("EXITGROUP", Exitgroup);
            return res.status(200).json(EncryptData({
                status: true,
                message: "Blocked",
                data: Exitgroup
            }));
        } else {
            return res.status(200).json(EncryptData({
                status: false,
                message: "Not Blocked"
            }));
        }

    } catch (error) {
        return catchErrorResponse(res, error);
    }
}


export const Groupcategorylists = async (req, res) => {
    try {
        let query = await Groupcategory.aggregate([

            {
                $lookup: {
                    from: "subcategories",
                    let: { groupIdsubcat: "$subcategoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", { $toObjectId: "$$groupIdsubcat" }]
                                }
                            }
                        }
                    ],
                    as: "subcategorylist"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    let: { groupIdcat: "$categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", { $toObjectId: "$$groupIdcat" }]
                                }
                            }
                        }
                    ],
                    as: "categorylist"
                }
            },
        ])
        console.log("query", query)
        if (query) {
            return res.status(200).json(EncryptData({ status: true, message: `Groups lists`, data: query }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const Hobbieslists = async (req, res) => {
    try {
        let query = await HobbiesAddAdmin.aggregate([

            {
                $match: {
                    hideshow: "visible"
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    let: { groupIdsubcat: "$subcategoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", { $toObjectId: "$$groupIdsubcat" }]
                                }
                            }
                        }
                    ],
                    as: "subcategorylist"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    let: { groupIdcat: "$categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", { $toObjectId: "$$groupIdcat" }]
                                }
                            }
                        }
                    ],
                    as: "categorylist"
                }
            },
            { $sort: { order: 1 } }
        ])
        if (query) {
            return res.status(200).json(EncryptData({ status: true, message: `Hobbies lists`, data: query }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


/*
 * METHOD : POST
 * BODY: (objId)
 * URL : /v1/admin/CategorySelectHobbiesSubHobbieslists
 */
export const CategorySelectHobbiesSubHobbieslists = async (req, res) => {
    try {
        console.log("yttttt", req.body)
        const { objId } = req.body
        let query = await HobbiesAddAdmin.find({ categoryId: objId })
        console.log("queryhobbies", query)
        if (query) {
            return res.status(200).json(EncryptData({ status: true, message: `Hobbies lists`, data: query }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (HobbiesOrder)
 * URL : /v1/admin/HobbieslistUpdateRearrange
 */
export const HobbieslistUpdateRearrange = async (req, res) => {
    // console.log("HobbiesUpdateRearrange", req.body);
    try {
        let { HobbiesOrder } = req.body;
        HobbiesOrder = ParsingFunc(HobbiesOrder);

        if (!HobbiesOrder || !Array.isArray(HobbiesOrder)) {
            return res.status(200).json(EncryptData({ status: false, message: "Invalid hobbies order" }));
        }

        // Prepare bulk operations for efficient database updates
        const bulkOps = HobbiesOrder.map((hobby, index) => ({
            updateOne: {
                filter: { _id: new ObjectId(hobby._id) },
                update: { $set: { order: index + 1 } } // Assign new order field
            }
        }));

        if (bulkOps.length > 0) {
            await HobbiesAddAdmin.bulkWrite(bulkOps);
            return res.status(200).json(EncryptData({ status: true, message: "Hobbies successfully re-arranged!" }));
        }

        return res.status(200).json(EncryptData({ status: false, message: "Hobbies not re-arranged" }));

    } catch (error) {
        catchErrorResponse(res, error);
    }
};
// export const HobbieslistUpdateRearrange = async (req, res) => {
//     console.log("HobbiesUpdateRearrange", req.body);
//     try {
//         let { HobbiesOrder } = req.body;
//         HobbiesOrder = ParsingFunc(HobbiesOrder)
//         if (!HobbiesOrder || !Array.isArray(HobbiesOrder)) {
//             return res.status(200).json(EncryptData({ status: false, message: "Invalid hobbies order" }));
//         }
//         //command code also working code.
//         /*  Loop through the provided order array and update each document
//          const bulkOps = HobbiesOrder.map((hobby, index) => ({
//              updateOne: {
//                  filter: { _id: hobby._id },
//                  update: { $set: { order: index + 1 } } // Set new order field
//              }
//          }));
//             if (bulkOps.length > 0) {
//              await HobbiesAddAdmin.bulkWrite(bulkOps);
//          } */
//         let promise = HobbiesOrder.map(async (val, index) => {
//             console.log("ifgnfngfgngn", val, index);
//             let orderIndex = index + 1;
//             const promise = HobbiesAddAdmin.updateMany({ _id: val._id }, { $set: { order: orderIndex } })
//             console.log("promisepromise", promise);
//             return promise;
//         })

//         if (promise) {
//             return res.status(200).json(EncryptData({ status: true, message: "Hobbies successfully re-arranged!" }))
//         }
//         else {
//             return res.status(200).json(EncryptData({ status: false, message: "Hobbies not re-arranged" }))

//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }

// }

/*
 * METHOD : POST
 * BODY: (CategoriesOrder)
 * URL : /v1/admin/CategorieslistUpdateRearrange
 */
export const CategorieslistUpdateRearrange = async (req, res) => {
    console.log("CategorieslistUpdateRearrange", req.body);
    try {
        let { CategoriesOrder } = req.body;
        CategoriesOrder = ParsingFunc(CategoriesOrder)


        if (!CategoriesOrder || !Array.isArray(CategoriesOrder)) {
            return res.status(200).json(EncryptData({ status: false, message: "Invalid category order" }));
        }
        //command code also working code.
        //  Loop through the provided order array and update each document
        const bulkOps = CategoriesOrder.map((hobby, index) => ({
            updateOne: {
                filter: { _id: hobby._id },
                update: { $set: { order: index + 1 } } // Set new order field
            }
        }));

        /*  let promise = CategoriesOrder.map(async (val, index) => {
             console.log("ifgnfngfgngn", val, index);
             let orderIndex = index + 1;
             const promise = Category.updateMany({ _id: val._id }, { $set: { order: orderIndex } })
             console.log("promisepromise", promise);
             return promise;
         }) */

        if (bulkOps.length > 0) {
            await Category.bulkWrite(bulkOps);
            return res.status(200).json(EncryptData({ status: true, message: "Category successfully re-arranged!" }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Category not re-arranged" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }

}

/*
 * METHOD : POST
 * BODY: (SubCategoriesOrder)
 * URL : /v1/admin/SubcategorylistUpdateRearrange
 */
export const SubcategorylistUpdateRearrange = async (req, res) => {
    console.log("SubcategorylistUpdateRearrange", req.body);
    try {
        let { SubCategoriesOrder } = req.body;
        SubCategoriesOrder = ParsingFunc(SubCategoriesOrder)

        if (!SubCategoriesOrder || !Array.isArray(SubCategoriesOrder)) {
            return res.status(200).json(EncryptData({ status: false, message: "Invalid Subcategory order" }));
        }
        //command code also working code.
        //  Loop through the provided order array and update each document
        const bulkOps = SubCategoriesOrder.map((hobby, index) => ({
            updateOne: {
                filter: { _id: hobby._id },
                update: { $set: { order: index + 1 } } // Set new order field
            }
        }));

        /*  let promise = SubCategoriesOrder.map(async (val, index) => {
             console.log("ifgnfngfgngn", val, index);
             let orderIndex = index + 1;
             const promise = Subcategory.updateMany({ _id: val._id }, { $set: { order: orderIndex } })
             console.log("promisepromise", promise);
             return promise;
         }) */

        if (bulkOps.length > 0) {
            await Subcategory.bulkWrite(bulkOps);
            return res.status(200).json(EncryptData({ status: true, message: "Subcategory successfully re-arranged!" }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Subcategory not re-arranged" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }

}

// update refund user
export const refundUpdate = async (req, res) => {
    try {
        const { userId, subscriptionId } = req.body
        const userplan = await Userplan.findOne({
            _id: new ObjectId(subscriptionId),
            userId: new ObjectId(userId)
        });
        if (!userplan) {
            return res.status(200).json(EncryptData({ status: false, message: "Invalid user or plan details" }))
        }
        const updatedUser = await Userplan.findOneAndUpdate({ _id: new ObjectId(subscriptionId) }, { $set: { subscriptionStatus: "refunded", isActive: "expired" } }, { new: true });
        console.log("updatedUser", updatedUser);

        if (updatedUser) {
            return res.status(200).json(EncryptData({ status: true, message: "Refunded successfully." }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}