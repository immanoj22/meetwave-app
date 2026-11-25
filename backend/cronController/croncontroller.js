import Event from "../ActivityController/Models/event_schema";
import cron from 'node-cron'
import Userplan from "../UserController/Models/userplan_schema"
// import * as  activityService from '../ActivityController/activity.service'
import User from "../UserController/Models/user_schema"
import Comment from "../ActivityController/Models/comments_schema"
import Whish from "../ActivityController/Models/whishlist_schema"
import { deleteImageFromS3, EventNotification, Node_Mailer, subscriptionNotification } from "../Helper/common";
import Messages from "../Chat/Models/Message_schema"
import Notification from "../Helper/Activity_schema"
import mongoose from "mongoose"
import { sendPushNotification } from "../pushnotification";
// import fs from "fs"
import ChatModel from "../Chat/Models/instance_schema";
import { app } from "../server";
var ObjectId = mongoose.Types.ObjectId

//event Datevalidation
/* export const EventChecking = async () => {
    try {
        let Data = await Event.find({ event_status: { $ne: "finished" } }).populate("userId")
        // console.log("findplan_Userplan", Data);

        // await Promise.all(Data?.map(async (val) => {
        for (let i = 0; i < Data.length; i++) {
            let val = Data[i]
            // console.log("map_values", val);
            const startdate = new Date(val?.startDate)
            // console.log("starterffg", startdate);
            const enddate = new Date(val?.endDate)

            // console.log("EventChecking_enddate", enddate);
            // console.log("EventChecking_event_details", startdate, enddate);
            // console.log("EventChecking_event_details_enddate", new Date(), "enddateenddate", startdate.toLocaleString(), enddate, "startDate", new Date().toLocaleString(), "endDate", enddate.toLocaleString());


            if (startdate > new Date() && val?.event_status == "comingsoon" && val?.event_status != "finished") {
                let UpdateplanActive = await Userplan.findOneAndUpdate({ _id: val?._id }, { isActive: "comingsoon" }, { new: true })
                let Updateplan = await activityService.EventfindOneAndUpdateService({ _id: val?._id }, { event_status: "comingsoon" })

                // console.log("event_comingsoon", Updateplan, UpdateplanActive);

            }
            if (startdate <= new Date() && val?.event_status != "finished") {
                let UpdateplanActive = await Userplan.findOneAndUpdate({ _id: val?._id }, { isActive: "started" }, { new: true })

                let Updateplan = await activityService.EventfindOneAndUpdateService({ _id: val?._id }, { event_status: "started" })

                // console.log("EventChecking_event_started", Updateplan, UpdateplanActive);

            }
            if (enddate <= new Date() && val.event_status != "finished") {
                let UpdateplanActive = await Userplan.findOneAndUpdate({ _id: val?._id }, { isActive: "finished" }, { new: true }).populate("userId")

                const Commentdelete = await Comment.deleteMany({ eventId: new ObjectId(val?._id) });
                // console.log("Deleted Comments:", Commentdelete);
                let resp = await activityService.EventfindOneAndUpdateService({ _id: val?._id }, { event_status: "finished" }, "userId")
                // console.log("responses", resp, UpdateplanActive);

                let NotificationEvent = await Notification.find({ eventId: new ObjectId(val?._id) })
                // console.log("expireresp", expireresp);
                await Promise.all(NotificationEvent?.map(async (value) => {
                    await Notification.findOneAndDelete(
                        { "eventId": new ObjectId(value?._id) },
                        { new: true }
                    );
                    
                }))
                if (resp?.userId?.pushNotification) {
                    await sendPushNotification({
                        type: "eventexpired",
                        tokens: resp?.userId?.fcmToken,
                        title: "Event expiry",
                        content: `${resp?.userId?.username} your ${resp?.eventTitle} event is finished`

                    })
                }


            }
            // console.log("datas", val);
        }
        let expireresp = await Event.find({ event_status: "finished" })
        // console.log("expireresp", expireresp);
        await Promise.all(expireresp?.map(async (value) => {
            await Whish.findOneAndUpdate(
                { "save_eventId": { $in: [new ObjectId(value?._id)] } },
                { $pull: { "save_eventId": new ObjectId(value?._id) } },
                { new: true }
            );
        }))

        // await Event.deleteMany({ event_status: "finished" })

    } catch (error) {
        console.log("error", error);
    }
} */
export const EventChecking = async () => {
    try {
        let events = await Event.find({ event_status: { $ne: "finished" } }).populate({ path: "userId", select: "_id pushNotification fcmToken username name email" });
        // console.log("🚀 ~ EventChecking ~ events:", events)

        if (!events.length) return;

        const now = new Date();

        const updateEventOps = [];   //Stores bulk update operations for the Event collection
        const updateUserPlanOps = [];
        const finishedEventIds = [];

        for (let val of events) {
            console.log("valval", val);

            const startdate = new Date(val?.startDate);
            const enddate = new Date(val?.endDate);

            if (startdate > now) {
                updateUserPlanOps.push({
                    updateOne: {
                        filter: { _id: new ObjectId(val._id) },
                        update: { isActive: "comingsoon" },
                    },
                });
                updateEventOps.push({
                    updateOne: {
                        filter: { _id: new ObjectId(val._id) },
                        update: { event_status: "comingsoon", upcomingEvent_status: "comingsoon" },
                    },
                });
            }
            if (startdate <= now && val?.event_status !== "finished") {
                updateUserPlanOps.push({
                    updateOne: {
                        filter: { _id: new ObjectId(val._id) },
                        update: { isActive: "started" },
                    },
                });
                updateEventOps.push({
                    updateOne: {
                        filter: { _id: new ObjectId(val._id) },
                        update: { event_status: "started", upcomingEvent_status: "started" },
                    },
                });
            }
            if (enddate <= now && val?.event_status !== "finished") {
                if (val.userId?.pushNotification) {
                    await sendPushNotification({
                        type: "eventexpired",
                        tokens: val.userId.fcmToken,
                        title: "Event expiry",
                        content: `${val.userId.username}, your event '${val.eventTitle}' is finished.`,
                    });
                }
                updateUserPlanOps.push({
                    updateOne: {
                        filter: { _id: new ObjectId(val._id) },
                        update: { isActive: "finished" },
                    },
                });
                updateEventOps.push({
                    updateOne: {
                        filter: { _id: new ObjectId(val._id) },
                        update: { event_status: "finished", upcomingEvent_status: "finished" },
                    },
                });

                finishedEventIds.push(new ObjectId(val._id));

            }
        }

        // Perform bulk updates
        if (updateUserPlanOps.length) await Userplan.bulkWrite(updateUserPlanOps);
        if (updateEventOps.length) await Event.bulkWrite(updateEventOps);

        console.log("🚀 ~ EventChecking ~ finishedEventIds:", finishedEventIds)
        if (finishedEventIds.length) {
            await Promise.all([
                Comment.deleteMany({ eventId: { $in: finishedEventIds } }),
                Notification.deleteMany({ eventId: { $in: finishedEventIds } }),
                Whish.updateMany(
                    { save_eventId: { $in: finishedEventIds } },
                    { $pull: { save_eventId: { $in: finishedEventIds } } }
                ),
                ChatModel.findOneAndDelete({ eventId: { $in: finishedEventIds } }, { new: true })
            ])
        }

    } catch (error) {
        console.error("EventChecking Error:", error);
    }
};
//plan Datevalidation
//This format "2024-07-17 01:23:51 PM"
/* export const subscriptionValidateCheck = async () => {
    try {
        let findplan = await Userplan.find({ isActive: { $ne: "expired" } }).populate("userId")
        // console.log("subs_records", findplan);

        // await Promise.all(findplan?.map(async (value) => {
        for (let i = 0; i < findplan?.length; i++) {

            let value = findplan[i]
            let options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const startDate = new Date(value.startDate);
            const endDate = new Date(value.EndDate);
            let EndDate = new Date(value.EndDate).toLocaleString()
            let currentDate = new Date();
            let subscriptionNotifiy = await subscriptionNotification(value)

            // console.log("subscriptionNotifiy", currentDate.toISOString(),"gggggggggggggggggg",subscriptionNotifiy.toISOString(),toDateString(), subscriptionNotifiy.toLocaleString('en-US', options));
            // setTimeout(async()=>{
            if (currentDate.toISOString() == subscriptionNotifiy.toISOString()) {
                if (value?.userId?.pushNotification) {
                    await sendPushNotification({
                        type: "plansubscribe",
                        tokens: value?.userId?.fcmToken,
                        title: "Subscription Plan Expiry",
                        content: `Your plan has expired soon at ${EndDate}, please subscribe to create unlimited event, group and choose hobbies.`

                    })
                }
            }

            if (new Date().getDate() == new Date(subscriptionNotifiy).getDate() && new Date().getMonth() == new Date(subscriptionNotifiy).getMonth() && new Date().getFullYear() == new Date(subscriptionNotifiy).getFullYear() && new Date().getHours() == new Date(subscriptionNotifiy).getHours() && new Date().getMinutes() == new Date(subscriptionNotifiy).getMinutes() && new Date().getSeconds() == new Date(subscriptionNotifiy).getSeconds() && value.isActive != "expired") {
                let SendMail = await Node_Mailer({ Type: "planexpirysoon", EmailId: value?.userId?.email, Subject: 'Meeting Application', Content: `your plan has expired soon at ${EndDate}, please subscribe`, username: value?.userId?.name })
                // console.log("SendMail", SendMail);
            }
            // },3000)


            // console.log("enddates", new Date(), "startDateinDB", startDate.toLocaleString(), endDate, "startDate", new Date().toLocaleString(), "endDate", endDate.toLocaleString());

            if (startDate > new Date() && value?.isActive != "expired") {
                let UpdateplanActive = await Userplan.findOneAndUpdate({ _id: value?._id }, { isActive: "comingsoon" }, { new: true })

                let Updateplan = await activityService.UserPlanfindOneAndUpdateService({ _id: value?._id }, { isActive: "comingsoon" })

                // console.log("event_comingsoon", Updateplan, UpdateplanActive);
            }
            if (startDate <= new Date() && value?.isActive != "expired") {
                let UpdateplanActive = await Userplan.findOneAndUpdate({ _id: value?._id }, { isActive: "started" }, { new: true })

                let Updateplan = await activityService.UserPlanfindOneAndUpdateService({ _id: value?._id }, { isActive: "started" })

                // console.log("event_started", Updateplan, UpdateplanActive);
            }
            // let expireresp = await Userplan.find({ isActive: "expired" })
            // await expireresp?.map(async (value) => {
            //     await User.findOneAndUpdate(
            //         { "plan": { $in: [value._id] } },
            //         { $pull: { "plan": value._id } },
            //         { new: true }
            //     );
            // })

            if (endDate <= new Date() && value?.isActive != "expired") {
                // let resp = await Userplan.findOneAndUpdate({ _id: value._id }, { isActive: "expired" }, { new: true })
                let UpdateplanActive = await Userplan.findOneAndUpdate({ _id: value?._id }, { isActive: "expired" }, { new: true })
                let resp = await activityService.UserPlanfindOneAndUpdateService({ _id: value?._id }, { isActive: "expired" }, "userId")
                if (resp?.userId?.pushNotification) {
                    await sendPushNotification({
                        type: "eventexpired",
                        tokens: resp?.userId?.fcmToken,
                        title: "Subscription plan expired",
                        content: `${resp?.userId?.name} your plan is expired,subscribed to create event,group and hobbies`

                    })
                }
                // console.log("responses", resp, UpdateplanActive);
            }
        }
        let expireresp = await Userplan.find({ isActive: "expired" })
        await Promise.all(expireresp?.map(async (value) => {
            await User.findOneAndUpdate(
                { "plan": { $in: [value?._id] } },
                { $pull: { "plan": value?._id } },
                { new: true }
            );
        }))
    } catch (error) {
        console.log("error", error);
    }
} */
export const subscriptionValidateCheck = async () => {
    let io = app.get("io");
    try {
        let findplan = await Userplan.find({ isActive: { $ne: "expired" } }).populate({ path: "userId", select: "_id pushNotification fcmToken username email name" });
        let currentDate = new Date();

        // Prepare bulk update operations
        let bulkUpdates = [];

        for (let value of findplan) {
            let startDate = new Date(value.startDate);
            let endDate = new Date(value.EndDate);
            let originalEndDate = new Date(value?.subscriptionEndDate);
            let subscriptionNotifiy = await subscriptionNotification(value, 20);
            let subscriptionExpirysoonNotifiy = await subscriptionNotification(value, 5);


            if (currentDate.getTime() == subscriptionNotifiy.getTime() && value.isActive == "started") {
                // Send push notification
                if (value?.userId?.pushNotification) {
                    await sendPushNotification({
                        type: "plansubscribe",
                        tokens: value?.userId?.fcmToken,
                        title: "Subscription Expiry Soon!",
                        // content: `Your plan is set to expire on ${endDate.toLocaleString()}, Don’t forget to renew to keep enjoying all.`
                        content: `Your plan expires on ${originalEndDate?.toLocaleString()}. Grace period until ${endDate?.toLocaleString()}. Renew to continue access.`
                    });
                }
                // Send email notification
                await Node_Mailer({
                    Type: "planexpirysoon",
                    EmailId: value?.userId?.email,
                    Subject: "Subscription Expiry Soon!",
                    // Content: `Your plan expires soon at ${endDate?.toLocaleString()}, Don’t forget to renew to keep enjoying all.`,
                    Content: `Your plan expires on ${originalEndDate?.toLocaleString()}. A grace period extends access for 15 days, until ${endDate?.toLocaleString()}. Renew before then to continue enjoying all features.`,
                    username: value?.userId?.username
                });
            }

            if (currentDate.getTime() == subscriptionExpirysoonNotifiy.getTime() && value.isActive == "started") {
                // Send push notification
                if (value?.userId?.pushNotification) {
                    await sendPushNotification({
                        type: "plansubscribe",
                        tokens: value?.userId?.fcmToken,
                        title: "Subscription Expiry Warning!",
                        content: `Your grace period is set to expire on ${endDate.toLocaleString()}, Don’t forget to renew to keep enjoying all.`
                    });
                }
                // Send email notification
                await Node_Mailer({
                    Type: "planexpirysoon",
                    EmailId: value?.userId?.email,
                    Subject: "Subscription Expiry Warning!",
                    Content: `Your grace period expires soon at ${endDate?.toLocaleString()}, Don’t forget to renew to keep enjoying all.`,
                    username: value?.userId?.username
                });
            }

            // Bulk update preparation
            if (startDate > currentDate) {
                bulkUpdates.push({
                    updateOne: {
                        filter: { _id: new ObjectId(value._id) },
                        update: { $set: { isActive: "comingsoon" } }
                    }
                });
            }
            if (startDate <= currentDate && value.isActive !== "expired") {
                bulkUpdates.push({
                    updateOne: {
                        filter: { _id: new ObjectId(value._id) },
                        update: { $set: { isActive: "started" } }
                    }
                });
            }
            if (endDate <= currentDate && value.isActive !== "expired") {
                bulkUpdates.push({
                    updateOne: {
                        filter: { _id: new ObjectId(value._id) },
                        update: { $set: { isActive: "expired" } }
                    }
                });

                await io?.sockets.to(value?.userId?._id?.toString()).emit("expiredPlan", `Your plan has expired. Re-activate now to enjoy all the benefits.`);
            }
        }

        // Execute bulk updates in one query
        if (bulkUpdates.length > 0) {
            await Userplan.bulkWrite(bulkUpdates);
        }

        // Remove expired plans from users
        let expiredPlans = await Userplan.find({ isActive: "expired" });
        let userUpdates = expiredPlans?.length > 0 && expiredPlans?.map((plan) => ({
            updateOne: {
                filter: { "plan": plan._id },
                update: { $pull: { "plan": plan._id } }
            }
        }));

        if (userUpdates.length > 0) {
            await User.bulkWrite(userUpdates);
        }

    } catch (error) {
        console.log("Error in subscription validation:", error);
    }
};


export const ImageExpiry = async () => {
    console.log("ImageExpiry");
    try {
        // const fileUploadDir = './public/Chatimage/';
        // const fileUploadDirCompress = './public/Chatimage/Compress';

        let resp = await Messages.find({ "delete_image": false, createdAt: { $lte: new Date(new Date().setDate(new Date().getDate() - 7)) } })
        for (let i = 0; i < resp?.length; i++) {
            const deleteFilesArray = [];
            if (resp[i]?.file?.length > 0) {
                for (let j = 0; j < resp[i]?.file; j++) {
                    let imageData = resp[i]?.file[j];
                    deleteFilesArray.push(imageData);
                    // console.log("imageDataimageData",imageData);

                    // const oldImagePath = `${fileUploadDir}${imageData}`;
                    // if (imageData && fs.existsSync(oldImagePath)) {
                    //     await fs.unlinkSync(oldImagePath);
                    // }
                }
            }
            if (resp[i]?.voicerecord?.length > 0) {
                for (let j = 0; j < resp[i]?.voicerecord; j++) {
                    let voicerecordVal = resp[i]?.voicerecord[j];
                    deleteFilesArray.push(voicerecordVal);

                    // const oldImagePath = `${fileUploadDir}${voicerecordVal}`;
                    // if (voicerecordVal && fs.existsSync(oldImagePath)) {
                    //     await fs.unlinkSync(oldImagePath);
                    // }
                }
            }
            if (resp[i]?.compressfile?.length > 0) {
                for (let j = 0; j < resp[i]?.compressfile; j++) {
                    let compressfileVal = resp[i]?.compressfile[j];
                    deleteFilesArray.push(compressfileVal);


                    // const oldImagePath = `${fileUploadDirCompress}${compressfileVal}`;
                    // if (compressfileVal && fs.existsSync(oldImagePath)) {
                    //     await fs.unlinkSync(oldImagePath);
                    // }
                }
            }
            if (deleteFilesArray.length > 0) {
                deleteFilesArray.map(async (delImage, i) => {
                    const deleteImg = delImage?.slice(1)
                    await deleteImageFromS3(deleteImg);
                })
            }
            await Messages.findOneAndUpdate({ _id: resp[i]?._id }, { $set: { "compressfile": [], "voicerecord": [], "file": [] }, delete_image: true }, { new: true })

        }

    } catch (error) {
        console.log("error", error);
    }
}

export const NotificationData = async () => {
    try {
        let resp = await Notification.deleteMany({ createdAt: { $lte: new Date(new Date().setDate(new Date().getDate() - 30)) } })
    } catch (error) {
        console.log("error_notification", error);
    }
}
let emailTranserChangeDays = 7;
export const Transferverifyemail = async () => {
    try {

        const transferEmailUsers = await User.find({ transferAction: "change" });

        const CurrentData = new Date()
        for (let i = 0; i < transferEmailUsers?.length; i++) {
            let record = transferEmailUsers[i];
            const transferDate = new Date(record?.transferEmailCreated);
            transferDate.setDate(transferDate.getDate() + emailTranserChangeDays);
            if (CurrentData >= transferDate && record?.transferAction == "change") {
                const transferChanged = await User.findOneAndUpdate(
                    { _id: new ObjectId(record?._id), transferAction: "change" },
                    { email: record?.alternativeEmail, transferAction: "", alternativeEmail: "" },
                    { new: true }
                );
                // Send notification email
                await sendPushNotification({
                    type: "email transfer success",
                    tokens: emailverify?.fcmToken,
                    title: "Email Transfer",
                    content: `Your new email has been successfully transferred`
                });
                await Node_Mailer({
                    Type: "transferdurationend",
                    EmailId: transferChanged?.email,
                    Subject: 'Email has been transferred successfully!.',
                    username: transferChanged?.username
                });
            }
        }
    } catch (error) {
        console.error("Error in Transferverifyemail:", error);
    }
};

let EventCheckingCronRunning = false;
let subscriptionValidateCheckCronRunning = false;
let ImageExpiryCronRunning = false;
let NotificationDataCronRunning = false;
let TransferverifyemailCronRunning = false;


// cron.schedule('0 */2 * * * *', () => EventChecking());
// cron.schedule('0 */1 * * * *', () => subscriptionValidateCheck());
// cron.schedule('0 0 0 */5 * *', () => ImageExpiry());
// cron.schedule('0 */5 * * * *', () => NotificationData());
// cron.schedule('0 */10 * * * *', () => Transferverifyemail());

cron.schedule('0 */2 * * * *', async () => {
    console.log("Running EventChecking...");
    if (!EventCheckingCronRunning) {
        EventCheckingCronRunning = true;
        await EventChecking();
        EventCheckingCronRunning = false;
    }
    else {
        console.log('EventCheckingCronRunning_already')
    }
});

cron.schedule('0 */1 * * * *', async () => {
    console.log("Running subscriptionValidateCheckCronRunning...");
    if (!subscriptionValidateCheckCronRunning) {
        subscriptionValidateCheckCronRunning = true;
        await subscriptionValidateCheck();
        subscriptionValidateCheckCronRunning = false;
    }
    else {
        console.log('subscriptionValidateCheckCronRunning_already')
    }
});

cron.schedule('0 0 0 */5 * *', async () => {
    console.log("Running ImageExpiryCronRunning...");
    if (!ImageExpiryCronRunning) {
        ImageExpiryCronRunning = true;
        await ImageExpiry();
        ImageExpiryCronRunning = false;
    }
    else {
        console.log('ImageExpiryCronRunning_already')
    }
});

cron.schedule('0 */5 * * * *', async () => {
    console.log("Running NotificationDataCronRunning...");
    if (!NotificationDataCronRunning) {
        NotificationDataCronRunning = true;
        await NotificationData();
        NotificationDataCronRunning = false;
    }
    else {
        console.log('NotificationDataCronRunning_already')
    }
});

cron.schedule('0 */2 * * * *', async () => {
    console.log("Running TransferverifyemailCronRunning...");
    if (!TransferverifyemailCronRunning) {
        TransferverifyemailCronRunning = true;
        await Transferverifyemail();
        TransferverifyemailCronRunning = false;
    }
    else {
        console.log('TransferverifyemailCronRunning_already')
    }
});