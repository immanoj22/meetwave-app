
import { AccountDeleteVerifyOTPfunc, AddRemoveCreateGroup, DateValidation, DecryptData, EncryptData, GetMostPopularHobbies, GroupLikeEventGroupjoinRequestUsersCounts, ImageAddFunc, Imagecompress, Node_Mailer, ParsingFunc, ResendOtpfunc, TransferEmailVerify, Userchangepasswordfunc, bcryptcompare, bcrypthash, calculateAge, catchErrorResponse, cleanSpace, deleteImageFromS3, findNearbyUsersWithHobbiesNotification, generateOTP, getDistanceFromLatLonInKm, getResponse, isEmpty, loginverifyOTPfunc, passwordForgetfunc, responseReturn, saveNotification, t, uploadImageToS3, verifyemailfunc } from '../../Helper/common.js';
import { CommonSearchUserListAndfunc, createEventListsAggre, createGroupListsAggre, eventListSearchAggregation, eventListSearchWithRadiusAggregation, EventNearByLocation, groupInfoDetails, joinEventListsAggre, joinGroupListsAggre, Save, SingleUserDetails, UserHobbysearch, UserListAndSearchfunc, UserNearByLocation, UserNotifications } from '../../Helper/mongooseHelper.js';
import jwt from "jsonwebtoken";
import Notification from '../../Helper/Activity_schema.js'
import User from '../Models/user_schema.js'
import config from '../../Config/config.js'
import Hobby from '../Models/hobbies_schema.js'
import follownotify from '../Models/follownotify_schema.js'
// import followrequest from '../Models/followrequest_schema'
import Like from '../Models/likes_schema.js'
import HobbiesAdmin from "../../AdminController/Models/Hobbiesadmin.schema.js"
import Plan from "../../AdminController/Models/plan_schema.js"
import Userplan from "../Models/userplan_schema.js"
import Subscribers from "../../AdminController/Models/emailupdate_schema.js"
import Help from "../Models/help_schema.js"
import Feedback from "../Models/feedback_schema.js"
import fs from "fs"
import mongoose from "mongoose"
import { isPushNotificationEnabled, sendPushNotification } from '../../pushnotification.js';
import categorylist from "../../AdminController/Models/category_schema.js"
import ChatModel from '../../Chat/Models/instance_schema.js';
import Event from "../../ActivityController/Models/event_schema.js"
import Admin from "../../AdminController/Models/admin_schema.js"
import Gender from "../../AdminController/Models/gender_schema.js"
import Cms from "../../CmsController/Models/cms_schema.js"
import MessageModel from '../../Chat/Models/Message_schema.js'
import Report from "../../commonSchema/report_schema.js"
// import { UserFind } from '../../ActivityController/activity.service';
// import { userFind, userFindOne } from '../user.service';
// import Subcategory from "../../AdminController/Models/subcategory_schema"
import AdminHobbies from "../../AdminController/Models/Hobbiesadmin.schema.js"
import { userFindOne } from '../user.service.js';
// import Group from "../../Chat/Models/instance_schema"
// import { languages } from "../../languages"
// import HobbyRequest from "../Models/userhobbyrequest_schema"
import HobbiesAddAdmin from "../../AdminController/Models/Hobbiesadmin.schema.js"

var ObjectId = mongoose.Types.ObjectId
// const axios = require('axios');

/*
 * METHOD : POST
 * BODY: (email, ageconfirm_status(true or false))
 * URL : /v1/event/UserEmailverify
 */
export const UserEmailverify = async (req, res) => {
    try {
        var otp = generateOTP();
        const { body: { email, ageconfirm_status, fcmtoken, password }, user } = req
        let emailExist = await User.findOne({ $or: [{ email: email }, { alternativeEmail: email }] })
        if (emailExist) {
            return res.status(200).json(EncryptData({ status: false, reg_status: emailExist?.verify_status, message: t((user && user.language) ? user.language : "english", "email_exists") }))
        }

        else {
            // Handle new user registration
            const hash = await bcrypthash(password)
            let payload = {
                email: cleanSpace(email),
                ageconfirm_status: ParsingFunc(ageconfirm_status),
                fcmToken: [fcmtoken],
                password: hash
            }
            let validAge = typeof ageconfirm_status == "string" ? ParsingFunc(ageconfirm_status) : ageconfirm_status;
            if (validAge) {

                let Datas = new User(payload)
                let resp = await Datas.save()

                if (resp) {
                    let emailupdate = new Subscribers({ email: cleanSpace(email) })
                    await emailupdate.save()
                    await User.findOneAndUpdate({ email: email }, { OTP: EncryptData(otp) }, { new: true })
                    const sendMailResponse = await Node_Mailer({ Type: "registeremailverify", EmailId: resp?.email, Subject: 'Meeting Application Email verification OTP', OTP: otp })
                    if (!sendMailResponse) {
                        return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "otp_failed"), data: resp }))
                    }
                    return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "otp_verify_msg"), data: resp }))
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_not_saved"), data: resp }))
                }

            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "age_confirm") }))
            }
        }


    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (email, OTP)
 * URL : /v1/user/verifyEmail
 */
export const verifyEmail = async (req, res) => {
    try {
        await verifyemailfunc(req, res, User)
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (name, dob, latitude, longitude, gender, username, email, bio, randomIndex, personalAddress, MychatDiscription)
 * URL : /v1/user/RegisterProfile
 */
export const RegisterProfile = async (req, res) => {
    console.log("register_response", req.body, "files", req.files);
    try {
        const { body: { name, dob, latitude, longitude, gender, username, email, bio, randomIndex, personalAddress, MychatDiscription, age }, user } = req
        // let emailvalid = email?.split(".")?.pop()
        const AdminData = await Admin.findOne({});
        const HobbyLimit = Number(AdminData?.hobby_limit);
        let findUsername = await User.findOne({ username: username.trim(), email: { $ne: email } })

        if (findUsername) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "username_exists") }))
        }

        // let Age = await calculateAge(dob)
        // console.log("ghdfghbfgnjh", Age);
        if (age < 18) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "age_limit") }))
        }
        let arr = [];

        if (req.files && req.files.image) {
            let img = req.files.image
            var profile = await ImageAddFunc([
                {
                    files: img,
                    filePath: "userProfile"
                },
            ]);

        }
        if (req.files && req.files.bioimage) {
            // await fs.promises.mkdir(filePath, { recursive: true });

            let files = Array.isArray(req.files.bioimage) ? req.files.bioimage : [req.files.bioimage];

            /* arr = await Promise.all(files.map(async (img, i) => {
                console.log("ertrtretert", img.name);
                let compressimgname = `${Date.now() + String(i)}_compressed_image.webp`;
                let CompressImage = await Imagecompress({ image: img, path: filePath, imagename: compressimgname })
                console.log("CompressImage", CompressImage);
                // const multiimg = Date.now() + i + ".webp";
                const multiimg = CompressImage;

                await img.mv(filePath + multiimg);
                return multiimg;
            })); */
            arr = await Promise.all(
                files.map(async (img, i) => {
                    const compressedFilename = await Imagecompress({
                        image: img
                    });

                    const s3Url = await uploadImageToS3({ fileBuffer: compressedFilename, fileMimetype: "image/webp", filePath: "userBioimage", index: i });
                    return s3Url;
                })
            );
        }

        let payload = {
            name: name,
            dob: dob,
            gender: gender?.toLowerCase(),
            username: username,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: [longitude, latitude]
            },
            profile: profile,
            age: age,
            bioimage: arr ? arr : [],
            bio: bio ? bio : "",
            randomIndex: randomIndex,
            personalAddress: personalAddress,
            // MychatDiscription: MychatDiscription ? MychatDiscription : ""

        }

        let resp = await User.findOneAndUpdate({ email: email }, payload, { new: true }).lean()


        // if (JSON.parse(Pricacy_status) == true) {
        /*    if (resp?.location?.coordinates) {
               let temp = resp.location.coordinates[0];
   
               resp.location.coordinates[0] = resp.location.coordinates[1]
               resp.location.coordinates[1] = temp
   
   
           }
           if (resp?.homeAddress?.coordinates) {
               let temp = resp.homeAddress.coordinates[0];
   
               resp.homeAddress.coordinates[0] = resp.homeAddress.coordinates[1]
               resp.homeAddress.coordinates[1] = temp
   
   
           } */
        // let activitysave = {
        //     DBName: Notification, Data: {
        //         action: "personal details add",
        //         from: "user",
        //         message: "user added personal profile successfully",
        //         Userid: resp?._id
        //     }
        // }
        // let activityvalues = await Save(activitysave)
        // console.log("ddddddddd", activityvalues);

        let responses = { ...resp, ...{ "HobbiesLimit": HobbyLimit } }
        if (resp) {
            res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "details_saved"), data: responses }))

            const sendMailResponse = await Node_Mailer({
                EmailId: resp?.email,
                Subject: 'Welcome to Our Meetwave',
                Type: "welcome",
                username: resp?.username
            });
            return true;
            // console.log('testresponseeweeeee',res,'reqqqqqqqqq',req)
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "details_not_saved"), data: resp }))
        }
        // }
        // else {
        //     res.status(200).json({ status: false, message: "Please select privacy policy" })

        // }

    } catch (error) {
        // res.status(200).json({ status: false, message: "Something went error in personal details" })
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (name, dob, latitude, longitude, gender, username, email, bio, image, bioimage, biodelete, randomIndex, personalAddress, MychatDiscription)
 * URL : /v1/user/EditRegisterProfile
 */
export const EditRegisterProfile = async (req, res) => {
    try {
        let { body: { name = "", dob = "", latitude = "", longitude = "", gender = "", username = "", email = "", bio = "", image, bioimage, biodelete, randomIndex, personalAddress, MychatDiscription, age, type }, user } = req

        // let Imagesparse = ParsingFunc(bioimage)
        let DeleteImage = ParsingFunc(biodelete)
        let files = req?.files && req?.files?.bioimage;
        const [AdminData, findUsername, userDetails] = await Promise.all([
            Admin.findOne({}),
            User.findOne({ username: username, _id: { $ne: user?._id } }),
            User.findOne({ _id: new ObjectId(user?._id) })
        ]);
        const HobbyLimit = Number(AdminData?.hobby_limit);
        if (!userDetails) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
        if (findUsername) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "username_exists") }))
        }

        let arr = [];
        if (age < 18) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "age_limit") }))
        }
        let profile = image;
        if (req.files && req.files.image) {
            const deleteImg = userDetails?.profile?.slice(1)

            await deleteImageFromS3(deleteImg)
            let img = req.files.image
            profile = await ImageAddFunc([
                {
                    files: img,
                    filePath: "userProfile"
                },
            ]);
        }

        const filePath = `public/Bioimage/`;

        if (DeleteImage) {
            if (Array.isArray(userDetails.bioimage)) {
                // Iterate through each image in DeleteImage
                Promise.all(DeleteImage.map(async (images) => {
                    const deleteImg = images?.slice(1)

                    const deleteInS3 = await deleteImageFromS3(deleteImg)

                    const updatedBio = await User.findOneAndUpdate(
                        { _id: new ObjectId(userDetails?._id), bioimage: { $in: images } },
                        { $pull: { bioimage: images } }, // Use $in to pull multiple bioimage
                        { new: true }
                    );
                }))

            } else {
                console.log("Event image field is not an array.");
            }
        }

        if (req.files?.bioimage) {
            await fs.promises.mkdir(filePath, { recursive: true });
            if (!Array.isArray(files)) {
                files = [req?.files?.bioimage];
            }

            if (Array.isArray(files)) {

                await Promise.all(files.map(async (img, i) => {
                    let compressimgname = `${Date.now() + String(i)}_compressed_image.webp`;
                    let CompressImage = await Imagecompress({ image: img, path: filePath, imagename: compressimgname })

                    // var multiimg = Date.now() + i + ".webp";
                    // let multiimg = CompressImage;
                    const s3Url = await uploadImageToS3({ fileBuffer: CompressImage, fileMimetype: "image/webp", filePath: "userBioimage", index: i });

                    arr.push(s3Url);
                    /*        console.log("arrays_pushh", arr);
                           await img.mv(filePath + multiimg); */
                    await User.findOneAndUpdate(
                        { _id: new ObjectId(userDetails?._id) },
                        { $push: { bioimage: s3Url } }, // Use $in to pull multiple images
                        { new: true }
                    );
                }));

            }
        }

        let payload;

        if (type == "homeEdit") {
            payload = {
                bio: bio ? bio : userDetails?.bio,
            }
        }
        else {
            longitude = isEmpty(longitude) ? userDetails?.location?.coordinates[0] : longitude;
            latitude = isEmpty(latitude) ? userDetails?.location?.coordinates[1] : latitude;
            payload = {
                name: name ? name : userDetails?.name,
                dob: dob ? dob : userDetails?.dob,
                gender: gender ? gender?.toLowerCase() : userDetails?.gender,
                username: username ? username.trim() : userDetails?.username,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: [longitude, latitude]
                },
                profile: req.files ? profile : userDetails?.profile,
                age: age ? age : userDetails?.age,
                bio: bio ? bio : userDetails?.bio,
                randomIndex: randomIndex ? randomIndex : userDetails?.randomIndex,
                personalAddress: personalAddress ? personalAddress : userDetails?.personalAddress,
                // MychatDiscription: MychatDiscription ? MychatDiscription : userDetails?.MychatDiscription
            }
        }
        const resp = await User.findOneAndUpdate({ _id: new ObjectId(user?._id) }, { $set: payload }, { new: true }).lean()
        /* if (resp.location.coordinates) {
            let temp = resp.location.coordinates[0];

            resp.location.coordinates[0] = resp.location.coordinates[1]
            resp.location.coordinates[1] = temp


        }
        if (resp?.homeAddress?.coordinates) {
            let temp = resp.homeAddress.coordinates[0];

            resp.homeAddress.coordinates[0] = resp.homeAddress.coordinates[1]
            resp.homeAddress.coordinates[1] = temp


        } */
        // let activitysave = {
        //     DBName: Notification, Data: {
        //         action: "personal details edit",
        //         from: "user",
        //         message: "user edited personal profile successfully",
        //         Userid: resp?._id
        //     }
        // }
        // let activityvalues = await Save(activitysave)
        // console.log("ddddddddd", activityvalues);

        let responses = { ...resp, ...{ "HobbiesLimit": HobbyLimit } }
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "details_updated"), data: responses }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "details_not_updated"), data: resp }))
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (email)
 * URL : /v1/user/ResendOtp
 */
export const ResendOtp = async (req, res) => {
    try {
        await ResendOtpfunc(req, res, User)

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (email,password,token(FCM),TFA(true or false))
 * URL : /v1/user/Userlogin
 */

export const Userlogin = async (req, res) => {
    try {

        const { body: { email, password, fcmtoken } } = req

        let user = await User.findOne({ email: email })

        if (!user) {
            return res.status(200).json(EncryptData({ status: false, "message": t((user && user.language) ? user.language : "english", "user_nf") }))
        }

        if (user && user?.delete) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "account_deleted") }))
        }

        if (user && user?.blockStatus == "blocked") {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "account_blocked") }))
        }

        let passwordCheck = await bcryptcompare(password, user?.password)

        if (!passwordCheck) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "wrong_pass") }))
        }

        // if (user) {
        if (user?.verify_status) {
            if (user?.TFA == false) {
                // User doesn't have two-factor authentication enabled
                console.log("user", user)
                if (!fcmtoken) {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "fcm_empty") }))
                }

                let payload = { "id": user?._id, email: user?.email }

                let tokenhash = jwt.sign(payload, config.SECRET_KEY, { expiresIn: '30d' })
                let token = `Bearer ${tokenhash}`
                // Check if FCM token exists in user document
                let fcmExists = await User.findOne({ email: email, "fcmToken": { $in: [fcmtoken] } })
                if (!fcmExists) {
                    // Add FCM token and update login status
                    let Data = await User.findOneAndUpdate({ email: email }, { $addToSet: { "fcmToken": fcmtoken }, $set: { login_status: true, authToken: tokenhash } }, { new: true })

                    if (Data) {
                        return res.status(200).json(EncryptData({ status: true, TFAstatus: false, message: t((user && user.language) ? user.language : "english", "login_success"), data: Data }))
                    }
                    else {
                        return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), data: Data }))
                    }
                }
                else {
                    // Update login status without adding FCM token
                    await User.findOneAndUpdate({ email: email }, { login_status: true, authToken: tokenhash }, { new: true })
                    return res.status(200).json(EncryptData({ status: true, TFAstatus: false, "message": t((user && user.language) ? user.language : "english", "login_success"), "data": user, "token": tokenhash }))
                }

            }
            else {
                let otp = generateOTP();
                // User has two-factor authentication enabled, send OTP
                let user = await User.findOne({ email: email })
                if (!user) {
                    return res.status(200).json(EncryptData({ status: false, "message": t((user && user.language) ? user.language : "english", "user_nf") }))
                }
                let passwordCheck = await bcryptcompare(password, user?.password)

                if (user && !passwordCheck) {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "wrong_pass") }))
                }
                // console.log("passwordCheck", passwordCheck)
                // console.log("user_enable", user);

                await User.findOneAndUpdate({ email: user?.email }, { $addToSet: { "fcmToken": fcmtoken }, OTP: EncryptData(otp) }, { new: true })
                // console.log("ggggggg", resendata);

                const sendMailResponse = await Node_Mailer({ Type: "loginverify", EmailId: user?.email, Subject: 'Meeting Application OTP', OTP: otp, username: user?.username })
                if (!sendMailResponse) {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "otp_failed") }))
                }
                return res.status(200).json(EncryptData({ status: true, TFAstatus: true, "message": t((user && user.language) ? user.language : "english", "otp_verify_msg") }))
            }
        }
        else {
            return res.status(200).json(EncryptData({ status: true, reg_status: user?.verify_status, TFAstatus: false, message: t((user && user.language) ? user.language : "english", "incomplete_profile"), data: user }))
        }
        // } else {
        //     return res.status(200).json(EncryptData({ status: false, "message": "User not found" }))
        // }
    } catch (error) {
        catchErrorResponse(res, error)
    }


}

/*
 * METHOD : POST
 * BODY: (email,OTP)
 * URL : /v1/user/loginverifyOTP
 */
/* export const loginverifyOTP = async (req, res) => {
    try {
        await loginverifyOTPfunc(req, res, User)

    } catch (error) {
        catchErrorResponse(res, error)
    }

} */

/*
 * METHOD : POST
 * BODY: ( userId, HobbiesId, type)
 * URL : /v1/user/UserchooseHobbies
 */
export const UserchooseHobbies = async (req, res) => {
    try {
        const { body: { userId, HobbiesId, type }, user } = req;
        const io = req?.app?.get("io")
        let MappedData = await HobbiesId?.map(id => new ObjectId(id))

        const [AdminData, subcategories, users, hobbydatas] = await Promise.all([
            Admin.findOne({}),
            HobbiesAdmin.find({ _id: { $in: MappedData } }),
            User.findOne({ _id: new ObjectId(userId) }).populate("hobbies").populate("plan"),
            Hobby.find({})
        ])
        const HobbyLimit = Number(AdminData?.hobby_limit);

        if (subcategories?.length !== HobbiesId?.length) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_hobbies") }));
        }

        if (!users) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        const activePlan = users?.plan?.some(plan => plan?.isActive == "started");
        let addedHobbies = [];
        let responses;
        // ==================
        if (type != "add" && type != "edit" && !activePlan && subcategories?.length > HobbyLimit) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "sub_required") }));
        }
        // ==================
        for (const subcategory of subcategories) {
            addedHobbies.push(subcategory?.hobbyname);
            if (users?.plan?.length > 0 && activePlan && subcategories?.length > HobbyLimit) {
                addedHobbies.push(subcategory?.hobbyname);
            }
        }
        // let hobbydatas = await Hobby.find({});
        let savedata = [];
        for (let i = 0; i < MappedData?.length; i++) {
            if (!(hobbydatas.some(el => el?.hobbyId?.toString() == MappedData[i]?.toString()))) {
                savedata.push(MappedData[i])
            }
        }
        responses = await addHobbyToUser(users, savedata, res, user);
        if (type == "add") {
            findNearbyUsersWithHobbiesNotification(users, users?.location?.coordinates[1], users?.location?.coordinates[0], users?.locationDistance, HobbiesId, "user", io);
        }

        let FindupdateHobbies = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { "hobbies": MappedData } }, { new: true })
        return res.status(200).json(EncryptData({ status: true, message: (type == "add") ? t((user && user.language) ? user.language : "english", "register_success") : t((user && user.language) ? user.language : "english", "hobbies_updated"), data: responses, "HobbiesLimit": HobbyLimit }));
    } catch (error) {
        console.error("Error choosing hobby:", error);
        return res.status(200).json(EncryptData({ status: false, message: t((req.user && req.user.language) ? req.user.language : "english", "server_error"), error }));
    }
}

const addHobbyToUser = async (userDetails, HobbiesData, res, user) => {
    try {
        const subcategories = await Promise.all(
            HobbiesData?.map(async (val) => {
                const response = await AdminHobbies.findById(val);
                if (!response) {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_hobbies") }));
                }
                return response;
            })
        );

        const savedHobbies = [];
        for (const subcategory of subcategories) {
            const newHobby = new Hobby({
                userId: userDetails?._id,
                subcategoryId: subcategory?.subcategoryId,
                categoryId: subcategory?.categoryId,
                hobbyId: subcategory?._id,
                name: subcategory?.hobbyname,
                planType: subcategory?.plan,
                description: subcategory?.description,
                eligible_plan: subcategory?.planId,
                paid_level: subcategory?.paid_level
            });

            const savedHobby = await newHobby.save();
            savedHobbies.push(savedHobby);
        }

        await userDetails.save();
        return savedHobbies;
    } catch (error) {
        console.error("Error adding hobby to user:", error);
        catchErrorResponse(res, error)
    }
};


/*
 * METHOD : POST
 * BODY: ( id, bio)
 * URL : /v1/user/UserAddBio
 */
// export const UserAddBio = async (req, res) => {
//     try {
//         let resp = await User.findOneAndUpdate({ _id: req.body.id }, { "bio": req.body.bio }, { new: true })
//         console.log("response", resp);
//         if (resp) {
//             res.status(200).json({ status: true, message: "User added bio", data: resp })
//         }
//         else {
//             res.status(200).json({ status: false, message: "Something error" })
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

/*
 * METHOD : POST
 * BODY: (userId, privacy_status)
 * URL : /v1/user/UsersecurityAccount
 */
export const UsersecurityAccount = async (req, res) => {
    try {
        const { body: { userId, privacy_status }, user } = req
        let privacystatus = typeof privacy_status == "string" ? ParsingFunc(privacy_status) : privacy_status
        let status = privacystatus == true ? "private" : "public"
        let resp = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { privacy_status: status }, { new: true })
        const statusUpdate = resp?.privacy_status ? t((user && user.language) ? user.language : "english", "acc_enabled") : t((user && user.language) ? user.language : "english", "acc_disabled")
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: statusUpdate, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))

        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

// export const Userlists = async (req, res) => {
//     // console.log("sdfgfsdgdfgdfg",req.user);
//     try {

//         const { userId, page, limit } = req.query

//         const skip = ((page ? parseInt(page) : 1) - 1) * limit
//         console.log("dfgfgfgfggf", skip);

//         let findUser = await User.findOne({ _id: userId })
//         if (!findUser) {
//             return res.status(200).json({ status: false, message: "This user not found" })
//         }

//         let resp = await User.find({ _id: { $ne: userId } }).skip(Number(skip)).limit(Number(limit)).populate("hobbies")
//         // let resp = await User.find({_id:{$ne:userId}}).populate("hobbies")

//         console.log("resp", resp);
//         if (resp) {
//             res.status(200).json({ status: true, message: "Users lists", data: resp })
//         }
//         else {
//             res.status(200).json({ status: false, message: "Something wrong" })
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

/*
 * METHOD : POST
 * BODY: (userId)
 * URL : /v1/user/FindUserData
 */
export const FindUserData = async (req, res) => {
    try {
        const { query: { userId }, user } = req
        let resp = await User.findOne({ _id: new ObjectId(userId) }).populate({ path: "hobbies" })
        if (resp) {
            res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "user_list"), data: resp }))
        }
        else {
            res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId,from, to)
 * URL : /v1/user/userfollow
 */
export const userfollow = async (req, res) => {
    try {
        const { body: { userId, from, to }, user } = req;
        const io = req?.app?.get("io")

        const [from_User, to_User] = await Promise.all([
            User.findById(from),
            User.findById(to)
        ])
        if (!from_User || !to_User) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        let followNotify;
        let savedNotify;
        let [findUserNotify, findUser_Notify] = await Promise.all([
            follownotify.findOne({ from: new ObjectId(to), to: new ObjectId(from), status: "completed" }),
            follownotify.findOne({ from: new ObjectId(from), to: new ObjectId(to), status: "completed" })
        ])
        const isPrivateAccount = to_User?.privacy_status === "private";
        // Helper function to save activity
        const saveActivity = async (activityData) => {
            // let activitysave = { DBName: Notification, Data: activityData };
            // return await Save(activitysave);
            return await saveNotification(activityData, io);

        };

        // if (to_User.privacy_status === "public") {
        //     followNotify = new follownotify({
        //         from,
        //         to,
        //         notification: true,
        //         status: "completed",
        //         message_type: "Friend request sent",
        //         followto: `${from_User?.name} followed ${to_User?.name}`
        //     });

        //     await Promise.all([
        //         User.findByIdAndUpdate(from_User._id, { $inc: { followingCount: 1 } }, { new: true }),
        //         User.findByIdAndUpdate(to_User._id, { $inc: { followersCount: 1 } }, { new: true })
        //     ])

        //     savedNotify = await followNotify.save();
        //     // if (!findUserNotify) {
        //     await saveActivity({
        //         userId,
        //         action: "Follow",
        //         status: "public",
        //         from: from,
        //         to: to,
        //         type: "Follow",
        //         message: `Friend request accepted`,
        //         followUserId: savedNotify?._id
        //     });

        // } else 
        if (["public", "private"].includes(to_User.privacy_status)) {
            if (findUserNotify || findUser_Notify) {
                followNotify = new follownotify({
                    from,
                    to,
                    notification: true,
                    status: "completed",
                    message_type: "Friend request sent",
                    followto: `${from_User?.name} followed ${to_User?.name}`
                });

                await Promise.all([
                    User.findByIdAndUpdate(from_User._id, { $inc: { followingCount: 1 } }, { new: true }),
                    User.findByIdAndUpdate(to_User._id, { $inc: { followersCount: 1 } }, { new: true })
                ])

                savedNotify = await followNotify.save();
            }
            else {
                followNotify = new follownotify({
                    from,
                    to,
                    notification: true,
                    status: "pending",
                    message_type: "Friend request sent",
                    followto: `${from_User?.name} followed ${to_User?.name}`
                });
                savedNotify = await followNotify.save();
                // if (!findUserNotify) {
                await saveActivity({
                    userId,
                    action: "Follow",
                    status: "private",
                    from,
                    to,
                    type: "Followback",
                    message: `Has sent you a friend request`,
                    followUserId: savedNotify?._id
                });
            }

        }

        console.log("🚀 ~ userfollow ~ savedNotify:", savedNotify)
        if (savedNotify) {
            if (isPushNotificationEnabled(to_User?.pushNotification)) {
                await sendPushNotification({
                    type: "follow",
                    tokens: to_User?.fcmToken,
                    title: "New Friend",
                    // content:isPrivateAccount ? `${to_User?.username} has sent you a friend request`: `${from_User?.username} is now your friend`,
                    content: `${from_User?.username} has sent you a friend request`,
                    extraData: { _id: to_User?._id, "type": "notification" }
                });
            }

            // return res.status(200).json(EncryptData({ status: true, message: to_User?.privacy_status == "public" ? t((user && user.language) ? user.language : "english", "follow_notify") : t((user && user.language) ? user.language : "english", "follow_sent"), data: savedNotify }));
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "follow_notify"), data: savedNotify }));
        }
        return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "follow_failed") }));

    } catch (error) {
        console.error("Error in userfollow:", error);
        catchErrorResponse(res, error);
    }
};
/*
 * METHOD : POST
 * BODY: (userId, from, to, request_id, accept)
 * URL : /v1/user/userUnFollow
 */


export const userUnFollow = async (req, res) => {
    console.log("🚀 ~ userUnFollow ~ req:", req.body)

    try {
        const { body: { userId, from, to, request_id, accept }, user } = req;

        if (accept !== "unfollowed") {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_status") }));
        }

        // Fetch user details concurrently
        const [fromUser, toUser, findUser] = await Promise.all([
            User.findById(from),
            User.findById(to),
            User.findById(userId),
        ]);

        if (!fromUser || !toUser || !findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
        const fromFollowUserDelete = follownotify.deleteMany({ from: new ObjectId(from), to: new ObjectId(to) })
        const toFollowUserDelete = follownotify.deleteMany({ from: new ObjectId(to), to: new ObjectId(from) })
        await Promise.all([fromFollowUserDelete, toFollowUserDelete]);

        if (fromFollowUserDelete.deletedCount == 0 && toFollowUserDelete.deletedCount == 0) {
            return res.status(200).json(
                EncryptData({ status: false, message: t(user?.language || "english", "unfollow_failed") })
            );
        }
        console.log("🚀 ~ userUnFollow ~ fromFollwUser, toFollowUser:", fromFollowUserDelete, toFollowUserDelete)
        // Update follow notification entry
        // const followNotifyUpdate = await follownotify.findOneAndUpdate(
        //     { _id: request_id },
        //     {
        //         notification: false,
        //         status: "unfollowed",
        //         message_type: "Unfriended",
        //         followto: `${fromUser.name} unfollowed ${toUser.name}`
        //     },
        //     { new: true }
        // );
        // console.log("🚀 ~ userUnFollow ~ followNotifyUpdate:", followNotifyUpdate)

        // Remove main follow notifications
        /* const [unfollowNotification, unfollowNotification2] = */
        await Promise.all([
            Notification.findOneAndDelete({ from: new ObjectId(from), to: new ObjectId(to) }),
            Notification.findOneAndDelete({ from: new ObjectId(to), to: new ObjectId(from) })
        ]);
        /*  single chat delete */
        const singleChatInstanceRemove = await ChatModel.findOneAndDelete({ "members": { $all: [new ObjectId(from), new ObjectId(to)] }, isGroupchat: false })
        console.log("🚀 ~ userUnFollow ~ singleChatInstanceRemove:", singleChatInstanceRemove)
        if (singleChatInstanceRemove) {
            const singleChatMessagesRemove = await MessageModel.deleteMany({ instanceId: singleChatInstanceRemove._id })
            console.log("🚀 ~ userUnFollow ~ singleChatMessagesRemove:", singleChatMessagesRemove)
        }
        /*   single chat delete */
        // if (followNotifyUpdate) {
        // Adjust follow counters atomically
        let decreaseCountfromUser = fromUser.followingCount > 0 ? -1 : 0;
        let decreaseCounttoUser = toUser.followersCount > 0 ? -1 : 0;
        await Promise.all([
            User.findByIdAndUpdate(fromUser._id, { $inc: { followingCount: decreaseCountfromUser } }),
            User.findByIdAndUpdate(toUser._id, { $inc: { followersCount: decreaseCounttoUser } })
        ]);

        return res.status(200).json(EncryptData({
            status: true,
            message: t((user && user.language) ? user.language : "english", "Unfriended"),
            // data: followNotifyUpdate
        }));

    } catch (error) {
        console.error("Error in userUnFollow:", error);
        catchErrorResponse(res, error);
    }
};

//old code
// export const userUnFollow = async (req, res) => {
//     console.log("Request Body:", req.body);

//     try {
//         const { userId, from, to, request_id, accept } = req.body;

//         // Fetch user details
//         const [fromUser, toUser, findUser] = await Promise.all([
//             User.findById(from),
//             User.findById(to),
//             User.findById(userId),
//         ]);

//         if (!fromUser || !toUser || !findUser) {
//             return res.status(200).json(EncryptData({ status: false, message: "User not found" }));
//         }

//         if (accept !== "unfollowed") {
//             return res.status(200).json(EncryptData({ status: false, message: "Invalid accept status" }));
//         }

//         // Define update parameters based on privacy status
//         const statusUpdate = "unfollowed";
//         const message_type = "unFollowed";
//         const statusText = "unfollowed";

//         // Update notification entry
//         const followNotifyUpdate = await follownotify.findOneAndUpdate(
//             { _id: request_id },
//             {
//                 notification: false,
//                 status: statusText,
//                 message_type: message_type,
//                 followto: `${fromUser?.name} unfollowed ${toUser?.name}`
//             },
//             { new: true }
//         );
//         console.log("notificaationssssss_unfollow", followNotifyUpdate);
//         // Update main notification
//         const unfollowNotification = await Notification.findOneAndDelete(
//             { from: new ObjectId(from), to: new ObjectId(to) },

//             { new: true }
//         );
//         const unfollowNotification2 = await Notification.findOneAndDelete(
//             { from: new ObjectId(to), to: new ObjectId(from) },

//             { new: true }
//         );
//         console.log("UnfollowData", unfollowNotification, unfollowNotification2);

//         if (followNotifyUpdate) {
//             // Adjust follow counters
//             const followingCount = Math.max(0, fromUser.followingCount - 1);
//             const followersCount = Math.max(0, toUser.followersCount - 1);

//             await Promise.all([
//                 User.findByIdAndUpdate(fromUser._id, { followingCount }),
//                 User.findByIdAndUpdate(toUser._id, { followersCount })
//             ]);

//             // Send push notification if enabled
//             // if (toUser?.pushNotification) {
//             //     await sendPushNotification({
//             //         type: toUser?.privacy_status === "public" ? "privateaccreq" : "privateaccUnfollowed",
//             //         tokens: toUser?.fcmToken,
//             //         title: "Unfollowed",
//             //         content: `${fromUser?.username} unfollowed you`
//             //     });
//             // }

//             return res.status(200).json(EncryptData({ status: true, message: "Unfollowed successfully", data: followNotifyUpdate }));
//         }

//         res.status(200).json(EncryptData({ status: false, message: "Failed to process unfollow request" }));

//     } catch (error) {
//         console.error("Error in userUnFollow:", error);
//         catchErrorResponse(res, error);
//     }
// };

/*
 * METHOD : POST
 * BODY: (userId, from, to, request_id, accept)
 * URL : /v1/user/privateUserAccFollow
 */
export const privateUserAccFollow = async (req, res) => {
    try {
        const { body: { userId, from, to, request_id, accept }, user } = req;
        const io = req?.app?.get("io")

        const [from_User, to_User] = await Promise.all([
            User.findOne({ _id: new ObjectId(from) }),
            User.findOne({ _id: new ObjectId(to) })
        ])
        // const to_User = await User.findOne({ _id: to });

        if (!from_User || !to_User) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
        const saveActivity = async (activityData) => {
            // let activitysave = { DBName: Notification, Data: activityData };
            // return await Save(activitysave);
            return await saveNotification(activityData, io);
        };
        const isPrivateAccount = to_User?.privacy_status === "private";
        let followNotify;

        const followMessage = `${from_User?.name} followed ${to_User?.name}`;
        const followUpdate = {
            request: true,
            status: "completed",
            message_type: "Followed",
            followto: followMessage
        };

        const resp1 = await follownotify.findOneAndUpdate({ _id: request_id }, { ...followUpdate, seen: true }, { new: true });

        if (!resp1) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "follow_update_failed") }));
        }

        if (accept !== "followed") {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_req") }));
        }
        else if (accept == "followed") {
            followNotify = new follownotify({
                from,
                to,
                notification: true,
                status: "completed",
                message_type: "followed",
                followto: `${to_User?.name} friended ${from_User?.name}`
            });
            await followNotify.save();
            await saveActivity({
                userId,
                action: "Follow",
                status: "private",
                from,
                to,
                type: "Followback",
                message: `Friend request sent`,
                followUserId: followNotify?._id
            });

            await Promise.all([
                User.findOneAndUpdate({ _id: from_User._id }, { $inc: { followingCount: 1 } }, { new: true }),
                User.findOneAndUpdate({ _id: to_User._id }, { $inc: { followingCount: 1 } }, { new: true }),
                User.findOneAndUpdate({ _id: from_User._id }, { $inc: { followersCount: 1 } }, { new: true }),
                User.findOneAndUpdate({ _id: to_User._id }, { $inc: { followersCount: 1 } }, { new: true })
            ])

            if (isPushNotificationEnabled(to_User?.pushNotification)) {
                await sendPushNotification({
                    type: isPrivateAccount ? "privateaccfollow" : "publicaccfollow",
                    tokens: to_User?.fcmToken,
                    title: "New Friend",
                    // content:isPrivateAccount ? `${to_User?.username} has sent you a friend request`: `${from_User?.username} is now your friend`,
                    content: `${from_User?.username} is now your friend`,
                    extraData: { _id: to_User?._id, "type": "notification" }
                });
            }
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "follow_success"), data: resp1 }));
        }

    } catch (error) {
        console.error("Error in privateUserAccFollow:", error);
        catchErrorResponse(res, error);
    }
};


//user followers Data
/*
 * METHOD : POST
 * BODY: (userId, page, limit, searchFollower)
 * URL : /v1/user/GetUserfollower
 */
export const GetUserfollower = async (req, res) => {
    console.log("Getfollow", req.body);
    try {
        const { body: { userId, page, limit, searchFollower }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        const regex = new RegExp(`^${searchFollower}`, 'i');

        let resp;
        if (searchFollower?.toString()) {
            resp = await follownotify.find({ to: new ObjectId(userId), status: "completed" }, { followto: 0 }).skip(parseInt(skip)).limit(parseInt(limit)).populate({
                path: 'from',
                match: { username: regex },
                populate: {
                    path: 'hobbies'
                }
            })
            resp = resp.filter(user => user?.from !== null);

        }
        else {
            resp = await follownotify.find({ to: new ObjectId(userId), status: "completed" }, { followto: 0 }).skip(parseInt(skip)).limit(parseInt(limit)).populate({
                path: 'from',
                populate: {
                    path: 'hobbies'
                }
            })
        }
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "followers"), count: resp?.length, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId, page, limit,searchFollowing)
 * URL : /v1/user/GetUserfollowing
 */
export const GetUserfollowing = async (req, res) => {
    try {
        const { body: { userId, page, limit, searchFollowing }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        const regex = new RegExp(`^${searchFollowing}`, 'i');

        let resp;
        if (searchFollowing?.toString()) {
            resp = await follownotify.find({ from: new ObjectId(userId), status: "completed" }, { followto: 0 }).skip(parseInt(skip)).limit(parseInt(limit)).populate({
                path: 'to',
                match: { username: regex },
                populate: {
                    path: 'hobbies'
                }
            })
            resp = resp.filter(user => user?.to !== null);

        }
        else {
            resp = await follownotify.find({ from: new ObjectId(userId), status: "completed" }, { followto: 0 }).skip(parseInt(skip)).limit(parseInt(limit)).populate({
                path: 'to',
                populate: {
                    path: 'hobbies'
                }
            })
        }

        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "followings"), count: resp?.length, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


//like
/*
 * METHOD : POST
 * BODY: ( userId, likeId )
 * URL : /v1/user/Userlikeprofile
 */
export const Userlikeprofile = async (req, res) => {
    try {
        const { body: { userId, likeId }, user } = req;

        let [likingUser, likedUser, existingLike] = await Promise.all([
            User.findById({ _id: new ObjectId(userId) }),
            User.findById({ _id: likeId }),
            await Like.findOne({ userId })
        ]);
        if (!likingUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
        if (!likedUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "User_liked_not_found") }));
        }
        if (existingLike && existingLike.likeId.includes(likeId)) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "Already_liked_person") }));
        }

        let updatedLikeData;
        if (existingLike) {

            updatedLikeData = await Like.findOneAndUpdate(
                { userId },
                { $push: { likeId } },
                { new: true, strictPopulate: false }
            ).populate({ path: "userId", select: "_id username profile randomIndex name location" }).lean();
        } else {

            const newLike = new Like({
                userId,
                likeId: [likeId],
                status: true
            });
            updatedLikeData = await newLike.save();
        }


        likedUser.likesCount += 1;
        await likedUser.save();
        if (updatedLikeData) {
            if (isPushNotificationEnabled(likedUser?.pushNotification)) {
                await sendPushNotification({
                    type: "like",
                    tokens: likedUser?.fcmToken,
                    title: "Like",
                    content: `${likingUser?.username} is liked your profile`,
                    extraData: { _id: likedUser?._id, "type": "notification" }
                });
            }

            // let activitysave = {
            //     DBName: Notification, Data: {
            //         userId: userId,
            //         action: "like",
            //         from: userId,
            //         to: likeId,
            //         type: "like",
            //         message: `liked your profile`

            //     }
            // }
            // let activityvalues = await Save(activitysave)
            await saveNotification({
                userId: userId,
                action: "like",
                from: userId,
                to: likeId,
                type: "like",
                message: `liked your profile`
            })
            res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "Liked"), data: updatedLikeData }));
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }));

        }


    } catch (error) {
        console.error("Error in Userlikeprofile:", error);
        catchErrorResponse(res, error);
    }
};

//unlike
/*
 * METHOD : POST
 * BODY: ( userId, likeId )
 * URL : /v1/user/UserUnlikeprofile
 */
export const UserUnlikeprofile = async (req, res) => {
    try {
        const { body: { userId, likeId }, user } = req;

        let [userDetails, likedUser, likeDocument, updatedLikeData] = await Promise.all([
            User.findById({ _id: userId }),
            User.findById({ _id: likeId }),
            Like.findOne({ userId }),
            Like.findOneAndUpdate(
                { userId },
                { $pull: { likeId } },
                { new: true }
            )
        ])
        if (!userDetails) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
        if (!likedUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "Liked_user_not_found") }));
        }
        if (!likeDocument || !likeDocument.likeId.includes(likeId)) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "This_like_does_not_exist") }));
        }
        likedUser.likesCount = Math.max((likedUser.likesCount || 0) - 1, 0);
        await likedUser.save();

        if (updatedLikeData) {
            /*   if (isPushNotificationEnabled(likedUser?.pushNotification)) {
                  await sendPushNotification({
                      type: "unlike",
                      tokens: likedUser?.fcmToken,
                      title: "Unlike",
                      content: `${user?.username} is unliked your profile`,
                      extraData:{_id:user?._id,"type":"profile"}
                  });
              } */
            let AcceptChange = await Notification.findOneAndDelete({ from: userId, to: likeId, type: "like" })
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "Unliked"), data: updatedLikeData }));
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }));
        }

    } catch (error) {
        console.error("Error in UserUnlikeprofile:", error);
        catchErrorResponse(res, error);
    }
};

/*
 * METHOD : POST
 * BODY: ( userId,page,limit,searchLikes )
 * URL : /v1/user/UserLikelist
 */
export const UserLikelist = async (req, res) => {
    try {
        const { body: { userId, page, limit, searchLikes }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        const regex = new RegExp(`^${searchLikes}`, 'i');
        let resp;
        if (searchLikes.toString()) {
            resp = await Like.find({ likeId: { $in: [new ObjectId(userId)] } }).skip(parseInt(skip)).limit(parseInt(limit)).populate({
                path: "userId",
                match: { username: regex },
                populate: { path: "hobbies" }
            })
            resp = resp.filter(user => user?.userId !== null);
        }
        else {
            resp = await Like.find({ likeId: { $in: [new ObjectId(userId)] } }).skip(parseInt(skip)).limit(parseInt(limit)).populate({ path: "userId", populate: { path: "hobbies" } })

        }
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "Like_details"), data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

//get like data
/*
 * METHOD : POST
 * BODY: ( userId )
 * URL : /v1/user/GetlikeData
 */
export const GetlikeData = async (req, res) => {
    try {
        const { body: { userId }, user } = req
        let resp = await Like.findOne({ userId: userId }).populate("likeId")
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "Like_details"), data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (planId, planarrId, userId )
 * URL : /v1/user/Userplanadd
 */
/* export const Userplanadd = async (userId, planId, subPlanId, res, type = "") => {
    console.log("request_plan", userId, planId, subPlanId, type);
    try {
        // const { userId, planId, subPlanId } = req.body
        let [finddata, result] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }, { _id: 1, username: 1, profile: 1, randomIndex: 1 }),
            Plan.findOne(
                {
                    _id: planId,
                    plan_days: {
                        $elemMatch: { _id: subPlanId }
                    }
                },
                { 'plan_days.$': 1, 'planType': 1, 'plan_description': 1, 'createdAt': 1, 'updatedAt': 1 }
            )
        ])
        if (type == "subscribe") {

            console.log("result", result, Number(result.plan_days[0].planDays));

            let Date_validation = await DateValidation(Number(result?.plan_days[0]?.planDays))
            console.log("Date_validation", Date_validation);

            let payload = {
                userId: new ObjectId(finddata?._id),
                planId: new ObjectId(result?.plan_days[0]?._id),
                planDays: result?.plan_days[0]?.planDays,
                planType: result?.planType,
                planPrice: result?.plan_days[0]?.planPrice,
                startDate: new Date(),
                EndDate: Date_validation,
                isActive: "started",
                subscriptionStatus: type
            }
            let resp = new Userplan(payload)
            let data = await resp.save()
            console.log("data", data);
            let userplanupdate = await User.findOneAndUpdate({ _id: userId }, { $push: { "plan": resp?._id } }, { new: true })
            console.log("userplanupdate", userplanupdate);
            if (data) {

                // res.status(200).json(EncryptData({ status: true, message: `Plan added details`, data: result }))
                if (isPushNotificationEnabled(userplanupdate?.pushNotification)) {
                    await sendPushNotification({
                        type: "subscribe",
                        tokens: userplanupdate?.fcmToken,
                        title: "Plan Subscribed",
                        content: `${userplanupdate?.username} you plan is subscribed`

                    })
                }
                return { status: true, message: `Plan added successfully`, data: data };

            }
            else {
                // return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                return { status: false, message: "Something error" };

            }
        }
        else if (type == "trial") {
            const userplanId = await Userplan.findOne({ userId: new ObjectId(userId), isActive: { $nin: ["expired", "comingsoon", "started"] } })
            if (!userplanId) {
                return res.status(200).json({ status: false, message: "Plan is already exists, so not give trial." })
            }
            let Date_validation = await DateValidation(Number(result?.plan_days[0]?.planDays))
            console.log("Date_validation", Date_validation);

            let payload = {
                userId: new ObjectId(finddata?._id),
                planId: new ObjectId(result?.plan_days[0]?._id),
                planDays: result?.plan_days[0]?.planDays,
                planType: result?.planType,
                planPrice: result?.plan_days[0]?.planPrice,
                startDate: new Date(),
                EndDate: Date_validation,
                isActive: "started",
                subscriptionStatus: type
            }
            let resp = new Userplan(payload)
            let data = await resp.save()
            console.log("data", data);
            let userplanupdate = await User.findOneAndUpdate({ _id: userId }, { $push: { "plan": resp?._id } }, { new: true })
            console.log("userplanupdate", userplanupdate);
            if (data) {

                // res.status(200).json(EncryptData({ status: true, message: `Plan added details`, data: result }))
                if (isPushNotificationEnabled(userplanupdate?.pushNotification)) {
                    await sendPushNotification({
                        type: "subscribe",
                        tokens: userplanupdate?.fcmToken,
                        title: "Plan trial",
                        content: `${userplanupdate?.username} you plan is trial.`

                    })
                }
                return { status: true, message: `Plan trial added successfully`, data: data };

            }
            else {
                // return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                return { status: false, message: "Something error" };

            }
        }
        else if (type == "cancel") {
            const userplanId = await Userplan.findOne({ _id: new ObjectId(userplanId) })
            if (!userplanId) {
                return res.status(200).json({ status: false, message: "Plan is not found." })
            }
            let userplanupdate = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $pull: { "plan": userplanId?._id } }, { new: true })
            const cancelUserUpdate = await Userplan.findOneAndUpdate({ _id: new ObjectId(userplanId), userId: new ObjectId(userId), subscriptionStatus: "trial" }, { $set: { subscriptionStatus: "cancel" } }, { new: true })
            console.log("userplanupdate", userplanupdate);
            if (cancelUserUpdate) {
                // res.status(200).json(EncryptData({ status: true, message: `Plan added details`, data: result }))
                if (isPushNotificationEnabled(userplanupdate?.pushNotification)) {
                    await sendPushNotification({
                        type: "subscribe",
                        tokens: userplanupdate?.fcmToken,
                        title: "Plan Cancelled.",
                        content: `${userplanupdate?.username} you plan is cancel.`

                    })
                }
                return { status: true, message: `Plan cancel successfully`, data: data };

            }
            else {
                // return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                return { status: false, message: "Something error" };

            }
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
} */


//old code -2
/* export const Userplanadd = async (userId, planId, subPlanId, res, type = "", user_status = "", period_type = "") => {
    try {
        let [finddata, result] = await Promise.all([
            User.findOne(
                { _id: new ObjectId(userId) },
                { _id: 1, username: 1, profile: 1, randomIndex: 1, pushNotification: 1, fcmToken: 1 }
            ),
            Plan.findOne(
                {
                    _id: planId,
                    plan_days: { $elemMatch: { _id: subPlanId } }
                },
                { 'plan_days.$': 1, 'planType': 1, 'plan_description': 1 }
            )
        ]);

        if (!finddata || !result) {
            return { status: false, message: "Invalid user or plan details" };
        }

        const subPlan = result.plan_days[0];
        const Date_validation = await DateValidation(Number(subPlan.planDays));
        const graceSubscription_EndDate = await DateValidation(Number(subPlan.planDays) + 15);

        if (type === "subscribe" || type === "trial") {
            if (type === "trial") {
                const existingTrial = await Userplan.findOne({
                    userId: new ObjectId(userId),
                    subscriptionStatus: { $nin: ["cancel"] },
                    isActive: { $nin: ["expired"] }
                });
                if (existingTrial) {
                    return { status: false, message: "Trial already used" };
                }
            }
            if (user_status == "RENEWAL") {
                const existing = await Userplan.findOne({
                    userId: new ObjectId(userId),
                    planId: new ObjectId(planId),
                    status: "RENEWAL",
                });
                if (existing) {
                    return { status: false, message: "Renewal already used" };
                }
            }
            let payload = {
                userId: new ObjectId(finddata?._id),
                planId: new ObjectId(subPlan?._id),
                planDays: subPlan?.planDays,
                planType: result?.planType,
                planPrice: subPlan?.planPrice,
                startDate: new Date(),
                EndDate: graceSubscription_EndDate,
                isActive: "started",
                subscriptionStatus: type,
                status: user_status,
                periodicType: period_type,
                subscriptionEndDate: Date_validation
            };

            let data = await new Userplan(payload).save();

            await User.findOneAndUpdate({ _id: new ObjectId(finddata?._id) }, { $push: { plan: data._id } }, { new: true });

            if (isPushNotificationEnabled(finddata?.pushNotification)) {
                await sendPushNotification({
                    type,
                    tokens: finddata?.fcmToken,
                    title: type === "subscribe" ? "Plan Subscribed" : type === "trial" ? "Plan Trial" : type === "cancel" ? "Plan Cancelled" : "",
                    content: `${finddata?.username}, your plan is ${type === "subscribe" ? "Subscribed" : type === "trial" ? "Trial" : type === "cancel" ? "Cancelled" : ""}.`
                });
            }
            if (type === "subscribe") {
                await Node_Mailer({
                    Type: "plansubscribed",
                    EmailId: finddata?.email,
                    Subject: "Plan Subscribed successfully!",
                    Content: `Plan Subscribed successfully! Your plan expires on ${new Date(data?.subscriptionEndDate)?.toLocaleString()}. A grace period extends access for 15 days, until ${new Date(data?.EndDate)?.toLocaleString()}. Enjoy all features.`,
                    username: finddata?.username
                });
            }
            return { status: true, message: `Plan ${type} added successfully`, data };
        }

        else if (type === "cancel") {
            if (!planId) return { status: false, message: "cancelPlanId is required" };

            const userplan = await Userplan.findOne({
                _id: new ObjectId(planId),
                userId: new ObjectId(userId)
            });

            if (!userplan) return { status: false, message: "Plan not found" };

            await User.findOneAndUpdate({ _id: new ObjectId(finddata?._id) }, { $pull: { plan: userplan._id } }, { new: true });

            const cancelUserUpdate = await Userplan.findByIdAndUpdate(
                userplan._id,
                { $set: { subscriptionStatus: "cancel", isActive: "expired", status: user_status, periodicType: period_type } },
                { new: true }
            );

            if (isPushNotificationEnabled(finddata?.pushNotification)) {
                await sendPushNotification({
                    type: "cancel",
                    tokens: finddata?.fcmToken,
                    title: "Plan Cancelled",
                    content: `${finddata?.username}, your plan has been cancelled.`
                });
            }

            return { status: true, message: "Plan cancelled successfully", data: cancelUserUpdate };
        }

        return { status: false, message: "Invalid plan type" };

    } catch (error) {
        catchErrorResponse(res, error);
    }
}; */
export const Userplanadd = async (
    userId,
    planId,
    subPlanId,
    res,
    type,
    user_status,
    period_type
) => {
    try {

        const userObjectId = new ObjectId(userId);
        const planObjectId = new ObjectId(planId);
        const subPlanObjectId = new ObjectId(subPlanId);

        const user = await User.findById(userObjectId);

        if (!user) {
            return { status: false, message: "User not found" };
        }

        const plan = await Plan.findOne(
            {
                _id: planObjectId,
                plan_days: { $elemMatch: { _id: subPlanObjectId } }
            },
            { 'plan_days.$': 1, 'planType': 1, 'plan_description': 1 }
        )

        if (!plan) {
            return { status: false, message: "Plan not found" };
        }

        const subPlan = plan?.plan_days[0];

        const subscriptionEndDate = await DateValidation(
            Number(subPlan?.planDays)
        );

        const graceEndDate = await DateValidation(
            Number(subPlan?.planDays) + 15
        );

        /* ------------------ SUBSCRIBE ------------------ */

        if (type === "subscribe" || type === "trial") {

            const payload = {
                userId: userObjectId,
                planId: planObjectId,
                subPlanId: subPlanObjectId,
                planDays: subPlan.planDays,
                planType: plan.planType,
                planPrice: subPlan.planPrice,
                startDate: new Date(),
                subscriptionEndDate: subscriptionEndDate,
                EndDate: graceEndDate,
                isActive: "started",
                subscriptionStatus: type,
                status: user_status,
                periodicType: period_type
            };

            const newPlan = await new Userplan(payload).save();
            if (!newPlan) {
                return {
                    status: true,
                    message: `Plan ${type} is failed`,
                    data: newPlan
                };
            }
            await User.findByIdAndUpdate(
                userObjectId,
                { $push: { plan: newPlan._id } }
            );
            if (isPushNotificationEnabled(user?.pushNotification)) {
                await sendPushNotification({
                    type,
                    tokens: user?.fcmToken,
                    title: type === "subscribe" ? "Plan Subscribed" : type === "trial" ? "Plan Trial" : type === "cancel" ? "Plan Cancelled" : "",
                    content: `${user?.username}, your plan is ${type === "subscribe" ? "Subscribed" : type === "trial" ? "Trial" : type === "cancel" ? "Cancelled" : ""}.`
                });
            }
            if (type === "subscribe") {
                await Node_Mailer({
                    Type: "plansubscribed",
                    EmailId: user?.email,
                    Subject: "Plan Subscribed successfully!",
                    Content: `Plan Subscribed successfully! Your plan expires on ${new Date(newPlan?.subscriptionEndDate)?.toLocaleString()}. A grace period extends access for 15 days, until ${new Date(newPlan?.EndDate)?.toLocaleString()}. Enjoy all features.`,
                    username: user?.username
                });
            }
            return {
                status: true,
                message: `Plan ${type} successfully`,
                data: newPlan
            };
        }

        /* ------------------ CANCEL ------------------ */

        if (type === "cancel") {

            const activePlan = await Userplan.findOne({
                userId: userObjectId,
                isActive: "started"
            });

            if (!activePlan) {
                return { status: false, message: "Active plan not found" };
            }

            const update = await Userplan.findByIdAndUpdate(
                activePlan._id,
                {
                    $set: {
                        subscriptionStatus: "cancel",
                        isActive: "expired",
                        status: user_status
                    }
                },
                { new: true }
            );

            return {
                status: true,
                message: "Subscription cancelled",
                data: update
            };
        }

        /* ------------------ REFUND ------------------ */

        if (type === "refund") {

            const activePlan = await Userplan.findOne({
                userId: userObjectId,
                isActive: "started"
            });

            if (!activePlan) {
                return { status: false, message: "Active plan not found" };
            }

            const update = await Userplan.findByIdAndUpdate(
                activePlan._id,
                {
                    $set: {
                        subscriptionStatus: "refund",
                        isActive: "expired",
                        status: user_status
                    }
                },
                { new: true }
            );

            return {
                status: true,
                message: "Subscription refunded",
                data: update
            };
        }

        /* ------------------ EXPIRE ------------------ */

        if (type === "expire") {

            const expirePlan = await Userplan.updateMany(
                {
                    userId: userObjectId,
                    isActive: "started"
                },
                {
                    $set: {
                        isActive: "expired",
                        subscriptionStatus: "expired"
                    }
                }
            );

            return {
                status: true,
                message: "Plan expired",
                data: expirePlan
            };
        }

        return { status: false, message: "Invalid type" };

    } catch (error) {

        console.error("Userplanadd_error", error);

        return {
            status: false,
            message: "Server error"
        };
    }
};

//This code is expiry plan to start next plan
/* export const Userplanadd = async (req, res) => {
    console.log("request_plan", req.body);
    try {
        const { planId, planarrId, userId } = req.body;

        let finddata = await User.findOne({ _id: new ObjectId(userId) }).populate("plan").lean();
        if (!finddata) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const result = await Plan.findOne(
            {
                _id: planId,
                plan_days: {
                    $elemMatch: { _id: new ObjectId(planarrId) }
                }
            },
            { 'plan_days.$': 1, 'planType': 1, 'plan_description': 1, 'createdAt': 1, 'updatedAt': 1 }
        );

        if (!result) {
            return res.status(404).json({ status: false, message: "Plan not found" });
        }

        // Get the user's last active plan that hasn't expired
        const lastPlan = await Userplan.findOne({
            userId: userId,
            isActive: { $ne: "expired" }
        }).sort({ EndDate: -1 });  // Sort by EndDate to get the most recent plan

        let startDate, endDate;
        if (lastPlan) {
            // Set startDate to the previous plan's EndDate
            startDate = new Date(lastPlan.EndDate);
        } else {
            // If no previous plan, start the plan immediately
            startDate = new Date();
        }

        // Validate and calculate the EndDate using DateValidation
        const planDays = Number(result?.plan_days[0]?.planDays);
        endDate = await DateValidation(planDays, startDate);

        // Prepare the payload for the new subscription
        const payload = {
            userId: new ObjectId(finddata?._id),
            planId: new ObjectId(result?.plan_days[0]?._id),
            planDays: planDays,
            planType: result?.planType,
            planPrice: result?.plan_days[0]?.planPrice,
            plan_description: result?.plan_description,
            startDate: startDate,
            EndDate: endDate,
            isActive: "notstarted"
        };

        const newPlan = new Userplan(payload);
        const savedPlan = await newPlan.save();

        if (!savedPlan) {
            return res.status(500).json({ status: false, message: "Error saving plan" });
        }

        const userplanupdate = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { plan: savedPlan._id } },
            { new: true }
        );

        res.status(200).json({ status: true, message: "Plan added successfully", data: result });

        if (isPushNotificationEnabled(userplanupdate?.pushNotification)) {
            await sendPushNotification({
                type: "subscribe",
                tokens: userplanupdate?.fcmToken,
                title: "Plan Subscribed",
                content: `${userplanupdate?.name} has subscribed`
            });
        }

    } catch (error) {
        console.error("Error adding user plan:", error);
        catchErrorResponse(res, error);
    }
}; */


/*
 * user email update enable(true), disable(false)
 * METHOD : POST
 * BODY: {id,emailupdate(true or false)}
 * URL : /user/EmailupdateEnabledisable
 */
// export const EmailupdateEnabledisable = async (req, res) => {
//     console.log("req.body", req.body);
//     try {
//         let resp = await User.findOne({ _id: req.body.id })
//         let emailupdates = await Subscribers.findOneAndUpdate({ email: resp.email }, { emailupdate: req.body.emailupdate, maySent: req.body.emailupdate }, { new: true })
//         console.log("responses", resp, emailupdates);
//         let result = emailupdates?.emailupdate == true ? "enable" : "disable"
//         if (resp) {
//             res.status(200).json({ status: true, message: `emailupdate ${result} successfully`, data: emailupdates })
//         }
//         else {
//             res.status(200).json({ status: false, message: "something error" })
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

/*
 * user account delete
 * METHOD : POST
 * BODY: (userId)
 * URL : /v1/user/UserAccountDelete
 */
export const UserAccountDelete = async (req, res) => {
    try {
        let otp = generateOTP();
        const { user } = req
        let finduser = await User.findOne({ _id: new ObjectId(user?._id) })
        if (finduser?.delete == false) {
            let resendata = await User.findOneAndUpdate({ _id: finduser?._id }, { OTP: EncryptData(otp) }, { new: true })
            res.status(200).json(EncryptData({ status: true, "message": t((user && user.language) ? user.language : "english", "otp_del_sent") }))
            let SendMail = await Node_Mailer({ Type: "deleteverify", EmailId: resendata.email, Subject: 'Meeting Application Delete verify OTP', OTP: otp, username: resendata.username })
            // console.log(SendMail)
        }
        /*    let resp = await User.findOneAndUpdate({ _id: userId }, { delete: true, socketId: "", fcmToken: [], login_status: false, authToken: "" }, { new: true })
           console.log("responses", resp);
           if (resp) {
               res.status(200).json({ status: true, message: "You have deleted your account", data: resp })
               let SendMail = await Node_Mailer({ Type: "deleteaccount", EmailId: resp.email, Subject: 'Delete Account in Meeting Application', username: resp.name })
               console.log(SendMail)
           }
           else {
               res.status(200).json({ status: false, message: "Something error" })
           } */
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (email, OTP)
 * URL : /v1/user/verifyEmail
 */
export const AccountDeleteOtpVerify = async (req, res) => {
    try {
        await AccountDeleteVerifyOTPfunc(req, res, User)
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

//help
/*
 * METHOD : POST
 * BODY: (userId, feature, description, help,email)
 * URL : /v1/user/helpadd
 */
export const helpadd = async (req, res) => {
    try {
        const { body: { userId, feature, description, help, email }, user } = req
        let findusers = await User.findOne({ _id: new ObjectId(userId) })
        if (findusers) {

            let payload = {
                userId: new ObjectId(userId),
                feature: feature,
                description: description,
                email: findusers?.email

            }
            let data = new Help(payload)
            let resp = await data.save()
            if (resp) {
                res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "help_sent"), data: resp }))
                let SendMail = await Node_Mailer({ Type: "helpmail", EmailId: email, Subject: 'Meeting Application Help Mail', Content: description, feature: feature, username: "admin" })
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), data: resp }))
            }
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId, feedback,email)
 * URL : /v1/user/Userfeedback
 */
export const Userfeedback = async (req, res) => {
    try {
        const { body: { userId, feedback, email }, user } = req
        let finduser = await User.findOne({ _id: new ObjectId(userId) })
        let payload = {
            userId: new ObjectId(userId),
            feedback: feedback,
            email: finduser?.email
        }
        let data = new Feedback(payload)
        let resp = await data.save()
        if (resp) {
            res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "feedback_sent"), data: resp }))
            let SendMail = await Node_Mailer({ Type: "feedbackmail", EmailId: email, Subject: 'Meeting Application Feedback Mail', Content: feedback, username: "admin" })

        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), data: resp }))

        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId, fcmtoken)
 * URL : /v1/user/UserLogout
 */
export const UserLogout = async (req, res) => {
    try {
        const { body: { userId, fcmtoken }, user } = req;

        let resp = await User.findOneAndUpdate({ _id: new ObjectId(userId), "fcmToken": { $in: [fcmtoken] } }, { $pull: { "fcmToken": fcmtoken }, $set: { login_status: false } }, { new: true })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "logout_success"), data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "fcm_not_match"), data: resp }))
        }

    } catch (error) {
        catchErrorResponse(res, error);
    }
};



/*
 * METHOD : POST
 * BODY: (userId,TFA(true,false))       mn               
 * URL : /v1/user/UserEnableDisableTFA
 */
export const UserEnableDisableTFA = async (req, res) => {
    try {
        const { body: { userId, TFA }, user } = req
        let userFind = await User.findOne({ _id: new ObjectId(userId) })
        if (userFind) {
            let resp = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { TFA: TFA }, { new: true })
            let result = resp?.TFA ? t((user && user.language) ? user.language : "english", "tfa_enabled") : t((user && user.language) ? user.language : "english", "tfa_disabled")

            if (resp) {
                return res.status(200).json(EncryptData({ status: true, message: result, data: resp }))
                /* if (resp?.pushNotification) {
                    await sendPushNotification({
                        type: "tfa",
                        tokens: resp?.fcmToken,
                        title: "TFA",
                        content: `Two Factor Authentication is ${result}`

                    })
                } */
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))

            }
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))

        }
    } catch (error) {
        catchErrorResponse(req, error)
    }
}

//email updates
/*
 * METHOD : POST
 * BODY: (userId, emailUpdates(true,false))
 * URL : /v1/user/UserEnableDisableInEmailUpdate
 */
export const UserEnableDisableInEmailUpdate = async (req, res) => {
    try {
        const { body: { userId, emailUpdates }, user } = req
        let findusertoupdate = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { emailUpdates: emailUpdates }, { new: true })
        let result = findusertoupdate?.emailUpdates == true ? t((user && user.language) ? user.language : "english", "enabled") : t((user && user.language) ? user.language : "english", "disabled")
        if (findusertoupdate) {
            if (isPushNotificationEnabled(findusertoupdate?.pushNotification)) {
                await sendPushNotification({
                    type: "emailupdate",
                    tokens: findusertoupdate?.fcmToken,
                    title: "Email Update",
                    content: `Email update is ${findusertoupdate?.emailUpdates == true ? "Enable" : "Disable"}`

                })
            }
            return res.status(200).json(EncryptData({ status: true, message: result, data: findusertoupdate }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

// export const Hobbieslist = async (req, res) => {
//     try {
//         let resp = await categorylist.find({ hideshow: "visible" }).populate({
//             path: "subcategoryId",
//             match: { hideshow: "visible" }
//         });
//         console.log("resposne", resp);
//         if (resp) {
//             res.status(200).json({ status: true, message: `Hobbies lists`, data: resp })
//         }
//         else {
//             res.status(200).json({ status: false, message: "something error" })
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

/*
 * METHOD : POST
 * BODY: (userId, pushNotification(true,false))
 * URL : /v1/user/Pushnotification
 */
export const Pushnotification = async (req, res) => {

    try {
        const { body: { userId, pushNotification, fcmtoken }, user } = req
        const enabled =
            pushNotification === true ||
            pushNotification === 'true' ||
            pushNotification === 1 ||
            pushNotification === '1';

        const update = { $set: { pushNotification: enabled } };
        if (fcmtoken) {
            update.$addToSet = { fcmToken: fcmtoken };
        }

        let resp = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, update, { new: true })

        let result = resp?.pushNotification ? t((user && user.language) ? user.language : "english", "push_enabled") : t((user && user.language) ? user.language : "english", "push_disabled")
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: result, data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId, hide_profile(true,false))
 * URL : /v1/user/Hideprofile
 */
export const HideProfile = async (req, res) => {
    try {
        const { body: { userId, hide_profile }, user } = req
        let resp = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { ishideprofile: hide_profile } }, { new: true })
        const result = resp?.ishideprofile ? t((user && user.language) ? user.language : "english", "profile_hidden") : t((user && user.language) ? user.language : "english", "profile_visible");

        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: result }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId,hide_hobbies(true,false))
 * URL : /v1/user/HidehobbiesInprofile
 */
export const HidehobbiesInprofile = async (req, res) => {
    try {
        const { body: { userId, hide_hobbies }, user } = req
        let resp = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { ishidehobbies: hide_hobbies } }, { new: true })
        const result = resp?.ishidehobbies ? t((user && user.language) ? user.language : "english", "Hobbies_hide_successfully") : t((user && user.language) ? user.language : "english", "Hobbies_unhide_successfully")
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: result }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId)
 * URL : /v1/user/UserGroupCount
 */
export const UserGroupCount = async (req, res) => {
    try {
        const { user } = req
        let resp = await ChatModel.countDocuments({ groupCreater: new ObjectId(req.body.userId), isGroupchat: true, iseventchat: false })

        if (resp || resp == 0) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "group_count"), data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId)
 * URL : /v1/user/UserInterestCount
 */
export const UserInterestCount = async (req, res) => {
    try {
        const { user } = req

        let resp = await User.findOne({ _id: new ObjectId(req.body.userId) })

        let result = resp.hobbies.length
        if (resp || resp == 0) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "hobby_count"), data: result }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId)
 * URL : /v1/user/UserFollowingCount
 */
export const UserFollowingCount = async (req, res) => {
    try {
        const { user } = req

        let resp = await User.findOne({ _id: new ObjectId(req.body.userId) })

        let result = resp.followingCount
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "followers_count"), data: result }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : GET
 * BODY: (userId, hobbyname, page, limit)
 * URL : /v1/user/hobbysearch
 */
/* export const hobbysearch = async (req, res) => {
    console.log("hobbysearch_request",req.query);
    
    try {
        const { userId, hobbyname, page, limit } = req.query;
        if (!userId || !hobbyname) {
            return res.status(200).json(EncryptData({ status: false, message: "User ID and hobby name are required" }));
        }

        const skip = ((page ? parseInt(page) : 1) - 1) * limit
        let [AdminData, userData] = await Promise.all([
            Admin.findOne({}),
            User.findOne({ _id: new ObjectId(userId) })
        ]);
        const HobbyLimit = Number(AdminData?.hobby_limit);

        if (!userData) {
            return res.status(200).json(EncryptData({ status: false, message: "User not found" }));
        }

        const MostPopularHobbies = await GetMostPopularHobbies();

        let Matchfinddata = await UserHobbysearch({
            DbName: categorylist,
            hobbyname: hobbyname,
            page: page, skip: skip, limit: limit
        });
        // console.log("Matchfinddata",Matchfinddata);

        if (!Matchfinddata) {
            return res.status(200).json(EncryptData({
                status: false,
                message: "No records found for your search"
            }));
        }

        let message = (page == -1 || page == "all") ? "All hobbies" : "Your search results";
        return res.status(200).json(EncryptData({
            status: true,
            message: message,
            data: Matchfinddata.data,
            HobbyLimit: HobbyLimit,
            PopularHobbies: MostPopularHobbies
        }));
    } catch (error) {
        catchErrorResponse(res, error);
    }
}; */

export const hobbysearch = async (req, res) => {
    console.log("🚀 ~ hobbysearch ~ req:", req.query)
    const url = req.originalUrl.split("?")[0];

    try {
        const { query: { userId, hobbyname, page, limit }, user } = req
        let MostPopularHobbies = await GetMostPopularHobbies()
        let message = (page == Number(-1) || page == "all") ? t((user && user.language) ? user.language : "english", "all_hobbies") : t((user && user.language) ? user.language : "english", "search_hobbies")

        const AdminData = await Admin.findOne({});
        const HobbyLimit = Number(AdminData?.hobby_limit);

        const skip = page == "all" ? 0 : ((page ? parseInt(page) : 1) - 1) * parseInt(limit)

        let respdata = await User.findOne({ _id: new ObjectId(userId) })
        if (!respdata) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }

        const Matchfinddata = await UserHobbysearch({ DbName: categorylist, hobbyname: hobbyname, page: page, skip: skip, limit: limit })
        // console.log("🚀 ~ hobbysearch ~ Matchfinddata:", Matchfinddata)
        const responseData = {
            status: true,
            message: message,
            data: Matchfinddata.data,
            HobbyLimit: HobbyLimit,
            PopularHobbies: MostPopularHobbies
        };

        //     {
        //         $match: {
        //             $expr: { "hideshow": "visible" }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "subcategories",
        //             let: { groupIdsubcat: "$subcategoryId" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $eq: ["$_id", { $toObjectId: "$$groupIdsubcat" }]
        //                         }
        //                     }
        //                 }
        //             ],
        //             as: "subcategorylist"
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "categories",
        //             let: { groupIdcat: "$categoryId" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $eq: ["$_id", { $toObjectId: "$$groupIdcat" }]
        //                         }
        //                     }
        //                 }
        //             ],
        //             as: "categorylist"
        //         }
        //     },
        //     { $sort: { order: 1 } },
        //     ...(page && page !== -1 && page !== "all" ? [{ $skip: skip }] : []),
        //     ...(page && page !== -1 && page !== "all" ? [{ $limit: limit }] : [])
        // ])
        console.log("Matchfinddata", Matchfinddata.length);

        if (Matchfinddata?.data.length > 0) {
            // let message = (page == Number(-1) || page == "all") ? t((user && user.language) ? user.language : "english", "all_hobbies") : t((user && user.language) ? user.language : "english", "search_hobbies")
            return res.status(200).json(EncryptData({ status: true, message: message, data: responseData?.data, "HobbyLimit": responseData?.HobbyLimit, PopularHobbies: responseData?.PopularHobbies }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "search_hobbies_err") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : GET
 * BODY: (userId, name, page, limit)
 * URL : /v1/user/UserslistSearchfunc
 */
export const UserslistSearchfunc = async (req, res) => {
    // console.log("fgggdwer34344343", req.query);
    const url = req.originalUrl.split("?")[0];

    try {
        const { query: { userId, name, page, limit, latitude, longitude, distance }, user } = req;

        const io = req?.app?.get("io")
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        let blockUsers = await User.find({ "userblocked": { $in: [new ObjectId(userId)] } }, { _id: 1, userblocked: 1 })
        blockUsers = blockUsers?.map(el => el?.userblocked?.map(id => id.toString())).flat() || [];
        console.log("DVVVVVVV_123", blockUsers);

        let NotifyCount = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: userId, io: io, BlockUser: blockUsers });
        let respdata = await User.findOne({ _id: new ObjectId(userId) }, { _id: 1, hobbies: 1, location: 1, profile: 1, randomIndex: 1, plan: 1, blockStatus: 1 })
        // console.log("respdatarespdata", respdata);

        if (!respdata) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }

        const regex = `^${name}`;
        console.log("rt_regex", regex.length)
        const validHobbies = [];

        if (Array.isArray(respdata?.hobbies) && respdata?.hobbies.length > 0) {
            for (const hobby of respdata?.hobbies) {
                if (ObjectId.isValid(hobby)) {
                    // console.log("hobby", hobby);
                    validHobbies.push(new ObjectId(hobby));
                }
            }
        }

        let matchStage = {
            _id: { $ne: new ObjectId(userId) },
            ishideprofile: false,
            // userblocked: { $nin: blockId },
            delete: false,
            blockStatus: "unblocked",
            // Do not require hobby overlap: everyone in radius who passes matchStage is included;
            // UserListAndSearchfunc sorts by mutualHobbiesCount (viewer hobbies) then distance.
            // $or: [
            //     { name: { $regex: regex, $options: 'i' } },
            //     { username: { $regex: regex, $options: 'i' } }
            // ]
        };

        // Prefer client-sent coordinates (device GPS / advanced-filter map /
        // location picker).  Fall back to the user's stored profile location
        // only when the client didn't send any.  Mirrors getInitialchatdata
        // for groups.
        const profileLng = respdata?.location?.coordinates?.[0];
        const profileLat = respdata?.location?.coordinates?.[1];
        const parsedClientLat = Number(latitude);
        const parsedClientLng = Number(longitude);
        const hasClientCoords =
            Number.isFinite(parsedClientLat) &&
            Number.isFinite(parsedClientLng) &&
            !(parsedClientLat === 0 && parsedClientLng === 0);
        const effectiveLat = hasClientCoords ? parsedClientLat : profileLat;
        const effectiveLng = hasClientCoords ? parsedClientLng : profileLng;
        const parsedDistanceKm = parseFloat(distance);
        const distanceKilometer =
            Number.isFinite(parsedDistanceKm) && parsedDistanceKm > 0
                ? parsedDistanceKm * 1000
                : 100 * 1000; // 100km default to match the previous hardcoded value

        console.log("UserslistSearchfunc location →", {
            hasClientCoords,
            effectiveLat,
            effectiveLng,
            distanceKilometer,
        });

        // console.log("fg_validHobbies", validHobbies)
        const UserlistSearchFunction = await UserListAndSearchfunc({ DBName: User, userId: userId, page: page, limit: limit, skip: skip, matchStage: matchStage, longitude: effectiveLng, latitude: effectiveLat, viewerHobbyIds: validHobbies, distanceKilometer })
        console.log("UserlistSearchFunction", JSON.stringify(UserlistSearchFunction, null, 2));

        if (UserlistSearchFunction) {
            let msg = (page == Number(-1) || page == "all") ? t((user && user.language) ? user.language : "english", "all_users") : t((user && user.language) ? user.language : "english", "search_users")
            // io?.sockets?.to(userId?.toString()).emit("Singlechat_counts", { SingleChatCounts: NotifyCount?.SingleChatCounts , userId, api:"UserslistSearchfunc"});
            const reponseData = {
                status: true, message: msg, data: UserlistSearchFunction?.data || [], NotificationCount: NotifyCount?.NotificationCount,
                SingleChatCounts: NotifyCount?.SingleChatCounts,
                _debug: {
                    source: hasClientCoords ? "client" : "profile",
                    center: [effectiveLng, effectiveLat],
                    distanceKilometer,
                    count: UserlistSearchFunction?.data?.length || 0,
                },
            }
            return res.status(200).json(EncryptData(reponseData))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : GET
 * BODY: (userId)
 * URL : /v1/user/EventslistSearchfunc
 */


// export const EventslistSearchfunc = async (req, res) => {
//     console.log("requestssssbody", req.query);
//     try {
//         const { userId, eventTitle, page, limit } = req.query
//         const skip = ((page ? parseInt(page) : 1) - 1) * limit
//         console.log("dfgfgfgfggf", skip);
//         let respdata = await User.findOne({ _id: userId })

//         let followedUsers = await follownotify.find({ from: userId, status: "completed" }, { to: 1 });
//         console.log("Followed Users:", followedUsers);

//         var followedUserIds = followedUsers.map((value) => value.to);
//         console.log("Followed User IDs:", followedUserIds);


//         console.log("respdatarespdata", respdata);
//         let regex = new RegExp(`^${eventTitle}`, "i");
//         if (respdata) {
//             if (page == Number(-1) || page == "all") {

//                 // let finddata = await Event.find({ userId: { $ne: new ObjectId(userId) }, event_status: { $in: ["comingsoon", "started"] },  isblocked: "unblocked", eventTitle: { $regex: regex } }).populate({ path: "userId", populate: { path: "hobbies" } }).populate({ path: "eventinterested.userId" }).lean()


//                 let finddata = await Event.find({
//                     $and: [
//                         { userId: { $ne: new ObjectId(userId) } },
//                         { event_status: { $in: ["comingsoon", "started"] } },
//                         { isblocked: "unblocked" },
//                         { eventTitle: { $regex: regex } }
//                     ],
//                     $or: [
//                         { privacy_status: 'public' },
//                         { userId: { $in: followedUserIds.map(id => new ObjectId(id)) } }
//                     ],
//                 })
//                     .populate({
//                         path: "userId",
//                         populate: { path: "hobbies" }
//                     })
//                     .populate({ path: "eventinterested.userId" })
//                     .lean();

//                 console.log("finddata", finddata);
//                 // await finddata.map((values)=>{
//                 //     console.log("mapvlauess",values);
//                 // })
//                 if (finddata) {
//                     res.status(200).json({ status: true, message: "All events", data: finddata })
//                 }
//                 else {
//                     res.status(200).json({ status: false, message: "you search data not get error" })

//                 }
//             }
//             else {
//                 // let regex = new RegExp(`^${eventTitle}`, "i");
//                 // let finddata = await Event.find({ userId: { $ne: new ObjectId(userId) }, event_status: { $in: ["comingsoon", "started"] }, isblocked: "unblocked", eventTitle: { $regex: regex } }).skip(parseInt(skip)).limit(parseInt(limit)).populate({ path: "userId", populate: { path: "hobbies" } }).populate({ path: "eventinterested.userId" }).lean()


//                 let finddata = await Event.find({
//                     $and: [
//                         { userId: { $ne: new ObjectId(userId) } },
//                         { event_status: { $in: ["comingsoon", "started"] } },
//                         { isblocked: "unblocked" },
//                         { eventTitle: { $regex: regex } }
//                     ],
//                     $or: [
//                         { privacy_status: 'public', isblocked: "unblocked" },
//                         { userId: { $in: followedUserIds.map(id => new ObjectId(id)) } }
//                     ],
//                 }).skip(parseInt(skip)).limit(parseInt(limit)).populate({ path: "userId", populate: { path: "hobbies" } }).populate({ path: "eventinterested.userId" }).lean()
//                 console.log("finddata", finddata);
//                 if (finddata) {
//                     res.status(200).json({ status: true, message: "you search data", data: finddata })
//                 }
//                 else {
//                     res.status(200).json({ status: false, message: "you search data not get error" })

//                 }
//             }

//         }
//         else {
//             res.status(200).json({ status: false, message: "something error" })

//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }


// }

/*
 * METHOD : GET
 * BODY: (userId, eventTitle, page, limit)
 * URL : /v1/user/EventslistSearchfunc
 */

export const EventslistSearchfunc = async (req, res) => {
    console.log("Request query:", req.query);

    try {
        const { query: { userId, eventTitle, page, limit, latitude, longitude, distance } } = req;
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        console.log("Skip value for pagination:", skip, ((page <= 0 ? 1 : parseInt(page)) - 1), page);
        let [user, findHideEvent] = await Promise.all([
            User.findById(userId).populate("plan"),
            User.find({ ishideevent: true }, { _id: 1 })
        ])
        const activePlan = user?.plan?.length > 0 ? user?.plan?.find(plan => plan?.isActive == "started") : null;
        let arrBlockedUser = [new ObjectId(userId)];
        if (!user) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        let followedUsers = await follownotify.find({ from: userId, status: "completed" }, { to: 1 });

        let followedUserIds = (followedUsers?.length > 0 && Array.isArray(followedUsers)) ? followedUsers?.map(follow => follow?.to) : [];
        const viewerOid = new ObjectId(userId);
        const followedObjectIds = followedUserIds.map((id) =>
            id instanceof ObjectId ? id : new ObjectId(String(id)),
        );
        const followOrSelfIds = [...followedObjectIds];
        if (!followOrSelfIds.some((id) => id.equals(viewerOid))) {
            followOrSelfIds.push(viewerOid);
        }

        const rawTitle = eventTitle != null ? String(eventTitle) : '';
        const escapedTitle = rawTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = `^${escapedTitle}`;
        // console.log("findHideEventfindHideEvent_123", findHideEvent);
        let hiddenUserIds = findHideEvent?.map(user => user?._id);
        hiddenUserIds.push(new ObjectId(userId))
        console.log("hiddenUserIds", hiddenUserIds);
        if (user && user?.userblocked?.length > 0) {
            user?.userblocked?.map((el) => {
                hiddenUserIds.push(el)
                arrBlockedUser.push(el)
            })
        }

        // const hideEventCondition = eventTitle
        //     ? { userId: { $nin: hiddenUserIds } }
        //     : { userId: { $nin: arrBlockedUser } };
        /*  const cleanHiddenUserIds = (hiddenUserIds || []).filter(
             id => id && ObjectId.isValid(id.toString())
         );
 
         const cleanBlockedUserIds = (arrBlockedUser || []).filter(
             id => id && ObjectId.isValid(id.toString())
         ); */

        /* const hideEventCondition = eventTitle
            ? (cleanHiddenUserIds.length > 0 ? { userId: { $nin: cleanHiddenUserIds } } : {})
            : (cleanBlockedUserIds.length > 0 ? { userId: { $nin: cleanBlockedUserIds } } : {}); */

        // const hideEventCondition = eventTitle
        // ? (cleanHiddenUserIds.length > 0 ? { userId: { $in: cleanHiddenUserIds } } : {})
        // : (cleanBlockedUserIds.length > 0 ? { userId: { $in: cleanBlockedUserIds } } : {});
        // console.log("🚀 ~ EventslistSearchfunc ~ hideEventCondition:",eventTitle, hideEventCondition)

        let eventQuery = {
            // ...hideEventCondition,
            ishideInEvent: false,
            event_status: { $in: ["comingsoon", "started"] },
            isblocked: "unblocked",
            delete: false,
            eventTitle: { $regex: regex, $options: 'i' },
            // Schema default privacy can be "" — treat as public. Only hide true private except for followed hosts + self.
            $or: [
                { privacy_status: { $nin: ['private', 'Private'] } },
                {
                    $and: [
                        { privacy_status: { $in: ['private', 'Private'] } },
                        { userId: { $in: followOrSelfIds } },
                    ],
                },
            ],
        };
        // let finddata;
        /*     const chatRecords = await ChatModel.find({ "isGroupchat": true }) */
        // if (activePlan) {
        //     finddata = await eventListSearchAggregation({ DBName: Event, eventQuery, page, limit, skip, longitude: user?.location?.coordinates[0], latitude: user?.location?.coordinates[1] })
        // }
        // else {
        const viewerEventHobbyIds = (Array.isArray(user?.hobbies) ? user.hobbies : [])
            .filter((h) => ObjectId.isValid(h))
            .map((h) => new ObjectId(h));

        // Prefer client-sent coordinates (device GPS / advanced-filter map /
        // location picker).  Fall back to the user's stored profile location
        // only when the client didn't send any.  Mirrors getInitialchatdata
        // for groups.
        const profileEventLng = user?.location?.coordinates?.[0];
        const profileEventLat = user?.location?.coordinates?.[1];
        const parsedEventClientLat = Number(latitude);
        const parsedEventClientLng = Number(longitude);
        const hasEventClientCoords =
            Number.isFinite(parsedEventClientLat) &&
            Number.isFinite(parsedEventClientLng) &&
            !(parsedEventClientLat === 0 && parsedEventClientLng === 0);
        const effectiveEventLat = hasEventClientCoords ? parsedEventClientLat : (profileEventLat ?? 0);
        const effectiveEventLng = hasEventClientCoords ? parsedEventClientLng : (profileEventLng ?? 0);
        const parsedEventDistanceKm = parseFloat(distance);
        const eventDistanceKilometer =
            Number.isFinite(parsedEventDistanceKm) && parsedEventDistanceKm > 0
                ? parsedEventDistanceKm * 1000
                : 100 * 1000; // 100km default to match the previous hardcoded value

        console.log("EventslistSearchfunc location →", {
            hasClientCoords: hasEventClientCoords,
            effectiveLat: effectiveEventLat,
            effectiveLng: effectiveEventLng,
            distanceKilometer: eventDistanceKilometer,
        });

        let finddata = await eventListSearchWithRadiusAggregation({
            DBName: Event,
            eventQuery,
            page,
            limit,
            skip,
            longitude: effectiveEventLng,
            latitude: effectiveEventLat,
            viewerHobbyIds: viewerEventHobbyIds,
            distanceKilometer: eventDistanceKilometer,
        })
        // }
        console.log("finddata===>", JSON.stringify(finddata, null, 2));

        // if (page == -1 || page == "all") {
        // finddata = await eventListSearchAggregation({ DBName: Event, eventQuery, page, limit, skip, longitude: user?.location?.coordinates[0], latitude: user?.location?.coordinates[1] })
        // await Event.find(eventQuery)
        //     .sort({ createdAt: -1 })
        //     .populate({ path: "userId", select: "_id profile randomIndex username", populate: { path: "hobbies", select: "_id hobbyname" } })
        //     .populate({ path: "eventinterested.userId", select: "_id profile randomIndex username" })
        //     .populate({ path: "eventhobbies" })
        //     .lean();
        // } else {
        // finddata = await eventListSearchAggregation({ DBName: Event, eventQuery, page, limit, skip, longitude: user?.location?.coordinates[0], latitude: user?.location?.coordinates[1] })
        // finddata = 
        // await Event.find(eventQuery)
        //     .sort({ createdAt: -1 })
        //     .skip(skip)
        //     .limit(parseInt(limit))
        //     .populate({ path: "userId", select: "_id profile randomIndex username", populate: { path: "hobbies", select: "_id hobbyname" } })
        //     .populate({ path: "eventinterested.userId", select: "_id profile randomIndex username" })
        //     .populate({ path: "eventhobbies" })
        //     .lean();
        // }
        const listData = Array.isArray(finddata?.data) ? finddata.data : [];
        const _debug = {
            source: hasEventClientCoords ? "client" : "profile",
            center: [effectiveEventLng, effectiveEventLat],
            distanceKilometer: eventDistanceKilometer,
            count: listData.length,
        };
        const responseData = { status: true, message: t((user && user.language) ? user.language : "english", "events_loaded"), data: listData, _debug };

        if (listData.length > 0) {
            return res.status(200).json(EncryptData(responseData));
        }
        return res.status(200).json(EncryptData({
            status: false,
            statusCode: true,
            message: t((user && user.language) ? user.language : "english", "no_events"),
            data: listData,
            _debug,
        }));

    } catch (error) {
        catchErrorResponse(res, error);
    }

};

/*
 * METHOD : GET
 * BODY: (gender, page, limit)
 * URL : /v1/user/Gendersearchlist
 */
export const Gendersearchlist = async (req, res) => {
    console.log("hobbysearch", req.body);
    try {
        const { query: { gender, page, limit }, user } = req;
        const skip = ((page ? parseInt(page) : 1) - 1) * parseInt(limit)
        console.log("dfgfgfgfggf", skip);
        const finddata = await Gender.find({});
        console.log("finddata_23454546", finddata);
        let GenderCount = finddata.length
        console.log("dfdfdfdf", GenderCount);
        if (page == Number(-1) || page == "all") {
            const finddata = await Gender.find({});
            console.log("finddata", finddata);

            if (finddata?.length > 0) {
                return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "all_genders"), data: finddata, GenderCount: GenderCount }));
            } else {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }));
            }
        }
        else {
            let query = {};
            if (gender) {
                const regex = new RegExp(`^${gender}`, "i");
                query.gendername = { $regex: regex };
            }

            const finddata = await Gender.find(query).skip(parseInt(skip)).limit(parseInt(limit));
            console.log("finddata", finddata);

            if (finddata) {
                return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "search_found"), data: finddata, GenderCount: GenderCount }));
            } else {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "search_not_found") }));
            }
        }

    } catch (error) {
        console.error('Error occurred:', error);
        catchErrorResponse(res, error)
    }
};

/*
 * METHOD : POST
 * BODY: (userId)
 * URL : /v1/user/Userprofilelist
 */
export const Userprofilelist = async (req, res) => {
    console.log("A5BX5r454545", req.body)
    try {
        const { body: { userId }, user } = req

        const CountsData = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: userId })
        console.log("CountsData", CountsData);

        let resp = await User.findOne({ _id: new ObjectId(userId) }).populate("hobbies").populate({ path: "plan" }).lean()
        if (!resp) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        // console.log("single_user_profile", resp);
        let Response = { ...resp, ...{ Groupcounts: CountsData?.Groupcounts, NotificationCount: CountsData?.NotificationCount, LikeData: CountsData?.LikeData, GroupJoinedCount: CountsData?.GroupJoinedCount, EventCreateCounts: CountsData?.EventCreateCounts, requestusersCounts: CountsData?.requestusersCounts } }
        // console.log("Response", Response);

        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "user_profile"), data: Response }))
            // responseReturn(res, 200, true, "User profile", Response)
        }
        else {
            // responseReturn(res, 200, false, "Something error")

            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/* no need language translation */
export const GetAllCmsLists = async (req, res) => {
    console.log("requestlistss", req.query);

    try {
        let resp = await Cms.find({})
        console.log("response", resp);
        if (resp) {
            // responseReturn(res, 200, true, "All Cms lists", resp)
            return res.status(200).json(EncryptData({ status: true, message: "All Cms lists", data: resp }))
        }
        else {
            // responseReturn(res, 200, false, "Something error")
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }

    }
    catch (e) {
        console.log("getcmslist _err", e);
        catchErrorResponse(res, e)

    }

}

// ------------------------------available is remove the command and use api-----------------------------------
/*
 * METHOD : GET
 * BODY: (userId, instanceId)
 * URL : /v1/user/UserMediaDatas
 */
export const UserMediaDatas = async (req, res) => {
    console.log("req,,eerwr", req.query);
    try {
        const { query: { userId, instanceId }, user } = req
        let resp = await User.findOne({ _id: new ObjectId(userId) })
        if (resp) {
            let Usermedias = await MessageModel.find({ instanceId: instanceId, "messageDelete.id": { $nin: [new ObjectId(userId)] } }).sort({ createdAt: -1 })
            console.log("Usermedias", Usermedias);
            let allFiles = Usermedias?.reduce((acc, message) => {
                // console.log("AAAcccc",acc,message);
                if (Array.isArray(message.file)) {
                    acc.push(...message.file);
                }
                return acc;
            }, []);

            console.log("allFiles", allFiles);
            if (Usermedias) {
                // responseReturn(res, 200, true, "All Image files", allFiles)
                return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "img_list"), data: allFiles }))
            }
            else {
                // responseReturn(res, 200, false, "No medias")
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_media") }))
            }
        }
        else {
            // responseReturn(res, 200, false, "Something error")
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}
// ------------------------------------------------------------------



// export const Genderlists = async (req, res) => {
//     try {

//         let resp = await Gender.find({})
//         if (resp) {
//             res.status(200).json({ status: true, message: "Gender lists", data: resp })
//         }
//         else {
//             res.status(200).json({ status: false, message: "something error" })
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }
// // const picsartfordevelopers = require('@api/picsartfordevelopers');
// export const Avatar = async(req,res)=>{
//     try {
//         const response = await picsartfordevelopers.postAvatarsModels({
//           image_list: [req.files.image], // Replace with actual image URLs
//           type: 'man' // Replace with the desired type
//         });
//         console.log('Response data:', response.data);
//       } catch (error) {
//         console.error('Error:', error);
//       }
// }


/*
 * METHOD : POST
 * BODY: ( userId, subcategoryId)
 * URL : /v1/user/UserHobbiesDeleteData
 */
/* export const UserHobbiesDeleteData = async (req, res) => {
    console.log("ffffffffffff", req.body);
    try {
        console.log("userrers", req.body.userId, req.body.subcategoryId);
        try {
            const { userId, subcategoryId } = req.body;
            const AdminData = await Admin.findOne({});
            const HobbyLimit = Number(AdminData?.hobby_limit);
            console.log("HobbyLimit", HobbyLimit);

            let MappedData = await subcategoryId.map(id => new ObjectId(id))
            console.log("MappedData", MappedData);

            const subcategories = await Subcategory.find({ _id: { $in: MappedData } });
            console.log("subcategories", subcategories);
            if (subcategories.length !== subcategoryId.length) {
                return res.status(200).json({ status: false, message: "One or more hobbies are not in the database" });
            }

            const user = await User.findOne({ _id: new ObjectId(userId) }).populate("hobbies").populate("plan");
            if (!user) {
                return res.status(200).json({ status: false, message: "User not found" });
            }

            const activePlan = user.plan.find(plan => plan.isActive == "started");
            let addedHobbies = [];
            let AddNewHobby = [];
            let responses;
            for (const subcategory of subcategories) {
                console.log("subcategory_sdcf", subcategory);
                const hobbyExists = user.hobbies.some(hobby => hobby._id.equals(subcategory._id));
                console.log("hobbyExists",hobbyExists);
                if(hobbyExists){
     
                    if (activePlan || (subcategory.plan == "free" || subcategory.paid_level == 0 && user.hobbies.filter(hobby => hobby.plan === "free").length <= HobbyLimit)) {
                        AddNewHobby.push(subcategory._id)
                    } else if (subcategory.plan !== "free" || subcategory.paid_level !== 0) {
                        return res.status(200).json({ status: false, message: "Please subscribe to choose premium hobbies" });
                    } else {
                        return res.status(200).json({ status: false, message: `Free hobby limit of ${HobbyLimit} reached, and add more hobbies is please subscribe plan to choose hobbies` });
                    }
                }
                else{
                    if (activePlan || (subcategory.plan == "free" || subcategory.paid_level == 0 && user.hobbies.filter(hobby => hobby.plan === "free").length <= HobbyLimit)) {
                        responses = await addHobbyToUserDeleteHobby(user, subcategory, res);
                        console.log("reponsesreponses", responses);
                        addedHobbies.push(subcategory.subcategory);
                        console.log("addedHobbies", addedHobbies);
                    } else if (subcategory.plan !== "free" || subcategory.paid_level !== 0) {
                        return res.status(200).json({ status: false, message: "Please subscribe to choose premium hobbies" });
                    } else {
                        return res.status(200).json({ status: false, message: `Free hobby limit of ${HobbyLimit} reached, and add more hobbies is please subscribe plan to choose hobbies` });
                    }
                }


              
            }
            console.log("AddNewHobby",AddNewHobby);

            return res.status(200).json({ status: true, message: "Hobbies updated successfully", data: responses, "HobbiesLimit": HobbyLimit });
        } catch (error) {
            console.error("Error choosing hobby:", error);
            return res.status(200).json({ status: false, message: "Internal server error", error });
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
} */

/* const addHobbyToUserDeleteHobby = async (user, subcategory, res) => {
    console.log("subcategory_data", subcategory);
    // let FindHobby = User.findOneAndUpdate({ _id: user._id, "hobbies": { $nin: [subcategory._id] } }, { "hobbies": { $push: [subcategory._id] } }, { new: true })
    // console.log("FindHobby", FindHobby);
    const newHobby = new Hobby({
        userId: user._id,
        subcategoryId: subcategory._id,
        name: subcategory.subcategory,
        planType: subcategory.plan,
        description: subcategory.description,
        eligible_plan: subcategory.planId,
        paid_level: subcategory.paid_level
    });

    const savedHobby = await newHobby.save();
    user.hobbies.push(subcategory._id);
    await user.save();
    return savedHobby;
} */


// export const generateimage = async (req, res) => {
//     console.log("generateimage", req.query);
//     // try {
//     //     // Extract data from request body
//     //     const { url, width } = req.body;

//     //     // Validate input
//     //     if (  !url || !width) {
//     //       return res.status(400).json({ error: 'Missing required fields in the request body.' });
//     //     }

//     //     // Prepare headers and data
//     //     const headers = {
//     //       'Content-Type': 'application/json',
//     //       'X-API-Key': API_KEY,
//     //     };

//     //     const requestData = {
//     //       enhancements: ['denoise', 'deblur', 'light'],
//     //       url: url,
//     //       width: width,
//     //     };

//     //     // Make POST request using Axios
//     //     const response = await axios.post(apiUrl, requestData, { headers });

//     //     // Return response data to the client
//     //     return res.status(200).json({
//     //       status: true,
//     //       message: 'Image processed successfully',
//     //       data: response.data,
//     //     });
//     //   } catch (error) {
//     //     // Handle errors
//     //     console.error('Error:', error.message);
//     //     return res.status(500).json({
//     //       status: false,
//     //       message: 'Error processing image',
//     //       error: error.message,
//     //     });
//     //   }

// };

// import axios from "axios"
// const FormData = require('form-data');

// // const apiUrl = 'https://deep-image.ai/rest_api/process_result';
// // const baseUrl = 'https://a1.art';
// const apiUrl = 'https://a1.art/open-api/v1/a1/images/upload';
// const API_KEY = 'bf8f1c326e3a4720a3bd6ce3e107f86b'; // Replace with your actual API key
// export const generateimage = async (req, res) => {
//     console.log("generateimage", req.files);
//     try {
//         // Ensure file is present
//         if (!req.files || !req.files.file) {
//             return res.status(400).json({ error: 'No file uploaded.' });
//         }

//         // Extract the file from the request
//         const uploadedFile = req.files.file;

//         // Create FormData
//         const data = new FormData();
//         data.append('file', uploadedFile.data, uploadedFile.name);

//         console.log("ddfdfdfddfdf",data, "uploadedFile0",uploadedFile);
//         const filePath = `public/avatar/`;
//         // Configure request to external API
//         const config = {
//             method: 'post',
//             url: apiUrl,
//             headers: {
//                 'apiKey': API_KEY,
//                 'Accept': '*/*',
//                 'Host': 'a1.art',
//                 'Connection': 'keep-alive',
//                 ...data.getHeaders()
//             },
//             data: data
//             // ImageFullurl:`${baseUrl}/${data.data.path}${data.data.imageUrl}`
//         };

//         // Make POST request using Axios
//         const response = await axios(config);
//         console.log("responsers",response.data);
//         const multiimg = Date.now()  + response.data.data.imageUrl;
//         var profile =  await uploadedFile.mv(filePath + multiimg);
//         // Return response from external API
//         res.status(200).json({
//             status: true,
//             message: 'Image uploaded successfully',
//             data: response.data
//         });
//     } catch (error) {
//         // Handle errors
//         console.error('Error:', error.message);
//         res.status(500).json({
//             status: false,
//             message: 'Error uploading image',
//             error: error.message
//         });
//     }
// };

/*
 * METHOD : POST
 * BODY: ( userId, page, limit)
 * URL : /v1/user/GetLikeFollowEventNotification
 */
export const GetLikeFollowEventNotification = async (req, res) => {
    console.log("Request received for GetLikeFollow:", req.body);

    try {
        const { body: { userId, page, limit }, user } = req;
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        const io = req?.app?.get("io")

        const findUser = await User.findOne({ _id: new ObjectId(userId) })
        console.log("findUser", findUser.userblocked);
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
            // responseReturn(res, 200, false, "User not found")

        }

        const resp = await Notification.updateMany({ to: new ObjectId(userId), seen: false }, { $set: { seen: true } }, { new: true })

        console.log("Likes and follows fetched:", resp);

        if (!resp) {
            // responseReturn(res, 200, true, "No likes or follows found for the user", resp)

            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "no_likes_follows"), data: resp }));
        }

        let response = await UserNotifications({ DBName: Notification, userId: userId, findUser: findUser.userblocked, page: page, limit: limit, skip: skip })
        console.log("responsemmmm", JSON.stringify(response, null, 2));

        // let findnotificationlist = await Notification.find({ to: userId, display: true }).populate("userId").populate("eventId").lean()
        // Return the combined data
        // responseReturn(res, 200, true, "All lists retrieved successfully", response?.data)
        io?.sockets?.to(userId?.toString()).emit("notifications", { status: true, message: "Notification lists", data: response?.data })
        return res.status(200).json(EncryptData({
            status: true,
            message: t((user && user.language) ? user.language : "english", "list_success"),
            data: response?.data
        }));

    } catch (error) {
        console.error("Error in GetLikeFollow:", error);
        return catchErrorResponse(res, error);
    }
};


/*
 * METHOD : POST
 * BODY: (from, to)
 * URL : /v1/user/UserCreateProfileDetails
 */
export const UserCreateProfileDetails = async (req, res) => {
    console.log("from_detailsss", req.body)
    try {
        const { body: { from, to }, user } = req

        const [findUser, findToUser] = await Promise.all([
            User.findOne({ _id: new ObjectId(from) }).select({ _id: 1, username: 1, location: 1 }),
            User.findOne({ _id: new ObjectId(to) }).select({ _id: 1, username: 1, location: 1 })
        ])

        const long1 = findUser?.location?.coordinates[0] || 0;
        const long2 = findToUser?.location?.coordinates[0] || 0;
        const lat1 = findUser?.location?.coordinates[1] || 0;
        const lat2 = findToUser?.location?.coordinates[1] || 0;

        const findKilometer = getDistanceFromLatLonInKm(lat1, long1, lat2, long2)
        console.log(`Distance: ${findKilometer?.toFixed(2)} km`);
        let distanceWithKm = `${(findKilometer <= 0 || isNaN(findKilometer)) ? "0" : Math.round(findKilometer * 100) / 100}`
        distanceWithKm = Math.round(distanceWithKm)
        const response = await SingleUserDetails({ from: from, to: to, myLocation: findUser?.location, DbName: User })
        console.log("response_Userlist", JSON.stringify(response, null, 2));

        const profileRows = response?.data || [];
        if (
            profileRows.length > 0 &&
            !(await canViewerSeePrivateProfileContent(from, to))
        ) {
            profileRows[0] = {
                ...profileRows[0],
                events: [],
                joinedEvents: [],
                createGroup: [],
                joinedGroup: [],
            };
        }

        const [FollowBackinUserDetails, FollowBackinUserDetailsTo] = await Promise.all([
            follownotify.findOne({ from: new ObjectId(to), to: new ObjectId(from) }).sort({ createdAt: -1 }),
            follownotify.findOne({ from: new ObjectId(from), to: new ObjectId(to) }).sort({ createdAt: -1 })
        ])
        const resposeFollowBack = {
            fromToDetails: FollowBackinUserDetails,
            toFromDetails: FollowBackinUserDetailsTo,
        };
        return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "your_details"), data: profileRows, resposeFollowBack, distanceInKm: distanceWithKm }))
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (type, report_from, report_to, to, eventId, groupId, message)
 * URL : /v1/user/ReportsData
 */
export const ReportsData = async (req, res) => {
    console.log("reqReportedData", req.body);

    try {
        const { body: { type, report_from, report_to, to, eventId, groupId, message }, user } = req
        // let payload;
        const io = req.app.get("io");
        let payload = {
            type: type,
            report_from: new ObjectId(report_from),
            report_to: new ObjectId(report_to),
            to: to ? new ObjectId(to) : "000000000000000000000000",
            eventId: eventId ? new ObjectId(eventId) : null,
            groupId: groupId ? new ObjectId(groupId) : null,
            message: message
        };
        if (type == "group" || type == "singlechat") {
            await AddRemoveCreateGroup({ type: type, userId: report_from, instanceId: report_to, messageData: "left", io: io })
            await ChatModel.findOneAndUpdate(
                { _id: new ObjectId(report_to), members: { $in: new ObjectId(report_from) } },
                { $pull: { members: new ObjectId(report_from) } },
                { new: true }
            );
        }
        let data = new Report(payload)
        let resp = await data.save()
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "report_sent"), data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "report_failed") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }

}


// export const ReportsData = async (req, res) => {
//     console.log("reqReportedData", req.body);

//     try {
//         const { body: { type, report_from, report_to, to, eventId, groupId, message }, user } = req
//         let payload;

//         const io = req.app.get("io");
//         if (type == "group" || type == "singlechat") {
//             await AddRemoveCreateGroup({ type: type, userId: report_from, instanceId: report_to, messageData: "left", io: io })
//             let upData = await ChatModel.findOneAndUpdate(
//                 { _id: new ObjectId(report_to), members: { $in: new ObjectId(report_from) } },
//                 { $pull: { members: new ObjectId(report_from) } },
//                 { new: true }
//             );

//             payload = {
//                 type: type,
//                 report_from: new ObjectId(report_from),
//                 report_to: new ObjectId(report_to),
//                 to: to ? new ObjectId(to) : "000000000000000000000000",
//                 eventId: eventId ? new ObjectId(eventId) : null,
//                 groupId: groupId ? new ObjectId(groupId) : null,
//                 message: message
//             };

//         }
//         else {
//             payload = {
//                 type: type,
//                 report_from: new ObjectId(report_from),
//                 report_to: new ObjectId(report_to),
//                 to: to ? new ObjectId(to) : "000000000000000000000000",
//                 eventId: eventId ? new ObjectId(eventId) : null,
//                 groupId: groupId ? new ObjectId(groupId) : null,
//                 message: message
//             };
//         }

//         let data = new Report(payload)
//         let resp = await data.save()
//         if (resp) {
//             return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "report_sent"), data: resp }))
//         }
//         else {
//             return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "report_failed") }))
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }

// }


// export const getReportData = async (req, res) => {
//     console.log("repngetReportData");
//     try {
//         let query = [
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "report_from",
//                     foreignField: "_id",
//                     as: "reporter"
//                 }
//             },
//             {
//                 $unwind:{
//                     path:"$reporter",preserveNullAndEmptyArrays:true
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
//                 $unwind:{
//                     path:"$UserDetails",preserveNullAndEmptyArrays:true
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
//                 $unwind:{
//                     path:"$eventDetails",preserveNullAndEmptyArrays:true
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
//                 $unwind:{
//                     path:"$instanceDetails",preserveNullAndEmptyArrays:true
//                 }
//             }

//         ]
//         let getreport = await Report.aggregate(query)
//         console.log("getreport", getreport);
//         if (getreport) {
//             return res.status(200).json({ status: true, message: "Report Details", data: getreport })
//         }
//         else {
//             return res.status(200).json({ status: false, message: "Report not Details" })
//         }
//     } catch (e) {
//         catchErrorResponse(res, e)
//     }
// }

/*
 * METHOD : GET
 * BODY: (username, type, userId)
 * URL : /v1/user/ValidUsername
 */
export const ValidUsername = async (req, res) => {
    console.log("req.queryreq.query", req.query);

    try {
        const { query: { username, type, userId }, user } = req;
        const userCheck = await userFindOne({ findData: { _id: new ObjectId(userId) } });
        if (!userCheck?.status) {
            return res.status(200).json(EncryptData(getResponse(false, "error", t((user && user.language) ? user.language : "english", "user_nf"))));
        }
        if (type == "add") {
            const usernameCheck = await userFindOne({ findData: { username: username } });
            console.log("usernameCheck", usernameCheck);

            if (usernameCheck?.data) {
                return res.status(200).json(EncryptData(getResponse(false, "error", t((user && user.language) ? user.language : "english", "username_taken"), usernameCheck.data)));
            }
            else {
                return res.status(200).json(EncryptData(getResponse(true, "success", t((user && user.language) ? user.language : "english", "username_done"), usernameCheck.data)));

            }
        } else if (type == "edit") {
            const usernameCheck = await userFindOne({ findData: { _id: { $ne: new ObjectId(userId) }, username: username } });
            if (usernameCheck?.data) {
                return res.status(200).json(EncryptData(getResponse(false, "error", t((user && user.language) ? user.language : "english", "username_taken"), usernameCheck.data)));
            } else {
                return res.status(200).json(EncryptData(getResponse(true, "success", t((user && user.language) ? user.language : "english", "username_done"), usernameCheck.data)));

            }
        } else {
            return res.status(200).json(EncryptData(getResponse(false, "error", t((user && user.language) ? user.language : "english", "Invalid_type_parameter"))));
        }
    } catch (error) {
        catchErrorResponse(res, error);
    }
};

/*
 * METHOD : POST
 * BODY: (longitude, latitude, distance, userId, page, limit, type)
 * URL : /v1/user/UserEventNearbyLocation
 */
export const UserEventNearbyLocation = async (req, res) => {
    try {
        const { body: { longitude, latitude, distance, userId, page, limit, type }, user } = req
        let distanceKilometer = parseFloat(distance) * 1000
        distanceKilometer = Math.round(distanceKilometer);
        const parsedLongitude = parseFloat(longitude);
        const parsedLatitude = parseFloat(latitude);
        let findUser = await User.findOne({ _id: new ObjectId(userId) })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        if (isNaN(longitude) || isNaN(latitude)) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_coords") }));
        }
        if (type == "user") {
            await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { locationDistance: distance }, { new: true })
            const UserAndEventNearByLocation = await UserNearByLocation({ DBName: User, parsedLongitude: parsedLongitude, parsedLatitude: parsedLatitude, distanceKilometer: distanceKilometer, userId: userId, page: page, limit: limit })
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "near_users"), data: UserAndEventNearByLocation?.data }))
        }
        else if (type == "event") {
            const UserAndEventNearByLocation = await EventNearByLocation({ DBName: Event, parsedLongitude: parsedLongitude, parsedLatitude: parsedLatitude, distanceKilometer: distanceKilometer, userId: userId, page: page, limit: limit })
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "near_events"), data: UserAndEventNearByLocation?.data }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        console.error("Error finding events near location:", error);
        catchErrorResponse(res, error)
    }
};

//email transfer

/*
 * METHOD : POST
 * BODY: ( userId, email)
 * URL : /v1/user/UserEmailTransfrer
 */
export const UserEmailTransfrer = async (req, res) => {
    console.log("UserEmailTransfrer", req.body)
    try {
        var otp = generateOTP();
        console.log("otpDatazs", otp)
        const { body: { userId, email }, user } = req
        let findUser = await User.findOne({ _id: new ObjectId(userId) })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }

        res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "otp_verify_short"), data: findUser }))
        let resendata = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { OTP: EncryptData(otp) } }, { new: true })
        console.log("Alteremail", resendata);
        let SendMail = await Node_Mailer({ Type: "transferemail", EmailId: findUser?.email, Subject: 'Email transfer verification OTP', OTP: otp, username: findUser?.username })
        console.log("SendMail_alteremail", SendMail);

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: ( userId, email, alternativeEmail)
 * URL : /v1/user/ChangeEmailTransfer
 */
export const ChangeEmailTransfer = async (req, res) => {
    console.log("ChangeEmailTransfer", req.body)
    try {
        var otp = generateOTP();
        console.log("ccocoocococ", otp)
        const { body: { userId, email, alternativeEmail }, user } = req
        let [emailExist, findUser] = await Promise.all([
            User.findOne({ $or: [{ email: alternativeEmail }, { alternativeEmail: alternativeEmail }] }),
            User.findOne({ _id: new ObjectId(userId), email: email })
        ])
        console.log("emailExist_alter_email", emailExist);
        if (emailExist) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "email_exist_short") }))
        }
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        let updateNewEmail = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { alternativeEmail: cleanSpace(alternativeEmail), transferEmailCreated: new Date(), OTP: EncryptData(otp) } }, { new: true })
        console.log("updateNewEmail", updateNewEmail);

        res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "otp_verify_msg"), data: findUser }))

        let SendMail = await Node_Mailer({ Type: "transferemailverify", EmailId: alternativeEmail, Subject: 'Email transfer verification OTP', OTP: otp, username: updateNewEmail?.username })
        console.log("SendMail_alteremail", SendMail);
        // let resendata = await User.findOneAndUpdate({ _id: userId, email: email, alternativeEmail: alternativeEmail }, { OTP: EncryptData(otp) }, { new: true })
        // console.log("Alteremail", resendata);
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


/*
 * METHOD : POST
 * BODY: ( userId, email, alternativeEmail)
 * URL : /v1/user/TransferEmailCancel
 */
export const TransferEmailCancel = async (req, res) => {
    console.log("erereqxdfsdfdf", req.body)
    try {
        const { body: { userId, email, transferAction }, user } = req;
        const io = req?.app?.get("io")

        let findUser = await User.findOne({ _id: new ObjectId(userId), email: email })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        if (transferAction == "cancel") {
            let CancelEmail = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { alternativeEmail: "", transferAction: "cancel" } }, { new: true })
            console.log("CancelEmail", CancelEmail);
            if (CancelEmail) {
                res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "email_transfer_cancel"), data: CancelEmail }))
                // const activitysave = {
                //     DBName: Notification,
                //     Data: {
                //         userId: findUser?._id,
                //         action: "Emailtransfercancel",
                //         status: findUser?.privacy_status,
                //         from: findUser?._id,
                //         to: findUser?._id,
                //         message: `Your email transfer is successfully cancelled`,
                //         type: "Emailtransfercancel"
                //     }
                // }
                // await Save(activitysave)
                await saveNotification({
                    userId: findUser?._id,
                    action: "Emailtransfercancel",
                    status: findUser?.privacy_status,
                    from: findUser?._id,
                    to: findUser?._id,
                    message: `Your email transfer is successfully cancelled`,
                    type: "Emailtransfercancel",
                    io
                })
                let SendMail = await Node_Mailer({ Type: "transferemailcancel", EmailId: findUser?.alternativeEmail, Subject: 'Email transfer cancel', username: findUser?.username })
                console.log("SendMail_alteremail", SendMail);
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
            }
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "transfer_required") }))
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}


/*
 * METHOD : POST
 * BODY: (email,alternativeEmail, OTP)
 * URL : /v1/user/transferEmailverify
 */
export const transferEmailverify = async (req, res) => {
    try {
        await TransferEmailVerify(req, res, User)
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: ( userId, homeType, longitude, latitude)
 * URL : /v1/user/ResidentialAddress
 */
export const ResidentialAddress = async (req, res) => {
    console.log("ResidentialAddress", req.body)
    try {
        const { body: { userId, homeType, longitude, latitude }, user } = req

        let findUser = await User.findOne({ _id: new ObjectId(userId) })

        // if (findUser?.plan?.length == 0 && findSubscriptionUser?.planType == "free") {
        //     return res.status(200).json(EncryptData({ status: false, message: "Please subscribe to change address." }));
        // }

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        let payload;

        if (homeType == "change") {

            payload = {
                homeType: homeType,
                homeAddress: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: [longitude, latitude]
                }
            }
        }
        else {
            payload = {
                homeType: homeType,
            }
        }

        let UpdateResidential = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, payload, { new: true })
        console.log("UpdateResidential", UpdateResidential)

        if (UpdateResidential) {
            return res.status(200).json(EncryptData({ status: true, message: homeType == "change" ? t((user && user.language) ? user.language : "english", "addr_changed") : t((user && user.language) ? user.language : "english", "cancelled"), data: UpdateResidential }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * URL : /v1/user/GetAdminDetails
 */
/* no need language translation */
export const GetAdminDetails = async (req, res) => {
    console.log("rerererererer")
    try {
        let resp = await Admin.find({}, { "email": 1, "eventImage_limit": 1, "hobby_limit": 1 })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Admin details", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something details" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId,page,limit,searchMygroup)
 * URL : /v1/user/GetMyCreateGroup
 */
export const GetMyCreateGroup = async (req, res) => {
    console.log("createdddd", req.body)
    try {
        const { body: { userId, page, limit, searchMygroup }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        console.log("skiplimits", skip, "page", page, "limit", limit)
        const searchText = typeof searchMygroup === "string" ? searchMygroup.trim() : "";
        const regex = searchText.length > 0 ? new RegExp(searchText, "i") : null;
        let getgroupcreate;
        if (regex) {
            getgroupcreate = await ChatModel.find({ chatName: regex, "iseventchat": false, isGroupchat: true, "members": { $in: [new ObjectId(userId)] }, groupCreater: new ObjectId(userId) }).populate([{ path: "grouphobbies" }, { path: "members", select: "_id username profilePic randomIndex" }]).skip(skip).limit(limit);
        }
        else {
            getgroupcreate = await ChatModel.find({ isGroupchat: true, "iseventchat": false, "members": { $in: [new ObjectId(userId)] }, groupCreater: new ObjectId(userId) }).populate([{ path: "grouphobbies" }, { path: "members", select: "_id username profilePic randomIndex" }]).skip(skip).limit(limit);
        }
        console.log("🚀 ~ GetMyCreateGroup ~ getgroupcreate:", getgroupcreate)

        if (getgroupcreate) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "group_created"), data: getgroupcreate || [], count: getgroupcreate?.length }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId,page,limit,searchJoingroup)
 * URL : /v1/user/GetJoinedGroupAndCreateGroup
 */
export const GetJoinedGroupAndCreateGroup = async (req, res) => {
    console.log("rquestsss", req.body);
    try {

        const { body: { userId, page, limit, searchJoingroup }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        console.log("skiplimits", skip, "page", page, "limit", limit)
        const searchText = typeof searchJoingroup === "string" ? searchJoingroup.trim() : "";
        const regex = searchText.length > 0 ? new RegExp(searchText, "i") : null;
        let resp;
        if (regex) {
            resp = await ChatModel.find({
                chatName: regex,
                "isblocked": "unblocked",
                isGroupchat: true,
                groupCreater: { $ne: new ObjectId(userId) },
                members: { $in: [new ObjectId(userId)] },
                "iseventchat": false
            }).populate("grouphobbies").skip(skip).limit(limit);

        }
        else {
            resp = await ChatModel.find({
                "isblocked": "unblocked",
                isGroupchat: true,
                groupCreater: { $ne: new ObjectId(userId) },
                members: { $in: [new ObjectId(userId)] },
                "iseventchat": false
            }).populate("grouphobbies").skip(skip).limit(limit);
        }

        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "joined_groups"), data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId, toUserId, type)
 * URL : /v1/user/UserBlockandUnblock
 */
export const UserBlockandUnblock = async (req, res) => {
    console.log("reqbody", req.body);
    try {
        const { body: { userId, toUserId, type }, user } = req
        const io = req?.app?.get("io");
        // toUserId = Array.isArray(toUserId) ? toUserId : [toUserId]
        const findUser = await User.findOne({ _id: new ObjectId(userId) })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        let BlockUnblockUser;
        if (type == "block") {
            BlockUnblockUser = await User.findOneAndUpdate({ _id: new ObjectId(toUserId) }, { $push: { "userblocked": new ObjectId(userId) } }, { new: true })
        }
        else if (type == "unblock") {
            BlockUnblockUser = await User.findOneAndUpdate({ _id: new ObjectId(toUserId), "userblocked": { $in: new ObjectId(userId) } }, { $pull: { "userblocked": new ObjectId(userId) } }, { new: true })
            io?.sockets?.to(toUserId?.toString()).emit("unBlock", { msg: `unbloked ${toUserId}` });
        }
        if (BlockUnblockUser) {
            return res.status(200).json(EncryptData({ status: true, message: type == "block" ? ((user && user.language) ? user.language : "english", "blocked") : t((user && user.language) ? user.language : "english", "unblocked"), data: BlockUnblockUser }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: ( userId, range, newjoinerstatus)
 * URL : /v1/user/newUserJoiner
 */
export const NewUserJoiner = async (req, res) => {
    console.log("newNewUserJoineref", req.body);
    try {
        let { body: { userId, range, newjoinerstatus }, user } = req
        newjoinerstatus = typeof newjoinerstatus == "string" ? ParsingFunc(newjoinerstatus) : newjoinerstatus;
        const findUser = await User.findOne({ _id: new ObjectId(userId) })
        if (!findUser) {
            return res.status(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        let UserjoinNotificationStatus = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { range: range, newjoinerStatus: newjoinerstatus } }, { new: true })
        console.log("UserjoinNotificationStatus", UserjoinNotificationStatus);
        const message = newjoinerstatus ? t((user && user.language) ? user.language : "english", "joinee_enabled") : t((user && user.language) ? user.language : "english", "joinee_disabled")
        if (UserjoinNotificationStatus) {

            return res.status(200).json(EncryptData({ status: true, message: message, data: UserjoinNotificationStatus }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), data: UserjoinNotificationStatus }))

        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: ( userId, page, limit, searchRequsers)
 * URL : /v1/user/RequestedUserslists
 */
export const RequestedUserslists = async (req, res) => {
    console.log("RequestedUserslists", req.body);
    try {
        const { body: { userId, page, limit, searchRequsers }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        const regex = new RegExp(`^${searchRequsers}`, 'i');
        const findUser = await User.findOne({ _id: new ObjectId(userId) })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        let MyRequestUsers;
        if (searchRequsers?.toString()) {
            MyRequestUsers = await follownotify.find({ to: new ObjectId(userId), status: "pending" })
                .skip(parseInt(skip))
                .limit(parseInt(limit))
                .populate({
                    path: { path: "from", select: "_id username profile randomIndex userblocked" },
                    match: { username: regex }
                })
            MyRequestUsers = MyRequestUsers.filter(user => user?.from !== null);

            console.log("MyRequestUsers", MyRequestUsers);

        }
        else {
            MyRequestUsers = await follownotify.find({ to: new ObjectId(userId), status: "pending" })
                .skip(parseInt(skip))
                .limit(parseInt(limit))
                .populate({
                    path: { path: "from", select: "_id username profile randomIndex userblocked" }
                })

        }
        if (MyRequestUsers) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "requested_users"), data: MyRequestUsers }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), data: MyRequestUsers }))

        }
    } catch (e) {
        catchErrorResponse(res, e)
    }
}

export const ForgetPassword = async (req, res) => {
    console.log("CreateAndForgetPassword", req.body);
    try {

        await passwordForgetfunc(req, res, User)

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const Userchangepassword = async (req, res) => {
    try {
        await Userchangepasswordfunc(req, res, User)
    } catch (error) {
        catchErrorResponse(res, error)

    }

}

// export const ForgetPassword = async (req, res) => {
//     try {
//         await ForgetPasswordfunc(req, res, User)
//     } catch (error) {
//         catchErrorResponse(res, error)

//     }

// }

/*
 * METHOD : POST
 * BODY: ( email)
 * URL : /v1/user/SendOtp
 */
export const SendOtp = async (req, res) => {
    console.log("dfdgfg", req.body);
    try {
        var otp = generateOTP();
        const { body: { email } } = req
        let findUser = await User.findOne({ email: email })
        if (isEmpty(findUser)) {
            return res.status(200).json(EncryptData({ status: false, message: t((findUser && findUser.language) ? findUser.language : "english", "email_nf") }))
        }
        const OTP = await EncryptData(otp)
        let findEmailUpdateOtp = await User.findOneAndUpdate({ email: email }, { $set: { OTP: OTP } }, { new: true })
        if (findEmailUpdateOtp) {
            res.status(200).json(EncryptData({ status: true, message: t((findUser && findUser.language) ? findUser.language : "english", "otp_success_email") }))
            await Node_Mailer({ Type: "verifyotp", EmailId: findEmailUpdateOtp?.email, Content: "", Subject: 'OTP Verification for Password Change.', OTP: otp, username: findEmailUpdateOtp?.username })

        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: ( email, OTP )
 * URL : /v1/user/VerifyOtpfunc
 */
export const VerifyOtpfunc = async (req, res) => {
    // console.log("gbbbbbb", req.body);
    try {
        const { body: { email, OTP }, user } = req
        let findEmailUpdateOtp = await User.findOne({ email: email })

        const otpUpdateTime = new Date(findEmailUpdateOtp.updatedAt);
        let stratdate = new Date(otpUpdateTime.getTime() + 5 * 60000)

        if (findEmailUpdateOtp && DecryptData(findEmailUpdateOtp?.OTP) == OTP) {
            if (new Date().getDate() == new Date(findEmailUpdateOtp?.updatedAt).getDate() && new Date().getHours() == new Date(findEmailUpdateOtp?.updatedAt).getHours() && stratdate > new Date().getMinutes()) {
                return res.status(200).json(EncryptData({ status: true, message: t((findEmailUpdateOtp && findEmailUpdateOtp.language) ? findEmailUpdateOtp.language : "english", "otp_verified") }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: t((findEmailUpdateOtp && findEmailUpdateOtp.language) ? findEmailUpdateOtp.language : "english", "otp_exp") }));

            }
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((findEmailUpdateOtp && findEmailUpdateOtp.language) ? findEmailUpdateOtp.language : "english", "otp_wrong") }))
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: ( userId, type, name, hobbyname, page, limit )
 * URL : /v1/user/CommonSearchApi
 */
export const CommonSearchApi = async (req, res) => {
    console.log("Request_Body_CommonSearchApi", req.body);
    try {
        let { body: { userId, type, name, hobbyname, page, limit, selectedHobbyId }, user } = req;
        const io = req?.app?.get("io")
        page = (page == "all") ? "all" : parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page == "all") ? 0 : (page - 1) * limit;
        selectedHobbyId = Array.isArray(selectedHobbyId) ? selectedHobbyId : ParsingFunc(selectedHobbyId);
        console.log("skiplimits", skip, "page", page, "limit", limit)
        selectedHobbyId = selectedHobbyId?.map((el) => new ObjectId(el))

        let findUser = await User.findOne({ _id: new ObjectId(userId) }, { _id: 1, username: 1, profile: 1, randomIndex: 1, language: 1, userblocked: 1, location: 1 });
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
        var arr = findUser?.userblocked ? [...findUser?.userblocked, new ObjectId(userId)] : [new ObjectId(userId)];
        console.log("arrarrarr", findUser);

        if (isEmpty(type)) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "Type_is_required") }))
        }

        if (type == "users" || type == "hobbies") {
            let NotifyCount = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: userId, io: io })

            // let regex = new RegExp(`^${name}`, "i");
            const regex = name ? new RegExp(`^${name}`, "i") : null;
            // console.log("rt_regex", regex.length)

            let matchStage = {
                _id: { $nin: arr },
                delete: false,
                blockStatus: "unblocked",
            };

            if (type == "hobbies") {
                matchStage.ishideprofile = false;
                matchStage.hobbies = { $in: selectedHobbyId }
            }

            if (type == "users" && regex) {
                matchStage.ishideprofile = false;
                matchStage.username = { $regex: regex };
            }
            const longitude = findUser?.location?.coordinates[0] || 0;
            const latitude = findUser?.location?.coordinates[1] || 0;

            // const UserlistSearchFunction = await UserListAndSearchfunc({ DBName: User, userId: userId, page: page, limit: limit, skip: skip, matchStage: matchStage, hobbyname: hobbyname, username: name })
            // console.log("UserlistSearchFunction", UserlistSearchFunction);
            const UserlistSearchFunction = await CommonSearchUserListAndfunc({ DBName: User, userId: userId, page: page, limit: limit, matchStage: matchStage, hobbyname, longitude: longitude, latitude: latitude })
            console.log("UserlistSearchFunction", UserlistSearchFunction.data);

            if (UserlistSearchFunction) {
                let msg = (page == Number(-1) || page == "all") ? t((user && user.language) ? user.language : "english", "All_records") : t((user && user.language) ? user.language : "english", "You_search_records")
                // io?.sockets?.to(userId?.toString()).emit("Singlechat_counts", { SingleChatCounts: NotifyCount?.SingleChatCounts , userId, api:"UserslistSearchfunc"});
                return res.status(200).json(EncryptData({ status: true, message: msg, data: UserlistSearchFunction?.data, NotificationCount: NotifyCount?.NotificationCount, SingleChatCounts: NotifyCount?.SingleChatCounts }))
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
            }
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
};
/* export const CommonSearchApi = async (req, res) => {
    console.log("Request_Body_CommonSearchApi", req.body);
    try {
        const { userId, type, name, hobbyname, page, limit } = req.body;
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
        console.log("skiplimits", skip, "page", page, "limit", limit)
        let findUser = await User.findOne({ _id: new ObjectId(userId) });

        var arr = findUser?.userblocked ? [...findUser?.userblocked, new ObjectId(userId)] : [new ObjectId(userId)];
        console.log("arrarrarr", arr);

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: "User not found" }));
        }
        if (isEmpty(type)) {
            return res.status(200).json(EncryptData({ status: false, message: "Type is required." }))
        }
        if (type == "hobbies") {
            const regex = hobbyname ? new RegExp(`^${hobbyname}`, "i") : null;
            console.log("Regex_hobbies", regex);

            let adminHobbiesRecords = await HobbiesAdmin.find(regex ? { hobbyname: regex } : {});
            if (adminHobbiesRecords?.length == 0) {
                return res.status(200).json(EncryptData({ status: false, message: "No search found" }));
            }

            let hobbyIds = adminHobbiesRecords.map((hobby) => hobby?._id);
            console.log("Matching_Hobby", { blockStatus: "unblocked", $in: hobbyIds });

            let hobbyQuery = hobbyIds?.length > 0 ? { $in: hobbyIds } : null;
            console.log("hobbyQuery", hobbyQuery);
            // let findHideEvent = await User.find({ ishideevent: true }, { _id: 1 });
            // console.log("findHideEventfindHideEventfindHideEvent", findHideEvent);
            // const hiddenUserIds = findHideEvent?.map(user => user?._id);
            // hiddenUserIds.push(new ObjectId(userId))
            // console.log("hiddenUserIds", hiddenUserIds);

            let eventQuery = {
                userId: { $nin: arr },
                // eventhobbies: hobbyQuery,
                "isblocked": "unblocked",
                "delete": false,
                "event_status": { $ne: "finished" },
                ishideevent: false
            }

            let ChatGroupQuery = {
                isGroupchat: true,
                isblocked: "unblocked",
                ishidegroup: false,
                iseventchat: false,
                groupCreater: { $nin: findUser?.userblocked || [] }
            };

            let UserQuery = {
                _id: { $nin: arr },
                "blockStatus": "unblocked",
                "delete": false,
                "ishideprofile": false
            };

            if (hobbyQuery) {
                eventQuery.eventhobbies = hobbyQuery;
                ChatGroupQuery.grouphobbies = hobbyQuery;
                UserQuery.hobbies = hobbyQuery;
            }


            let [userRecords, eventRecords, groupRecords] = await Promise.all([
                User.find(UserQuery).populate({ path: "hobbies", select: "_id hobbyname" }).lean(),
                Event.find(eventQuery).populate({ path: "eventhobbies", select: "_id hobbyname" }).lean(),
                ChatModel.find(ChatGroupQuery).populate({ path: "grouphobbies", select: "_id hobbyname" }).lean()
            ]);

            //user,event and group merge type use map() function
            let mergeRecords = [...userRecords?.map(users => ({ ...users, type: "user" })), ...eventRecords?.map(events => ({ ...events, type: "event" })), ...groupRecords?.map(groups => ({ ...groups, type: "group" }))];
            console.log("Filtered_Hobby_Records123", mergeRecords);

            // sort descending order(b-a) - ascending order(a-b)
            mergeRecords = mergeRecords?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt));

            let paginatedRecords = mergeRecords?.slice(skip, skip + parseInt(limit));
            const msg = hobbyname ? "Your search records" : "All records";

            return res.status(200).json(EncryptData({ status: true, message: msg, data: paginatedRecords }));
        }
        else if (type == "users") {
            const regexUser = name ? new RegExp(`^${name}`, "i") : null;
            let UserQuery = {
                _id: { $nin: arr },
                "blockStatus": "unblocked",
                "delete": false,
                "ishideprofile": false
            };
            if (name) {
                UserQuery.username = regexUser;
            }
            // let query = name ? { _id: { $nin: arr }, username: regexUser, "blockStatus": "unblocked", "delete": false, "ishideprofile": false } : { _id: { $nin: arr }, "blockStatus": "unblocked", "delete": false, "ishideprofile": false };

            let findUserRecords = await User.find(UserQuery).skip(skip).limit(limit).populate({ path: "hobbies", select: "_id hobbyname" }).lean();
            console.log("MatchingUsers", findUserRecords);
            const msg = name ? "Your search records" : "All records";

            if (findUserRecords.length > 0) {
                return res.status(200).json(EncryptData({ status: true, message: msg, data: findUserRecords }));
            } else {
                return res.status(200).json(EncryptData({ status: false, message: "No search users found" }));
            }
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}; */


/*
 * METHOD : POST
 * BODY: (userId, hide_event)
 * URL : /v1/event/HideEvents
 */
export const HideEventsAndGroups = async (req, res) => {
    try {
        const { body: { userId, hide_event }, user } = req
        const findUser = await User.findOne({ _id: new ObjectId(userId) })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }

        let resp = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { ishideevent: hide_event, ishideAllGroup: hide_event } }, { new: true })
        const result = (resp?.ishideevent && resp?.ishideAllGroup) ? t((user && user.language) ? user.language : "english", "Hide_successfully") : t((user && user.language) ? user.language : "english", "Unhide_successfully")

        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: result }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

//RevenueCat-webhook
/* export const RevenuecatWebhook = async (req, res) => {
    console.log("request_body_webhook", req.body);

    try {
        let webhookData = req.body
        const eventData = webhookData.event;
        console.log("Received RevenueCat event:", webhookData, eventData?.type);
        const io = req?.app?.get("io")

        if (!eventData) {
            return res.status(200).json({ status: false, message: "Invalid webhook format" });
        }

        const { userId, planId, subPlanId } = extractSubscriberAttributes(eventData?.subscriber_attributes || {});
        console.log("🚀 ~ RevenuecatWebhook ~ userId, planId, subPlanId:", userId, planId, subPlanId)

        if (!['TRIAL'].includes(eventData?.type) && ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE'].includes(eventData?.type)) {
            console.log("new_subscribessss", eventData?.type);

            if (!userId || !planId || !subPlanId) {
                return res.status(200).json({ status: false, message: "Missing subscription details." });
            }
            let result = await Userplanadd(userId, planId, subPlanId, res, "subscribe", eventData?.type, eventData?.type);
            console.log("dsf_result", result);

            const checkUser = await User.findOne({ _id: userId });
            if (checkUser) {
                io?.sockets?.to(checkUser?._id?.toString()).emit("purchaseResponse", { status: result.status, message: result.message });
            }
            return res.status(200).json({ status: result.status, message: result.message });

        }
        // period_type
        else if (['TRIAL'].includes(eventData?.type)) {
            if (!userId || !planId || !subPlanId) {
                return res.status(200).json({ status: false, message: "Missing trial details." });
            }
            let result = await Userplanadd(userId, planId, subPlanId, res, "trial", eventData?.type, eventData?.type);
            console.log("dsf_result", result);

            const checkUser = await User.findOne({ _id: userId });
            if (checkUser) {
                io?.sockets?.to(checkUser?._id?.toString()).emit("purchaseResponse", { status: result.status, message: result.message });
            }
            return res.status(200).json({ status: result.status, message: result.message });
        }
        else if (['CANCELLATION'].includes(eventData?.type)) {
            console.log(`Handling ${eventData?.type} for user ${userId}`);
            if (!userId || !planId || !subPlanId) {
                return res.status(200).json({ status: false, message: "Missing cancel details." });
            }
            let result = await Userplanadd(userId, planId, subPlanId, res, "cancel", eventData?.type, eventData?.type);
            console.log("dsf_result", result);

            const checkUser = await User.findOne({ _id: userId });
            if (checkUser) {
                io?.sockets?.to(checkUser?._id?.toString()).emit("purchaseResponse", { status: result.status, message: result.message });
            }
            return res.status(200).json({ status: result.status, message: result.message });
        }
        else {
            return res.status(200).json({ status: false, message: "Something error" });
        }
    } catch (err) {
        console.error("RevenuecatWebhook_error", err);
        return res.status(200).json({ status: false, message: "Internal server error" });
    }
}; */
export const RevenuecatWebhook = async (req, res) => {
    try {
        console.log("🚀 ~ RevenuecatWebhook ~ req.body:", req.body)
        const webhookData = req.body;
        const eventData = webhookData.event;

        console.log("RevenueCat Webhook:", eventData?.type, "eventData====>", eventData);

        const io = req?.app?.get("io");

        if (!eventData) {
            return res.status(200).json({
                status: false,
                message: "Invalid webhook format"
            });
        }

        const { userId, planId, subPlanId } = extractSubscriberAttributes(
            eventData?.subscriber_attributes || {}
        );

        console.log("Webhook user:", userId);

        if (!userId) {
            return res.status(200).json({
                status: false,
                message: "User not found in attributes"
            });
        }

        let result;

        switch (eventData?.type) {

            case "INITIAL_PURCHASE":
            case "RENEWAL":
            case "PRODUCT_CHANGE":

                result = await Userplanadd(
                    userId,
                    planId,
                    subPlanId,
                    res,
                    "subscribe",
                    eventData?.type,
                    eventData?.period_type
                );

                break;

            case "TRIAL":

                result = await Userplanadd(
                    userId,
                    planId,
                    subPlanId,
                    res,
                    "trial",
                    eventData?.type,
                    eventData?.period_type
                );

                break;

            case "CANCELLATION":

                result = await Userplanadd(
                    userId,
                    planId,
                    subPlanId,
                    res,
                    "cancel",
                    eventData?.type,
                    eventData?.period_type
                );

                break;

            case "REFUND":

                result = await Userplanadd(
                    userId,
                    planId,
                    subPlanId,
                    res,
                    "refund",
                    eventData?.type,
                    eventData?.period_type
                );

                break;

            case "EXPIRATION":

                result = await Userplanadd(
                    userId,
                    planId,
                    subPlanId,
                    res,
                    "expire",
                    eventData?.type,
                    eventData?.period_type
                );

                break;

            default:
                console.log("Unhandled event:", eventData?.type);
                result = { status: true, message: "Event ignored" };
        }

        const checkUser = await User.findById(userId);

        if (checkUser) {
            io?.sockets
                ?.to(checkUser?._id?.toString())
                .emit("purchaseResponse", {
                    status: result?.status,
                    message: result?.message
                });
        }

        return res.status(200).json(result);

    } catch (err) {
        console.error("RevenuecatWebhook_error", err);
        return res.status(200).json({
            status: false,
            message: "Internal server error"
        });
    }
};
function extractSubscriberAttributes(attributes) {
    console.log("attributesattributes", attributes);
    try {
        let subplanId = attributes?.subPlanId?.value ? attributes?.subPlanId?.value?.split(":")[0] : attributes?.subPlanId?.value
        return {
            userId: attributes?.userId?.value || null,
            planId: attributes?.planId?.value || null,
            subPlanId: subplanId || null,
            // offerId:attributes?.offerId?.value || ""
        };
    } catch (error) {
        console.log("error_throw", error);

    }

}

/* no need language translation */
export const UserPlanLists = async (req, res) => {
    try {

        const resp = await Plan.find({}).select({ "_id": 1, "planType": 1, "plan_description": 1, "plan_days": 1 })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Plans Lists", data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/* no need language translation */
export const getPrivacypolicy = async (req, res) => {
    try {
        let resp = await Cms.findOne({ "identifier": "privacypolicy" })
        return res.status(200).json(resp?.Content)
        // return res.status(200).json({message:languages[(user && user.language) ? user.language : "english"].privacy_policy,data:resp?.Content})
    }
    catch (e) {
        catchErrorResponse(res, e)
    }
}

export const userChangeLanguage = async (req, res) => {
    try {
        const { body: { language }, user } = req
        console.log("user_records", user);
        const updateLanguage = await User.findOneAndUpdate({ _id: user._id }, { $set: { language: language } }, { new: true })
        console.log("language_update", updateLanguage)
        if (updateLanguage) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "Language_updated"), data: updateLanguage }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const userRequestHobbiesSuggest = async (req, res) => {
    console.log("request", req.body)
    try {
        const { body: { userId, hobbyfeedback }, user } = req
        const findUser = await User.findOne({ _id: new ObjectId(userId) }, { _id: 1, username: 1, email: 1 })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        const requestData = {
            userId: new ObjectId(userId),
            feedback: hobbyfeedback,
            email: findUser?.email
        }
        // const data = new HobbyRequest(requestData);
        let data = new Feedback(requestData)
        const resp = await data.save();
        return res.status(200).json(EncryptData({ status: resp ? true : false, message: resp ? t((user && user.language) ? user.language : "english", "Request_sended") : t((user && user.language) ? user.language : "english", "error"), data: resp }))
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const addOtherProfileHobbies = async (req, res) => {
    try {
        let { body: { userId, HobbyId }, user } = req
        HobbyId = Array.isArray(HobbyId) ? HobbyId : ParsingFunc(HobbyId);
        const findUser = await User.findOne({ _id: new ObjectId(userId) }, { _id: 1, email: 1, hobbies: 1, plan: 1 })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        console.log("findUser", findUser);

        const userHobbies = findUser?.hobbies?.map(id => String(id));
        const isExists = HobbyId?.some(id => userHobbies?.includes(id));
        console.log("isExists", isExists)
        if (isExists) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "Already_exisits_hobbies") }))
        }
        /* if(findUser?.plan?.length == 0){
            return res.status(200).json(({ status: false, message: t((user && user.language) ? user.language : "english", "no_subscription") }))
        } */
        const newIdSet = HobbyId?.map((valId) => new ObjectId(valId))
        let mergeHobby = [...findUser?.hobbies, ...newIdSet]

        const addOtherHobby = await User.findOneAndUpdate({ _id: new ObjectId(userId) }, { $addToSet: { hobbies: { $each: mergeHobby } } }, { new: true })
        if (addOtherHobby) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "Added_successfully") }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

export const groupInfo = async (req, res) => {
    try {
        const { body: { userId, groupId }, user } = req
        const findUser = await User.find({ _id: new ObjectId(userId) })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        const groupInfoDetailLists = await groupInfoDetails({ DBName: ChatModel, groupId })

        if (groupInfoDetailLists?.data?.length <= 0) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
        const recordsData = { status: true, message: t((user && user.language) ? user.language : "english", "Group_info_list"), data: groupInfoDetailLists?.data }
        return res.status(200).json(EncryptData(recordsData))

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

// import axios from "axios";

// async function reverseGeocode(lat, lng) {
//   const apiKey = "YOUR_GOOGLE_API_KEY"; // store your key in .env
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

//   try {
//     const response = await axios.get(url);
//     if (response.data.status === "OK") {
//       return response.data.results[0].formatted_address;
//     } else {
//       throw new Error(response.data.error_message || "No results found");
//     }
//   } catch (err) {
//     console.error("Geocoding error:", err.message);
//     return null;
//   }
// }

// // Example usage
// (async () => {
//   const address = await reverseGeocode(9.9436582, 78.15630039999999);
//   console.log("Address:", address);
// })();

const canViewerSeePrivateProfileContent = async (viewerId, profileUserId) => {
    const viewerOid = new ObjectId(String(viewerId));
    const profileOid = new ObjectId(String(profileUserId));
    if (viewerOid.equals(profileOid)) {
        return true;
    }
    const profileUser = await User.findOne(
        { _id: profileOid },
        { privacy_status: 1 }
    );
    if (!profileUser) {
        return false;
    }
    const isPrivate =
        profileUser.privacy_status === "private" ||
        profileUser.privacy_status === "Private";
    if (!isPrivate) {
        return true;
    }
    const follow = await follownotify.findOne({
        from: viewerOid,
        to: profileOid,
        status: "completed",
    });
    return !!follow;
};

export const eventAndGroupLists = async (req, res) => {
    console.log("reqreq", req.body);

    try {
        const { body: { toUserId, type, fromUserId }, user } = req
        const viewerId = fromUserId || user?._id || user?.userId;

        const findUser = await User.findOne({ _id: new ObjectId(toUserId) }, { _id: 1, username: 1 })

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }

        if (viewerId && !(await canViewerSeePrivateProfileContent(viewerId, toUserId))) {
            return res.status(200).json(EncryptData({
                status: true,
                message: t((user && user.language) ? user.language : "english", "No_Groups_Events"),
                data: [],
            }));
        }
        const aggregationMap = {
            createEvent: createEventListsAggre,
            joinEvent: joinEventListsAggre,
            createGroup: createGroupListsAggre,
            joinGroup: joinGroupListsAggre
        };

        const aggregationFunction = aggregationMap[type];
        console.log("🚀 ~ eventAndGroupLists ~ aggregationFunction:", aggregationFunction)

        if (!aggregationFunction) {
            return res.status(200).json(
                EncryptData({
                    status: false,
                    message: "Invalid type"
                })
            );
        }
        const aggregateData = await aggregationFunction({
            DBName: User,
            toUserId
        });
        const data = aggregateData?.data || [];
        // let aggregateData;
        // if (type === "createEvent") {
        //     aggregateData = await createEventListsAggre({ DBName: User, toUserId: toUserId })
        // }
        // else if (type === "joinEvent") {
        //     aggregateData = await joinEventListsAggre({ DBName: User, toUserId: toUserId })
        // }
        // else if (type === "createGroup") {
        //     aggregateData = await createGroupListsAggre({ DBName: User, toUserId: toUserId })
        // }
        // else if (type === "joinGroup") {
        //     aggregateData = await joinGroupListsAggre({ DBName: User, toUserId: toUserId })
        // }
        // console.log("aggregateData?.dataaggregateData?.data",JSON.stringify(aggregateData?.data, null, 2));

        if (aggregateData?.data?.length > 0) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "Groups_Events_activities"), data: data }))
        }
        else {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "No_Groups_Events"), data: data }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

// export const joinEventLists = async (req, res) => {
//     try {
//         const { body: { toUserId }, user } = req
//         const findUser = await User.findOne({ _id: new ObjectId(toUserId) })

//         if (!findUser) {
//             return res.status(200).json(({ status: false, message: "User not found." }))
//         }
//         const aggregateData = await joinEventListsAggre({ DBName: User, toUserId: toUserId })

//         if (aggregateData?.data?.length > 0) {
//             return res.status(200).json(({ status: true, message: "Join Event Lists", data: aggregateData?.data }))
//         }
//         else {
//             return res.status(200).json(({ status: true, message: "No Join Events", data: aggregateData?.data }))
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

// export const createGroupLists = async (req, res) => {
//     try {
//         const { body: { toUserId }, user } = req
//         const findUser = await User.findOne({ _id: new ObjectId(toUserId) })

//         if (!findUser) {
//             return res.status(200).json(({ status: false, message: "User not found." }))
//         }
//         const aggregateData = await createGroupListsAggre({ DBName: User, toUserId: toUserId })

//         if (aggregateData?.data?.length > 0) {
//             return res.status(200).json(({ status: true, message: "Create Group Lists", data: aggregateData?.data }))
//         }
//         else {
//             return res.status(200).json(({ status: true, message: "No Create Groups", data: aggregateData?.data }))
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

// export const joinGroupLists = async (req, res) => {
//     try {
//         const { body: { toUserId }, user } = req
//         const findUser = await User.findOne({ _id: new ObjectId(toUserId) })

//         if (!findUser) {
//             return res.status(200).json(({ status: false, message: "User not found." }))
//         }
//         const aggregateData = await joinGroupListsAggre({ DBName: User, toUserId: toUserId })

//         if (aggregateData?.data?.length > 0) {
//             return res.status(200).json(({ status: true, message: "Join Group Lists", data: aggregateData?.data }))
//         }
//         else {
//             return res.status(200).json(({ status: true, message: "No Join Groups", data: aggregateData?.data }))
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }
