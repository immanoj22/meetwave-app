// import { EventChecking } from "../../cronController/croncontroller";
import { CreateEventChats, EncryptData, EventJoinCount, ImageAddFunc, Imagecompress, Node_Mailer, ParsingFunc, catchErrorResponse, convertToISO, deleteImageFromS3, findDistanceAndLocation, findNearbyUsersWithHobbiesAndLatLong, isEmpty, isSameDay, normalizeHobbyObjectIds, saveNotification, t, updateRedis, uploadImageToS3, userHasActivePlan } from "../../Helper/common";
import Event from "../Models/event_schema";
import Notification from '../../Helper/Activity_schema'
import { Save, UserPeoplesNearLocation, UserfollowAndfollowing, eventWithUserDetails, upcomingEventDetails } from "../../Helper/mongooseHelper";
import User from '../../UserController/Models/user_schema'
import follownotify from "../../UserController/Models/follownotify_schema"
import Comment from "../Models/comments_schema"
import Userplan from "../../UserController/Models/userplan_schema"
import Whish from "../Models/whishlist_schema"
import mongoose from "mongoose"
import { isPushNotificationEnabled, sendPushNotification } from "../../pushnotification";
import fs from "fs"
import ChatModel from "../../Chat/Models/instance_schema";
import { error, log } from "console";
import config from "../../Config/config"
import Admin from "../../AdminController/Models/admin_schema"
import { languages } from "../../languages";
const ObjectId = mongoose.Types.ObjectId

async function FollowingData(userId, userblocked) {
    console.log("useriddsss", userId, userblocked);
    let resp = await follownotify.find({ from: new ObjectId(userId), to: { $nin: userblocked }, status: "completed" }).populate({
        path: 'to', select: "_id username name profile randomIndex userblocked email fcmToken pushNotification",
        populate: {
            path: 'hobbies'
        }
    })
    // console.log("resposnses", resp);
    return resp;
}

const handleNotificationsAndEmails = async (fromUser, record, notifyRecordUserId, Id, eventcreateremail, io) => {
    console.log("fromUser_666666666666", fromUser, "record_1236666_14444444444444444", record, record.userId, "notifyRecordUserId", notifyRecordUserId, eventcreateremail);
    try {

        const blocUsers = record?.userId?.userblocked || [];
        const ChecBlockUsers = blocUsers.some(user => user.equals(fromUser?._id));
        console.log("ChecBlockUsers", ChecBlockUsers)
        // if (!ChecBlockUsers && fromUser?.pushNotification) {
        //     await sendPushNotification({
        //         type: "Event create",
        //         tokens: fromUser?.fcmToken,
        //         title: "Event Created",
        //         content: `${record?.userId?.username} has created a new event`,
        //         // extraData: { _id: fromUser?._id, type: "notification" }
        //         extraData: { _id: Id, type: "event" }

        //     });
        // }
        /* if (notifyRecordUserId && record?.userId?.pushNotification) {
            await sendPushNotification({
                type: "Event create",
                tokens: record?.userId?.fcmToken,
                title: "Event Create",
                content: `you have new event created successfully`,
                extraData: { _id: record?.userId?._id, type: "notification" }
            });
        } */

        /* if (fromUser?.emailUpdates) {
            await Node_Mailer({ EmailId: fromUser?.email, Subject: 'Event created', Type: "eventcreate", Content: `${record?.userId?.name} is new event created`, username: fromUser?.name, Eventcreatermail: eventcreateremail });

        } */
        /*   if (notifyRecordUserId && record?.userId?.emailUpdates) { */
        if (notifyRecordUserId) {
            await Node_Mailer({ EmailId: record?.userId?.email, Subject: 'Event created', Type: "eventcreate", username: record?.userId?.username, Eventcreatermail: eventcreateremail });
        }

        if (fromUser?._id) {
            // const activitysave = {
            //     DBName: Notification,
            //     Data: {
            //         userId: record?.userId?._id,
            //         action: "Event Add",
            //         status: record?.privacy_status,
            //         from: record?.userId?._id,
            //         to: fromUser?._id,
            //         message: `${record?.eventTitle} - Event created`,
            //         type: "Event",
            //         eventId: Id
            //     }
            // }
            // await Save(activitysave)
            // await saveNotification({
            //     userId: record?.userId?._id,
            //     action: "Event Add",
            //     status: record?.privacy_status,
            //     from: record?.userId?._id,
            //     to: fromUser?._id,
            //     message: `${record?.eventTitle} - Event created`,
            //     type: "Event",
            //     eventId: Id,
            //     io
            // })
        }
    } catch (error) {
        console.error("Error sending notifications and emails:", error);
    }
};

/*
 * METHOD : POST
 * BODY: (userId, eventTitle, startDate, endDate, description, latitude, longitude, privacy_status,eventAddress, eventhobbies, inviteMembers, eventRandomIndex, ishideInEvent)
 * URL : /v1/event/AddNewEvent
 */
export const AddNewEvent = async (req, res) => {
    console.log("Request Data:", req.body, req.files);
    const url = req.originalUrl.split("?")[0];
    const redisKey = `${url}:${req?.user?._id}`
    // await redisClient.del(redisKey);
    try {
        const io = req.app.get('io');
        let { body: { userId, eventTitle, startDate, endDate, description, latitude, longitude, privacy_status, eventAddress, eventhobbies, inviteMembers, eventRandomIndex, ishideInEvent }, user } = req;
        eventhobbies = Array.isArray(eventhobbies) ? eventhobbies : ParsingFunc(eventhobbies)
        let [AdminData, findUser] = await Promise.all([
            Admin.findOne({}),
            User.findOne({ _id: new ObjectId(userId) }).populate("hobbies").populate("plan")
        ]);
        const EventImageLimit = Number(AdminData?.eventImage_limit);
        const HobbyLimit = Number(AdminData?.hobby_limit);
        let arr = [];
        const currentDate = new Date();

        const startDateTime = new Date(startDate);
        console.log("🚀 ~ AddNewEvent ~ startDateTime:", startDateTime, "currentDate", currentDate)
        const endDateTime = new Date(endDate);
        // const nowStartDate = new Date(startDate);
        // const nowEndDate = new Date(endDate);
        let eventStatus = "";

        // if (
        //     startDateTime.getMinutes() >= currentDate.getMinutes() &&
        //     startDateTime.getDate() >= currentDate.getDate() &&
        //     startDateTime.getMonth() >= currentDate.getMonth() &&
        //     startDateTime.getFullYear() >= currentDate.getFullYear()
        // ) {
        //     eventStatus = "started";
        // }
        if (currentDate >= startDateTime && currentDate <= endDateTime) {
            eventStatus = "started";
        } else if (currentDate < startDateTime) {
            eventStatus = "comingsoon";
        } else {
            eventStatus = "finished";
        }

        const upcomingEvent = eventStatus === "started" ? "started" : "comingsoon";
        console.log("🚀 ~ AddNewEvent ~ eventStatus:", eventStatus)

        let Eventhobbies;
        let MappedData = await eventhobbies.map(id => new ObjectId(id))
        let [followingData, userPlans, userPlanDetails] = await Promise.all([
            FollowingData(userId, findUser?.userblocked),
            Userplan.find({ userId: new ObjectId(userId) }),
            User.findOne({ _id: new ObjectId(userId) }).populate("plan")
        ]);
        console.log("followingDatafollowingData", followingData);

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        if (findUser?.eventTitle == eventTitle) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "title_exists") }));
        }

        const today = currentDate;
        today.setHours(0, 0, 0, 0);
        const startDateOnly = new Date(startDateTime);
        startDateOnly.setHours(0, 0, 0, 0);

        if (startDateOnly < today) {
            return res.status(200).json(
                EncryptData({
                    status: false,
                    message: t(
                        user?.language || "english",
                        "start_date_invalid"
                    )
                })
            );
        }

        if (
            startDateTime.toDateString() === endDateTime.toDateString() &&
            endDateTime <= startDateTime
        ) {
            return res.status(200).json(
                EncryptData({
                    status: false,
                    message: t(
                        user?.language || "english",
                        "start_time_invalid"
                    )
                })
            );
        }
        /*    const startDatetime = startDateTime;
           startDatetime.setHours(0, 0, 0, 0);
   
           if (startDatetime < today) {
               return res.status(200).json(EncryptData({
                   status: false,
                   message: t((user && user.language) ? user.language : "english", "start_date_invalid")
               }));
           }
   
           if (isSameDay(startDateTime, endDateTime) && endDateTime <= startDateTime) {
               return res.status(200).json(EncryptData({
                   status: false,
                   message: t((user && user.language) ? user.language : "english", "start_time_invalid")
               }));
           } */
        const activePlan = findUser?.plan?.find(plan => plan?.isActive == "started");
        if (!activePlan && MappedData?.length <= HobbyLimit) {
            Eventhobbies = MappedData;
        }
        else if (activePlan) {
            Eventhobbies = MappedData;
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: `${t((user && user.language) ? user.language : "english", "free_hobby_limit")} ${HobbyLimit} ${t((user && user.language) ? user.language : "english", "free_hobby_subscribe")}` }));
        }

        const eventEndDate = new Date(endDate);

        let checkActivePlan = userPlans.find(plan => new Date(plan.EndDate) >= eventEndDate);

        if (!checkActivePlan) {
            return res.status(200).json(EncryptData({
                status: false,
                message: `${t((user && user.language) ? user.language : "english", "subscription_expired")} ${new Date(userPlans[0]?.EndDate).toLocaleString()}, ${t((user && user.language) ? user.language : "english", "end_date_blocked")}.`
            }));
        }

        let activeUserPlan = userPlanDetails.plan.find(plan => plan.isActive === "started");
        console.log("activeUserPlan", activeUserPlan);
        if (userPlans.length == 0 || userPlanDetails.plan.length == 0) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_subscription") }));
        }

        if (!activeUserPlan) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "subscribe_to_create_event") }));
        }
        // ================================
        // Handle file uploads
        // let Eventlimit = EventImageLimit.includes("-") ? EventImageLimit.split("-")[1] : EventImageLimit;

        if (req.files && req.files.eventProfile) {
            let img = req.files.eventProfile
            var Eventprofile = await ImageAddFunc([
                {
                    files: img,
                    filePath: "eventProfile"
                },
            ]);
        }

        if (req.files?.image?.length > EventImageLimit) {
            return res.status(200).json(EncryptData({ status: false, message: `${t((user && user.language) ? user.language : "english", "file_type_allowed")} ${EventImageLimit} ${t((user && user.language) ? user.language : "english", "images")}` }))
        }

        if (req?.files?.image) {
            try {
                // Ensure the directory exists
                // await fs.promises.mkdir(filePath, { recursive: true });
                // Normalize files to an array
                let files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
                // Process each image
                arr = await Promise.all(
                    files.map(async (img, i) => {
                        // let compressimgname = `${Date.now()}_${i}_compressed_image.webp`;
                        // const originalFilePath = `${filePath}/${compressimgname}`;
                        // await img.mv(originalFilePath);
                        // Compress the image
                        const compressedImageName = await Imagecompress({
                            image: img
                        });
                        const s3Url = await uploadImageToS3({ fileBuffer: compressedImageName, fileMimetype: "image/webp", filePath: "eventImages", index: i });
                        return s3Url;
                    })
                );
            } catch (error) {
                console.error("Error processing images:", error);
            }
        }
        const payload = {
            userId: new ObjectId(userId),
            eventTitle: eventTitle,
            startDate: startDate,
            endDate: endDate,
            description: description,
            image: arr,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: [longitude, latitude]
            },
            privacy_status: privacy_status,
            eventAddress: eventAddress,
            eventhobbies: Eventhobbies,
            event_status: eventStatus ? eventStatus : "comingsoon",
            upcomingEvent_status: upcomingEvent,
            eventinterested: inviteMembers && inviteMembers.map(members => ({
                userId: new ObjectId(members),
                joinstatus: true
            })),
            eventprofile: Eventprofile,
            eventRandomIndex: eventRandomIndex,
            ishideInEvent: ishideInEvent
        };
        console.log("fffffffffffffff", payload);
        // let findEvent = await Event.findOne({_id:eventId})
        const savedEvent = await new Event(payload).save();
        // console.log("Event Response", savedEvent);
        const members = Array.isArray(inviteMembers) && inviteMembers.length > 0
            ? [userId, ...inviteMembers]
            : [userId];

        if (savedEvent) {
            // create event group
            await CreateEventChats({ type: "add", userId: userId, eventMembers: members, privacy_status: privacy_status, eventhobbies: eventhobbies, eventTitle: eventTitle, description: description, eventprofile: Eventprofile, eventRandomIndex: eventRandomIndex, eventId: savedEvent?._id })
            const findUserId = await Event.findOne({ _id: savedEvent?._id }).populate({ path: "userId", select: "_id email username fcmToken pushNotification emailUpdates email" });
            // console.log("User ID:", findUserId);

            // Send notifications and emails following users
            let followersData = [new ObjectId(userId)]
            await Promise.all(followingData.map(async (following) => {
                console.log("followingDetails0", following?.to);
                followersData.push(following?.to?._id)
                if (following?.to) {
                    // let findUnblockUser = await User.find({_id:})
                    handleNotificationsAndEmails(following?.to, findUserId, false, savedEvent?._id, userPlanDetails?.email, io);
                }
            }));
            console.log("dfsgsergfretgt5rertfre4", followersData);

            // if (findUserId?.userId) {
            //     handleNotificationsAndEmails(null, findUserId, true, "", userPlanDetails?.email, io);
            // }
            findNearbyUsersWithHobbiesAndLatLong(userPlanDetails, findUser?.location?.coordinates[0], findUser?.location?.coordinates[1], findUser?.locationDistance, savedEvent?.eventhobbies, "event", followersData, savedEvent, io)

            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "event_created"), data: findUserId }));
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }));
        }
    } catch (error) {
        catchErrorResponse(res, error);
    }
};

/*
 * METHOD : POST
 * BODY: (eventId, eventTitle, startDate, endDate, description, latitude, longitude, privacy_status,image, Delete, eventAddress, eventhobbies, inviteMembers, eventRandomIndex, ishideInEvent)
 * URL : /v1/event/EditEvent
 */
export const EditEvent = async (req, res) => {
    console.log("Request Data:", req.body, req.files);
    try {
        let { body: { userId, eventId, eventTitle, startDate = "", endDate = "", description, latitude, longitude, privacy_status, image, Delete, eventAddress, eventhobbies, inviteMembers, eventRandomIndex, ishideInEvent, newMembers }, user } = req;
        newMembers = ParsingFunc(newMembers)
        const io = req?.app?.get("io")
        const AdminData = await Admin.findOne({});
        console.log("eventImage_limit", AdminData)
        const EventImageLimit = Number(AdminData?.eventImage_limit);
        const HobbyLimit = Number(AdminData?.hobby_limit);
        // let Imagesparse = ParsingFunc(image)
        let DeleteImage = (Delete?.length > 0 && Array.isArray(Delete)) ? typeof Delete == "string" ? ParsingFunc(Delete) : Delete : [];

        eventhobbies = Array.isArray(eventhobbies) ? eventhobbies : ParsingFunc(eventhobbies)
        const currentDate = new Date()
        console.log(":DeleteImage", DeleteImage);
        let Eventhobbies;
        let MappedData = await eventhobbies?.map(id => new ObjectId(id))
        console.log("eventhobbieseventhobbies", MappedData);

        let files = req?.files?.image;

        const [event, finduser] = await Promise.all([
            Event.findOne({ _id: new ObjectId(eventId) }).populate({ path: "eventinterested.userId", select: "_id randomIndex username profile email" }).lean(),
            User.findOne({ _id: new ObjectId(userId) }).populate("hobbies").populate("plan")
        ]);

        const startDateTime = startDate ? new Date(startDate) : null;
        const endDateTime = endDate ? new Date(endDate) : null;

        let eventStatus = "";
        if (!(startDateTime == event.startDate) || (startDateTime && endDateTime) || (event?.event_status === "comingsoon")) {
            if (currentDate >= startDateTime && currentDate <= endDateTime) {
                eventStatus = "started";
            } else if (currentDate < startDateTime) {
                eventStatus = "comingsoon";
            } else {
                eventStatus = "finished";
            }
        }
        console.log("findUser_findUser", finduser)
        const upcomingEvent = eventStatus === "started" ? "started" : "comingsoon";
        if (!finduser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));

        }
        if (req.files?.image?.length > EventImageLimit) {
            return res.status(200).json(EncryptData({ status: false, message: `${t((user && user.language) ? user.language : "english", "file_type_allowed")} ${EventImageLimit} ${t((user && user.language) ? user.language : "english", "file_type_images")}` }))
        }

        const today = currentDate;
        today.setHours(0, 0, 0, 0);

        const startDatetime = startDateTime;
        startDatetime.setHours(0, 0, 0, 0);

        if (startDatetime < today) {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "start_date_invalid")
            }));
        }

        if (isSameDay(startDateTime, endDateTime) && endDateTime <= startDateTime) {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "start_time_invalid")
            }));
        }

        if (!event) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "event_not_found") }));
        }

        if (!finduser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        if (!userHasActivePlan(finduser)) {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "free_hobby_subscribe"),
            }));
        }

        /* if (event?.eventTitle !== eventTitle) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "title_exists") }));
        } */
        const activePlan = finduser?.plan.find(plan => plan.isActive == "started");
        console.log("activPlansDatra", activePlan)
        if (!activePlan && MappedData?.length <= HobbyLimit) {
            Eventhobbies = MappedData;
        }
        else if (activePlan) {
            Eventhobbies = MappedData;
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: `${t((user && user.language) ? user.language : "english", "free_hobby_limit")} ${HobbyLimit} ${t((user && user.language) ? user.language : "english", "free_hobby_subscribe")}` }));
        }
        console.log("Eventhobbiesbies111", Eventhobbies);

        // let arr = [];
        // let ImgArray = [];
        // const filePath = `public/Eventimage/`;
        if (DeleteImage && DeleteImage != undefined) {
            if (Array.isArray(event.image)) {
                // Iterate through each image in DeleteImage
                const imagesToDelete = DeleteImage?.map(async (images) => {
                    console.log("imagesToDelete", images);
                    const deleteImg = images?.slice(1)
                    await deleteImageFromS3(deleteImg)
                    const updatedEvent = await Event.findOneAndUpdate(
                        { _id: new ObjectId(eventId), image: { $in: images } },
                        { $pull: { image: images } }, // Use $in to pull multiple images
                        { new: true }
                    );

                    console.log("Updated Event after removing images:", updatedEvent);
                })

            } else {
                console.log("Event image field is not an array.");
            }
        }

        if (req.files && req.files.eventProfile) {

            let img = req.files.eventProfile
            var Eventprofile = await ImageAddFunc([
                {
                    files: img,
                    filePath: "eventProfile"
                },
            ]);
        }

        // console.log("EventprofileEventprofile", Eventprofile);

        if (req.files?.image) {
            // await fs.promises.mkdir(filePath, { recursive: true });
            if (!Array.isArray(files)) {
                files = [req?.files?.image];
            }
            if (Array.isArray(files)) {
                console.log("arrays_pushh");
                await Promise.all(files.map(async (img, i) => {
                    console.log("imnmfar", img);

                    let CompressImage = await Imagecompress({ image: img })
                    console.log("CompressImage", CompressImage);

                    // var multiimg = Date.now() + i + ".webp";
                    const s3Url = await uploadImageToS3({ fileBuffer: CompressImage, fileMimetype: "image/webp", filePath: "eventImages", index: i });

                    // arr.push(multiimg);
                    // console.log("arrays_pushh", arr);
                    // await img.mv(filePath + multiimg);
                    await Event.findOneAndUpdate(
                        { _id: new ObjectId(eventId) },
                        { $push: { image: s3Url } },
                        { new: true }
                    );
                }));
            }
        }
        // Update the event details
        const updatePayload = {
            eventTitle: eventTitle ? eventTitle : event?.eventTitle,
            // startDate: convertToISO(startDate.split(" ")),
            // endDate: convertToISO(endDate.split(" ")),
            startDate: startDate ? startDate : event?.startDate,
            endDate: endDate ? endDate : event?.endDate,
            description: description ? description : event?.description,
            // event_status: "started",
            event_status: eventStatus ? eventStatus : event?.event_status,
            // image: req.files ? (req.files ? arr : Imagesparse) : event.image,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: [longitude, latitude]
            },
            privacy_status: privacy_status ? privacy_status : event?.privacy_status,
            eventAddress: eventAddress ? eventAddress : event?.eventAddress,
            eventhobbies: Eventhobbies ? Eventhobbies : event?.eventhobbies,
            eventinterested: inviteMembers ? inviteMembers.map(members => ({
                userId: new ObjectId(members),
                joinstatus: true
            }))
                :
                event?.eventinterested,
            eventprofile: Eventprofile ? Eventprofile : event?.eventprofile,
            eventRandomIndex: eventRandomIndex ? eventRandomIndex : event?.eventRandomIndex,
            ishideInEvent: typeof ishideInEvent === 'boolean'
                ? ishideInEvent
                : (ishideInEvent !== undefined && ishideInEvent !== null
                    ? (typeof ishideInEvent === 'string' ? ParsingFunc(ishideInEvent) : Boolean(ishideInEvent))
                    : event?.ishideInEvent),
            upcomingEvent_status: upcomingEvent,


        };
        const members = Array.isArray(inviteMembers) && inviteMembers.length > 0
            ? [userId, ...inviteMembers]
            : [userId];
        const resp = await Event.findOneAndUpdate({ _id: new ObjectId(eventId) }, { $set: updatePayload }, { new: true });
        //    edit event group
        await CreateEventChats({ type: "edit", userId: userId, eventMembers: members, privacy_status: updatePayload?.privacy_status, eventhobbies: updatePayload?.eventhobbies, eventTitle: updatePayload?.eventTitle, description: updatePayload?.description, eventprofile: updatePayload.eventprofile, eventRandomIndex: updatePayload.eventRandomIndex, eventId: eventId ? eventId : updatePayload._id })
        let response = await User.find({ _id: { $in: newMembers } })
        response?.length > 0 && response.map(async (res) => {
            if (isPushNotificationEnabled(res?.pushNotification)) {
                await sendPushNotification({
                    type: "add event",
                    tokens: res?.fcmToken,
                    title: "Added to Event",
                    content: `${res?.username} is added to event ${resp.eventTitle}`,
                    extraData: { ...resp, "type": "eventedit" }
                });
            }
            // await Save({
            //     DBName: Notification,
            //     Data: {
            //         userId: new ObjectId(userId),
            //         action: "Event Edit",
            //         status: resp?.privacy_status,
            //         from: resp?.userId,
            //         to: res?._id,
            //         message: `${resp?.eventTitle} - Event Added to you`,
            //         type: "Event Add",
            //         eventId: resp?._id
            //     }
            // });
            await saveNotification({
                userId: new ObjectId(userId),
                action: "Event Edit",
                status: resp?.privacy_status,
                from: resp?.userId,
                to: res?._id,
                // message: `${resp?.eventTitle} - Event Added to you`,
                message: `Has added you to an Event - ${resp?.eventTitle}`,
                type: "Event Add",
                eventId: resp?._id,
                io
            })
        })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "event_updated"), data: resp }));
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }));
        }

    } catch (error) {
        catchErrorResponse(res, error);
    }
};

/*
 * METHOD : POST
 * BODY: (eventId,userId )
 * URL : /v1/event/DeleteEvent
 */
export const DeleteEvent = async (req, res) => {
    console.log("Request Data:", req.body);
    const url = req.originalUrl.split("?")[0];
    const redisKey = `${url}:${req?.user?._id}`
    // await redisClient.del(redisKey);
    try {
        const { body: { userId, eventId }, user } = req;
        console.log("🚀 ~ DeleteEvent ~ user:", user)

        let findUser = await User.findOne({ _id: user._id })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
        let resp = await Event.findOneAndUpdate({ _id: new ObjectId(eventId) }, { $set: { delete: true } }, { new: true })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "event_deleted"), data: resp }));
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }));
        }

    } catch (error) {
        catchErrorResponse(res, error);
    }
};

/*
 * METHOD : POST
 * BODY: (userId, eventId, type)
 * URL : /v1/event/eventInterest
 */
// export const eventInterest = async (req, res) => {
//     console.log("resquests", req.body);
//     try {
//         // eventId is Event schema objectId
//         // userId is User schema objectId
//         const { userId, eventId, type } = req.body
//         if (type == "interest") {

//             const event = await Event.findOne({ _id: new ObjectId(eventId), 'eventinterested.userId': new ObjectId(userId) });
//             console.log("events", event);

//             if (event && event != null) {
//                 Promise.all(await event.eventinterested.filter(async (value) => {
//                     console.log("eventdatas", value);

//                     if (value.userId == userId && value.status == true) {
//                         console.log("fgjhgj", value && value.status == true);
//                         return res.status(200).json(EncryptData({ status: false, message: "Your already interested", data: event }))
//                     }
//                     else if (value.userId == userId && value.status == false) {
//                         console.log("fgjhgj", value && value.status == false);

//                         const resp = await Event.findOneAndUpdate(
//                             { _id: new ObjectId(eventId), 'eventinterested.userId': new ObjectId(userId) },
//                             { $set: { 'eventinterested.$.status': true } },
//                             { new: true }
//                         ).populate("userId");
//                         console.log("Updated resp:", resp);

//                         if (resp) {
//                             console.log("Updated Event:", resp);
//                             res.status(200).json(EncryptData({ status: true, message: "User intereted", data: resp }))

//                             if (resp?.userId?.pushNotification) {
//                                 await sendPushNotification({
//                                     type: "eventinterest",
//                                     tokens: resp?.userId?.fcmToken,
//                                     title: "Event Interest",
//                                     content: `${resp?.userId?.username} is intereted`

//                                 })
//                             }

//                         } else {
//                             return res.status(200).json(EncryptData({ status: false, message: "Something error" }))

//                         }
//                     }
//                 }))
//             }
//             else if (!event) {
//                 console.log("fgjhgjcfgjhgnjghjmh========");

//                 const resp = await Event.findOneAndUpdate({ _id: new ObjectId(eventId) }, { $push: { "eventinterested": { userId: new ObjectId(userId), status: true } } }, { new: true }).populate("userId")
//                 console.log("respmsers", resp);
//                 res.status(200).json(EncryptData({ status: true, message: "User intereted", data: resp }))

//                 if (resp?.userId?.pushNotification) {
//                     await sendPushNotification({
//                         type: "eventinterest",
//                         tokens: resp?.userId?.fcmToken,
//                         title: "Event Interest",
//                         content: `${resp?.userId?.name} is Interested event`

//                     })
//                 }


//             }
//             else {
//                 return res.status(200).json(EncryptData({ status: false, message: "Not to interest to yourself" }))

//             }
//         }

//         else if (type == "not interest") {

//             const resp = await Event.findOneAndUpdate(
//                 { _id: eventId, 'eventinterested.userId': new ObjectId(userId) },
//                 { $set: { 'eventinterested.$.status': false } },
//                 { new: true }
//             ).populate("userId");

//             if (resp) {
//                 console.log("Updated Event:", resp);
//                 res.status(200).json(EncryptData({ status: true, message: "User not intereted", data: resp }))

//                 if (resp?.userId?.pushNotification) {
//                     await sendPushNotification({
//                         type: "eventinterest",
//                         tokens: resp?.userId?.fcmToken,
//                         title: "Event Interest",
//                         content: `${resp?.userId?.name} is not interested event`

//                     })
//                 }

//             } else {
//                 console.log("User not found in the interested list or event not found");
//                 return res.status(200).json(EncryptData({ status: false, message: "Something error" }))

//             }
//         }

//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

/*
 * METHOD : POST
 * BODY: (userId, eventId, type)
 * URL : /v1/event/UserjoinUser
 */
export const UserjoinUser = async (req, res) => {
    try {
        const { body: { userId, eventId, type }, user } = req;
        const io = req?.app?.get("io");

        const findUser = await User.findById(userId);
        if (!findUser) return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));

        if (type == "join") {
            const event = await Event.findOne({ _id: new ObjectId(eventId), 'eventinterested.userId': userId });
            // console.log("eventevent", event)
            if (event) {
                const userInterest = event?.eventinterested?.find(e => e?.userId?.toString() == userId?.toString());
                if (userInterest?.joinstatus) {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "already_joined"), data: event }));
                }
                else if (!userInterest?.joinstatus) {
                    userInterest.joinstatus = true;
                    await event.save();

                }
            } else {
                // console.log("dddvvvvvbbbbbbbbbbbb", eventId, userId);

                await Event.findByIdAndUpdate(eventId, { $push: { eventinterested: { userId, joinstatus: true } } }, { new: true });
            }

            const updatedEvent = await Event.findById(eventId).populate("userId eventinterested.userId");
            res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "joined_success"), data: updatedEvent }));
            await ChatModel.findOneAndUpdate({ eventId: new ObjectId(eventId) }, { $addToSet: { "members": new ObjectId(userId) } }, { new: true })
            // console.log("updatedEventupdatedEventupdatedEvent", updatedEvent);

            await saveNotification({
                userId: new ObjectId(userId),
                action: "Event joined",
                status: "Event joined",
                from: new ObjectId(userId),
                to: updatedEvent?.userId?._id,
                type: "Event",
                // message: `Joined ${updatedEvent.eventTitle} - event`,
                message: `Joined Event - ${updatedEvent.eventTitle}`,
                eventId: new ObjectId(eventId)
            });

            if (isPushNotificationEnabled(updatedEvent?.userId?.pushNotification)) {
                await sendPushNotification({
                    type: "Join",
                    tokens: updatedEvent.userId.fcmToken,
                    title: "Event Joined",
                    content: `${findUser.username} Joined Event - ${updatedEvent.eventTitle}`,
                    extraData: { _id: updatedEvent.userId._id, type: "notification" }
                });
            }
        } else if (type == "unjoin") {
            const updatedEvent = await Event.findOneAndUpdate(
                { _id: new ObjectId(eventId), 'eventinterested.userId': userId },
                { $set: { 'eventinterested.$.joinstatus': false } },
                { new: true }
            ).populate("userId eventinterested.userId");

            if (!updatedEvent) return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
            io?.sockets?.to(userId.toString()).emit("unjoinEventGroup", { status: true, message: "Unjoin event", data: updatedEvent })
            res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "unjoined_success"), data: updatedEvent }));
            await ChatModel.findOneAndUpdate({ eventId: new ObjectId(eventId) }, { $pull: { "members": new ObjectId(userId) } }, { new: true })
            await Notification.findOneAndDelete({ from: new ObjectId(userId), eventId: new ObjectId(eventId), type: "Event" });

        } else if (type == "get") {
            const event = await Event.findOne(
                { _id: new ObjectId(eventId), 'eventinterested.userId': userId },
                { "eventinterested.$": 1 }
            );

            return event && event?.eventinterested?.length > 0
                ? res.status(200).json(EncryptData({
                    status: true, message: t((user && user.language) ? user.language : "english", "joined_records"), data: event?.eventinterested[0]?.joinstatus
                }))
                : res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
    } catch (error) {
        catchErrorResponse(res, error);
    }
};

// export const UserjoinUser = async (req, res) => {
//     console.log("fghghghghghgh", req.body);
//     try {
//         const { userId, eventId, type } = req.body

//         let findUser = await User.findOne({ _id: userId })
//         if (type == "join") {
//             const event = await Event.findOne({ _id: eventId, 'eventinterested.userId': new ObjectId(userId) });
//             console.log("events", event);

//             if (event && event != null) {
//                 await Promise.all(event.eventinterested.map(async (value) => {
//                     console.log("eventdatas", value);

//                     if (value.userId == userId && value.joinstatus == true) {
//                         console.log("fgjhgj", value && value.joinstatus == true);
//                         return res.status(200).json(EncryptData({ status: false, message: "Your already joined", data: event }))
//                     }
//                     else if (value.userId == userId && value.joinstatus == false) {
//                         console.log("fgjhgj", value && value.joinstatus == false);

//                         const resp = await Event.findOneAndUpdate(
//                             { _id: eventId, 'eventinterested.userId': new ObjectId(userId) },
//                             { $set: { 'eventinterested.$.joinstatus': true } },
//                             { new: true }
//                         ).populate({ path: "userId" }).populate({ path: 'eventinterested.userId' }).exec();

//                         console.log("Updated_resp:", resp);


//                         if (resp) {
//                             console.log("Updated_Event:", resp);
//                             res.status(200).json(EncryptData({ status: true, message: "Your joined successfully", data: resp }))
//                             let activitysave = {
//                                 DBName: Notification, Data: {
//                                     userId: userId,
//                                     action: "Event join",
//                                     status: "Event joined",
//                                     // from: resp.userId,
//                                     // to: userId,
//                                     from: new ObjectId(userId),
//                                     type: "Event",
//                                     to: resp?.userId?._id,
//                                     message: `Joined ${resp?.eventTitle} - event`,
//                                     eventId: eventId,

//                                 }
//                             }

//                             let activityvalues = await Save(activitysave)
//                             console.log("ddddddddd", activityvalues);
//                             if (resp?.userId?.pushNotification) {
//                                 await sendPushNotification({
//                                     type: "Join",
//                                     tokens: resp?.userId?.fcmToken,
//                                     title: "Event Join",
//                                     content: `${findUser?.username} is joined ${resp?.eventTitle} - event`,
//                                     extraData: { _id: resp?.userId?._id, type: "notification" }

//                                 })
//                             }

//                         } else {
//                             return res.status(200).json(EncryptData({ status: false, message: "Something error" }))

//                         }
//                     }
//                 }))
//             }
//             else if (!event) {
//                 console.log("joinedjoinedjoined========");

//                 const resp = await Event.findOneAndUpdate({ _id: eventId }, { $push: { "eventinterested": { userId: new ObjectId(userId), joinstatus: true } } }, { new: true }).populate("userId").populate({ path: 'eventinterested.userId' }).exec()
//                 console.log("respmsers", resp);
//                 res.status(200).json(EncryptData({ status: true, message: "Your joined successfully", data: resp }))

//                 if (resp?.userId?.pushNotification) {
//                     await sendPushNotification({
//                         type: "eventjoin",
//                         tokens: resp?.userId?.fcmToken,
//                         title: "Event Join",
//                         content: `${findUser?.username} is joined`,
//                         extraData: { _id: resp?.userId?._id, type: "notification" }

//                     })
//                 }

//                 let activitysave = {
//                     DBName: Notification, Data: {
//                         userId: userId,
//                         action: "Event join",
//                         status: "Event joined",
//                         // from: resp.userId,
//                         // to: userId,
//                         from: new ObjectId(userId),
//                         to: resp?.userId?._id,
//                         message: `Joined ${resp?.eventTitle} - event`,
//                         type: "Event",
//                         eventId: eventId,

//                     }
//                 }
//                 let activityvalues = await Save(activitysave)
//                 console.log("ddddddddd", activityvalues);
//             }
//             else {
//                 return res.status(200).json(EncryptData({ status: false, message: "Not to joined to yourself" }))

//             }
//         }
//         else if (type == "unjoin") {

//             const resp = await Event.findOneAndUpdate(
//                 { _id: eventId, 'eventinterested.userId': new ObjectId(userId) },
//                 { $set: { 'eventinterested.$.joinstatus': false } },
//                 { new: true }
//             ).populate("userId").populate({ path: 'eventinterested.userId' });
//             console.log("rrerrrrrrrrr", resp);

//             // let AcceptChange = await Notification.findOneAndUpdate({ from: userId, to: resp?.userId?._id, type: "Event" }, { $set: { status: "Event unjoined", message: "Event unjoined", display: false } }, { new: true })
//             let AcceptChange = await Notification.findOneAndDelete({ from: userId, to: resp?.userId?._id, eventId: resp?._id, type: "Event" })

//             console.log("ddddddddd345", AcceptChange);
//             let cleanRecord = resp?.toObject();
//             let response = { ...cleanRecord, type: "event" };
//             if (resp) {
//                 console.log("Updated Event:", resp);
//                 res.status(200).json(EncryptData({ status: true, message: "Your unjoined successfully", data: resp }))

//                 /*   if (resp?.userId?.pushNotification) {
//                       await sendPushNotification({
//                           type: "eventnotjoiin",
//                           tokens: resp?.userId?.fcmToken,
//                           title: "Event unjoined",
//                           content: `${findUser?.username} is unjoined ${resp?.eventTitle} - event`,
//                           extraData: response

//                       })
//                   } */


//             } else {
//                 console.log("User not found in the interested list or event not found");
//                 return res.status(200).json(EncryptData({ status: false, message: "Something error" }))

//             }
//         }
//         else if (type == "get") {
//             const event = await Event.findOne(
//                 { _id: new ObjectId(eventId), eventinterested: { $elemMatch: { userId: new ObjectId(userId) } } },
//                 { "eventinterested.$": 1 } // Projection to include only the matched element
//             );
//             console.log("wecentes", event);
//             if (event && event.eventinterested?.length > 0) {
//                 const userStatus = event?.eventinterested[0]?.status;
//                 console.log("User Status:", userStatus);
//                 return userStatus;
//             } else {
//                 console.log("User not found in eventinterested array");
//                 return res.status(200).json(EncryptData({ status: false, message: "Something error" }));
//             }
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }


/*
 * METHOD : POST
 * BODY: (longitude, latitude, gender, agestart, ageend, hobbies, distance, userId,page, limit)
 * URL : /v1/event/FilterUsersNearLocation
 */
export const FilterUsersNearLocation = async (req, res) => {
    console.log("reqesss_FilterUsersNearLocation", req.body);
    try {
        let { body: { longitude, latitude, gender, agestart, ageend, hobbies, distance, userId, page, limit }, user } = req
        hobbies = typeof hobbies === "string" ? ParsingFunc(hobbies) : hobbies;
        gender = typeof gender === "string" ? ParsingFunc(gender) : gender;
        let finduserhobbydata = await User.findOne({ _id: new ObjectId(userId) })
        if (!finduserhobbydata) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        const inOther = gender?.some(item => item == "others");

        const findAllUsers = await User.find({ _id: { $ne: new ObjectId(userId) }, "gender": { $nin: ["male", "female", ""] } }, { "_id": 0, "gender": 1 })
        const otherGenderList = findAllUsers?.map(user => user?.gender);
        const removeDuplicates = new Set(
            inOther ? otherGenderList?.map(g => g) : []
        );

        let latAndlong;
        if (!isEmpty(longitude) && !isEmpty(latitude)) {
            console.log("dynamic_user");

            latAndlong = await findDistanceAndLocation({ longitude: longitude, latitude: latitude })
        }
        else {
            console.log("static_user");

            latAndlong = await findDistanceAndLocation({ longitude: finduserhobbydata?.location?.coordinates[0], latitude: finduserhobbydata?.location?.coordinates[1] })

        }
        const initialDistance = 10;
        const distanceKilometer = distance ? parseFloat(distance) * 1000 : parseFloat(initialDistance) * 1000
        if (Array.isArray(gender)) {
            for (const gndr of gender) {
                removeDuplicates.add(gndr);
            }
        } else if (typeof gender === 'string') {
            removeDuplicates.add(ParsingFunc(gender));
        }
        const Gender = [...removeDuplicates]?.filter((el => el !== "others"));
        console.log("derrrrrrr", Gender);

        if (Gender?.length <= 0) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "gender_invalid") }));
        }

        const validHobbies = normalizeHobbyObjectIds(hobbies);
        if (validHobbies.length === 0 && Array.isArray(hobbies) && hobbies.length > 0) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_hobby_id") }));
        }

        const viewerSortHobbies = [];
        if (Array.isArray(finduserhobbydata?.hobbies) && finduserhobbydata.hobbies.length > 0) {
            for (const hobby of finduserhobbydata.hobbies) {
                if (ObjectId.isValid(hobby)) {
                    viewerSortHobbies.push(new ObjectId(hobby));
                }
            }
        }
        /** Sort key: overlap with filter hobbies if any, else overlap with viewer profile hobbies. */
        const sortByHobbyIds = validHobbies.length > 0 ? validHobbies : viewerSortHobbies;

        const matchFilter = {
            _id: { $ne: new ObjectId(userId) },
            delete: false,
            blockStatus: "unblocked",
            ishideprofile: false,
        };

        if (agestart != undefined && ageend != undefined) {
            matchFilter.age = { $gte: parseInt(agestart), $lte: parseInt(ageend) };
        }
        if (Array.isArray(Gender) && Gender?.length > 0) {
            matchFilter.gender = { $in: Gender };
        }
        if (validHobbies.length > 0) {
            matchFilter.hobbies = { $in: validHobbies };
        }

        const UsersPeoplesnearlocations = await UserPeoplesNearLocation({ DBName: User, userId: userId, page: page, limit: limit, matchFilter: matchFilter, distanceKilometer: distanceKilometer, longitude: latAndlong?.parsedLongitude, latitude: latAndlong?.parsedLatitude, sortByHobbyIds })
        console.log("🚀 ~ FilterUsersNearLocation ~ UsersPeoplesnearlocations:", UsersPeoplesnearlocations?.data?.length)

        const _debug = {
            source: (!isEmpty(longitude) && !isEmpty(latitude)) ? "client" : "profile",
            center: [latAndlong?.parsedLongitude, latAndlong?.parsedLatitude],
            distanceKilometer,
            validHobbyIds: validHobbies?.map(String) || [],
            gender: Gender,
            agestart,
            ageend,
            count: UsersPeoplesnearlocations?.data?.length || 0,
        };
        console.log("FilterUsersNearLocation _debug →", _debug);

        if (UsersPeoplesnearlocations.data) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "people_nearby"), data: UsersPeoplesnearlocations?.data, _debug }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), _debug }))
        }
        // }
    } catch (error) {
        console.error("Error finding events near location:", error);
        catchErrorResponse(res, error)
    }
};


/*
 * METHOD : POST
 * BODY: (userId)
 * URL : /v1/event/EventPublicOrPrivate
 */
// export const EventPublicOrPrivate = async (req, res) => {
//     console.log("Request body:", req.body);
//     try {
//         const { userId } = req.body;

//         let followedUsers = await follownotify.find({ from: userId, status: "completed" }, { to: 1 });
//         console.log("Followed Users:", followedUsers);

//         let followedUserIds = followedUsers.map((value) => value.to);
//         console.log("Followed User IDs:", followedUserIds);

//         let events = await Event.aggregate([
//             {
//                 $match: {
//                     $or: [
//                         { privacy_status: 'public', isblocked: "unblocked" },
//                         { userId: { $in: followedUserIds.map(id => new ObjectId(id)) } }
//                     ],
//                     userId: { $ne: new ObjectId(userId) }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     foreignField: "_id",
//                     localField: "userId",
//                     as: "EventCreateDetails"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$EventCreateDetails", preserveNullAndEmptyArrays: true
//                 }
//             }
//         ]);
//         console.log("Matched Events:", events);

//         if (events) {
//             res.status(200).json({ status: true, message: "Match results", data: events });
//         } else {
//             res.status(404).json({ status: false, message: "No matching results found" });
//         }

//     } catch (error) {
//         console.error("Error fetching events:", error);
//         catchErrorResponse(res, error);
//     }
// };


// export const EventPublicOrPrivate = async (req, res) => {
//     console.log("Request body:", req.body);
//     try {
//         const { userId, eventTitle, page = 1, limit = 10 } = req.body;
//         const skip = (parseInt(page) - 1) * parseInt(limit);

//         let respdata = await User.findOne({ _id: userId });
//         let followedUsers = await follownotify.find({ from: userId, status: "completed" }, { to: 1 });
//         let followedUserIds = followedUsers.map((value) => value.to);

//         if (!respdata) {
//             return res.status(200).json(EncryptData({ status: false, message: "User not found" }));
//         }

//         let matchConditions = {
//             $or: [
//                 { privacy_status: 'public', isblocked: "unblocked" },
//                 { userId: { $in: followedUserIds.map(id => new ObjectId(id)) } }
//             ],
//             userId: { $ne: new ObjectId(userId) },
//             event_status: { $in: ["comingsoon", "started"] },
//             isblocked: "unblocked"
//         };

//         // Add eventTitle regex if provided
//         if (eventTitle) {
//             matchConditions.eventTitle = { $regex: new RegExp(`^${eventTitle}`, "i") };
//         }

//         let pipeline = [
//             { $match: matchConditions },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "userId",
//                     foreignField: "_id",
//                     as: "userDetails"
//                 }
//             },
//             { $unwind: "$userDetails" },
//             {
//                 $lookup: {
//                     from: "subcategories",
//                     let: { hobbiesData: "$userDetails.hobbies" },
//                     pipeline: [
//                         { $match: { $expr: { $in: ["$_id", "$$hobbiesData"] } } },
//                         { $limit: 1 }
//                     ],
//                     as: "hobbies"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "userplan",
//                     let: { plansData: "$userDetails.plan" },
//                     pipeline: [
//                         { $match: { $expr: { $in: ["$_id", "$$plansData"] } } },
//                         { $limit: 1 }
//                     ],
//                     as: "plan"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "eventinterested.userId",
//                     foreignField: "_id",
//                     as: "eventinteresteds"
//                 }
//             },
//             { $project: { userId: 0 } }  // Hiding the userId from output
//         ];

//         // Add pagination stages only if page is not "all"
//         if (page != -1 && page != "all") {
//             pipeline.push({ $skip: skip });
//             pipeline.push({ $limit: parseInt(limit) });
//         }

//         let finddata = await Event.aggregate(pipeline).exec();
//         if (finddata.length > 0) {
//             return res.status(200).json(EncryptData({ status: true, message: "Events found", data: finddata }));
//         } else {
//             return res.status(200).json(EncryptData({ status: false, message: "No events found" }));
//         }

//     } catch (error) {
//         console.error("Error fetching events:", error);
//         return res.status(200).json(EncryptData({ status: false, message: "Error fetching events", error: error.message }));
//     }
// };


/*
 * METHOD : POST
 * BODY: (eventId, userId, comments)
 * URL : /v1/event/EventComments
 */

/* No need language translation */
export const EventComments = async (req, res) => {
    try {
        const { eventId, userId, comments } = req.body
        // const io = req?.app?.get("io")
        let payload = {
            eventId: eventId,
            userId: userId,
            comments: comments
        }
        let Data = new Comment(payload)
        let resp = await Data.save()
        if (resp) {
            // io?.sockets?.to(eventId?.toString()).emit("EVENT_COMMENTS", { data: resp })
            return res.status(200).json(EncryptData({ status: true, message: "Comments saved", data: resp }))
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
 * BODY: (commentId)
 * URL : /v1/event/DeleteEventComments
 */
/* No need language translation */
export const DeleteEventComments = async (req, res) => {
    try {
        const { commentId } = req.body

        let resp = await Comment.findOneAndDelete({ _id: commentId })
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "Comment deleted", data: resp }))
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
 * BODY: (page, limit,eventId)
 * URL : /v1/event/Getcommentslist
 */
/* No need language translation */
export const Getcommentslist = async (req, res) => {
    try {
        const { page, limit, eventId } = req.body

        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
        let resp = await Comment.find({ eventId: new ObjectId(eventId) }).skip(parseInt(skip)).limit(parseInt(limit)).populate("userId").populate("eventId")
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: "All Comments", data: resp }))
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
 * BODY: (eventId)
 * URL : /v1/event/EventJoinedMemberslist
 */
export const EventJoinedMemberslist = async (req, res) => {
    try {
        const { user } = req
        const eventIdWithUserDetails = await eventWithUserDetails({ DbName: Event, eventId: new ObjectId(req.body.eventId) })
        console.log(JSON.stringify(eventIdWithUserDetails, null, 2));
        if (eventIdWithUserDetails) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "joined_members_list"), data: eventIdWithUserDetails?.data }))

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
 * BODY: (userId,eventId,type)
 * URL : /v1/event/UserCreateEventlist
 */
export const UserCreateEventlist = async (req, res) => {
    try {
        const { query: { userId, eventId, type, searchEvent } } = req;
        let user = await User.findOne({ _id: new ObjectId(userId) });

        if (user) {
            if (type == "singleevent") {
                let event = await Event.findOne({
                    _id: new ObjectId(eventId),
                    delete: false,
                    event_status: { $in: ["comingsoon", "started"] },
                    isblocked: "unblocked",
                    userId: new ObjectId(userId)
                }).populate({ path: "eventinterested.userId", select: "_id randomIndex username profile email" }).populate({ path: "userId", select: "_id randomIndex username profile email", populate: { path: "hobbies" } }).populate({ path: "eventhobbies" }).lean();

                if (event) {
                    let eventJoinCount = await EventJoinCount({ eventId: event?._id });
                    // console.log("Event Join Count:", eventJoinCount);

                    event = { ...event, ...{ EventJoinCount: eventJoinCount } }
                    return res.status(200).json(EncryptData({
                        status: true,
                        message: t((user && user.language) ? user.language : "english", "Your_event"),
                        data: event
                        // EventJoinCount: eventJoinCount
                    }));
                } else {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_event_listed") }));
                }
            } else if (type == "all") {


                const searchText = typeof searchEvent == "string" ? searchEvent?.trim() : "";

                let queryResult = {
                    isblocked: "unblocked",
                    event_status: { $in: ["comingsoon", "started"] },
                    delete: false,
                    userId: new ObjectId(userId)
                }

                if (searchText?.length) {
                    queryResult.eventTitle = { $regex: searchText, $options: "i" };
                }


                let events = await Event.find(queryResult).populate({ path: "eventinterested.userId", select: "_id randomIndex username profile" }).populate({ path: "userId", select: "_id randomIndex username profile", populate: { path: "hobbies" } }).populate({ path: "eventhobbies" }).sort({ createdAt: -1 }).lean();

                if (events.length > 0) {
                    let eventJoinCounts = await Promise.all(events && events?.map(async (event) => {
                        let eventJoinCount = await EventJoinCount({ eventId: event?._id });
                        return { eventId: event._id, EventJoinCount: eventJoinCount };
                    }));
                    events = events && events?.map((ValId, i) => {
                        return {
                            ...ValId, ...eventJoinCounts[i]
                        }
                    })

                    return res.status(200).json(EncryptData({
                        status: true,
                        message: t((user && user.language) ? user.language : "english", "All_events_retrieved"),
                        data: events
                        // EventJoinCounts: eventJoinCounts
                    }));
                } else {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "No_events_listed") }));
                }
            } else {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_event_type") }));
            }
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }
    } catch (error) {
        catchErrorResponse(res, error);
    }
}

/*
 * METHOD : POST
 * BODY: (userId,eventId,type(save,unsave))
 * URL : /v1/event/EventWhish
 */

// export const EventWhish = async (req, res) => {
//     console.log("Request Body:", req.body);

//     try {
//         const { userId, eventId, type } = req.body;

//         // Validate the existence of the user and event
//         const findUser = await User.findById(userId);
//         const findEvent = await Event.findById(eventId);

//         if (!findEvent) {
//             return res.status(200).json({ status: false, message: "This event was not found" });
//         }

//         if (!findUser) {
//             return res.status(200).json({ status: false, message: "User not found" });
//         }

//         // Handle save operation
//         if (type === "save") {
//             let whishUser = await Whish.findOne({ userId: new ObjectId(userId) });

//             if (!whishUser) {
//                 await Event.findByIdAndUpdate({ _id: eventId }, { $push: { "isSaved": userId }, status: true }, { new: true });
//                 const newWhish = new Whish({
//                     userId: new ObjectId(userId),
//                     save_eventId: [new ObjectId(eventId)]
//                 });
//                 const resp = await newWhish.save();
//                 console.log("reposnereesd", resp, whishUser);

//                 return res.status(200).json({ status: true, message: "Saved", data: resp });
//             }

//             const exists = await Whish.findOne({
//                 userId: new ObjectId(userId),
//                 save_eventId: { $in: [new ObjectId(eventId)] }
//             });

//             if (exists) {
//                 return res.status(200).json({ status: false, message: "This event is already saved" });
//             }
//             await Event.findByIdAndUpdate({ _id: eventId }, { $push: { "isSaved": userId }, status: true }, { new: true });
//             const resp = await Whish.findOneAndUpdate(
//                 { userId: new ObjectId(userId) },
//                 { $push: { save_eventId: new ObjectId(eventId) } },
//                 { new: true }
//             );
//             console.log("reposnereesd111", resp, whishUser);

//             return res.status(200).json({ status: true, message: "Saved", data: resp });
//         }

//         // Handle unsave operation
//         if (type === "unsave") {
//             await Event.findByIdAndUpdate({ _id: eventId, "isSaved": {$in:[new ObjectId(userId)]}  }, { $pull: { "isSaved": userId }, status: false }, { new: true });

//             const resp = await Whish.findOneAndUpdate(
//                 { userId: new ObjectId(userId), save_eventId: { $in: [new ObjectId(eventId)] } },
//                 { $pull: { save_eventId: new ObjectId(eventId) } },
//                 { new: true }
//             );

//             return res.status(200).json({ status: true, message: "Unsaved" });
//         }

//         return res.status(400).json({ status: false, message: "Invalid operation type" });

//     } catch (error) {
//         catchErrorResponse(res, error);
//     }
// };

/*
 * METHOD : POST
 * BODY: (userId,eventId,type(save,unsave))
 * URL : /v1/event/EventWhish
 */
export const EventWhish = async (req, res) => {

    try {
        const { body: { userId, eventId, type }, user } = req;

        // Validate the existence of the user and event
        const [findUser, findEvent] = await Promise.all([User.findById(userId), Event.findById(eventId)]);

        if (!findEvent) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "event_not_found") }));
        }

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        if (type == "save") {
            // Check if the user already saved the event
            const isEventAlreadySaved = await Event.findOne({
                _id: eventId,
                'isSaved.userId': userId // Check if the user exists in the isSaved array
            });

            if (isEventAlreadySaved) {
                // Update the status to true if the event is already saved
                await Event.findOneAndUpdate(
                    { _id: eventId, 'isSaved.userId': userId },
                    { $set: { 'isSaved.$.status': true } },  // Update status to true
                    { new: true }
                );
            } else {
                // Add the event to the saved list for the user if it's not already saved
                await Event.findByIdAndUpdate(
                    eventId,
                    { $push: { isSaved: { userId: userId, status: true } } },
                    { new: true }
                );
            }

            // Handle the wish list logic (create or update wish document)
            let whishUser = await Whish.findOne({ userId: userId });

            if (!whishUser) {
                const newWhish = new Whish({
                    userId: userId,
                    save_eventId: [eventId],
                });
                const resp = await newWhish.save();

                return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "event_saved"), data: resp }));
            }

            const updatedWhish = await Whish.findOneAndUpdate(
                { userId: userId },
                { $push: { save_eventId: eventId } },
                { new: true }
            );
            const url = req.originalUrl.split("?")[0];

            const redisKey = `/v1/event/EventslistSearchfunc:${req.user?._id}`;

            await updateRedis({ keyName: redisKey, updateId: eventId, dataRecords: updatedWhish })
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "event_saved"), data: updatedWhish }));
        }

        if (type == "unsave") {
            // Unsave the event by updating the status to false, not removing the user
            const updatedEvent = await Event.findOneAndUpdate(
                { _id: eventId, 'isSaved.userId': userId },
                { $set: { 'isSaved.$.status': false } },  // Update status to false
                { new: true }
            );

            if (!updatedEvent) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "event_unsave_error") }));
            }

            const updatedWhish = await Whish.findOneAndUpdate(
                { userId: userId, save_eventId: { $in: [new ObjectId(eventId)] } },
                { $pull: { save_eventId: eventId } },  // Remove the event from the user's wish list
                { new: true }
            );

            if (!updatedWhish) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "wish_not_found") }));
            }
            const url = req.originalUrl.split("?")[0];

            const redisKey = `/v1/event/EventslistSearchfunc:${req.user?._id}`;

            await updateRedis({ keyName: redisKey, updateId: eventId, dataRecords: updatedWhish })
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "event_unsaved"), data: updatedWhish }));
        }

        return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_operation") }));

    } catch (error) {
        console.error("Error in EventWhish:", error);
        return res.status(200).json(EncryptData({ status: false, message: t((req.user && req.user.language) ? req.user.language : "english", "server_error") }));
    }
};



/*
 * METHOD : GET
 * BODY: (userId, page, limit)
 * URL : /v1/event/EventWhishLists
 */
export const EventWhishLists = async (req, res) => {
    console.log("sdffffff", req.query);
    try {
        const { query: { userId, page, limit }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
        const limitInt = parseInt(limit);
        console.log("dfgfgfgfggf", skip);
        let resp = await Whish.findOne({ userId: new ObjectId(userId) }).skip(parseInt(skip)).limit(parseInt(limit)).populate("userId").populate({ path: "save_eventId", populate: { path: "eventinterested.userId" }, populate: { path: "userId" } }).lean()
        console.log("reponsesess", resp);

        const paginatedEvents = resp.save_eventId.slice(skip * limitInt, skip * limitInt + limitInt);
        let eventJoinCounts = await Promise.all(paginatedEvents.map(async (event) => {
            let eventJoinCount = await EventJoinCount({ eventId: event?._id });
            console.log("ffffffffffff", eventJoinCount);
            return { eventId: event._id, EventJoinCount: eventJoinCount };
        }));
        const updatedPaginatedEvents = paginatedEvents.map((ValId, i) => {
            return {
                ...ValId, ...eventJoinCounts[i]
            }
        })
        resp.save_eventId = updatedPaginatedEvents;

        console.log("EeEsdecdEEEEEEEEEE", eventJoinCounts, resp);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "saved_list"), data: resp }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), data: resp }))

        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}


/* export const ImageDelete = async (req, res) => {
    console.log("requests_event_delete", req.body, req.files);
    try {
        const { userId, Imagename, eventId, instanceId, type } = req.body;
 
        let findUser = await User.findOne({ _id: userId });
        if (!findUser) {
            return res.status(200).json({ status: false, message: "User not found" });
        }
        let resp;
        let imageFolderPath;
        if (type == "event") {
            resp = await Event.findOneAndUpdate(
                { _id: new ObjectId(eventId), "image": { $in: [Imagename] } },
                { $pull: { "image": Imagename } },
                { new: true }
            );
 
            if (!resp) {
                return res.status(200).json(EncryptData({ status: false, message: "Event image not found" }));
            }
            imageFolderPath = `public/Eventimage/`;
 
 
        }
        else if (type == "profile") {
            resp = await User.findOneAndUpdate(
                { _id: new ObjectId(userId), "profile": Imagename },
                { "profile": "" },
                { new: true }
            );
 
            if (!resp) {
                return res.status(200).json(EncryptData({ status: false, message: "Profile image not found" }));
            }
            imageFolderPath = `public/PersonalProfile/`;
        }
        else if (type == "group") {
            resp = await ChatModel.findOneAndUpdate(
                { _id: new ObjectId(instanceId), "Image": Imagename },
                { "Image": "" },
                { new: true }
            );
 
            if (!resp) {
                return res.status(200).json(EncryptData({ status: false, message: "Group image not found" }));
            }
            imageFolderPath = `public/Chatimage/`;
        }
 
 
        const oldImagePath = `${imageFolderPath}${Imagename}`;
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log(`Image ${Imagename} deleted successfully`);
        } else {
            console.log(`Image ${Imagename} not found on the server`);
        }
 
        return res.status(200).json(EncryptData({ status: true, message: `Image removed successfully`, data: resp }));
    } catch (error) {
        catchErrorResponse(res, error)
    }
} */

/*
 * METHOD : POST
 * BODY: (longitude, latitude, distance, userId, eventhobbies, page, limit)
 * URL : /v1/event/FindNearbyEvents
 */
export const FindNearbyEvents = async (req, res) => {
    console.log("Request_received_123", req.body);
    try {
        let { body: { longitude = "", latitude = "", distance, userId, eventhobbies, page, limit }, user } = req;
        const hobbyObjectIds = normalizeHobbyObjectIds(eventhobbies);
        console.log("🚀 ~ FindNearbyEvents ~ eventhobbies:", hobbyObjectIds)
        let findUser = await User.findOne({ _id: new ObjectId(userId) });

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        if (hobbyObjectIds.length === 0) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "event_hobbies_required") }));
        }

        let latAndlong;
        if (!isEmpty(longitude) && !isEmpty(latitude)) {
            latAndlong = await findDistanceAndLocation({ longitude, latitude });
        } else if (findUser?.location?.coordinates?.length == 2) {
            latAndlong = await findDistanceAndLocation({
                longitude: findUser?.location?.coordinates[0],
                latitude: findUser?.location?.coordinates[1]
            });
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_location") }));
        }

        if (
            !latAndlong ||
            !Number.isFinite(latAndlong.parsedLatitude) ||
            !Number.isFinite(latAndlong.parsedLongitude)
        ) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_location") }));
        }

        const initialDistance = 100 * 1000;
        const parsedDistance = parseFloat(distance);
        const distanceKilometer =
            Number.isFinite(parsedDistance) && parsedDistance > 0
                ? parsedDistance * 1000
                : initialDistance;

        const viewerHobbyObjectIds = (Array.isArray(findUser?.hobbies) ? findUser.hobbies : [])
            .filter((h) => ObjectId.isValid(String(h)))
            .map((h) => new ObjectId(h));

        // Include events created by the user too, so an event hosted by the
        // viewer still appears in their filtered search when it falls inside
        // the search radius / hobby filter.  This mirrors the change made
        // for Groups (UserSearchHobbyBasedGroupFilter) where the
        // `groupCreater: { $ne: userId }` exclusion was removed.
        const matchFilter = {
            event_status: { $in: ["comingsoon", "started"] },
            isblocked: "unblocked",
            delete: false,
        };
        matchFilter.eventhobbies = { $in: hobbyObjectIds };

        let geoNearStage = {
            $geoNear: {
                near: { type: "Point", coordinates: [latAndlong.parsedLongitude, latAndlong.parsedLatitude] },
                distanceField: "dist.calculated",
                maxDistance: distanceKilometer, // meters
                spherical: true,
                key: "location"
            }
        };
        const pipeline = [];

        // if (distance > 0) {
        //     pipeline.push({
        //         $geoNear: {
        //             near: {
        //                 type: "Point",
        //                 coordinates: [latAndlong?.parsedLongitude, latAndlong?.parsedLatitude]
        //             },
        //             distanceField: "distanceFromQuery",
        //             maxDistance: distanceKilometer ? distanceKilometer : parseFloat(initialDistance) * 1000, // meters
        //             spherical: true,
        //             key: 'location'
        //         }
        //     });
        // }

        pipeline.push(
            geoNearStage,
            { $match: matchFilter },
            {
                $lookup: {
                    from: "adminHobbies",
                    let: { evnthobbies: "$eventhobbies" },
                    pipeline: [
                        { $match: { $expr: { $in: ["$_id", "$$evnthobbies"] } } }
                    ],
                    as: "eventhobbies"
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { user_ID: "$userId" },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$_id", "$$user_ID"] } }
                        },
                        {
                            $lookup: {
                                from: "adminHobbies",
                                let: { usershobbies: "$hobbies" },
                                pipeline: [
                                    { $match: { $expr: { $in: ["$_id", "$$usershobbies"] } } }
                                ],
                                as: "hobbies"
                            }
                        }
                    ],
                    as: 'userId'
                }
            },
            { $unwind: "$userId" },

            {
                $lookup: {
                    from: "Instance",
                    localField: "_id",
                    foreignField: "eventId",
                    as: "group"
                }
            },
        );

        pipeline.push(
            { $unwind: { path: "$eventinterested", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "users",
                    localField: "eventinterested.userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                "$unwind": {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "eventinterested.userId": {
                        _id: "$userDetails._id",
                        name: "$userDetails.name",
                        username: "$userDetails.username",
                        profile: "$userDetails.profile",
                        randomIndex: "$userDetails.randomIndex",
                        plan: "$userDetails.plan"

                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    eventTitle: { $first: "$eventTitle" },
                    otherFields: { $first: "$otherFields" }, // add any other top-level fields you have
                    eventinterested: { $push: "$eventinterested" },
                    startDate: { $first: "$startDate" },
                    endDate: { $first: "$endDate" },
                    description: { $first: "$description" },
                    image: { $first: "$image" },
                    event_status: { $first: "$event_status" },
                    location: { $first: "$location" },
                    privacy_status: { $first: "$privacy_status" },
                    ishideInEvent: { $first: "$ishideInEvent" },
                    userId: { $first: "$userId" },
                    eventprofile: { $first: "$eventprofile" },
                    eventRandomIndex: { $first: "$eventRandomIndex" },
                    isblocked: { $first: "$isblocked" },
                    blockedReason: { $first: "$blockedReason" },
                    delete: { $first: "$delete" },
                    isSaved: { $first: "$isSaved" },
                    eventhobbies: { $first: "$eventhobbies" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    eventAddress: { $first: "$eventAddress" },
                    group: { $first: "$group" }

                }
            }
        )

        pipeline.push(
            {
                $addFields: {
                    mutualHobbiesCount: {
                        $size: {
                            $setIntersection: [
                                { $ifNull: ["$eventhobbies", []] },
                                viewerHobbyObjectIds.length ? viewerHobbyObjectIds : [],
                            ],
                        },
                    },
                },
            },
            { $sort: { mutualHobbiesCount: -1 } },
        );

        if (page != Number(-1) && page != "all") {
            const pageNumber = parseInt(page);
            const pageSize = parseInt(limit);
            pipeline.push({ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize });
            pipeline.push({ $limit: pageSize });
        }

        // pipeline.push({
        //     $project: {
        //         "_id": 1,
        //         "userId": 1,
        //         "eventTitle": 1,
        //         "startDate": 1,
        //         "endDate": 1,
        //         "description": 1,
        //         "image": 1,
        //         "event_status": 1,
        //         "location": {
        //             "type": "$Point",
        //             "coordinates": [
        //                 { $arrayElemAt: ["$location.coordinates", 1] },
        //                 { $arrayElemAt: ["$location.coordinates", 0] }
        //             ]
        //         },
        //         "privacy_status": 1,
        //         "isblocked": 1,
        //         "blockedReason": 1,
        //         "delete": 1,
        //         "eventinterested": 1,
        //         "isSaved": 1,
        //         "createdAt": 1,
        //         "updatedAt": 1,
        //         "eventAddress": 1,
        //         "eventhobbies": 1,
        //         "group": { _id: 1 }
        //     }
        // });
        console.log("QUeryryyyr", JSON.stringify(pipeline, null, 2));

        const nearbyEvents = await Event.aggregate(pipeline);
        console.log("Events near location:", JSON.stringify(nearbyEvents, null, 2));
        const _debug = {
            source: (!isEmpty(longitude) && !isEmpty(latitude)) ? "client" : "profile",
            center: [latAndlong?.parsedLongitude, latAndlong?.parsedLatitude],
            distanceKilometer,
            validHobbyIds: (hobbyObjectIds || []).map(String),
            count: nearbyEvents?.length || 0,
        };
        console.log("FindNearbyEvents _debug →", _debug);
        if (nearbyEvents) {
            // console.log("nearbyEvents",nearbyEvents);
            return res.status(200).json(EncryptData({ status: true, message: nearbyEvents?.length > 0 ? t((user && user.language) ? user.language : "english", "nearby_events_found") : t((user && user.language) ? user.language : "english", "no_nearby_events"), data: nearbyEvents?.length > 0 ? nearbyEvents : [], _debug }));
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), data: nearbyEvents, _debug }))
        }

    } catch (error) {
        console.error("Error_finding_events", error);
        catchErrorResponse(res, error);
    }
};

// ------------------------reference-----------------------
// export const FindNearbyEvents = async (req, res) => {
//     console.log("reqesss", req.body);
//     try {
//         let { longitude, latitude, distance, userId, eventhobbies, page, limit } = req.body
//         eventhobbies = ParsingFunc(eventhobbies)
//         console.log("eeeeeeeeeeee", eventhobbies);
//         let findUser = await User.findOne({ _id: new ObjectId(userId) })

//         let latAndlong;

//         if (distance > 0) {
//             if (!isEmpty(longitude) && !isEmpty(latitude)) {
//                 latAndlong = await findDistanceAndLocation({ longitude: longitude, latitude: latitude })
//             }
//             else {
//                 latAndlong = await findDistanceAndLocation({ longitude: findUser?.location?.coordinates[0], latitude: findUser?.location?.coordinates[1] })

//             }
//         }

//         if (findUser) {
//             const distanceKilometer = parseFloat(distance) * 1000
//             console.log("distanceKilometer", distanceKilometer);
//             // const parsedLongitude = parseFloat(longitude);
//             // const parsedLatitude = parseFloat(latitude);

//             // const validHobbies = eventhobbies?.filter(hobby => ObjectId.isValid(hobby)).map(hobby => new ObjectId(hobby)) || [];
//             // console.log("event_validhobbies", validHobbies, validHobbies.map((item) => item))
//             // if (Array.isArray(validHobbies)?.length <= 0) {
//             //     return res.status(200).json(({ status: false, message: "Event Hobbies is required" }))
//             // }
//             if (isEmpty(eventhobbies)) {
//                 return res.status(200).json(EncryptData({ status: false, message: "Event Hobbies is required" }))

//             }
//             console.log("evetnetnethobbies", eventhobbies);
//             //    let HobbyId =  validHobbies.map((item)=>{
//             //         console.log("itemss",item)
//             //         return item
//             //     })
//             //     console.log("hobbbybb",HobbyId);

//             const matchFilter = {
//                 userId: { $ne: new ObjectId(userId) },
//                 event_status: { $in: ["comingsoon", "started"] },
//                 delete: { $ne: true },
//             };

//             console.log("matchFilter_eventhobby", matchFilter)

//             const pipeline = [


//                 // {
//                 //     $geoNear: {
//                 //         near: {
//                 //             type: "Point",
//                 //             coordinates: [latAndlong?.parsedLongitude, latAndlong?.parsedLatitude]
//                 //         },
//                 //         distanceField: "distanceFromQuery",
//                 //         maxDistance: distanceKilometer, // meters
//                 //         spherical: true,
//                 //         key: 'location'
//                 //     }
//                 // },
//                 // {
//                 //     $match: matchFilter
//                 // },
//                 // {
//                 //     $addFields: {
//                 //         distanceInKm: { $divide: ["$distanceFromQuery", 1000] } // meters to kilometers
//                 //     }
//                 // },

//                 // {
//                 //     $lookup: {
//                 //         from: "events",
//                 //         let: { user_id: "$userId", validHobbiesArray: validHobbies },
//                 //         pipeline: [
//                 // {
//                 //     $match: {
//                 //         $expr: {
//                 //             $and: [
//                 //                 {
//                 //                     $eq: ["$userId", "$$user_id"]
//                 //                 },
//                 //                 // {
//                 //                 //     $gt: [
//                 //                 //         { $size: { $setIntersection: ["$eventhobbies", "$$validHobbiesArray"] } }, // Check for intersection
//                 //                 //         0 // Ensure there is at least one common hobby
//                 //                 //     ]
//                 //                 // }
//                 //             ]
//                 //         }
//                 //     }
//                 // },
//                 {
//                     $lookup: {
//                         from: "adminHobbies",
//                         let: { evnthobbies: "$eventhobbies" },
//                         pipeline: [
//                             {
//                                 $match: {
//                                     $expr: {
//                                         $and: [
//                                             {
//                                                 $in: ["$_id", "$$evnthobbies"]
//                                             },



//                                         ]
//                                     }
//                                 }
//                             }
//                         ],

//                         as: "eventhobbies"
//                     }
//                 },
//                 //         ],
//                 //         as: "eventhobbies"
//                 //     }
//                 // },



//                 {
//                     $lookup: {
//                         from: 'users',
//                         let: { user_ID: "$userId" },
//                         pipeline: [

//                             {
//                                 $match: {
//                                     $expr: {
//                                         $and: [
//                                             {
//                                                 $eq: ["$_id", "$$user_ID"]
//                                             },
//                                             // {
//                                             //     $gt: [
//                                             //         { $size: { $setIntersection: ["$eventhobbies", "$$validHobbiesArray"] } }, // Check for intersection
//                                             //         0 // Ensure there is at least one common hobby
//                                             //     ]
//                                             // }
//                                             // {
//                                             //     $in:["$hobbies","$$validHobbiesArray"]
//                                             // }
//                                         ]
//                                     }
//                                 }
//                             },
//                             {
//                                 $lookup: {
//                                     from: "adminHobbies",
//                                     let: { usershobbies: "$hobbies" },
//                                     pipeline: [
//                                         {
//                                             $match: {
//                                                 $expr: {
//                                                     $and: [
//                                                         {
//                                                             $in: ["$_id", "$$usershobbies"]
//                                                         },



//                                                     ]
//                                                 }
//                                             }
//                                         }
//                                     ],

//                                     as: "hobbies"
//                                 }
//                             },



//                         ],

//                         as: 'userId'
//                     },
//                 },

//                 {
//                     $unwind: {
//                         path: "$userId"
//                     }
//                 },



//             ];

//             //available is remove comment
//             if (page !== -1) {
//                 const pageNumber = parseInt(page);
//                 const pageSize = parseInt(limit);
//                 pipeline.push({ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize });
//                 pipeline.push({ $limit: pageSize });
//             }
//             if (distance > 0) {
//                 pipeline.push(
//                     {
//                         $geoNear: {
//                             near: {
//                                 type: "Point",
//                                 coordinates: [latAndlong?.parsedLongitude, latAndlong?.parsedLatitude]
//                             },
//                             distanceField: "distanceFromQuery",
//                             maxDistance: distanceKilometer, // meters
//                             spherical: true,
//                             key: 'location'
//                         }
//                     },
//                     {
//                         $match: matchFilter
//                     },
//                     {
//                         $addFields: {
//                             distanceInKm: { $divide: ["$distanceFromQuery", 1000] } // meters to kilometers
//                         }
//                     }
//                 )
//             }
//             pipeline.push({

//                 $lookup: {
//                     from: "users",
//                     let: { eventUserId: "$eventinterested.userId", events: "$eventinterested" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         {
//                                             $in: ["$_id", "$$eventUserId"]
//                                         },

//                                     ]
//                                 }
//                             }
//                         },
//                         {
//                             $addFields: {
//                                 joinstatus: { $arrayElemAt: ["$$events.joinstatus", { $indexOfArray: ["$$events.userId", "$_id"] }] },
//                                 join_Id: { $arrayElemAt: ["$$events._id", { $indexOfArray: ["$$events.userId", "$_id"] }] },


//                             }
//                         }

//                     ],
//                     as: "eventinterested"

//                 },

//             })

//             pipeline.push({
//                 $project: {
//                     "_id": 1,
//                     "userId": 1,
//                     "eventTitle": 1,
//                     "startDate": 1,
//                     "endDate": 1,
//                     "description": 1,
//                     "image": 1,
//                     "event_status": 1,
//                     "location": {
//                         "type": "$Point",
//                         "coordinates": [
//                             { $arrayElemAt: ["$location.coordinates", 1] },
//                             { $arrayElemAt: ["$location.coordinates", 0] }
//                         ]
//                     },
//                     "privacy_status": 1,
//                     "isblocked": 1,
//                     "blockedReason": 1,
//                     "delete": 1,
//                     "eventinterested": 1,
//                     "isSaved": 1,
//                     "createdAt": 1,
//                     "updatedAt": 1,
//                     "eventAddress": 1,
//                     "eventhobbies": 1
//                 }

//             })
//             const nearbyUsers = await Event.aggregate(pipeline);
//             console.log("nearbyUsers", nearbyUsers);

//             console.log("Events near location:", JSON.stringify(pipeline, null, 2));
//             return res.status(200).json(EncryptData({ status: true, message: "Your location near events", data: nearbyUsers }))

//         }
//         else {
//             return res.status(200).json(EncryptData({ status: false, message: "Something error" }))

//         }



//     } catch (error) {
//         console.error("Error finding events near location:", error);
//         catchErrorResponse(res, error)
//     }


// };
// ------------------------reference-----------------------


/*
 * METHOD : POST
 * BODY: (userId, eventId)
 * URL : /v1/event/eventDetails
 */
export const eventDetails = async (req, res) => {
    console.log("request_eventGroupLists", req.body);
    try {
        const { body: { userId, eventId } } = req;

        let user = await User.findById(userId)
        if (!user) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        let eventQuery = {
            _id: new ObjectId(eventId),
            isblocked: "unblocked",
            delete: false
        };
        const chatRecords = await ChatModel.find({ "isGroupchat": true, "iseventchat": true })
        let finddata = await Event.find(eventQuery)
            .populate({ path: "userId", populate: { path: "hobbies", select: "_id hobbyname plan" } })
            .populate({ path: "eventinterested.userId" })
            .populate({ path: "eventhobbies", select: "_id hobbyname plan" })
            .lean();

        const groupMap = new Map(chatRecords.map(chat => [String(chat.eventId), chat.toObject?.() || chat]));

        const flippedData = finddata?.map(event => {
            const group = groupMap.get(String(event?._id)) || null;
            return {
                _id: event?._id,
                eventTitle: event?.eventTitle,
                startDate: event?.startDate,
                endDate: event?.endDate,
                eventhobbies: event?.eventhobbies,
                description: event?.description,
                image: event?.image,
                event_status: event?.event_status,
                location: event?.location,
                privacy_status: event?.privacy_status,
                /* Always a boolean so JSON never drops the key (undefined is omitted) */
                ishideInEvent: event?.ishideInEvent ?? false,
                eventAddress: event?.eventAddress,
                isSaved: event?.isSaved,
                createdAt: event?.createdAt,
                userId: event?.userId,
                eventRandomIndex: event?.eventRandomIndex,
                eventprofile: event?.eventprofile,
                eventinterested: event?.eventinterested?.map(e => ({
                    _id: e?.userId?._id,
                    name: e?.userId?.name,
                    username: e?.userId?.username,
                    randomIndex: e?.userId?.randomIndex,
                    profile: e?.userId?.profile,
                    MychatDiscription: e?.userId?.MychatDiscription,
                    userblocked: e?.userId?.userblocked,
                    joinstatus: e?.joinstatus,
                })) || [],
                group: {
                    _id: group ? group?._id : null
                }
            };
        });

        if (finddata && finddata.length > 0) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "event_retrieved"), data: flippedData }));
        } else {
            return res.status(200).json(EncryptData({ status: false, statusCode: true, message: t((user && user.language) ? user.language : "english", "No_event_found"), data: flippedData }));
        }

    } catch (error) {
        catchErrorResponse(res, error);
    }
}

//upcoming events in joined events
export const upcomingEvents = async (req, res) => {
    console.log("upcomingEventsssssssss", req.user);

    try {
        const { user } = req;

        const { searchEvent = "" } = req.query;
        const searchText = typeof searchEvent == "string" ? searchEvent?.trim() : "";
        console.log("searchText", searchText, req.query);

        const findUser = await User.findOne({ _id: user?._id })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        const getJoinedEvents = await upcomingEventDetails({ DBName: Event, userId: user._id, searchText: searchText })
        console.log("getJoinedEvents", getJoinedEvents);

        if (getJoinedEvents?.data?.length > 0) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "upcoming_event"), data: getJoinedEvents?.data }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_upcoming_event"), data: [] }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}