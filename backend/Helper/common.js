import bcrypt from 'bcrypt'
import config from '../Config/config'
const jwt = require('jsonwebtoken')
import crypto from 'crypto-js'
import nodemailer from 'nodemailer'
import path from "path";
import Group from "../Chat/Models/instance_schema"
import fs from 'fs'
import { PrivateMessageChatCounts, Save, UserNotifications, eventMessageChatCounts, getInstanceLastmessage, getInstanceLastmessageSocket, getSingleInstanceLastmessage } from './mongooseHelper'
// import Activity from '../Helper/Activity_schema'
import User from '../UserController/Models/user_schema'
import EmailTemplate from '../AdminController/Models/emailtemplate_schema'
import Event from "../ActivityController/Models/event_schema"
import { isPushNotificationEnabled, sendPushNotification } from '../pushnotification'
import mongoose from "mongoose"
import ChatModel from '../Chat/Models/instance_schema'
// import { SocketEmit, SocketEmitInstance } from '../socket'
import MessageModel from "../Chat/Models/Message_schema"
import sharp from 'sharp'
import AdminHobbies from "../AdminController/Models/Hobbiesadmin.schema"
import { rateLimit } from 'express-rate-limit'
import Notification from "./Activity_schema"
import Like from "../UserController/Models/likes_schema"
import follownotify from "../UserController/Models/follownotify_schema"
import report from "../commonSchema/report_schema";
import { languages } from '../languages'
import Hobby from '../UserController/Models/hobbies_schema'
import Subscriber from "../AdminController/Models/emailupdate_schema"
import Feedback from "../UserController/Models/feedback_schema"
import blockevent from "../AdminController/Models/blockevents"
import blockuser from "../AdminController/Models/blockmessage_schema"
import Eventwhish from "../ActivityController/Models/whishlist_schema"
import userplan from "../UserController/Models/userplan_schema"
import Admin from "../AdminController/Models/admin_schema"
import { getUserActiveChatInstance } from "./activeChatPresence"

const heicConvert = require('heic-convert');
// import { fromBuffer,fileTypeFromBuffer } from 'file-type';
const FileType = require('file-type');
const ffmpeg = require('fluent-ffmpeg');
// import connection from "../mongodbConnection";
var ObjectId = mongoose.Types.ObjectId
import AWS from 'aws-sdk';
import message from "aws-sdk/lib/maintenance_mode_message";
message.suppress = true;

const s3 = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.AWS_REGION,
});

export const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0) ||
    (typeof value === "string" && value === "0") ||
    (typeof value === "string" && value === "error") ||
    (typeof value === "number" && value === 0) ||
    (Array.isArray(value) === true && value.length === 0);


export const bcryptcompare = async (password, dbpassword) => {
    console.log("passworddbpassword", password, dbpassword)
    try {
        var bcryptData = await bcrypt.compare(password, dbpassword)
        console.log("bcryptData", bcryptData)
        return bcryptData;
    } catch (e) {
        console.log("error", e)
        return false;
    }
};

export const bcrypthash = async (password) => {
    console.log("password", password)
    try {
        const hash = await bcrypt.hash(password, 10)
        return hash;
    } catch (error) {
        console.log("error", error)
        return false;
    }

}

export const jasonwebtoken = async (data) => {
    console.log("jsonwebt", data)
    try {
        var jwtData = await jwt.sign(data, config.SECRET_KEY, { expiresIn: '30d' })
        return jwtData;
    } catch (e) {
        console.log("error", e)
        return false;
    }
};

export const escapeRegex = (text = "") => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const getResponse = (status, success, message, data) => {
    console.log('getResponse', { status, success, message, data })
    return { status, success, message, data }
}

// export const verify = async (token) => {
//     console.log("tokensss", token)
//     var tokens = await jwt.verify(token, config.SECRET_KEY)
//     return tokens
// }

/* No need language translation */
export const verifyToken = async (req, res, next) => {
    try {
        const authToken = req?.headers['authorization'];
        const token = (authToken && `Bearer ${authToken}`) ? (authToken?.split(' ')[1]) : authToken;
        console.log("fartrt", token);
        await jwt.verify(token, config.SECRET_KEY, async (err, user) => {

            if (err) {
                // console.log("errrrrrrrrrr", err);
                return res.status(200).json(EncryptData({ "status": false, "message": "Authentication Failed" }))
            }
            else {
                console.log("user_token", user, user?.id);
                const usertoken = await User.findOne({ _id: new ObjectId(user?.id) })
                console.log("usertoken", usertoken);
                // if (usertoken?.authToken == token) {
                if (usertoken) {
                    console.log("Toksune is correct===============>");
                    req.user = {
                        _id: usertoken?._id,
                        username: usertoken?.username,
                        email: usertoken?.email,
                        language: usertoken?.language,
                        location: usertoken?.location
                    }
                    return next();
                }
                else {
                    return res.status(200).json(EncryptData({ "status": false, "message": "Invalid token" }))
                }
            }
        })
    } catch (e) {
        console.log("error", e);
        return false;
    }

}

/* No need language translation */
export const verifyAdminToken = async (req, res, next) => {
    try {
        const authToken = req?.headers['authorization'];
        const token = (authToken && `Bearer ${authToken}`) ? (authToken?.split(' ')[1]) : authToken;
        await jwt.verify(token, config.SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(200).json(EncryptData({ "status": false, "message": "Authentication Failed" }))
            }
            const adminId = decoded?._id || decoded?.id;
            const admin = await Admin.findOne({ _id: new ObjectId(adminId) })
            if (admin) {
                req.admin = {
                    _id: admin?._id,
                    email: admin?.email,
                    name: admin?.name
                }
                return next();
            } else {
                return res.status(200).json(EncryptData({ "status": false, "message": "Invalid token" }))
            }
        })
    } catch (e) {
        console.log("error", e);
        return res.status(200).json(EncryptData({ "status": false, "message": "Authentication Failed" }))
    }
}


export const EncryptData = (data) => {
    // console.log("EncryptData", data);
    try {

        if (typeof (data) == 'string') {
            // console.log("EncryptData1111", data);
            return crypto.AES.encrypt(data, config.SECRET_KEY).toString();
        }
        else {
            // console.log("EncryptData22222", data);
            return crypto.AES.encrypt(JSON.stringify(data), config.SECRET_KEY).toString();
        }
    }
    catch (error) {
        return false;
    }

}

export const DecryptData = (data) => {
    // console.log("DecryptData5555555555555", data, config.SECRET_KEY);
    try {
        var bytes = crypto.AES.decrypt(data, config.SECRET_KEY);
        // console.log("bytesbytes",bytes);
        var decryptedData;
        try {
            decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));
            // console.log("decryptedData22222222222", decryptedData);
        }
        catch (err) {
            // console.log("errrrrrrrrrrDecrypt",err);
            try {
                decryptedData = bytes.toString(crypto.enc.Utf8);
                // console.log("decryptedData1111111", decryptedData);
            }
            catch (dcpterr) {
                // console.log("dcpterr88888888888", dcpterr);
                return false;
            }
        }
        return decryptedData;
    }
    catch (error) {
        console.log("error", dcpterr);
        return false;
    }
}

/* 
export const ImageAddFunc = async (send_file, type) => {
    var senddata;
    console.log("send_file", send_file);
    await Promise.all(
        send_file.map(async (item) => {
            console.log("itemmssss", item);
            await fs.promises.mkdir(item.path, { recursive: true })
            let tokenname = await item.files.mv(item.path + item.filename)
            console.log("filename", tokenname);
            let CompressImage = await Imagecompress({ image: item.files, path: item.path })
            console.log("CompressImage", CompressImage);

            senddata = type !== "bulk"
                ? CompressImage
                : {
                    file: CompressImage,
                }

            // senddata = type !== "bulk"
            // ? item.filename
            // : {
            //     file: item.filename,

            // }
        })
    );
    console.log("newssend", senddata, JSON.stringify(senddata))
    return senddata;
}; */


export const ImageAddFunc = async (send_file, type) => {
    var senddata;
    console.log("send_file", send_file);
    await Promise.all(
        send_file.map(async (item, i) => {
            console.log("itemmssss", item);
            // await fs.promises.mkdir(item.path, { recursive: true })
            // let tokenname = await item.files.mv(item.path + item.filename)
            // console.log("filename", tokenname);
            let compressedBuffer = await Imagecompress({ image: item.files })
            console.log("compressedBuffer", compressedBuffer);
            senddata = await uploadImageToS3({ fileBuffer: compressedBuffer, fileMimetype: "image/webp", filePath: item?.filePath, index: i })
            console.log("type_uploadupload", senddata);

        })
    );
    return senddata;
};


// export const Node_Mailer = async ({ Type, EmailId, Subject, Content }) => {
//     try {
//         console.log("emailtypes", Type, EmailId, Subject, Content);
//         let data = await EmailTemplate.findOne({Type:Type},{_id: 0, Type: 1, Content: 1})
//         console.log("datassd",data);
//         let smtp = nodemailer.createTransport(
//             config.keyEnvBased.emailGateway.nodemailer
//         );
//         console.log("Content_data data", Content)
//         let info = await smtp.sendMail({
//             from: config.keyEnvBased.emailGateway.fromMail, // sender address
//             to: EmailId, // list of receivers
//             subject: Subject, // Subject line
//             html: Content, // html body
//         });
//         console.log("info", info)
//         return true;

//     } catch (E) {
//         console.log("info", E)

//         return false;
//     }
// };


export const Node_Mailer = async ({ Type, EmailId = "", Subject = "", Content = "", feature = "", username = "", OTP = "", Eventcreatermail = "" }) => {
    try {
        console.log("emailtypes", Type, EmailId, Subject, "Content34343", Content, Eventcreatermail, feature);
        let data = await EmailTemplate.findOne({ Type: Type }, { _id: 0, Type: 1, Content: 1, subject: 1 })
        console.log("datassd", data);
        let findUser, dbSubject = "";
        if (!isEmpty(Eventcreatermail)) {
            findUser = await User.findOne({ email: Eventcreatermail })
            console.log("findUser_findUser", findUser, findUser.email)
        }

        let dirpath = './public/email-template/email_template.html';
        // let htmldata = fs.readFileSync(path, 'utf8');

        let htmldata = await fs.promises.readFile(path.resolve(dirpath), { encoding: 'utf-8' })

        // Set common replacements for sitelogo and emaillogo
        htmldata = htmldata.replaceAll("[[sitelogo]]", `${config?.ImgUrl}/email-template/Meetwave_logo.png`);
        htmldata = htmldata.replaceAll("[[emaillogo]]", `${config?.ImgUrl}/email-template/email_banner.png`);

        if (htmldata.includes("[[username]]") && htmldata.includes("[[content]]")) {
            switch (Type) {
                case "eventcreate":
                    dbSubject = data?.subject
                    htmldata = htmldata.replaceAll("[[username]]", username)
                        .replaceAll("[[content]]", findUser?.email == EmailId ? data.Content : Content)
                        .replaceAll("{{username}}", username)
                        // .replace("[[feature]]", '');
                        .replaceAll(/^.*\[\[feature\]\].*\n?/gm, '');
                    break;

                case "registeremailverify":
                    dbSubject = data?.subject
                    htmldata = htmldata.replaceAll("[[username]]", "User")
                        .replaceAll("[[content]]", data.Content)
                        .replaceAll("{{otp}}", OTP)
                        // .replace("[[feature]]", '');
                        .replaceAll(/^.*\[\[feature\]\].*\n?/gm, '');
                    break;
                case "plansubscribed":
                    dbSubject = data?.subject
                    htmldata = htmldata.replaceAll("[[username]]", username)
                        .replaceAll("[[content]]", Content)
                        // .replace("[[feature]]", '');
                        .replaceAll(/^.*\[\[feature\]\].*\n?/gm, '');
                    break;
                case "deleteaccount":
                // dbSubject = data?.subject
                // break;
                case "loginverify":
                // dbSubject = data?.subject
                // break;
                case "verifyotp":
                // dbSubject = data?.subject
                // break;
                case "welcome":
                // dbSubject = data?.subject
                // break;
                case "resendotp":
                // dbSubject = data?.subject
                // break;
                case "change_password":
                // dbSubject = data?.subject
                // break;
                case "login":
                // dbSubject = data?.subject
                // break;
                case "help":
                // dbSubject = data?.subject
                // break;
                case "feedback":
                // dbSubject = data?.subject
                // break;
                case "forgetpassword":
                // dbSubject = data?.subject
                // break;
                case "planexpirysoon":
                // dbSubject = data?.subject
                // break;
                case "deleteverify":
                // dbSubject = data?.subject
                // break;
                case "transferemail":
                // dbSubject = data?.subject
                // break;
                case "emailtransfered":
                // dbSubject = data?.subject
                // break;
                case "transferemailverify":
                // dbSubject = data?.subject
                // break;
                case "transferemailcancel":
                case "transferdurationend":
                    dbSubject = data?.subject
                    htmldata = htmldata.replaceAll("[[username]]", username)
                        .replaceAll("[[content]]", data?.Content ? data.Content : Content)
                        .replaceAll("{{otp}}", OTP || "")
                        // .replaceAll("[[feature]]", '');
                        .replaceAll(/^.*\[\[feature\]\].*\n?/gm, '');
                    break;

                case "verifyemail":
                    dbSubject = data?.subject
                    htmldata = htmldata.replaceAll("[[username]]", "admin")
                        .replaceAll("[[content]]", data.Content)
                        .replaceAll("{{otp}}", OTP)
                        // .replaceAll("[[feature]]", '');
                        .replaceAll(/^.*\[\[feature\]\].*\n?/gm, '');
                    break;

                case "helpmail":
                    dbSubject = data?.subject
                    if (htmldata.includes("[[feature]]")) {
                        htmldata = htmldata
                            .replaceAll("[[username]]", username)
                            .replaceAll("[[content]]", Content);

                        if (feature) {
                            htmldata = htmldata.replaceAll("[[feature]]", `<p class="desc">${feature}</p>`);
                        }
                        else {
                            // Remove the full line if no feature is present
                            htmldata = htmldata.replaceAll(/^.*\[\[feature\]\].*\n?/gm, '');
                        }
                    }
                    break;
                case "feedbackmail":
                    dbSubject = data?.subject
                    if (htmldata.includes("[[feature]]")) {
                        htmldata = htmldata
                            .replaceAll("[[username]]", username)
                            .replaceAll("[[content]]", Content);

                        if (feature) {
                            htmldata = htmldata.replaceAll("[[feature]]", `<p class="desc">${feature}</p>`);
                        }
                        else {
                            // Remove the full line if no feature is present
                            htmldata = htmldata.replaceAll(/^.*\[\[feature\]\].*\n?/gm, '');
                        }
                    }
                    break;
                case "subscribersmailsend":
                    dbSubject = data?.subject
                    htmldata = htmldata
                        .replaceAll("[[username]]", "User")
                        .replaceAll("[[content]]", Content);

                    if (feature) {
                        htmldata = htmldata.replaceAll("[[feature]]", `<p class="desc">${feature}</p>`);
                    }
                    else {
                        // Remove the full line with [[feature]] including optional newline
                        htmldata = htmldata.replaceAll(/^.*\[\[feature\]\].*\r?\n?/gm, '');
                    }
                    break;
                default:
                    dbSubject = data?.subject
                    htmldata = htmldata
                        .replaceAll("[[username]]", username || "")
                        .replaceAll("[[content]]", data.Content || Content);
                    if (OTP) {
                        htmldata = htmldata.replaceAll("{{otp}}", OTP);
                    }
                    if (feature) {
                        htmldata = htmldata.replaceAll("[[feature]]", `<p class="desc">${feature}</p>`);
                    }
                    else {
                        // Remove the full line with [[feature]] including optional newline
                        htmldata = htmldata.replaceAll(/^.*\[\[feature\]\].*\r?\n?/gm, '');
                    }
            }
        }
        console.log("dbSubject", dbSubject);

        let smtp = nodemailer.createTransport(
            config.keyEnvBased.emailGateway.nodemailer
        );
        // console.log("Content_data", data.Content)
        let info = await smtp.sendMail({
            from: config.keyEnvBased.emailGateway.fromMail, // sender address
            to: EmailId ? EmailId : findUser?.email, // list of receivers
            subject: dbSubject || Subject, // Subject line
            html: htmldata ? htmldata : Content, // html body
        });
        // console.log("info", config.keyEnvBased.emailGateway.fromMail, EmailId,
        //     Subject, htmldata ? htmldata : Content, Content);
        return true;

    } catch (E) {
        console.log("info", E)
        return false;
    }
};
/* No need language translation */
//email update
export const sendMailNodeMailer = async (payload) => {
    console.log("data in sendnode mailer ", payload)
    try {
        let reqBody = payload;
        let toEmail = reqBody.toEmail;
        let htmlContent = reqBody.htmlContent;
        let subject = reqBody.subject;
        console.log("chking toEmal", toEmail, htmlContent, subject);
        if (toEmail == '' || toEmail == undefined || toEmail == null)
            return { status: true, message: 'To email address must' };
        if (htmlContent == '' || htmlContent == undefined || htmlContent == null)
            return { status: true, message: 'Html content must' };
        if (subject == '' || subject == undefined || subject == null)
            return { status: true, message: 'Subject content must' };

        console.log("check data in mail")
        console.log("Message sent: nodemailer", config.keyEnvBased.emailGateway.nodemailer);
        let transporter = await nodemailer.createTransport(config.keyEnvBased.emailGateway.nodemailer);
        console.log("checking.....", toEmail, subject,);
        let info = await transporter.sendMail({
            from: config.keyEnvBased.emailGateway.nodemailer.auth.user,
            to: toEmail,
            subject: subject,
            html: htmlContent,
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return { status: true, message: 'Mail sent successfully!' };
    } catch (error) {
        console.log("Error in Sendmailer Function", error);
        return { status: false, message: 'Oops something went wrong!' };
    }
}


export function catchErrorResponse(res, message) {
    console.error("Error_message", message);
    return res.status(500).json(EncryptData({ status: false, msg: message?.message, error: "error" }))
}


export function responseReturn(isencrypt = true, res, statusCode, status, message, data, ...extraDataObjects) {
    const mergedExtraData = Object.assign({}, ...extraDataObjects);
    if (isencrypt) {
        return res.status(statusCode).json(
            EncryptData({
                status: status,
                msg: message,
                data: data,
                extraData: mergedExtraData
            })
        );
    }
    else {
        return res.status(statusCode).json(
            {
                status: status,
                msg: message,
                data: data,
                extraData: mergedExtraData
            }
        );
    }

}

/* function responseReturn(res, statusCode, status, message, data, ...extraDataObjects) {
    const mergedExtraData = Object.assign({}, ...extraDataObjects);
        return {res,statusCode, status, message, data, ...mergedExtraData}
}
const a = responseReturn("fs",200,true,"Success",{name:"viki", age:24}, {counts:1,degree:"bsc"})
console.log(a) */

//   OTP
export const generateOTP = () => {
    try {
        let digits = '0123456789';
        let OTP = '';
        console.log("otpps", OTP);
        let len = digits.length
        for (let i = 0; i < 4; i++) {
            OTP += digits[Math.floor(Math.random() * len)];
        }
        return OTP;
    } catch (error) {
        return false;
    }
}

// export const verifyemailfunc = async (req, res, DbName, forgetotp) => {
//     console.log("values", DbName, forgetotp);
//     try {
//         const otp = generateOTP();

//         let emailverify = await DbName.findOne({ email: req.body.email })
//         let dataupdate = await DbName.findOneAndUpdate({ email: req.body.email }, { OTP: EncryptData(otp) },{new:true})
//         if (forgetotp) {
//             if (dataupdate) {

//                 let SendMail = await Node_Mailer({ EmailId: emailverify.email, Subject: 'Meeting Application verification OTP', OTP: otp, Type: "verifyemail" })
//                 console.log("SendMail", SendMail);
//                 return res.json({ status: true, message: "OTP sended your mail", data: dataupdate })

//                 // return true
//             }
//         }

//         console.log("emailverify", emailverify,"dataupdate",dataupdate);
//         let stratdate = new Date(dataupdate?.updatedAt).getMinutes() + 2
//         console.log("stratdate", stratdate);

//         if (emailverify) {
//             if (req.body.OTP == DecryptData(dataupdate.OTP)) {
//                 if (new Date().getDate() == new Date(emailverify?.updatedAt).getDate() && new Date().getHours() == new Date(emailverify?.updatedAt).getHours() && stratdate > new Date().getMinutes()) {
//                     let respdata = await DbName.findOneAndUpdate({ email: req.body.email }, { verify_status: true }, { new: true })
//                     let activitysave = {
//                         DBName: Activity, Data: {
//                             action: "OTP verify",
//                             from: "user",
//                             message: "user Otp verified successfully",
//                             Userid: respdata._id
//                         }
//                     }
//                     let activityvalues = await Save(activitysave)
//                     console.log("ddddddddd", activityvalues);

//                     res.status(200).json({ status: true, message: "Otp verified successfully" });
//                     let SendMail = await Node_Mailer({
//                         Type: "welcome",
//                         EmailId: emailverify.email, Subject: 'Welcome to our Meetwave'
//                     })
//                     console.log("SendMail", SendMail);
//                 }
//                 else {
//                     res.status(200).json({ status: false, message: 'otp is expired' });
//                 }
//             }
//             else {
//                 res.status(200).json({ status: false, message: 'Otp is not match' });
//             }
//         }
//         else {
//             res.status(200).json({ status: false, message: "user not found" })
//         }


//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

export const verifyemailfunc = async (req, res, DbName, forgetotp = null) => {
    console.log("values", DbName, forgetotp);
    try {
        const { body: { email, OTP, fcmtoken }, user } = req;
        console.log("rgrgdfgrtfh", user);

        // Generate and encrypt OTP
        const otp = generateOTP();
        console.log("toweszdfg", otp);

        // Find and update the user's OTP
        const emailverify = await DbName.findOne({ email: email });
        console.log("emailverify", emailverify);

        if (!emailverify) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        if (forgetotp) {
            const dataupdate = await DbName.findOneAndUpdate(
                { email },
                { OTP: EncryptData(otp) },
                { new: true }
            );
            const sendMailResponse = await Node_Mailer({
                EmailId: emailverify.email,
                Subject: 'Meeting Application verification OTP',
                OTP: otp,
                Type: "verifyemail"
            });

            if (!sendMailResponse) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "otp_failed") }));
            }
            return res.json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "otp_verify_short"), data: dataupdate }));
        }

        // console.log("emailverify", emailverify, "dataupdate", emailverify);

        const otpValidityMinutes = 5;
        const otpExpiryTime = new Date(emailverify?.updatedAt);
        otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + otpValidityMinutes);

        // Verify OTP and check expiry
        // console.log("Deccrrypprt", DecryptData(emailverify?.OTP));
        if (DecryptData(emailverify?.OTP) == OTP) {
            if (new Date() > otpExpiryTime) {
                return res.status(200).json(EncryptData({
                    status: false,
                    message: t((user && user.language) ? user.language : "english", "OTP_expired")
                }));
            }
            // if (new Date() <= otpExpiryTime) {
            // if (!fcmtoken) {
            //     return res.status(200).json({ status: false, message: "FCM Token is not allowed to empty" })
            // }
            let payload = { id: emailverify?._id, email: email }

            let tokenhash = jwt.sign(payload, config.SECRET_KEY, { expiresIn: '30d' })
            let token = `Bearer ${tokenhash}`
            console.log("jwttoken", token);
            const respdata = await DbName.findOneAndUpdate(
                { email: email },
                { verify_status: true, authToken: tokenhash, $addToSet: { "fcmToken": fcmtoken } },
                { new: true }
            );

            // const respdata = await DbName.findOneAndUpdate(
            //     { email: email },
            //     { verify_status: true, authToken: tokenhash, $push: { "fcmToken": fcmtoken } },
            //     { new: true }
            // );
            // res.status(200).json({ status: true, message: "OTP verified successfully", data: respdata });

            // Log activity
            // await Save({
            //     DBName: Activity,
            //     Data: {
            //         action: "OTP verify",
            //         from: "user",
            //         message: "User OTP verified successfully",
            //         Userid: respdata._id
            //     }
            // });

            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "otp_verified"), data: respdata }));

            // Send welcome email
            // await Node_Mailer({
            //     Type: "welcome",
            //     EmailId: emailverify.email,
            //     Subject: 'Welcome to our Connect'
            // });

            // }
            //  else {
            //     return res.status(200).json(EncryptData({ status: false, message: 'OTP is expired' }));
            // }
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "otp_invalid") }));
        }

    } catch (error) {
        catchErrorResponse(res, error);
    }
}



export const ResendOtpfunc = async (req, res, DbName) => {
    console.log("ResendOtpfunc", DbName);
    try {
        const { user } = req
        const otp = generateOTP();
        console.log("OTP_ddatssd", otp);

        let EmailCheck = await DbName.findOne({ email: req.body.email })
        if (EmailCheck?.email) {
            let resendata = await DbName.findOneAndUpdate({ email: req.body.email }, { OTP: EncryptData(otp), verify_status: true }, { new: true })
            console.log("resendata", resendata);

            if (resendata) {
                // if (resendata?.pushNotification) {
                //     await sendPushNotification({
                //         type: "Resend",
                //         tokens: resendata?.fcmToken,
                //         title: "Resend OTP",
                //         content: `Meetwave Resend otp is ${otp}`

                //     })
                // }
                // let activitysave = {
                //     DBName: Activity, Data: {
                //         action: "OTP Resended",
                //         from: "user",
                //         message: "user Otp Resended successfully",
                //         Userid: resendata._id
                //     }
                // }
                // let activityvalues = await Save(activitysave)
                // console.log("ddddddddd", activityvalues);
                let SendMail = await Node_Mailer({ Type: "resendotp", EmailId: resendata.email, Subject: 'Meeting Application resend verification OTP', OTP: otp, username: resendata?.username })
                if (!SendMail) {
                    return res.send(EncryptData({ message: t((user && user.language) ? user.language : "english", "otp_failed"), status: false }))
                }
                return res.send(EncryptData({ message: t((user && user.language) ? user.language : "english", "otp_sent_msg"), status: true }))

            }
            else {
                return res.send(EncryptData({ message: t((user && user.language) ? user.language : "english", "otp_failed"), status: false }))

            }
            console.log("resendata", resendata);
        } else {
            return res.send(EncryptData({ message: t((user && user.language) ? user.language : "english", "pass_not_created"), status: false }))
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

// export const loginverifyOTPfunc = async (req, res, DbName) => {
//     console.log("loginverifyOTPfunc", DbName);


//     try {

//         let dataverify = await DbName.findOne({ email: req.body.email })
//         console.log("fggggg", dataverify);
//         let payload = { "id": dataverify._id, email: dataverify?.email }

//         let tokenhash = jwt.sign(payload, config.SECRET_KEY)
//         let token = `Bearer ${tokenhash}`
//         console.log(token)
//         let stratdate = new Date(dataverify.updatedAt).getMinutes() + 2
//         console.log("trprtrt", dataverify, DecryptData(dataverify.OTP), new Date(dataverify.updatedAt).getMinutes(), stratdate, stratdate > new Date().getMinutes());
//         if (req.body.OTP == DecryptData(dataverify.OTP)) {
//             if (new Date().getDate() == new Date(dataverify?.updatedAt).getDate() && new Date().getHours() == new Date(dataverify?.updatedAt).getHours() && stratdate > new Date().getMinutes()) {
//                 // let resps = await User.findOneAndUpdate({ email: req.body.email }, { socketId: req.body.socketId })
//                 // console.log("resps", resps);
//                 let fcm = await User.findOne({ email: dataverify.email, "fcmToken": { $in: [req.body.fcmtoken] } })
//                 if (!fcm) {
//                     let Data = await User.findOneAndUpdate({ email: req.body.email }, { $push: { "fcmToken": req.body.fcmtoken }, $set: { login_status: true, authToken: tokenhash } })
//                     console.log("Datanames", Data);
//                     if (Data) {

//                         res.status(200).json({ status: true, message: "Your Successfully logged in", data: Data })
//                         let SendMail = await Node_Mailer({ EmailId: Data.email, Subject: 'Meeting Application login', Type: "login", username: Data.name })
//                         console.log("sernEmails", SendMail);
//                     }
//                     else {
//                         return res.status(200).json({ staus: false, message: "Something error", data: Data })
//                     }
//                 }
//                 else {
//                     let dataupdate = await DbName.findOneAndUpdate({ email: dataverify.email }, { login_status: true, authToken: tokenhash }, { new: true })
//                     console.log("verifedtrue", dataupdate);

//                     res.send({ message: "your successfully loggedin", tokenhash, data: dataverify, status: true });
//                     // let activitysave = {
//                     //     DBName: Activity, Data: {
//                     //         action: "login",
//                     //         from: "user",
//                     //         message: "user loggedin successfully",
//                     //         Userid: dataverify._id
//                     //     }
//                     // }
//                     // let activityvalues = await Save(activitysave)


//                     // console.log("ddddddddd", activityvalues);
//                     let SendMail = await Node_Mailer({ EmailId: dataupdate.email, Subject: 'Meeting Application login', Type: "login", username: dataupdate.name })
//                     console.log("sernEmails", SendMail);
//                 }


//             }
//             else {
//                 return res.send({ status: false, message: 'OTP is expired' });
//             }

//         }
//         else {
//             return res.send({ status: false, message: "OTP is incorrect" })
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }

// }
export const AccountDeleteVerifyOTPfunc = async (req, res, DbName) => {
    console.log("AccountDeleteVerifyOTPfunc", req.body, DbName);
    const session = await mongoose.startSession();

    try {
        /* session.startTransaction(); */
        let dataverify = await DbName.findOne({ email: req.body.email })
        if (!dataverify) {
            /*  await session.abortTransaction();
             session.endSession(); */
            return res.send(EncryptData({ status: false, message: t((dataverify && dataverify.language) ? dataverify.language : "english", "user_nf") }));
        }

        const decryptedOTP = DecryptData(dataverify.OTP);

        const otpUpdateTime = new Date(dataverify.updatedAt);
        const otpExpiryTime = new Date(otpUpdateTime.getTime() + 5 * 60 * 1000);
        const currentTime = new Date();

        if (req.body.OTP == decryptedOTP) {
            if (currentTime <= otpExpiryTime) {
                let deleteArray = [];

                // const userDirPath = `public/PersonalProfile/`;
                // const userBioImgPath = `public/Bioimage/`;
                if (dataverify?.profile) {
                    // const profilePath = `${userDirPath}${dataverify?.profile}`;
                    // deleteFileIfExists(profilePath);
                    const deleteImg = dataverify?.profile?.slice(1)
                    await deleteImageFromS3(deleteImg)
                    deleteArray.push(dataverify?.profile)
                }
                if (Array.isArray(dataverify.bioimage) && dataverify.bioimage.length > 0) {
                    dataverify.bioimage.forEach(async (img) => {
                        // const bioPath = `${userBioImgPath}${img}`;
                        // deleteFileIfExists(bioPath);
                        const deleteImg = img?.slice(1)
                        await deleteImageFromS3(deleteImg)
                        deleteArray.push(img)

                    })
                }

                const userEvents = await Event.find({ userId: new ObjectId(dataverify._id) });
                userEvents?.forEach(async (event) => {
                    // const eventProfImgPath = 'public/EventProfile/';
                    // const eventImgPath = 'public/Eventimage/';

                    if (event?.eventprofile) {
                        // const eventProfPath = `${eventProfImgPath}${event.eventprofile}`;
                        // deleteFileIfExists(eventProfPath);
                        const deleteImg = event?.eventprofile?.slice(1)
                        await deleteImageFromS3(deleteImg)
                        deleteArray.push(event?.eventprofile)

                    }

                    if (Array.isArray(event.image) && event.image.length > 0) {
                        event.image.forEach(async (img) => {
                            // const eventImagePath = `${eventImgPath}${img}`;
                            // deleteFileIfExists(eventImagePath);
                            const deleteImg = img?.slice(1)
                            await deleteImageFromS3(deleteImg)
                            deleteArray.push(img)

                        });
                    }
                });

                const userGroupChats = await ChatModel.find({ isGroupchat: true, groupCreater: new ObjectId(dataverify._id) });
                userGroupChats?.forEach(async (chat) => {
                    // const chatImgPath = `public/GroupImage/`;
                    if (chat?.Image) {
                        // const chatImagePath = `${chatImgPath}${chat.Image}`;
                        // deleteFileIfExists(chatImagePath);
                        const deleteImg = chat?.Image?.slice(1)
                        await deleteImageFromS3(deleteImg)
                        deleteArray.push(chat?.Image)

                    }
                });
                if (deleteArray.length > 0) {
                    deleteArray.map(async (delImg, i) => {
                        const deleteImg = delImg?.slice(1)
                        await deleteImageFromS3(deleteImg)
                    })
                }
                console.log("All user-related images cleaned.");

                await Promise.all([
                    ChatModel.deleteMany({ isGroupchat: false, members: new ObjectId(dataverify?._id) }),
                    ChatModel.deleteMany({ isGroupchat: true, groupCreater: new ObjectId(dataverify?._id) }),
                    MessageModel.deleteMany({ chatId: new ObjectId(dataverify?._id) }),
                    follownotify.deleteMany({ $and: [{ from: new ObjectId(dataverify?._id) }, { to: new ObjectId(dataverify?._id) }] }),
                    Event.updateMany(
                        { "eventinterested.userId": new ObjectId(dataverify?._id) },
                        { $pull: { eventinterested: { userId: new ObjectId(dataverify?._id) } } }
                    ),
                    report.deleteMany({ $or: [{ report_from: new ObjectId(dataverify?._id) }, { report_to: new ObjectId(dataverify?._id) }] }),
                    Subscriber.deleteMany({ email: dataverify?.email }),
                    Notification.deleteMany({ userId: new ObjectId(dataverify?._id) }),
                    Event.deleteMany({ userId: new ObjectId(dataverify?._id) }),
                    Hobby.deleteMany({ userId: new ObjectId(dataverify?._id) }),
                    Feedback.deleteMany({ userId: new ObjectId(dataverify?._id) }),
                    blockevent.deleteMany({ userId: new ObjectId(dataverify?._id) }),
                    blockuser.deleteMany({ userId: new ObjectId(dataverify?._id) }),
                    Eventwhish.deleteMany({ userId: new ObjectId(dataverify?._id) }),
                    userplan.deleteMany({ userId: new ObjectId(dataverify?._id) })

                ]);

                const resp = await User.findOneAndDelete({ email: req.body.email }, { new: true });
                if (resp) {
                    /* await session.commitTransaction();
                    session.endSession(); */
                    res.status(200).json(EncryptData({
                        status: true,
                        message: t((dataverify && dataverify.language) ? dataverify.language : "english", "acc_deleted"),
                        data: resp
                    }));
                    await Node_Mailer({
                        Type: "deleteaccount",
                        EmailId: resp?.email,
                        Subject: 'Delete Account in Meeting Application',
                        username: resp?.username
                    });
                } else {
                    /*  await session.commitTransaction();
                     session.endSession(); */
                    return res.status(200).json(EncryptData({ status: false, message: t((dataverify && dataverify.language) ? dataverify.language : "english", "error") }));
                }

            } else {
                /*        await session.commitTransaction();
                       session.endSession(); */
                return res.status(200).json(EncryptData({ status: false, message: t((dataverify && dataverify.language) ? dataverify.language : "english", "otp_exp") }));
            }

        } else {
            /*  await session.commitTransaction();
             session.endSession(); */
            return res.status(200).json(EncryptData({ status: false, message: t((dataverify && dataverify.language) ? dataverify.language : "english", "otp_wrong") }));
        }
    } catch (error) {
        /* await session.abortTransaction();
        session.endSession(); */
        catchErrorResponse(res, error);
    }
};

export const ForgetPasswordfunc = async (req, res, DbName) => {
    console.log("dbnamess", DbName);
    try {
        const { body: { confirmpassword, email, OTP }, user } = req

        let changepass = await DbName.findOne({ email: email })
        console.log("changepass", changepass);

        const otpUpdateTime = new Date(changepass.updatedAt);
        let stratdate = new Date(otpUpdateTime.getTime() + 5 * 60000)

        // let confirmpassword = req.body.confirmpassword
        const hashed = await bcrypthash(confirmpassword)
        if (DecryptData(changepass.OTP) == OTP) {
            if (new Date().getDate() == new Date(changepass?.updatedAt).getDate() && new Date().getHours() == new Date(changepass?.updatedAt).getHours() && stratdate > new Date().getMinutes()) {
                let patientupdata = await DbName.findOneAndUpdate({ email: email }, { password: hashed })
                console.log("patientupdata", patientupdata);
                let SendMail = await Node_Mailer({ Type: "forgetpassword", EmailId: patientupdata.email, Subject: 'Forget password', Content: `your password has been changed`, username: patientupdata.adminname })
                // console.log("SendMail", SendMail);

                if (patientupdata && confirmpassword) {
                    return res.send(EncryptData({ status: true, message: "Changed your password" }))
                }
                else {
                    return res.send(EncryptData({ status: false, message: "No change password" }))
                }
            }
            else {
                return res.send(EncryptData({ status: false, message: 'One Time Password has expired' }));
            }

        }
        else {
            return res.send(EncryptData({ status: false, message: "One Time Password is incorrect" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }


}

export const changepasswordfunc = async (req, res, DbName) => {
    console.log("sdfgsdgsdg", DbName, req.body);
    try {
        const { confirmpassword } = req?.body
        let changepass = await DbName.findOne({ email: req.body.email })
        console.log("dfgfgfxxxxg", changepass);
        const match = await bcryptcompare(req.body.password, changepass?.hashpassword);
        console.log("changepass", match);
        if (match == true) {

            const hashed = await bcrypthash(confirmpassword)

            let commondata = await DbName.findOneAndUpdate({ email: req.body.email }, { hashpassword: hashed, password: hashed }, { new: true })
            console.log("commondata", commondata);
            if (commondata && confirmpassword) {
                res.send(EncryptData({ status: true, message: "Password changed successfully" }))
                let SendMail = await Node_Mailer({ EmailId: commondata.email, Subject: 'change password', Type: "change_password", username: commondata.username })
            }
            else {
                return res.send(EncryptData({ status: false, message: "Password not changed" }))
            }
        }
        else {
            return res.send(EncryptData({ status: false, message: "Old password is incorrect" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


//dob convert age
// export const calculateAge = (dob) => {
//     console.log("Dateofbirth", dob, "Dates", new Date(dob));

//     var formattedDate = dob.split("-")
//     var birthdateTimeStamp = new Date(formattedDate[0], formattedDate[1], formattedDate[2])
//     var currentDate = new Date().getTime();
//     var difference = currentDate - birthdateTimeStamp;
//     var currentAge = Math.floor(difference / 31557600000)
//     console.log("currentAge",currentAge, difference);

//     // dividing by 1000*60*60*24*365.25
//     console.log('My age is', currentAge);
//     if (Number(currentAge) < Number(18)) {
//         // throw new Error("Age must be 18 or older.")
//         return 0;
//     }
//     return currentAge;
// };
export const calculateAge = (dob) => {
    if (!dob || typeof dob !== "string") return 0;

    try {
        const [year, month, day] = dob.split("-").map(Number); // convert to numbers
        const birthdate = new Date(year, month - 1, day); // month - 1 since months are 0-based
        const today = new Date();

        let age = today.getFullYear() - birthdate.getFullYear();
        const m = today.getMonth() - birthdate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }

        return age >= 18 ? age : 0;
    } catch (err) {
        console.error("Failed to calculate age:", err);
        return 0;
    }
};


// export const DateValidation = async (data) => {
//     // console.log("date", data);
//     try {

//         let date = new Date();

//         // Add days
//         date.setDate(date.getDate() + data);

//         const year = date.getFullYear();
//         const month = (date.getMonth() + 1).toString().padStart(2, '0');
//         const day = date.getDate().toString().padStart(2, '0');
//         let hours = date.getHours();
//         const minutes = date.getMinutes().toString().padStart(2, '0');
//         const seconds = date.getSeconds().toString().padStart(2, '0');

//         const ampm = hours >= 12 ? 'PM' : 'AM';
//         hours = hours % 12;
//         hours = hours ? hours : 12;
//         const hoursStr = hours.toString().padStart(2, '0');

//         const newFormattedDate = `${year}-${month}-${day} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
//         return newFormattedDate;


//     } catch (error) {
//         console.log("error", error);
//     }
// }
export const DateValidation = async (days, startDate = new Date()) => {
    try {
        // Ensure valid days input
        if (!days || isNaN(days)) {
            throw new Error("Invalid number of days");
        }

        // Add the specified number of days to the startDate
        let date = new Date(startDate);
        date.setDate(date.getDate() + days);

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        // AM/PM format
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;  // Convert 0 hour to 12
        const hoursStr = hours.toString().padStart(2, '0');

        // Return the formatted date as YYYY-MM-DD HH:MM:SS AM/PM
        const formattedDate = `${year}-${month}-${day} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
        return formattedDate;

    } catch (error) {
        console.error("Error in DateValidation:", error);
        return null;
    }
};

export const subscriptionNotification = async (data, days = 20) => {
    // console.log("ddffdddd", data);
    try {
        let Datevalidate = new Date(data?.EndDate).setDate(new Date(data?.EndDate).getDate() - Number(days))
        // console.log("Datevalidate", Datevalidate);
        let minusDate = new Date(Datevalidate)
        // console.log("minusDate", minusDate);

        return minusDate;
    } catch (error) {
        console.log("error", error);
    }

}

// export const Groupscounts = async (data) => {
//     console.log("data_group", data);
//     try {
//         const { userId } = data
//         let resp = await Group.find({ groupCreater: new ObjectId(userId), members: { $in: [new ObjectId(userId)] } })
//         // console.log("rrirrpronress", resp);
//         return resp;
//     } catch (error) {
//         console.log("error", error);
//     }
// }

export const EventJoinCount = async (data) => {
    try {
        const { eventId } = data;

        let events = await Event.find({ _id: new ObjectId(eventId) });

        let joinCount = 0;

        for (let event of events) {
            for (let interested of event?.eventinterested) {
                if (interested?.joinstatus == true) {
                    joinCount++;
                }
            }
        }

        console.log("Total Join Count:", joinCount);
        return joinCount;

    } catch (error) {
        console.log("Error:", error);
        return 0;
    }
};

export const ParsingFunc = (data) => {
    try {
        return JSON.parse(data);
    }
    catch (err) {
        return data;
    }
}

export const normalizeHobbyObjectIds = (hobbies) => {
    const raw = typeof hobbies === "string" ? ParsingFunc(hobbies) : hobbies;
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw
        .map((hobby) => {
            const id =
                hobby && typeof hobby === "object"
                    ? hobby._id || hobby.id
                    : hobby;
            return ObjectId.isValid(String(id)) ? new ObjectId(String(id)) : null;
        })
        .filter(Boolean);
};

export const userHasActivePlan = (user) => {
    const plans = user?.plan;
    if (!Array.isArray(plans) || plans.length === 0) {
        return false;
    }
    const now = new Date();
    return plans.some(
        (plan) =>
            plan?.isActive === "started" &&
            plan?.subscriptionStatus !== "expired" &&
            plan?.subscriptionStatus !== "cancel" &&
            (!plan?.EndDate || new Date(plan.EndDate) >= now)
    );
};

/* No need language translation */
export const GetInstanceSocket = async (data) => {
    // console.log("dartasdssssss_instance_socket", data);
    try {
        const { userId, io, isGroupchat, res } = data
        console.log("isGroupchat_123_isGroupchat", isGroupchat, userId);

        let payload = { DBName: ChatModel, uesrId: userId }

        let chats = isGroupchat ? await getInstanceLastmessageSocket(payload) : await getSingleInstanceLastmessage(payload);
        console.log("🚀 ~ GetInstanceSocket ~ chats:", chats)
        if (!isGroupchat) {
            let UnreadMessages = chats?.data?.filter((unreaddata => unreaddata?.UnreadMessageCount?.unread > 0))
            // console.log("unread_mesaafdf", UnreadMessages, UnreadMessages?.length);

        }
        // let UnreadMessages = !isGroupchat ? chats?.data?.filter((unreaddata => unreaddata?.UnreadMessageCount?.unread > 0)) : 0
        // console.log("chatsss1_common_singleChats", JSON.stringify(chats, null, 2));
        let userDetail;

        let chatData = await Promise.all(chats?.data?.map(async (chat) => {
            // console.log("chatsss_dfstats", chat);

            let otherMembers = chat?.members
            // ?.filter(member => !member.equals(userId));
            // console.log("otherMembers", otherMembers);
            let memberDetails = await Promise.all(otherMembers?.map(async (memberId) => {
                // console.log("memberDetails", memberId);

                let user = await User.findOne({ _id: memberId })
                // console.log("users", user);
                userDetail = user;
                return user ? { _id: user?._id, name: user?.name, MychatDiscription: user?.MychatDiscription, online_status: user?.online_status, bioimage: user?.bioimage, randomIndex: user?.randomIndex, username: user?.username, profile: user?.profile } : null;
            }));
            // console.log("hhhhhhhhhhhh",chat?.UnreadMessageCount);

            return {
                chatName: chat?.chatName,
                groupAdmin: chat?.groupAdmin,
                groupCreater: chat?.groupCreater,
                isGroupchat: chat.isGroupchat,
                Image: chat?.Image ? chat?.Image : "",
                ImagePath: chat?.isGroupchat ? `/GroupImage/` : `/PersonalProfile/`,
                groupDiscription: chat?.isGroupchat ? chat?.groupDiscription : "",
                name: userDetail?.name,
                profile: userDetail?.profile,
                randomIndex: userDetail?.randomIndex,
                username: userDetail?.username,
                CreatedAt: chat?.createdAt,
                grouphobbies: chat?.grouphobbies ? chat?.grouphobbies : [],
                _id: chat?._id,
                requestedUsers: chat?.requested_users ? chat?.requested_users : [],
                members: memberDetails ? memberDetails.filter(member => member !== null) : res.status(200).json(EncryptData({ status: true, message: "No messages" }))
            };
        }));
        // console.log("chatDatachatData_createChat", userId,chatData);
        io?.in(userId?.toString()).emit("InstanceFormatRows", { chatData, isGroupchat: isGroupchat });
    } catch (error) {
        console.log("error_common_instance", error);
    }
}


// export const Imagecompress = async (data) => {
//     console.log("imageDatas", data);
//     const { image, path } = data

//     var paths = path
//     var images = image
//     console.log("inputfiles", images)

//     var info = await sharp(images?.data)
//         .webp({ quality: 20 })
//         .toFormat('jpeg')
//         .toFile(paths + Date.now() + '.webp')
//     console.log("infoss", info)
//     if (info) {
//         // res.send({
//         //     status: true, message: "image compressed", data:info
//         // }) 
//         return images?.name;
//     }
// }



/* export const Imagecompress = async (data) => {
    console.log("Imagecompress", data);
    try {
        let { image, path, imagename, } = data;

        // Check if `image` is a string (path) or a file object
        let inputBuffer;
        if (typeof image == 'string') {
            inputBuffer = fs.readFileSync(image); // If it's a path, read it
        } else if (image && image.data) {
            inputBuffer = image.data; // If it's a file object, use the data property
        } else {
            throw new Error('Invalid image format provided.');
        }

        imagename = imagename ? imagename : `${Date.now()}.webp`
        // Detect the format of the image buffer using fromBuffer


        // Convert HEIF to JPEG if the format is HEIF or HEIC
        if (image.mimetype == 'image/heif' || image.mimetype == 'image/heic') {
            const detectedType = await fromBuffer(inputBuffer);
            if (!detectedType) {
                throw new Error('Unable to determine the image format.');
            }

            console.log(`Detected image format: ${detectedType.mime}`);

            const outputBuffer = await heicConvert({
                buffer: inputBuffer,
                format: 'JPEG',
                quality: 0.0 // Quality between 0.0 and 1.0
            });

            // Construct output path
            const outputPath = `${path}/${imagename}`;
            console.log("frtgyttryry", outputPath);
            // Save the converted JPEG image
            fs.writeFileSync(outputPath, outputBuffer);

            console.log('HEIF image successfully converted to JPEG.');
            return `${imagename}`; // Return the image name (or path) if needed
        } else {
            // For other image formats, use sharp to compress and convert to WebP

            const outputPath = `${path}/${imagename}`;
            console.log("outputPath", outputPath);

            // const metadata = await sharp(image?.data).metadata();
            // console.log('Image_metadata:', metadata);

            // Use sharp to compress and save the image as WebP

            let info = await sharp(image?.data, { failOnError: false, animated: true })
                .webp({ quality: 70, reductionEffort: 6 })
                // .withMetadata(false)
                .toFile(outputPath)
                .then(() => {
                    return true;
                })
                .catch((e) => {
                    console.log("error_sharp", e)

                    return false;
                });
            console.log("infoinfo", info)
            return imagename;
            // const info = await sharp(Buffer.from(image?.data, "utf-8"), { failOnError: false, animated:true })
            //     .resize({ width: 3000, height: 3000, fit: 'inside' })
            //     .webp({ quality: 80 }) // Set quality for WebP
            //     // .toFormat('jpeg')
            //     .toFile(outputPath); // Save to file

            // console.log("Compressed image info:", info);
            // if (info) {
            //     return `${imagename}` // Return the image name if compression is successful
            // }
        }
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}; */


/* export const userRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: async (req, res) => {
        console.log("ewrewrewr", req.body);
        const { email } = req?.body;

        const user = await User.findOne({ email });

        if (user && user?.email == email) {
            return 5;
        }
        else {
            return 5;
        }

        //   return 2;
    },
    keyGenerator: (req) => req?.body?.email,
    handler: (req, res) => {
        console.log("reqestlimit", req.rateLimit, new Date(req.rateLimit.resetTime).toLocaleTimeString());
        // let date = new Date(req.rateLimit.resetTime);
        // req.rateLimit.resetTime = date.toLocaleTimeString();
        return res.status(200).json(EncryptData({ status: false, message: t((req.user && req.user.language) ? req.user.language : "english", "too_many_requests") }))
    },
    // message: "Too many login attempts from this email, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
}); */

const createUserRateLimiter = () => rateLimit({
    windowMs: 5 * 60 * 1000,
    // max : 5,
    // limit:req.body.email || req.ip,
    limit: async (req, res) => {
        const { email } = req.body || {};
        if (!email) return 5; // default for unknown emails

        const user = await User.findOne({ email }).lean();
        if (user) {
            return 5; // registered user = 5 requests
        }
        return 5; // unregistered user = 5 requests
    },
    keyGenerator: (req) => req?.body?.email || req.ip,
    handler: (req, res) => {
        return res.status(200).json(
            EncryptData({
                status: false,
                message: t(
                    (req.user && req.user.language) ? req.user.language : "english",
                    "too_many_requests"
                ),
            })
        );
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// separate limiter instances so resend-OTP, login, and logout don't share the same quota per email
export const userRateLimiter = createUserRateLimiter();
export const loginRateLimiter = createUserRateLimiter();
export const logoutRateLimiter = createUserRateLimiter();


export const AddRemoveCreateGroup = async (data) => {
    console.log("AddRemoveCreateGroup", data);
    try {
        const { userId, isGroupchats, instanceId, messageData = "", type = "", io, groupmembers = [] } = data

        let Users = Array.isArray(userId) ? userId : [userId]
        console.log("UsersUsers", Users);

        let savedMessage;

        if (type == "unjoingroup") {
            return;
        }

        await Users?.map(async (user) => {
            let response = await User.findOne({ _id: new ObjectId(user) })
            console.log("dfgsdfdg", response, response._id.toString() == userId.toString());
            if (response) {
                if (type && (type == "group" || type == "singlechat")) {
                    const payload = {
                        chatId: response?._id,
                        instanceId: instanceId,
                        messageData: `${response?.username} ${messageData}`,
                        groupmembers: groupmembers
                    };

                    const message = new MessageModel(payload);
                    savedMessage = await message.save();
                    console.log("savedMessage", savedMessage);

                }
                if (isGroupchats) {
                    const payload = {
                        chatId: response?._id,
                        instanceId: instanceId,
                        messageData: !isEmpty(messageData) ? messageData : response._id.toString() == userId.toString() ? `You have created a new group` : `Group created by ${response?.username}`,
                        groupmembers: groupmembers
                    };


                    const message = new MessageModel(payload);
                    savedMessage = await message.save();
                    console.log("savedMessage", savedMessage);

                }
            }

        })
        const ReportMessages = await MessageModel.findOne({ _id: savedMessage?._id });
        console.log("ReportMessages", ReportMessages);
        io?.in(instanceId?.toString()).emit("messageResponse", ReportMessages);
    } catch (error) {
        console.log("error", error);
    }
}

//transfer email verify function
export const TransferEmailVerify = async (req, res, DbName) => {
    console.log("values", DbName);
    try {
        const { body: { userId, email, alternativeEmail, OTP, type }, user } = req;
        const io = req?.app?.get("io")

        // Generate and encrypt OTP
        const otp = generateOTP();
        console.log("toweszdfg", otp);

        // Find and update the user's OTP
        const emailverify = await DbName.findOne({ email: email });
        console.log("emailverify", emailverify);

        if (!emailverify) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        console.log("emailverify", emailverify);

        const otpValidityMinutes = 5;
        const otpExpiryTime = new Date(emailverify.updatedAt);
        otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + otpValidityMinutes);

        // Verify OTP and check expiry
        console.log("Deccrrypprt", DecryptData(emailverify.OTP));
        if (DecryptData(emailverify.OTP) == OTP) {

            if (type == "oldemail") {
                if (new Date() <= otpExpiryTime) {

                    return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "otp_verified_short") }));

                    // let SendMail = await Node_Mailer({ Type: "emailtransfered", EmailId: emailverify.email, Subject: 'Email transfered', username:emailverify.name })
                    // console.log("SendMail_oldemail", SendMail);
                } else {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "otp_exp") }));
                }
            }
            else if (type == "alteremail") {
                if (new Date() <= otpExpiryTime) {

                    const respdata = await DbName.findOneAndUpdate(
                        { _id: new ObjectId(userId), email: email },
                        { $set: { alternativeEmail: cleanSpace(alternativeEmail), email: cleanSpace(email), transferEmailCreated: Date.now(), transferAction: "change" } },
                        { new: true }
                    );

                    console.log("respdata_emailtransfer", respdata)

                    res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "email_transfer_success"), data: respdata }));
                    if (isPushNotificationEnabled(emailverify?.pushNotification)) {
                        await sendPushNotification({
                            type: "email transfer",
                            tokens: emailverify?.fcmToken,
                            title: "Email Transfer",
                            content: `Your new email has been successfully transferred and will be active within 7 days from today`
                        });
                        // const activitysave = {
                        //     DBName: Notification,
                        //     Data: {
                        //         userId: emailverify?._id,
                        //         action: "Emailtransfer",
                        //         status: emailverify?.privacy_status,
                        //         from: emailverify?._id,
                        //         to: emailverify?._id,
                        //         message: `Your new email has been successfully transferred and will be active within 7 days from today`,
                        //         type: "Emailtransfer"
                        //     }
                        // }
                        // await Save(activitysave)
                        await saveNotification({
                            userId: emailverify?._id,
                            action: "Emailtransfer",
                            status: emailverify?.privacy_status,
                            from: emailverify?._id,
                            to: emailverify?._id,
                            message: `Your new email has been successfully transferred and will be active within 7 days from today`,
                            type: "Emailtransfer",
                            io
                        })
                    }
                    let SendMail = await Node_Mailer({ Type: "emailtransfered", EmailId: emailverify.email, Subject: 'Email transfered', username: emailverify.username })
                    console.log("SendMail_alteremail", SendMail);
                } else {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "otp_exp") }));
                }
            }

        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "otp_invalid") }));
        }

    } catch (error) {
        catchErrorResponse(res, error);
    }
}

// Transfer email verify function
// export const TransferEmailVerify = async (req, res, DbName) => {
//     console.log("Database:", DbName);
//     try {
//         const { userId, email, alternativeEmail, OTP, type } = req.body;

//         // Retrieve user by email
//         const user = await DbName.findOne({ email:email });
//         if (!user) {
//             return res.status(200).json({ status: false, message: "User not found" });
//         }

//         // Check OTP expiration (valid for 5 minutes after update)
//         const otpExpiryTime = new Date(user.updatedAt);
//         otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 5);

//         // Verify OTP
//         if (DecryptData(user.OTP) !== OTP) {
//             return res.status(200).json({ status: false, message: 'OTP does not match' });
//         }

//         // Check OTP expiration
//         if (new Date() > otpExpiryTime) {
//             return res.status(200).json({ status: false, message: 'OTP is expired' });
//         }

//         // Define update fields based on `type`
//         let updateFields;
//         if (type === "oldemail") {
//             updateFields = { transferEmailCreated: Date.now() };
//         } else if (type === "alteremail") {
//             updateFields = {
//                 alternativeEmail: email,
//                 email: alternativeEmail,
//                 transferEmailCreated: Date.now(),
//             };
//         } else {
//             return res.status(200).json({ status: false, message: "Invalid type provided" });
//         }

//         // Update user document with new email data
//         const updatedUser = await DbName.findOneAndUpdate(
//             { _id: userId, email },
//             { $set: updateFields },
//             { new: true }
//         );

//         // Confirm email transfer with response and email notification
//         res.status(200).json({
//             status: true,
//             message: "OTP verified successfully",
//             data: updatedUser,
//         });

//         // Send notification email
//         const mailResponse = await Node_Mailer({
//             Type: "emailtransfered",
//             EmailId: user.email,
//             Subject: "Email transferred",
//             username: user.name,
//         });
//         console.log("Email sent response:", mailResponse);

//     } catch (error) {
//         catchErrorResponse(res, error);
//     }
// };


export const findNearbyUsersWithHobbiesAndLatLong = async (userId, longitude, latitude, radiusInKm, targetHobbies, type, followersData, eventId, io) => {
    // console.log("All_values", userId, longitude, latitude, radiusInKm, targetHobbies, type, typeof followersData, followersData, eventId);
    try {
        // let findUser = await User.findOne({_id:new ObjectId(userId)})
        const validHobbies = [];

        if (Array.isArray(targetHobbies) && targetHobbies.length > 0) {
            for (const hobby of targetHobbies) {
                if (ObjectId.isValid(hobby)) {
                    console.log("hobby", hobby);
                    validHobbies.push(new ObjectId(hobby));
                } else {
                    return { status: false, message: "Invalid hobby ID provided" };
                }
            }
        }

        /*  const nearbyUsers = await User.aggregate([
 
             {
                 $geoNear: {
                     near: {
                         type: "Point",
                         coordinates: [targetLong, targetLat], // Note: [longitude, latitude]
                     },
                     distanceField: "distanceFromQuery",
                     maxDistance: 100 * 1000, // Convert km to meters for maxDistance
                     spherical: true,
                     key: 'location',
                 }
             },
             {
                 $match: {
                     _id: { $nin: followersData },
                     hobbies: { $in: validHobbies }
                 }
             },
         ]); */
        // const followersObjectIds = (followersData || [])?.map(id => new ObjectId(id));
        // console.log("🚀 ~ findNearbyUsersWithHobbiesAndLatLong ~ followersObjectIds:", followersObjectIds)
        const nearbyUsers = await User.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude], // [longitude, latitude]
                    },
                    distanceField: "distanceFromQuery",
                    maxDistance: 100 * 1000, // 100 KM
                    spherical: true,
                    key: "location",
                }
            },
            {
                $match: {
                    _id: { $nin: followersData },
                    hobbies: { $in: validHobbies }
                }
            }
            // {
            //     $match: {
            //         _id: {
            //             $nin: [...followersObjectIds, new ObjectId(userId._id)]
            //         },
            //         hobbies: { $in: validHobbies }
            //     }
            // }
        ]);
        const friendUsers = await User.find({
            _id: { $in: followersData, $ne: new ObjectId(userId._id) }
        });
        const usersMap = new Map();

        [...nearbyUsers, ...friendUsers].forEach(user => {
            usersMap.set(user._id.toString(), user);
        });

        const finalUsers = Array.from(usersMap.values());

        console.log("Final Notification Users:", finalUsers.length);
        // console.log("Nearby_users:", JSON.stringify(nearbyUsers, null, 2));

        if (finalUsers?.length > 0) {

            const notificationPromises = finalUsers?.map(async (nearby) => {
                console.log("Notifying_user:", nearby);
                // if (type == "event") {
                // const activitysave = {
                //     DBName: Notification,
                //     Data: {
                //         userId: new ObjectId(userId?._id),
                //         action: "Event",
                //         status: nearby?.privacy_status,
                //         from: new ObjectId(userId?._id),
                //         to: new ObjectId(nearby?._id),
                //         message: `${userId?.username} has created a new event`,
                //         eventId: eventId,
                //         type: "Event"
                //     }
                // }
                // let activityvalues = await Save(activitysave)
                // console.log("activityvaluesUser", activityvalues);
                await saveNotification({
                    userId: new ObjectId(userId?._id),
                    action: "Event",
                    status: nearby?.privacy_status,
                    from: new ObjectId(userId?._id),
                    to: new ObjectId(nearby?._id),
                    message: `${userId?.username} has created a new event`,
                    eventId: eventId?._id,
                    type: "Event",
                    io
                })
                if (isPushNotificationEnabled(nearby?.pushNotification)) {
                    sendPushNotification({
                        type: "Event",
                        tokens: nearby?.fcmToken,
                        title: "Event Created",
                        content: `${userId?.username} has created a new event`,
                        extraData: { _id: eventId?._id || "", "type": "eventcreate" }

                    });
                }
                // }
                // return sendPushNotification({
                //     type: type == "event" ? "Event create" : "User joined",
                //     tokens: nearby?.fcmToken,
                //     title: type == "event" ? "Event Create" : "New user joined",
                //     content: type == "event" ? `${userId?.username} has created a new event` : `${userId?.username} has joined`,
                // });
                // return sendPushNotification({
                //     type: "Event create",
                //     tokens: nearby?.fcmToken,
                //     title: "Event Create",
                //     content: `${userId?.username} has created a new event`,
                // });
                // if(type !="user" && nearby?.pushNotification){
                //     sendPushNotification({
                //             type:"Event create",
                //             tokens: nearby?.fcmToken,
                //             title:"Event Create",
                //             content:`${userId?.username} has created a new event`,
                //         });
                // }
                // if(type == "event"){
                // sendPushNotification({
                //     type: "Event create",
                //     tokens: nearby?.fcmToken,
                //     title: "Event Create",
                //     content: `${userId?.username} has created a new event`,
                // });
                // }

                // let Kilometer = metersToKilometers(nearby?.distanceFromQuery);
                // if (Math.round(Kilometer) <= nearby?.range) {
                //     if (type == "user" && nearby?.pushNotification && nearby?.newjoinerStatus) {
                //         sendPushNotification({
                //             type: "New user joined",
                //             tokens: nearby?.fcmToken,
                //             title: `New user joined`,
                //             content: `${userId?.username} is joined`,
                //         });
                //     }
                // }

            });
            await Promise.all(notificationPromises);
        }

        // return nearbyUsers;
    } catch (error) {
        console.error("Error finding nearby users:", error);
        return [];
    }
};


export const isSameDay = (date1, date2) => {
    console.log("datefdgfdgfdg", date1, date2)
    return (
        date1.getDate() == date2.getDate() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getFullYear() == date2.getFullYear()
    )
}


export const Audiofile = async (files) => {
    console.log("AudiofileAudiofile", files)
    try {
        const audioFile = files;
        console.log("filesssss", audioFile);

        // Set the desired output format (default to 'mp4')
        const outputFormat = 'mp4';

        // Directory to save the output video
        const outputDir = './public/Chatimage/';

        // Output file path with the correct extension
        const outputFilePath = path.join(outputDir, `${Date.now() + String(audioFile.name).split(".")[0]}.${outputFormat}`);
        await fs.promises.mkdir(outputDir, { recursive: true });
        console.log("gggggggggggg", outputFilePath, `${Date.now() + audioFile.name.split(".")[0]}.${outputFormat}`)

        await audioFile?.mv(outputDir + audioFile.name);
        // const s3Url = await uploadImageToS3({ fileBuffer: audioFile?.data, fileMimetype: audioFile?.mimetype, filePath: "chatAudio", index: 0, extension: 'mp3' });
        // return s3Url;
        // Process the conversion using ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(outputDir + audioFile.name) // Input the audio file
                .outputOptions('-shortest') // Match audio duration
                .output(outputFilePath) // Output to the specified file path
                .videoCodec('libx264') // Use a video codec like 'libx264' for video conversion
                .audioCodec('aac') // Use 'aac' for audio codec
                .on('start', commandLine => console.log('FFmpeg command:', commandLine))
                .on('progress', progress => console.log(`Progress: ${progress.percent}%`))
                .on('error', (err, stdout, stderr) => {
                    console.error('FFmpeg error:', err, stderr);
                    reject(err);
                })
                .on('end', () => {
                    console.log('Conversion completed.');
                    resolve();
                })
                .run();
        });

        return outputFilePath;

    } catch (error) {
        console.error('Error during conversion:', error);

    }
};

//Most first 10 popular hobbies function
export const GetMostPopularHobbies = async () => {
    // console.log("createdddd", req.body);
    try {
        const groupedHobbies = await User.aggregate([
            { $unwind: "$hobbies" },
            {
                $group: {
                    _id: "$hobbies",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1, _id: 1 } }, // tie breaker sort (only count is increase or decrease count is change order and same time _id is ascending its not change again and again order)
            { $limit: 10 }
        ]);

        const hobbyIds = await Promise.all(
            groupedHobbies.map(async (hobby) => {
                const FindData = await AdminHobbies.find({ _id: hobby?._id });
                return FindData?.length > 0 && FindData?.map(item => ({ ...item.toObject(), count: hobby.count }));
            })
        );

        const flattenedHobbyIds = hobbyIds.flat();

        // console.log("flattenedHobbyIds_with_counts", flattenedHobbyIds);

        if (flattenedHobbyIds.length > 0) {
            // return res.status(200).json({ 
            //     status: true, 
            //     message: "Group created details", 
            //     data: flattenedHobbyIds 
            // });
            return flattenedHobbyIds;
        } else {
            return [];
        }
    } catch (error) {
        return error;
    }
};

export const SingleUser_GetLikeFollowEventNotification = async (data) => {
    console.log("Request_received_for_GetFollow:", data);

    try {
        const { userId, to } = data;
        // Perform both queries concurrently
        // let resp = await Notification.updateMany({ to: new ObjectId(userId), seen: false }, { seen: true }, { new: true })

        // console.log("Likes_and_follows_fetched:", resp);
        // let findnotificationlist = await Notification.find({ to: userId, display: true }).populate("userId").populate("eventId").lean()
        let Query = await Notification.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            {
                                $eq: ["$display", true]
                            },
                            {
                                $eq: ["$to", new ObjectId(userId)]
                            },
                            {
                                $eq: ["$type", "Follow"]
                            },
                            // {
                            //     $eq: ["$to", new ObjectId(to)]
                            // }
                        ]

                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: "followuser",
                    localField: "followUserId",
                    foreignField: "_id",
                    as: "followUserId"

                },
            },
            {
                $unwind: {
                    path: "$followUserId", preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "followuser",
                    let: { from_notify: "$from", to_notify: "$to" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [

                                        {
                                            $ne: ["$status", "unfollowed"]
                                        },
                                        {
                                            $eq: ["$from", new ObjectId(to)]
                                        },
                                        {
                                            $eq: ["$to", new ObjectId(userId)]
                                        }
                                    ]
                                }
                            }
                        },
                        { $limit: 1 }
                    ],
                    as: "notificationsDetails"
                }
            },

            {
                $unwind: {
                    path: "$notificationsDetails", preserveNullAndEmptyArrays: true
                }
            },

            // {
            //     $project:{
            //         hobbiesDetails:"$notificationsDetails"
            //     }
            // }

        ])
        console.log("QueryQuery", JSON.stringify(Query, null, 2));

        // if (!resp) {
        //     return false;
        // }

        // Return the combined data
        return Query;

    } catch (error) {
        console.error("Error_in_GetFollow:", error);
    }
};



/* Send chat notification and file upload function */
// File handling logic with optimizations
// const fileUploadDir = './public/Chatimage/';
// const fileUploadDirCompress = './public/Chatimage/Compress/';
export const handleFileUploads = async (files, audio, arr, compress_arr) => {
    console.log("filesimages", arr, files)
    // await fs.promises.mkdir(fileUploadDir, { recursive: true });
    // await fs.promises.mkdir(fileUploadDirCompress, { recursive: true });
    // await fs.promises.mkdir(AudiofileUploadDirCompress, { recursive: true });

    if (files) {
        files = Array.isArray(files) ? files : [files];
        await Promise.all(files.map(async (img, i) => {
            try {
                const CompressImage = await Imagecompress({ image: img });
                const s3Url = await uploadImageToS3({ fileBuffer: CompressImage, fileMimetype: "image/webp", filePath: "chatImages", index: i });
                console.log("s3Urls3Url", s3Url);

                arr.push(s3Url);
                compress_arr.push(s3Url);
                // await img.mv(path.join(fileUploadDir, fileName));
            } catch (error) {
                console.error(`Failed to upload file: ${img.name}, error: ${error.message}`);
            }
        }));
    }

    if (audio) {
        audio = Array.isArray(audio) ? audio : [audio];
        await Promise.all(audio.map(async (audioFile, i) => {
            try {
                // let fileName;
                // // let androidFilename;
                // const fileExtension = audioFile?.name?.split('.').pop().toLowerCase();
                // const fileType = (fileExtension == "m4a" || fileExtension == "mp4" || fileExtension == "wav" || fileExtension == "mpeg")
                // if (fileType) {
                //     fileName = `${Date.now()}_${i}.${fileExtension}`;
                //     // androidFilename = Date.now() + i + ".mp3"
                // }
                // else {
                //     fileName = Date.now() + i + ".mp3";
                //     // androidFilename = Date.now() + i + ".mp3"
                // }
                // console.log("gvgtghyjyuj", fileName)
                // arr.push(fileName);
                // let result = await Audiofile(audioFile)
                // console.log("resultresult", result)
                const s3Url = await uploadImageToS3({ fileBuffer: audioFile?.data, fileMimetype: audioFile?.mimetype, filePath: "chatAudio", index: i, extension: 'mp3' });
                // let finalresult = result?.split("/")[2]
                // console.log("finalresult",finalresult)
                // compressAudio_arr.push(androidFilename)
                arr.push(s3Url);

                // await audioFile.mv(path.join(fileUploadDir, finalresult));
                // await audioFile.mv(path.join(fileUploadDir, fileName));

                // await audioFile.mv(path.join(AudiofileUploadDirCompress, androidFilename));

            } catch (error) {
                console.error(`Failed to upload audio file: ${audioFile.name}, error: ${error.message}`);
            }
        }));
    }
};
// Notification logic with optimizations
export const notifyUsers = async (MessageReceiveUsers, savedMessage, arr, text, chatId, io, findchat, BlockUser, res) => {
    try {
        const MsgDataUser = await User.findOne({ _id: new ObjectId(chatId) })
            .select('_id username profile randomIndex userblocked pushNotification');
        if (!MsgDataUser || !findchat?._id) {
            return;
        }

        const senderId = String(chatId);
        const hasContent = !isEmpty(text) || (Array.isArray(arr) && arr.length > 0);
        if (!hasContent) {
            return;
        }

        const recipientIds = (MessageReceiveUsers || [])
            .map((member) => {
                const id = member?._id ?? member;
                return id ? String(id) : null;
            })
            .filter((id) => id && id !== senderId);

        if (!recipientIds.length) {
            return;
        }

        const usersRecords = await User.find({ _id: { $in: recipientIds } })
            .select('_id fcmToken pushNotification username');

        const extraData = {
            _id: String(findchat._id),
            chatName: findchat?.chatName || '',
            isGroupchat: !!findchat?.isGroupchat,
            type: 'chat',
            profile: MsgDataUser?.profile || '',
            username: MsgDataUser?.username || '',
            randomIndex: MsgDataUser?.randomIndex || '',
            Image: findchat?.Image || '',
            groupIndex: findchat?.groupIndex ?? '',
            groupDiscription: findchat?.groupDiscription || '',
            CreatedAt: findchat?.createdAt ? new Date(findchat.createdAt).toISOString() : '',
        };

        const title = findchat?.isGroupchat
            ? (findchat?.chatName || 'Group')
            : (MsgDataUser?.username || 'New message');

        await Promise.all(usersRecords.map(async (user) => {
            try {
                GetInstanceSocket({ userId: user?._id, io, isGroupchat: findchat?.isGroupchat, res });
            } catch (error) {
                console.error('GetInstanceSocket error', error);
            }

            const isBlocked = BlockUser?.includes(user?._id?.toString());
            if (isBlocked || !isPushNotificationEnabled(user?.pushNotification)) {
                return;
            }

            const activeChatInstanceId = getUserActiveChatInstance(user?._id);
            if (
                activeChatInstanceId &&
                String(activeChatInstanceId) === String(findchat?._id)
            ) {
                return;
            }

            await sendPushNotification({
                type: 'Chatting',
                tokens: user?.fcmToken,
                title,
                content: text || '',
                fileUrls: arr || [],
                extraData,
                userId: user?._id,
            });
        }));
    } catch (error) {
        console.error('notifyUsers error:', error?.message);
    }
};



/* export const findNearbyUsersWithHobbiesNotification = async (user, targetLat, targetLong, radiusInKm, targetHobbies, type) => {
    console.log("All_values_near_users", user._id, targetLat, targetLong, radiusInKm, targetHobbies, type);

    try {
        // Validate and convert hobby IDs
        const validHobbies = [];
        if (Array.isArray(targetHobbies) && targetHobbies.length > 0) {
            for (const hobby of targetHobbies) {
                if (ObjectId.isValid(hobby)) {
                    validHobbies.push(new ObjectId(hobby));
                } else {
                    console.log("Invalid hobby ID:", hobby);
                    return { status: false, message: "Invalid hobby ID provided" };
                }
            }
        }

        console.log("Valid_Hobbies:", validHobbies);

        const nearbyUsers = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [targetLong, targetLat] },
                    distanceField: "distanceFromQuery",
                    maxDistance: 100 * 1000, // convert km to meters
                    spherical: true,
                    key: 'location',
                }
            },
            {
                $match: {
                    _id: { $ne: new ObjectId(user._id) },
                    hobbies: { $in: validHobbies }
                }
            }
        ]);

        console.log("Nearby_Users:", JSON.stringify(nearbyUsers, null, 2));

        // Send notifications
        const notificationPromises = nearbyUsers?.map(async (nearby) => {
            console.log("Notifying_user:", nearby);

            let kilometer = nearby?.distanceFromQuery / 1000; // convert meters to km
            if (kilometer <= nearby?.range) {
                if (type == "user" && nearby?.pushNotification && nearby?.newjoinerStatus) {
                    await sendPushNotification({
                        type: "New user joined",
                        tokens: nearby?.fcmToken,
                        title: "New user joined",
                        content: `${nearby?.username} has joined`,
                    });
                }
            }
        });

        await Promise.all(notificationPromises);

        return { status: true, message: "Notifications sent successfully", users: nearbyUsers };

    } catch (error) {
        console.error("Error finding nearby users:", error);
        return { status: false, message: "Error finding nearby users", error };
    }
}; */
export const findNearbyUsersWithHobbiesNotification = async (user, targetLat, targetLong, radiusInKm, targetHobbies, type, io) => {
    console.log("Input Params:", { userId: user._id, targetLat, targetLong, radiusInKm, targetHobbies, type });

    try {
        // Validate and convert hobby IDs
        const validHobbies = (Array.isArray(targetHobbies))
            ? targetHobbies.filter(hobby => ObjectId.isValid(hobby)).map(hobby => new ObjectId(hobby))
            : [];

        if (validHobbies.length == 0) {
            return { status: false, message: "No valid hobby IDs provided" };
        }

        console.log("Valid Hobby IDs:", validHobbies);

        // Aggregate nearby users
        const nearbyUsers = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [targetLong, targetLat] },
                    distanceField: "distanceFromQuery",
                    maxDistance: 100 * 1000, // km to meters
                    spherical: true,
                    key: "location"
                }
            },
            {
                $match: {
                    _id: { $ne: new ObjectId(user._id) },
                    hobbies: { $in: validHobbies }
                }
            }
        ]);

        console.log("Matched Nearby Users:", nearbyUsers.length);

        // Notification logic
        const notificationPromises = nearbyUsers.map(async (nearby) => {
            const distanceKm = nearby.distanceFromQuery / 1000;
            console.log("distanceKmdistanceKm", nearby, type, distanceKm, nearby.range);
            if (
                distanceKm <= nearby.range &&
                type == "user" &&
                isPushNotificationEnabled(nearby.pushNotification) &&
                nearby.newjoinerStatus
            ) {
                await sendPushNotification({
                    type: "New user joined",
                    tokens: Array.isArray(nearby.fcmToken) ? nearby.fcmToken : [nearby.fcmToken],
                    title: "New User",
                    content: `A new user who shares a hobby with you has entered your search radius`,
                    extraData: {
                        _id: user._id,
                        action: "NewUserJoined",
                        type: "newuserjoined"
                    }
                });
                // let activitysave = {
                //     DBName: Notification,
                //     Data: {
                //         userId: user._id,
                //         action: "NewUserJoined",
                //         status: nearby?.privacy_status,
                //         from: user?._id,
                //         to: nearby?._id,
                //         message: `A new user who shares a hobby with you has entered your search radius`,
                //         type: "New user joined"
                //     }
                // }
                // await Save(activitysave)
                await saveNotification({
                    userId: user._id,
                    action: "NewUserJoined",
                    status: nearby?.privacy_status,
                    from: user?._id,
                    to: nearby?._id,
                    message: `A new user who shares a hobby with you has entered your search radius`,
                    type: "New user joined",
                    io
                })
            }
        });

        await Promise.all(notificationPromises);

        return {
            status: true,
            message: "Notifications sent successfully",
            users: nearbyUsers
        };

    } catch (error) {
        console.error("Error in findNearbyUsersWithHobbiesNotification:", error);
        return {
            status: false,
            message: "Internal server error while processing nearby users",
            error
        };
    }
};

// export const findNearbyUsersWithHobbiesNotification = async (userId, targetLat, targetLong, radiusInKm, targetHobbies, type) => {
//     console.log("All_values_near_users", userId, targetLat, targetLong, radiusInKm, targetHobbies, type);

//     try {
//         const validHobbies = [];

//         if (Array.isArray(targetHobbies) && targetHobbies.length > 0) {
//             for (const hobby of targetHobbies) {
//                 if (ObjectId.isValid(hobby)) {
//                     console.log("hobby", hobby);
//                     validHobbies.push(new ObjectId(hobby));
//                 } else {
//                     // return res.status(200).json(EncryptData({ status: false, message: "Invalid hobby ID provided" }));
//                     return false;
//                 }
//             }
//         }
//         console.log("validHobbies0", validHobbies)
//         const nearbyUsers = await User.aggregate([

//             {
//                 $geoNear: {
//                     near: {
//                         type: "Point",
//                         coordinates: [targetLong, targetLat], // Note: [longitude, latitude]
//                     },
//                     distanceField: "distanceFromQuery",
//                     maxDistance: 100 * 10000, // Convert km to meters for maxDistance
//                     spherical: true,
//                     key: 'location',
//                 }
//             },
//             {
//                 $match: {
//                     _id: { $ne: new ObjectId(userId?._id) },
//                     hobbies: { $in: validHobbies }
//                 }
//             },
//         ]);

//         console.log("Nearby_users:", JSON.stringify(nearbyUsers, null, 2));

//         if (nearbyUsers?.length > 0) {

//             const notificationPromises = nearbyUsers.map(async (nearby) => {
//                 console.log("Notifying_user:", nearby);
//                 let Kilometer = metersToKilometers(nearby?.distanceFromQuery);
//                 if (Math.round(Kilometer) <= nearby?.range) {
//                     if (type == "user" && nearby?.pushNotification && nearby?.newjoinerStatus) {
//                         sendPushNotification({
//                             type: "New user joined",
//                             tokens: nearby?.fcmToken,
//                             title: `New user joined`,
//                             content: `${nearby?.username} is joined`,
//                         });
//                     }
//                 }

//             });

//             await Promise.all(notificationPromises);
//         }

//         // return nearbyUsers;
//     } catch (error) {
//         console.error("Error finding nearby users:", error);
//         return [];
//     }
// };

export const GroupLikeEventGroupjoinRequestUsersCounts = async (data) => {
    // console.log("counts_data", data)
    try {
        let { userId, io, instanceId, BlockUser } = data
        console.log("sdfsfsdsdg", instanceId, userId, BlockUser);

        let [resp, likeData, EventCreateCounts, RequestUsers, GroupJoinedCount, FindNotification] = await Promise.all([
            Group.find({ groupCreater: new ObjectId(userId), members: { $in: [new ObjectId(userId)] } }),
            Like.findOne({ userId: new ObjectId(userId) }),
            Event.find({ userId: new ObjectId(userId), event_status: { $in: ["comingsoon", "started"] } }),
            follownotify.find({ to: new ObjectId(userId), status: "pending" }),
            Group.find({
                isGroupchat: true,
                "iseventchat": false,
                groupCreater: { $ne: new ObjectId(userId) },
                members: { $in: [new ObjectId(userId)] }
            }),
            Notification.find({ to: new ObjectId(userId), seen: false }),

        ])

        let Eventcreatecounts = EventCreateCounts?.length > 0 ? EventCreateCounts?.length : 0;
        let requestusersCounts = RequestUsers?.length > 0 ? RequestUsers?.length : 0;
        let JoinedCounts = GroupJoinedCount?.length > 0 ? GroupJoinedCount?.length : 0;
        let NotifyCount = FindNotification?.length > 0 ? FindNotification?.length : 0;
        const isBlocked = BlockUser?.includes(userId?.toString()) || false;
        console.log("isBlockedisBlocked", isBlocked);

        let privateCount = 0;
        if (!isBlocked) {
            let aggragatePrivateChatCounts = await PrivateMessageChatCounts({ userId: userId, DBName: ChatModel });
            // console.log("aggragatePrivateChatCounts",JSON.stringify(aggragatePrivateChatCounts, null, 2));

            let PrivateChatCounts = aggragatePrivateChatCounts?.data?.filter((el => el?.PrivateChatCounts?.length > 0));
            // blockUser = blockUser == undefined ? false : blockUser
            privateCount =
                // (!blockUser) ? 0 : 
                PrivateChatCounts?.length > 0 ? PrivateChatCounts?.length : 0
            console.log("privateCount", privateCount, userId);

            if (privateCount || privateCount == 0) {
                console.log("Singlechat_counts----------->");
                io?.to(userId?.toString()).emit("Singlechat_counts", { SingleChatCounts: privateCount, userId, api: "GroupLikeEventGroupjoinRequestUsersCounts" });
            }
        }

        let aggragateEventChatCounts = await eventMessageChatCounts({ userId: userId, DBName: ChatModel });
        console.log("aggragateEventChatCounts", JSON.stringify(aggragateEventChatCounts, null, 2));

        let EventChatCounts = aggragateEventChatCounts?.data?.filter((el => el?.eventChatCounts?.length > 0));
        const eventCount = EventChatCounts?.length > 0 ? EventChatCounts?.length : 0
        console.log("eeeeeventCount", eventCount);

        if (eventCount || eventCount == 0) {
            console.log("userId_eventChatssss", userId, userId?.toString(), eventCount);
            io?.to(userId?.toString()).emit("eventchat_counts", { eventChatCounts: eventCount, userId, api: "GroupLikeEventGroupjoinRequestUsersCounts" });
        }

        let payload = {
            Groupcounts: resp,
            NotificationCount: NotifyCount,
            LikeData: likeData?.length > 0 ? likeData : [],
            GroupJoinedCount: JoinedCounts,
            EventCreateCounts: Eventcreatecounts,
            requestusersCounts: requestusersCounts,
            SingleChatCounts: privateCount,
            eventChatCounts: eventCount
        }
        return payload;
    } catch (error) {
        console.log("error", error);
    }
}

// came lat and long to return
export const findDistanceAndLocation = async (data) => {
    console.log("findDistanceAndLocation", data);
    try {
        const { longitude, latitude } = data
        let latlong = {
            parsedLongitude: parseFloat(longitude),
            parsedLatitude: parseFloat(latitude)
        }
        return latlong;

    } catch (error) {
        console.log("error", error);
    }
}


export const passwordForgetfunc = async (req, res, DbName) => {
    try {
        const { body: { email, newpassword } } = req

        const hash = await bcrypthash(newpassword)

        console.log("password", hash, email);
        let createpawd = await DbName.findOneAndUpdate({ email: email }, { password: hash }, { new: true })
        console.log("createpawd", createpawd);
        if (createpawd) {
            return res.status(200).json(EncryptData({ status: true, message: t((createpawd && createpawd.language) ? createpawd.language : "english", "pass_created"), data: createpawd }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((createpawd && createpawd.language) ? createpawd.language : "english", "pass_create_fail"), data: createpawd }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }


}


export const Userchangepasswordfunc = async (req, res, DbName) => {
    console.log("sdfgsdgsdg", DbName, req.body);
    const { body: { confirmpassword, email, oldpassword }, user } = req
    try {
        let changepass = await DbName.findOne({ email: email })
        console.log("dfgfgfxxxxg", changepass);


        const match = await bcryptcompare(oldpassword, changepass?.password);
        console.log("changepass", match);
        if (match == true) {

            const hashed = await bcrypthash(confirmpassword)

            let commondata = await DbName.findOneAndUpdate({ email: email }, { password: hashed }, { new: true })
            if (commondata && confirmpassword) {
                res.send(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "pass_change_success") }))
                await Node_Mailer({ EmailId: commondata?.email, Subject: 'your password have changed', Content: `your password have changed successfully`, Type: "change_password", username: commondata?.username })

            }
            else {
                return res.send(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "pass_change_failed") }))
            }
        }
        else {
            return res.send(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "old_pass_wrong") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)

    }

}


export const CreateEventChats = async (data) => {
    console.log("dataaaa", data);
    try {
        const { type, userId, eventMembers, privacy_status, eventhobbies, eventTitle, description, eventRandomIndex, eventprofile, eventId } = data

        // Create new chat instance
        if (type == "add") {
            const newChat = new ChatModel({
                members: eventMembers,
                eventId: eventId,
                groupIndex: eventRandomIndex ? eventRandomIndex : "",
                isGroupchat: true,
                chatName: eventTitle,
                groupDiscription: description ? description : "",
                groupCreater: new ObjectId(userId),
                groupAdmin: [new ObjectId(userId)],
                grouphobbies: eventhobbies ? eventhobbies : [],
                isPrivate: privacy_status != "public" ? true : false,
                iseventchat: true,
                Image: eventprofile ? eventprofile : "",
            });
            await newChat.save();
        }
        else {
            const findEvent = await ChatModel.findOne({ eventId: new ObjectId(eventId) }).populate({ path: "eventId", select: "_id eventTitle description eventhobbies" })
            await ChatModel.findOneAndUpdate({ eventId: new ObjectId(eventId) }, {
                $set: {
                    chatName: eventTitle ? eventTitle : findEvent?.eventId?.eventTitle,
                    groupDiscription: description ? description : findEvent?.eventId?.description,
                    isPrivate: privacy_status ? privacy_status != "public" ? true : false : false,
                    grouphobbies: eventhobbies ? eventhobbies : findEvent?.eventId?.eventhobbies,
                    members: eventMembers ? eventMembers : findEvent?.members,
                    Image: eventprofile ? eventprofile : "",
                    groupIndex: eventRandomIndex ? eventRandomIndex : "",
                    eventId: eventId
                }
            }, { new: true });
        }

    } catch (error) {
        console.log("error", error);

    }

}

//remove space
export const cleanSpace = (data) => {
    try {
        return data?.trim().toLowerCase().replace(/\s+/g, '');
    } catch (error) {
        console.log("error", error);
    }
}
/* export const AccountDeleteVerifyOTPfunc = async (req, res, DbName) => {
    console.log("AccountDeleteVerifyOTPfunc", req.body, DbName);

    try {

        let dataverify = await DbName.findOne({ email: req.body.email })
        console.log("fggggg", dataverify);
        const otpUpdateTime = new Date(dataverify.updatedAt);
        let stratdate = new Date(otpUpdateTime.getTime() + 5 * 60000)
        console.log("trprtrt", dataverify, DecryptData(dataverify.OTP), new Date(dataverify.updatedAt).getMinutes(), stratdate, stratdate > new Date().getMinutes());
        if (req.body.OTP == DecryptData(dataverify.OTP)) {
            if (new Date().getDate() == new Date(dataverify?.updatedAt).getDate() && new Date().getHours() == new Date(dataverify?.updatedAt).getHours() && stratdate > new Date().getMinutes()) {
                // let resp = await User.findOneAndUpdate({ email: req.body.email }, { delete: true, socketId: "", fcmToken: [], login_status: false, authToken: "" }, { new: true })
                let resp = await User.findOneAndDelete({ email: req.body.email })

                await Promise.all([
                    follownotify.bulkWrite([{ deleteMany: { filter: { userId: dataverify?._id } } }]),
                    Event.bulkWrite([{ deleteMany: { filter: { userId: dataverify?._id } } }]),
                    ChatModel.bulkWrite([{ deleteMany: { filter: { groupCreater: dataverify?._id } } }]),
                    ChatModel.updateMany(
                        { members: dataverify?._id },
                         { $pull: { members: dataverify?._id } }
                    )

                ]);

                console.log("responses", resp);
                if (resp) {
                    res.status(200).json(EncryptData({ status: true, message: "You have deleted your account", data: resp }))
                    let SendMail = await Node_Mailer({ Type: "deleteaccount", EmailId: resp.email, Subject: 'Delete Account in Meeting Application', username: resp.name })
                    // console.log(SendMail)
                }
                else {
                    res.status(200).json(EncryptData({ status: false, message: "Something error" }))
                }

            }
            else {
                return res.send(EncryptData({ status: false, message: 'OTP is expired' }));
            }

        }
        else {
            return res.send(EncryptData({ status: false, message: "OTP is incorrect" }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }

} */
export const deleteFileIfExists = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file ${filePath}:`, err);
            } else {
                console.log(`Deleted: ${filePath}`);
            }
        });
    } else {
        console.log(`File not found: ${filePath}`);
    }
};

export const t = (lang, key) => {
    lang = lang ? lang : "english";
    key = key ? key : "Something error";
    console.log("languages_for_all", lang, "key", key);
    return languages[lang]?.[key] || languages["english"][key] || key;
};

export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in KM
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// export const Imagecompress = async (data) => {
//     console.log("Imagecompress", data);
//     try {
//         let { image } = data;
//         console.log("comp_image", image);

//         let inputBuffer;
//         if (typeof image === 'string') {
//             inputBuffer = fs.readFileSync(image);
//         } else if (image && image.data) {
//             inputBuffer = image.data;
//         } else {
//             throw new Error('Invalid image format provided.');
//         }

//         // HEIC/HEIF Handling
//         if (image.mimetype == 'image/heif' || image.mimetype == 'image/heic') {
//             const detectedType = await fromBuffer(inputBuffer);
//             if (!detectedType) {
//                 throw new Error('Unable to determine the image format.');
//             }

//             const outputBuffer = await heicConvert({
//                 buffer: inputBuffer,
//                 format: 'JPEG',
//                 quality: 1
//             });

//             // Now compress JPEG to WebP
//             const webpBuffer = await sharp(outputBuffer, { failOnError: false })
//                 .webp({ quality: 70, reductionEffort: 6 })
//                 .toBuffer();

//             return webpBuffer;
//         } else {
//             // Compress and convert to WebP
//             const webpBuffer = await sharp(inputBuffer, { failOnError: false, animated: true })
//                 .webp({ quality: 70, reductionEffort: 6 })
//                 .toBuffer();

//             return webpBuffer;
//         }

//     } catch (error) {
//         console.error('Error processing image:', error);
//         throw error;
//     }
// };
export const Imagecompress = async (data) => {
    try {
        let { image } = data;

        let inputBuffer;
        if (typeof image === 'string') {
            inputBuffer = fs.readFileSync(image);
        } else if (image && image.data) {
            inputBuffer = image.data;
        } else {
            throw new Error('Invalid image format provided.');
        }

        const detected = await FileType.fromBuffer(inputBuffer);
        console.log("detected:", detected);


        if (detected && (detected.mime === 'image/heic' || detected.mime === 'image/heif')) {

            const jpegBuffer = await heicConvert({
                buffer: inputBuffer,
                format: 'JPEG',
                quality: 0.9
            });

            return await sharp(jpegBuffer)
                .webp({ quality: 70, reductionEffort: 6 })
                .toBuffer();
        }


        return await sharp(inputBuffer, { failOnError: false, animated: true })
            .webp({ quality: 70, reductionEffort: 6 })
            .toBuffer();

    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};
function getRandomInt() {
    return Math.floor(Math.random() * 20);
}

export const uploadImageToS3 = async ({ fileBuffer, fileMimetype, filePath, index, extension = "" }) => {
    console.log("vvvvvvvvvvv", fileBuffer, fileMimetype, index, config.CDN_URL);

    try {
        const uniqval = getRandomInt();
        console.log("FFFFFF", uniqval);
        const indexVal = index ? index : uniqval
        const compressimgname = extension ? `${Date.now()}_${indexVal}.${extension}` : `${Date.now()}_${indexVal}.webp`;
        const folder = extension ? "audios" : "images"
        const params = {
            Bucket: config.S3_BUCKET_NAME,
            Key: `${folder}/${filePath}/${compressimgname}`,
            Body: fileBuffer,
            ContentType: fileMimetype || 'image/webp'
        };
        const upload = await s3.upload(params).promise();
        console.log("aws_uploadupload", upload);
        const AwsUrl = upload?.Location?.split(".com")[1];
        // const imageUrl = `${config.CDN_URL}${AwsUrl}`   // store with full Link
        const imageUrl = `${AwsUrl}`

        console.log("CDN_urlCDN_url", imageUrl);

        return imageUrl;
    } catch (error) {
        console.log("error", error)
    }
}

export const deleteImageFromS3 = async (s3Key) => {
    console.log("deleteobject", s3Key)
    try {
        if (s3Key) {
            const params = {
                Bucket: config.S3_BUCKET_NAME,
                Key: s3Key, // Only the path inside bucket, NOT full URL
            };

            try {
                const result = await s3.deleteObject(params).promise();
                console.log('S3 Deletion Success:', result);
                //   return true;
                return {
                    success: true,
                    message: `File '${s3Key}' deleted successfully.`,
                    s3Response: result,
                };
            } catch (error) {
                console.error('S3 Deletion Error:', error);
                throw error;
            }
        }
        else {
            console.error('S3 Deletion key error:');
        }
    }
    catch (error) {
        console.log("S3 deletion key error", error)
        throw error;
    }
};

// export const socketCreateMessage = async (data) => {
//     console.log("socketCreateMessage", data);
//     try {
//         const { findchat, chattingPerson, io, member, BlockUser, chatId } = data;
//         console.log("GGTTTTTTTTT", member?.[0]?._id);
//         const blockUser = BlockUser && BlockUser.length > 0 ? BlockUser?.some(elt => elt.toString() != chatId.toString()) : false;
//         console.log("blockUserblockUser", blockUser, !findchat?.isGroupchat && chattingPerson && blockUser, member?.[0]?._id);

//         if (!findchat?.isGroupchat && chattingPerson && blockUser) {
//             const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: member?.[0]?._id, io, blockUser });
//             io.sockets.in(member?.[0]?._id?.toString()).emit("Singlechat_counts", {
//                 SingleChatCounts: result?.SingleChatCounts
//             });
//         }
//         if (findchat?.isGroupchat && findchat?.iseventchat) {
//             const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: member?.[0]?._id, io });
//             console.log("rhbggthtr__result", result);

//             io.sockets.in(member?.[0]?._id?.toString()).emit("eventchat_counts", {
//                 eventChatCounts: result?.eventChatCounts
//             });
//         }
//     } catch (error) {
//         console.log("error", error);
//     }
// }

export const saveNotification = async ({
    from,
    to,
    action,
    message,
    type,
    status,
    userId,
    io,
    ...extraFields
}) => {
    try {
        const activitysave = {
            DBName: Notification,
            Data: {
                userId: userId || from,
                from: new ObjectId(from),
                to: new ObjectId(to),
                action,
                message,
                type,
                status,
                ...extraFields
            }
        };
        console.log("activitysave=======>", activitysave);
        const notificationSave = await Save(activitysave);
        if (notificationSave) {
            const notificationCount = await Notification.countDocuments({ to: new ObjectId(to), seen: false });
            console.log("🚀 ~ saveNotification ~ notificationCount:", notificationCount)
            io?.to(to?.toString()).emit("notification_counts", { status: true, message: "Notification Counts", data: notificationCount })
            console.log("🚀 ~ saveNotification ~ notificationCount___22:", notificationCount)
        }

        // return notificationSave;
    } catch (error) {
        console.log("Notification Save Error:", error);
    }
};


export const cacheMiddleware = async (req, res, next) => {
    console.log("🚀 ~ cacheMiddleware ~ req:", req.pathname, req.path, req.originalUrl)
    const url = req.originalUrl.split("?")[0];
    console.log("🚀 ~ cacheMiddleware ~ url:", url, req.method)
    const source = req.method !== "POST" ? req.query : req.body;
    try {
        const page = source.page || null;
        console.log("🚀 ~ cacheMiddleware ~ page:", source.page)
        const limit = source.limit || null;

        const redisKey = (!isEmpty(page) || page !== "all") ? `${url}:${req.user?._id}:page:${page}:limit:${limit}` : `${url}:${req.user?._id}`;
        console.log("🚀 ~ cacheMiddleware ~ redisKey:", redisKey)
        // const cachedData = await redisClient.get(redisKey)

        // console.log("Redis Data:", cachedData)
        // let message = (req.query.page == Number(-1) || req.query.page == "all") ? t((req.user && req.user.language) ? req.user.language : "english", "all_hobbies") : t((req.user && req.user.language) ? req.user.language : "english", "search_hobbies")

        // if (cachedData) {
        //     const records = JSON.parse(cachedData);
        //     const modifyRecords = records;
        //     return res.status(200).json(EncryptData(modifyRecords))
        // }
        next();
    } catch (error) {
        console.log("🚀 ~ cacheMiddleware ~ error:", error)
        catchErrorResponse(res, error);
    }
}

export const updateRedis = async ({ keyName, updateId, dataRecords }) => {
    console.log("🚀 ~ updateRedis ~ keyName:", keyName, updateId, dataRecords)
    try {
        const key = keyName;
        const id = updateId;

        // let data = await redisClient.get(key);
        console.log("🚀 ~ updateRedis ~ data:", data)
        data = JSON.parse(data);

        const updateData = dataRecords;

        for (let i = 0; i < data.length; i++) {
            if (data[i]._id == id) {
                Object.assign(data[i], updateData);
            }
        }

        // await redisClient.set(key, JSON.stringify(data));
    } catch (error) {
        console.log("🚀 ~ updateRedis ~ error:", error)

    }
}
