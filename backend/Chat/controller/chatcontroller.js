import { AddRemoveCreateGroup, Audiofile, EncryptData, GetInstanceSocket, GroupLikeEventGroupjoinRequestUsersCounts, ImageAddFunc, Imagecompress, ParsingFunc, catchErrorResponse, deleteImageFromS3, findDistanceAndLocation, handleFileUploads, isEmpty, normalizeHobbyObjectIds, notifyUsers, saveNotification, socketCreateMessage, t, uploadImageToS3, userHasActivePlan } from "../../Helper/common";
import { isPushNotificationEnabled } from "../../pushnotification";
import ChatModel from "../Models/instance_schema";
import MessageModel from "../Models/Message_schema";
import User from "../../UserController/Models/user_schema"
import mongoose from "mongoose"
// import fs from "fs"
import { allChatsGroups, chatMessages, filterNearbyGroupLists, GetCurrentMessage, getGroupCreaterDetails, getInstanceChatlistAndFollowerLists, getInstanceEventLastmessage, getInstanceLastmessage, getSingleInstanceLastmessage, messageDetails, nearbyGroupLists, Save } from "../../Helper/mongooseHelper";
import { sendPushNotification } from "../../pushnotification";
import Notification from '../../Helper/Activity_schema'

// import { SocketEmit, SocketEmitAll, SocketEmitInstance, socketRemoveInRoom } from "../../socket";
// import Message from "../Models/Message_schema";
// import path from 'path';
import follownotify from "../../UserController/Models/follownotify_schema"
import Admin from "../../AdminController/Models/admin_schema"
// import HobbiesAdmin from "../../AdminController/Models/Hobbiesadmin.schema"
const ObjectId = mongoose.Types.ObjectId
// const ffmpeg = require('fluent-ffmpeg');
/*
 * METHOD : POST
 * BODY: (userId, isGroupchat, chatName, members)
 * URL : /v1/chat/Createchat
 */
// export const Createchat = async (req, res) => {
//     console.log("requests", req.body, req.files);
//     try {
//         // const io = req.app.get('io')
//         // const socket = req.app.get('socket')
//         const { userId, isGroupchat, chatName, groupDiscription, members } = req.body;
//         let isGroupchats = JSON.parse(isGroupchat)
//         console.log("isGroupchat", isGroupchats);
//         // let resps = await User.findOneAndUpdate({ _id: userId }, { socketId: ReqBody.socketId })
//         // console.log("resps", resps);
//         let findUser = await User.findOne({ _id: userId }).populate("plan")
//         console.log("findUser", findUser);
//         if (!findUser) {
//             return res.status(200).json({ status: false, message: "User not found" });
//         }

//         // Check for active plan
//         const planvalidate = findUser.plan.find(plan => plan.isActive === "started");
//         if (!planvalidate) {
//             return res.status(200).json({ status: false, message: "Please subscribe to a valid plan" });
//         }

//         let record = await User.findOne({ _id: userId, "plan": { $in: [planvalidate._id] } })
//         console.log("record", record);
//         console.log("memberdata", members);
//         const memberIds = await members.map(id => new ObjectId(id));
//         console.log("memberIds", memberIds);

//         if (isGroupchats) {
//             if (req.files && req.files.image) {

//                 let img = req.files.image
//                 // let CompressImage = await Imagecompress({ image: img, path: `public/GroupImage/` })
//                 // console.log("CompressImage", CompressImage);
//                 var profile = await ImageAddFunc([
//                     {
//                         path: `public/GroupImage/`,
//                         files: img,
//                         filename:
//                             Date.now() +
//                             ".webp"
//                     },
//                 ]);
//                 console.log("profiles", profile);
//             }
//             for (let i = 0; i < members.length; i++) {
//                 console.log("Member_ID:", members[i]);
//                 let MemberData = members[i];

//                 let findInstanceUser = await User.findOne({ _id: new ObjectId(MemberData) });
//                 console.log("findInstanceUser", findInstanceUser);

//                 if (findInstanceUser && isPushNotificationEnabled(findInstanceUser?.pushNotification)) {
//                     await sendPushNotification({
//                         type: "Newgroup",
//                         tokens: findInstanceUser?.fcmToken, // Use the correct token from the found user
//                         title: "New Group",
//                         content: findInstanceUser?._id.toString() === userId.toString()
//                             ? "You created a new group"
//                             : `${findInstanceUser?.name} is added you to a new group`
//                     });
//                 }
//             }
//             // let findUserupdateDescription = await User.findOneAndUpdate({ _id: userId }, { groupDiscription: groupDiscription }, { new: true })
//             // console.log("findUserupdateDescription", findUserupdateDescription);
//         }


//         // Find existing chats with the same members
//         let findInstance = await ChatModel.find({ "members": { $all: memberIds } });
//         let findInstanceprivate = await ChatModel.find({ isGroupchat: false, "members": { $all: memberIds } });
//         console.log("findInstanceprivate", findInstanceprivate);

//         console.log("members_members", findInstance, memberIds);
//         console.log("isGroupchat_chatName", isGroupchats && !chatName, isGroupchats && findInstance.length > 0, !isGroupchats && findInstanceprivate.length > 0, isGroupchats && members.length < 3, !isGroupchats && members.length !== 2);

//         if (isGroupchats && !chatName) {
//             return res.status(200).json({ status: false, message: 'Group chat must have a name' });
//         }
//         if (!isGroupchats && findInstanceprivate.length > 0) {
//             return res.status(200).json({ status: false, message: "Private chat instance already exists" });
//         }
//         // if (isGroupchats && findInstance.length > 0) {
//         //     return res.status(200).json({ status: false, message: "Group chat instance already exists" });
//         // }
//         if (isGroupchats && memberIds.length < 3) {
//             return res.status(200).json({ status: false, message: "Group chat must have at least 3 members" });
//         }
//         if (!isGroupchats && memberIds.length !== 2) {
//             return res.status(200).json({ status: false, message: "Private chat must have exactly 2 members" });
//         }

//         // Proceed with chat creation if the user has a valid plan
//         if (planvalidate.isActive == "started" && planvalidate.isActive != "expired") {
//             const newChat = new ChatModel({
//                 members: memberIds,
//                 Image: req.files ? profile : "",
//                 isGroupchat: isGroupchats,
//                 chatName: chatName,
//                 groupDiscription: groupDiscription,
//                 groupCreater: isGroupchat ? new ObjectId(userId) : null,
//                 groupAdmin: isGroupchat ? [new ObjectId(userId)] : []
//             });

//             const resp = await newChat.save();
//             console.log("instance_response", resp);
//             SocketEmitAll("InstanceResponse", resp)

//             if (resp) {
//                 // socket.emit('chatResponse', { status: true, message: "New Instance created", data: resp });
//                 // SocketEmitAll("InstanceResponse", resp)
//                 return res.status(200).json({ status: true, message: "New Instance created", data: resp, Groupimage: '/GroupImage/' });
//             } else {
//                 SocketEmitAll("InstanceResponse", "Something went wrong")

//                 // socket.emit('chatResponse', { status: false, message: "Something went wrong" });
//                 return res.status(500).json({ status: false, message: "Something went wrong" });
//             }
//         } else {
//             return res.status(200).json({ status: false, message: "Please subscribe to a valid plan" });
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)

//     }
// }

/*
 * METHOD : POST
 * BODY: (userId, isGroupchat, chatName, groupDiscription, members, groupIndex, grouphobbies, isPrivate)
 * URL : /v1/chat/Createchat
 */
export const Createchat = async (req, res) => {
    console.log("requests", req.body, req.files);
    try {
        const io = req.app.get("io")
        let { body: { userId, isGroupchat, chatName, groupDiscription, members, groupIndex, grouphobbies, isPrivate, hide_group, longitude = 0, latitude = 0, groupAddress = "" }, user } = req;
        let isGroupchats = typeof isGroupchat == "string" ? ParsingFunc(isGroupchat) : isGroupchat;
        isPrivate = typeof isPrivate == "string" ? ParsingFunc(isPrivate) : isPrivate;
        hide_group = typeof hide_group == "string" ? ParsingFunc(hide_group) : hide_group;
        members = Array.isArray(members) ? members : ParsingFunc(members)
        grouphobbies = Array.isArray(grouphobbies) ? grouphobbies : ParsingFunc(grouphobbies)
        console.log("fgfdgrthytjhytjyj", grouphobbies);
        const [findUser, AdminData] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }, { _id: 1, username: 1, userblocked: 1, plan: 1, privacy_status: 1, language: 1, hobbies: 1 }).populate("hobbies").populate("plan"),
            Admin.findOne({})
        ])
        console.log("findusersssss", findUser, isGroupchats, isGroupchat);
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        const blockuser = members?.some(el => findUser?.userblocked?.map(id => id.toString()).includes(el.toString()));

        if (findUser && findUser?.userblocked?.length > 0 && blockuser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_blocked") }))
        }

        let GroupHobbies;
        let MappedData
        if (isGroupchats) {
            MappedData = await grouphobbies?.map(id => new ObjectId(id))
            console.log("grouphobbiesgrouphobbies", MappedData);

        }
        // const subcategories = await HobbiesAdmin.find({ _id: { $in: MappedData } });
        // console.log("subcategories", subcategories);

        const HobbyLimit = Number(AdminData?.hobby_limit);
        console.log("HobbyLimit", HobbyLimit);
        const activePlan = findUser?.plan?.find(plan => plan?.isActive == "started");
        // console.log("activPlansDatra", activePlan)
        // if (activePlan) {
        //     GroupHobbies = MappedData;

        // }
        // if (!findUser?.plan || findUser?.plan?.length == 0 && !activePlan) {
        //     return res.status(200).json({ status: false, message: "Please subscribe to create an group." });
        // }
        if (isGroupchats) {
            if (!activePlan && MappedData?.length <= HobbyLimit) {
                GroupHobbies = MappedData;
            }
            else if (activePlan) {
                GroupHobbies = MappedData;
            }
            else {
                return res.status(200).json(EncryptData({ status: false, message: `${t((user && user.language) ? user.language : "english", "free_hobby_limit")} ${HobbyLimit} ${t((user && user.language) ? user.language : "english", "free_hobby_subscribe")}` }));
            }
            console.log("GroupHobbies111", GroupHobbies);
        }

        // let FindupdateGroupHobbies = await ChatModel.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { "grouphobbies": MappedData } }, { new: true })
        // console.log("FindupdateGroupHobbies--------->", FindupdateGroupHobbies);

        // Validate active plan
        if (isGroupchats) {
            const planvalidate = findUser?.plan?.find(plan => plan?.isActive == "started");
            if (!planvalidate) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "subscribe_create_group") }));
            }
            // let record = await User.findOne({ _id: userId, "plan": { $in: [planvalidate._id] } })
            // console.log("record", record);
        }
        // Convert member IDs to ObjectId format
        const memberIds = members?.map(id => new ObjectId(id));

        // Handle group chat image upload
        let arr = [];
        let profile = "";
        if (isGroupchats && req?.files) {
            const profileImage = req?.files?.image;
            if (profileImage) {
                profile = await ImageAddFunc([
                    {
                        files: profileImage,
                        filePath: "groupProfile"
                    }
                ]);
            }

            const groupImages = req?.files?.groupImages;
            if (groupImages) {
                const filesArray = Array.isArray(groupImages) ? groupImages : [groupImages];
                arr = await Promise.all(
                    filesArray.map(async (img, index) => {
                        const compressedImageBuffer = await Imagecompress({ image: img });
                        const s3Url = await uploadImageToS3({
                            fileBuffer: compressedImageBuffer,
                            fileMimetype: "image/webp",
                            filePath: "groupImages",
                            index
                        });
                        return s3Url;
                    })
                );
            }
        }

        // Check if private chat instance already exists
        if (!isGroupchats) {
            let findInstancePrivate = await ChatModel.find({ isGroupchat: false, "members": { $all: memberIds } });
            if (findInstancePrivate.length > 0) {
                return res.status(200).json(EncryptData({ statusCode: 200, status: false, message: t((user && user.language) ? user.language : "english", "private_chat_exists"), data: findInstancePrivate[0] }));
            }
            if (memberIds?.length != 2) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "private_chat_two_members") }));
            }
        }

        // Check if group chat meets requirements
        if (isGroupchats) {
            if (!chatName) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "group_chat_name_required") }));
            }
            // available is uncomment
            /* if (memberIds?.length < 3) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "group_chat_min_members") }));
            } */
        }

        // Create new chat instance
        const newChat = new ChatModel({
            members: memberIds,
            Image: profile,
            groupImages: arr,
            groupIndex: groupIndex,
            isGroupchat: isGroupchats,
            chatName: chatName,
            groupDiscription: groupDiscription ? groupDiscription : "",
            groupCreater: isGroupchats ? new ObjectId(userId) : null,
            groupAdmin: isGroupchats ? [new ObjectId(userId)] : [],
            grouphobbies: isGroupchats ? GroupHobbies : [],
            isPrivate: isPrivate ? true : false,
            ishidegroup: hide_group,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: [longitude, latitude]
            },
            groupAddress: groupAddress
        });

        const resp = await newChat.save();
        console.log("responserss", resp);
        // Send notifications to members if group chat

        /*  if (isGroupchats) {
             for (let i = 0; i < members?.length; i++) {
 
                 let memberId = members[i];
 
                 let findInstanceUser = await User.findOne({ _id: new ObjectId(memberId) });
                 console.log("🚀 ~ Createchat ~ findInstanceUser:", findInstanceUser)
 
                 if (!findInstanceUser) return;
                 if (isPushNotificationEnabled(findInstanceUser?.pushNotification)) {
                     console.log("🚀 ~ Createchat ~ findInstanceUser.pushNotification:", findInstanceUser.pushNotification)
                     await sendPushNotification({
                         type: "Newgroup",
                         tokens: findInstanceUser.fcmToken,
                         title: "New Group",
                         content: memberId.toString() === userId.toString()
                             ? "You created a new group"
                             : `${findInstanceUser.username} added you to a new group ${chatName}`,
 
                         extraData: findInstanceUser
                     });
                     console.log("🚀 ~sended Createchat ~ findInstanceUser.pushNotification:",)
 
                 }
             }
 
             const withOutMyId = memberIds?.length > 0 ? memberIds.filter((id) => id != userId) : [];
             withOutMyId?.length > 0 && withOutMyId?.map(async (ids) => {
                 let findInstanceUser = await User.findOne({ _id: new ObjectId(ids) });
                 
                 const activitysave = {
                     DBName: Notification,
                     Data: {
                         userId: new ObjectId(userId),
                         action: "New Group",
                         status: findUser?.privacy_status,
                         from: new ObjectId(userId),
                         to: new ObjectId(ids),
                         message: `${findInstanceUser.username} has added you to a group.`,
                         type: "Add New Group"
                     }
                 }
                 await Save(activitysave)
             })
         } */

        if (isGroupchats) {
            /*  for (let i = 0; i < members.length; i++) {
                 console.log("Member_ID:", members[i]);
                 let MemberData = members[i];
 
                 let findInstanceUser = await User.findOne({ _id: new ObjectId(MemberData) });
                 console.log("findInstanceUser", findInstanceUser);
 
                 if (findInstanceUser && isPushNotificationEnabled(findInstanceUser?.pushNotification)) {
                     await sendPushNotification({
                         type: "Newgroup",
                         tokens: findInstanceUser?.fcmToken, // Use the correct token from the found user
                         title: "New Group",
                         content: findInstanceUser?._id.toString() === userId.toString()
                             ? "You have created a new group"
                             : `${findUser?.username} is added you to a new group`
                     });
                 }
             } */

            const withOutMyId = resp?.members?.filter(id => id.toString() !== userId.toString());

            for (const ids of withOutMyId) {
                const findInstanceUser = await User.findOne({ _id: new ObjectId(ids) }, { _id: 1, fcmToken: 1, username: 1, language: 1, pushNotification: 1 });
                console.log("🚀 ~ Createchat ~ findInstanceUser:", findInstanceUser.fcmToken)
                // if (!findInstanceUser) continue;
                if (findInstanceUser && isPushNotificationEnabled(findInstanceUser?.pushNotification)) {
                    await sendPushNotification({
                        type: "Newgroup",
                        tokens: findInstanceUser?.fcmToken, // Use the correct token from the found user
                        title: "New Group",
                        content: `${findUser?.username} is added you to a new group`,
                        extraData: { ...resp, type: "Newgroup" }
                    });
                }
                // await Save({
                //     DBName: Notification,
                //     Data: {
                //         userId: new ObjectId(userId),
                //         action: "New Group",
                //         status: findUser?.privacy_status,
                //         from: new ObjectId(userId),
                //         to: new ObjectId(ids),
                //         message: `${findUser.username} has added you to a group.`,
                //         type: "Add New Group",
                //         groupId: resp?._id
                //     }
                // });
                await saveNotification({
                    userId: new ObjectId(userId),
                    action: "New Group",
                    status: findUser?.privacy_status,
                    from: new ObjectId(userId),
                    to: new ObjectId(ids),
                    message: `${findUser.username} has added you to a group.`,
                    type: "Add New Group",
                    groupId: resp?._id,
                    io
                })
            }

            const friendRelations = await follownotify.find(
                {
                    status: "completed",
                    $or: [
                        { from: new ObjectId(userId) },
                        { to: new ObjectId(userId) }
                    ]
                },
                { from: 1, to: 1 }
            ).lean();

            const alreadyNotifiedIds = new Set(
                (resp?.members || []).map(id => id.toString())
            );
            alreadyNotifiedIds.add(userId.toString());

            const friendIds = [
                ...new Set(
                    friendRelations.map(relation =>
                        relation?.from?.toString() === userId.toString()
                            ? relation?.to?.toString()
                            : relation?.from?.toString()
                    ).filter(Boolean)
                )
            ].filter(id => !alreadyNotifiedIds.has(id));

            for (const friendId of friendIds) {
                const friendUser = await User.findOne(
                    { _id: new ObjectId(friendId) },
                    { _id: 1, fcmToken: 1, pushNotification: 1, userblocked: 1 }
                ).lean();

                if (!friendUser) continue;

                const isBlockedByEitherUser =
                    friendUser?.userblocked?.some(
                        blockedId => blockedId?.toString() === userId.toString()
                    ) ||
                    findUser?.userblocked?.some(
                        blockedId => blockedId?.toString() === friendId.toString()
                    );

                if (isBlockedByEitherUser) {
                    continue;
                }

                if (isPushNotificationEnabled(friendUser?.pushNotification)) {
                    await sendPushNotification({
                        type: "Newgroup",
                        tokens: friendUser?.fcmToken,
                        title: "New Group",
                        content: `${findUser?.username} created a new group`,
                        extraData: { ...resp.toObject(), type: "Newgroup" }
                    });
                }

                await saveNotification({
                    userId: new ObjectId(userId),
                    action: "New Group",
                    status: findUser?.privacy_status,
                    from: new ObjectId(userId),
                    to: new ObjectId(friendId),
                    message: `${findUser?.username} created a new group.`,
                    type: "Add New Group",
                    groupId: resp?._id,
                    io
                });
            }
        }

        // const roomId = resp?._id?.toString();
        // if (io.sockets.adapter.rooms.has(roomId)) {
        //     console.log(`Emitting to room: ${roomId}`);
        //     io.sockets.in(roomId).emit("InstanceResponse", { resp, isGroupchat: isGroupchats });
        // } else {
        //     console.warn(`Room ${roomId} does not exist or has no users.`);
        // }
        const findUserMembers = await User.find({}, { _id: 1 })
        let userIds = findUserMembers?.map(user => user?._id?.toString());
        let commonMembers = members?.filter(mem => userIds?.includes(mem));
        console.log("commonMembers", commonMembers);
        await Promise.all(commonMembers && commonMembers?.map((ids => {
            io?.sockets?.to(ids?.toString()).emit("InstanceResponse", { resp, isGroupchat: isGroupchats });
        })))
        await AddRemoveCreateGroup({ userId: userId, isGroupchats: isGroupchats, instanceId: resp?._id, groupmembers: members ? members : [], io: io })

        // SocketEmitAll("InstanceResponse", resp);
        return res.status(200).json(EncryptData({
            statusCode: 200,
            status: true,
            message: t((user && user.language) ? user.language : "english", "new_instance_created"),
            data: resp,
            Groupimage: '/GroupImage/'
        }));

    } catch (error) {
        catchErrorResponse(res, error);
    }
};

export const NewGroupMembersAdd = async (req, res) => {
    console.log("dfvsdzfdsgdgv", req.body);
    try {
        const { userId, instanceId, members } = req.body
        let findUser = await User.findOne({ _id: userId })
        if (findUser) {
            let resp = await ChatModel.findOneAndUpdate({ _id: new ObjectId(instanceId) }, { $set: { "members": members } }, { new: true })
            console.log("newmembers", resp);
            if (resp) {
                return res.status(200).json({ status: true, message: "Added new members", data: resp })
            }
            else {
                return res.status(200).json({ Status: false, message: "something error" })
            }
        }
        else {
            return res.status(200).json({ status: false, message: "user not found" })
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/* Create message */
/* -----------------------------------------------------> */


// // File handling logic with optimizations
// const handleFileUploads = async (files, audio, arr, compress_arr) => {
//     console.log("filesimages", files)
//     await fs.promises.mkdir(fileUploadDir, { recursive: true });
//     await fs.promises.mkdir(fileUploadDirCompress, { recursive: true });
//     const uploadPromises = [];

//     if (files) {
//         files = Array.isArray(files) ? files : [files];
//         await Promise.all(files.map(async (img, i) => {
//             try {
//                 let compressimgname = `${Date.now() + String(i)}_compressed_image.webp`;
//                 let CompressImage = await Imagecompress({ image: img, path: fileUploadDirCompress, imagename: compressimgname });

//                 const fileExtension = img?.name.split('.').pop().toLowerCase();
//                 const fileName = (fileExtension === "heic" || fileExtension === "heif")
//                     ? `${Date.now()}_${i}.webp`
//                     : `${Date.now()}_${i}.${fileExtension}`;

//                 arr.push(fileName);
//                 compress_arr.push(CompressImage);
//                 await img.mv(path.join(fileUploadDir, fileName));
//             } catch (error) {
//                 console.error(`Failed to upload file: ${img.name}, error: ${error.message}`);
//             }
//         }));
//     }

//     if (audio) {
//         audio = Array.isArray(audio) ? audio : [audio];
//         await Promise.all(audio.map(async (audioFile, i) => {
//             try {
//                 const fileName = Date.now() + i + ".mp3";
//                 arr.push(fileName);
//                 await audioFile.mv(path.join(fileUploadDir, fileName));
//             } catch (error) {
//                 console.error(`Failed to upload audio file: ${audioFile.name}, error: ${error.message}`);
//             }
//         }));
//     }
// };


// // Notification logic with optimizations
// const notifyUsers = async (MessageReceiveUsers, savedMessage, arr, text, chatId, io, findchat) => {
//     console.log("frtgrtrtrtyrty", MessageReceiveUsers, findchat);
//     const MsgDataUser = await User.findOne({ _id: new ObjectId(chatId) });
//     if (!MsgDataUser) return;

//     // Notify all members concurrently
//     await Promise.all(MessageReceiveUsers.map(async (member) => {
//         const user = await User.findOne({ _id: member });
//         await GetInstanceSocket({ userId: member, io: io });
//         if (user && user.pushNotification) {
//             await sendPushNotification({
//                 type: "Chatting",
//                 tokens: user.fcmToken,
//                 title: findchat.isGroupchat ? findchat.chatName : MsgDataUser.username,
//                 content: text,
//                 fileUrls: arr,
//             });
//         }
//     }));
// };
/* -----------------------------------------------> */


/*
 * METHOD : POST
 * BODY: (chatId, instanceId, text)
 * URL : /v1/chat/creatMessage
 */
// const fileUploadDir = './public/Chatimage/';
// const fileUploadDirCompress = './public/Chatimage/Compress/';
// const AudiofileUploadDirCompress = './public/Chatimage/CompressAudio/';


export const creatMessage = async (req, res) => {
    // console.log("Message_request:", req.body, "imageFiles", req.files);

    try {
        const io = req?.app?.get("io");
        const { body: { chatId, instanceId, text, messageId, replyMsgId }, user } = req;
        let files = req?.files && req?.files?.file;
        let arr = [];
        let compress_arr = [];

        let audio = req?.files && req?.files?.voicerecord;
        console.log("🚀 ~ creatMessage ~ audio:", audio)
        console.log("creatMessage_instanceId", instanceId);

        // Fetch user and chat data concurrently
        const [Finduser, findchat] = await Promise.all([
            User.findOne({ _id: new ObjectId(chatId) }),
            ChatModel.findOne({ _id: new ObjectId(instanceId) }).populate({ path: "members", select: "_id profile username randomIndex userblocked" })
        ]);
        if (!Finduser || !findchat) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "chat_user_or_instance_not_found") }));
        }

        // Handle file uploads concurrently
        if (req?.files) {
            await handleFileUploads(files, audio, arr, compress_arr);
        }
        /* let BlockUser = [];
        if (!findchat?.isGroupchat) {
            console.log("sssssssssssssssssss", findchat?.members, chatId);
            let members = findchat?.members?.filter(member => member._id.toString() === chatId.toString());
            console.log("membersmembers", members);
            const blockUser = members?.map((el => el.userblocked)).flat()
            console.log("blockUserblockUser", blockUser);
            let findBlockUser = blockUser?.some(id => id.toString() !== chatId.toString());
            console.log("findBlockUserfindBlockUser", findBlockUser);
            if (findBlockUser) {
                BlockUser = findchat?.members
                    .filter(item => !blockUser?.map(id => id.toString()).includes(item._id.toString()))
                    .map(item => item._id);
            } else {
                BlockUser = findchat?.members.map(el => el._id);
            }
        } */
        let BlockUser = [];

        if (!findchat.isGroupchat) {
            // get the members matching chatId
            const members = findchat?.members?.filter(
                (member) => member._id.toString() == chatId.toString()
            );
            console.log("members_blockUser", members);

            // collect blocked user IDs from those members
            // const blockUser = members?.map((el) => el.userblocked.toString()).flat() || [];
            const blockUser = members
                ?.map(el => el.userblocked.map(id => id.toString())) // map each ObjectId
                .flat() || [];
            console.log("userblocked_blockUser", blockUser);
            if (blockUser.length > 0) {
                BlockUser = blockUser;
            }
        }
        BlockUser = BlockUser?.map(el => el.toString())
        const result = findchat?.members.filter(item => !BlockUser.includes(item._id.toString()));
        let Currentmembers = findchat?.isGroupchat ? findchat?.members : result;
        console.log("Image_BlockUser=======>", BlockUser, Currentmembers, findchat?.members);
        // Prepare the message payload
        const payload = {
            chatId: new ObjectId(chatId),
            instanceId: new ObjectId(instanceId),
            senderId: findchat?.members?.filter(member => !member.equals(chatId)),
            replyMessage: replyMsgId ? new ObjectId(replyMsgId) : "000000000000000000000000",
            text: text || '',
            voicerecord: audio ? arr : [],
            // compressAudio: audio ? compressAudio_arr : [],
            file: files ? arr : [],
            compressfile: files ? compress_arr : [],
            groupmembers: Currentmembers
        };
        console.log("payload", payload);

        // Save the message
        const message = new MessageModel(payload);
        const savedMessage = await message.save();
        // console.log("vfvfvfvvfv", savedMessage)
        if (!savedMessage) {
            io?.sockets?.in(instanceId?.toString()).emit("messageResponse", "Something went wrong");

            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "failed_save_message") }));
        }
        const messages = await messageDetails({ DBName: MessageModel, savedMessageId: savedMessage?._id })
        // Emit socket event for the new message
        /* const Displayprofile = await MessageModel.findOne({ _id: savedMessage?._id })
            .populate({ path: "chatId", select: "_id profile randomIndex username name" })
            .populate({ path: "instanceId", populate:{path:"replyMessage", select:"instanceId chatId text file compressfile voicerecord messageData seenStatus messageDelete"}  }).lean(); */
        const Displayprofile = messages?.data?.[0];
        if (Displayprofile) {
            io?.sockets?.in(instanceId?.toString()).emit("messageResponse", { ...Displayprofile, messageId: messageId ? messageId : "" });
        }

        // }

        // Notify users asynchronously without delaying the response
        const member = findchat?.members?.filter(member => !member.equals(chatId))

        // await io?.sockets?.in(members?.toString()).emit("Singlechat_counts", { SingleChatCounts: result });
        console.log("membermember", member, findchat?.members);
        // await notifyUsers(member, savedMessage, arr, text, chatId, io, findchat, BlockUser, res);
        notifyUsers(member, savedMessage, arr, text, chatId, io, findchat, BlockUser, res);
        let chattingPerson = null;
        if (!findchat?.isGroupchat) {
            chattingPerson = member?.[0];
        }

        const isBlocked = BlockUser?.includes(member?.[0]?._id?.toString()) || false;
        console.log("isBlocked", isBlocked, !isBlocked);
        // await socketCreateMessage({ findchat, chattingPerson: member?.[0], io, member, BlockUser, chatId })
        if (!findchat?.isGroupchat && chattingPerson && !isBlocked) {
            console.log("KKKKKKKKKKKKK--------->");
            const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: member?.[0]?._id, io, BlockUser });
            io?.sockets?.to(member?.[0]?._id?.toString()).emit("Singlechat_counts", {
                SingleChatCounts: result?.SingleChatCounts
            });
        }
        // if (findchat?.isGroupchat && findchat?.iseventchat) {
        //     for (const value of member) {
        //         const isBlocked = BlockUser?.includes(value._id?.toString()) || false;
        //         if (!isBlocked) {
        //             const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: value._id, io });
        //             io.to(value._id.toString()).emit("eventchat_counts", {
        //                 eventChatCounts: result?.eventChatCounts
        //             });
        //         }
        //     }
        // }
        if (findchat?.isGroupchat && findchat?.iseventchat) {
            const tasks = member?.map(async (value) => {
                const isBlocked = BlockUser?.includes(value._id?.toString()) || false;
                if (!isBlocked) {
                    try {
                        const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: value._id, io });
                        io.to(value._id.toString()).emit("eventchat_counts", {
                            eventChatCounts: result?.eventChatCounts
                        });
                    } catch (err) {
                        console.error(`Failed for user`, err.message);
                    }
                }
            });

            const results = await Promise.all(tasks);
            console.log("allSettled_results", results);
        }
        // await socketCreateMessage({ findchat, chattingPerson, io, member, BlockUser, chatId })
        // const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: member, io, BlockUser });
        // if (!findchat?.isGroupchat && chattingPerson && BlockUser?.some(elt => elt.toString() != chatId.toString())) {
        //     io.sockets.in(member?.[0]?._id?.toString()).emit("Singlechat_counts", {
        //         SingleChatCounts: result?.SingleChatCounts
        //     });
        // console.log("FDRGFRGFDGFG");
        // }

        //         if (findchat?.isGroupchat && findchat?.iseventchat) {
        //             // const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: member?.[0]?._id, io });
        //             // console.log("rhbggthtr__result", result);
        // console.log("Event_chat",member?.[0]?._id);

        //             io.sockets.in(member?.[0]?._id?.toString()).emit("eventchat_counts", {
        //                 eventChatCounts: result?.eventChatCounts
        //             });
        //         }
        return res.status(200).json(EncryptData({
            status: true,
            message: t((user && user.language) ? user.language : "english", "message_sent_success"),
            data: { savedMessage, messageId: messageId },
            personalprofile: `/PersonalProfile/`,
        }));

    } catch (error) {
        console.error("Error sending message:", error);
        catchErrorResponse(res, error);
    }
};

// // File handling logic with optimizations
// export const handleFileUploads = async (files, audio, arr, compress_arr) => {
//     console.log("filesimages", arr, files)
//     await fs.promises.mkdir(fileUploadDir, { recursive: true });
//     await fs.promises.mkdir(fileUploadDirCompress, { recursive: true });
//     // await fs.promises.mkdir(AudiofileUploadDirCompress, { recursive: true });



//     if (files) {
//         files = Array.isArray(files) ? files : [files];
//         await Promise.all(files.map(async (img, i) => {
//             try {
//                 let compressimgname = `${Date.now() + String(i)}_compressed_image.webp`;
//                 let CompressImage = await Imagecompress({ image: img, path: fileUploadDirCompress, imagename: compressimgname });

//                 const fileExtension = img?.name?.split('.').pop().toLowerCase();
//                 const fileName = (fileExtension == "heic" || fileExtension == "heif" || fileExtension == "HEIC" || fileExtension == "HEIF")
//                     ? `${Date.now()}_${i}.webp`
//                     : `${Date.now()}_${i}.${fileExtension}`;

//                 arr.push(fileName);
//                 compress_arr.push(CompressImage);
//                 await img.mv(path.join(fileUploadDir, fileName));
//             } catch (error) {
//                 console.error(`Failed to upload file: ${img.name}, error: ${error.message}`);
//             }
//         }));
//     }

//     if (audio) {
//         audio = Array.isArray(audio) ? audio : [audio];
//         await Promise.all(audio.map(async (audioFile, i) => {
//             try {
//                 let fileName;
//                 // let androidFilename;
//                 const fileExtension = audioFile?.name?.split('.').pop().toLowerCase();
//                 const fileType = (fileExtension == "m4a" || fileExtension == "mp4" || fileExtension == "wav" || fileExtension == "mpeg")
//                 if (fileType) {
//                     fileName = `${Date.now()}_${i}.${fileExtension}`;
//                     // androidFilename = Date.now() + i + ".mp3"
//                 }
//                 else {
//                     fileName = Date.now() + i + ".mp3";
//                     // androidFilename = Date.now() + i + ".mp3"
//                 }
//                 console.log("gvgtghyjyuj", fileName)
//                 // arr.push(fileName);
//                 let result = await Audiofile(audioFile)
//                 // console.log("resultresult", result)
//                 let finalresult = result?.split("/")[2]
//                 // console.log("finalresult",finalresult)
//                 // compressAudio_arr.push(androidFilename)
//                 arr.push(finalresult);

//                 // await audioFile.mv(path.join(fileUploadDir, finalresult));
//                 // await audioFile.mv(path.join(fileUploadDir, fileName));

//                 // await audioFile.mv(path.join(AudiofileUploadDirCompress, androidFilename));

//             } catch (error) {
//                 console.error(`Failed to upload audio file: ${audioFile.name}, error: ${error.message}`);
//             }
//         }));
//     }
// };
// // Notification logic with optimizations
// export const notifyUsers = async (MessageReceiveUsers, savedMessage, arr, text, chatId, io, findchat) => {
//     // console.log("arrayimagess", arr, findchat, "MessageReceiveUsers", MessageReceiveUsers)
//     const MsgDataUser = await User.findOne({ _id: new ObjectId(chatId) });
//     if (!MsgDataUser) return;

//     let Singlechat = await Promise.all(
//         findchat?.members?.map(async (ids) => {
//             const MemberDetails = await User.findOne({ _id: ids._id });
//             return MemberDetails;
//         })
//     );
//     // console.log("SinglechatSinglechat", Singlechat)
//     // let UnBlockUser;
//     const unblockedUsers = MessageReceiveUsers.filter(userId =>
//         !MsgDataUser?.userblocked.some(blockedId => blockedId.equals(userId))
//     );
//     // console.log("DFGGGGGG0",unblockedUsers);
//     // if(unblockedUsers?.length <=0){
//     //     UnBlockUser = MessageReceiveUsers;
//     // }
//     // else{
//     //     UnBlockUser = unblockedUsers
//     // }
//     // console.log("unblockedUsersunblockedUsers", unblockedUsers);
//     /*   const formattedUsers = MessageReceiveUsers.map(id => new ObjectId(id));

//       const MessageReceiveUsers = [
//           new ObjectId('677dfe7ce42863b5d4c7d3b9'),
//           new ObjectId('677dfe7ce42863b5d4c7d3ba'),
//       ];

//       const chatId = '64f1b23908f9c8d45678abcd'; // Example chat ID

//       const users = await User.find({
//           _id: new ObjectId(chatId),
//           userblocked: { $nin: MessageReceiveUsers },
//       });

//       console.log("Filtered Users:", users); */


//     const users = await User.find({ _id: { $in: unblockedUsers } });
//     // // console.log("dfrsedfggggggggggg", users)
//     let usersRecords = await User.find({ _id: { $in: unblockedUsers } });
//     if (MsgDataUser) {
//       usersRecords.push(MsgDataUser);
//     }
//     console.log("Fetched User Records:", usersRecords);
//     await Promise.all(
//       usersRecords.map(async (userData) => {
//         try {
//           await GetInstanceSocket({ userId: userData?._id, io: io });
//         } catch (error) {
//           console.error(`Failed to process user with ID: ${userData?._id}`, error);
//         }
//       })
//     );


//     await Promise.all(users.map(async (user) => {
//         // console.log("user_user_user_user", user)

//         // await GetInstanceSocket({ userId: user?._id, io: io });
//         // const RemoveMyUserId = users.filter(
//         //     (UserId) => UserId?._id.toString() !== MsgDataUser?._id.toString()
//         // );
//         // console.log("erdstery66yyyyyyyyyyyyyyyyyyyyyy", RemoveMyUserId);
//         // const users = await User.find({_id:{ $in: unblockedUsers } });
//         // await Promise.all(RemoveMyUserId.map(async (UserData) => {
//         // console.log("dsgttttttttttttttttttttttttttttt", UserData);
//         if (user?.pushNotification) {
//             await sendPushNotification({
//                 type: "Chatting",
//                 tokens: user?.fcmToken,
//                 title: findchat?.isGroupchat ? findchat?.chatName : MsgDataUser?.username,
//                 content: text,
//                 fileUrls: arr,
//                 extraData: {
//                     chatName: findchat?.chatName, isGroupChat: findchat?.isGroupchat, Image: findchat?.Image, groupIndex: findchat?.groupIndex, profile: MsgDataUser?.profile, randomIndex: user?.randomIndex, username: MsgDataUser?.username, _id: findchat?._id, members: Singlechat, groupDiscription: findchat?.groupDiscription, type: "chat", CreatedAt: findchat?.createdAt,
//                     members: [{ username: MsgDataUser?.username }],
//                     groupCreater: {
//                         profile: MsgDataUser?.profile, chatName: findchat?.chatName, _id: chatId, username: MsgDataUser?.username, createdAt: findchat?.createdAt, MychatDiscription: MsgDataUser?.MychatDiscription
//                     }
//                 }
//             });
//         }
//         // }))

//     }));
// };



/*
 * METHOD : POST
 * BODY: (userId, instanceId, page, limit)
 * URL : /v1/chat/getMessagesChat
 */
export const getMessages = async (req, res) => {
    // console.log("requests", req.body);
    try {
        const { body: { userId, instanceId, page, limit }, user } = req
        const skip = ((page ? parseInt(page) : 1) - 1) * parseInt(limit)

        console.log("dfgfgfgfggf", skip, "page", page);

        const messagesAggregation = await chatMessages({ DBName: MessageModel, instanceId, userId, skip, limit });
        console.log("🚀 ~ getMessages ~ messagesAggregation:", messagesAggregation)
        let resp = messagesAggregation?.data || [];
        let [findUser, instanceLists] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }, { _id: 1, username: 1, profile: 1, randomIndex: 1 }),
            ChatModel.findOne({ _id: new ObjectId(instanceId), isGroupchat: false }).populate({ path: "members", select: "_id username profile randomIndex userblocked" })
        ])

        let findBlockUser = false;
        if (instanceLists) {
            let members = instanceLists?.members?.filter((id => id._id != new ObjectId(userId)))
            // console.log("membersmembersmembers", members);
            const blockUser = members?.map((el => el.userblocked)).flat()
            // console.log("blockUser", blockUser);
            var uniq = [...new Set(blockUser)];
            // console.log("uniquniq", uniq);
            findBlockUser = uniq?.some(id => id.equals(userId));
        }

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }

        console.log("responses_getmessages", JSON.stringify(resp, null, 2));

        if (resp && resp?.length > 0) {
            const responsePayload = {
                status: true,
                message: t((user && user.language) ? user.language : "english", "Messages_retrieved"),
                data: resp,
            };

            if (findBlockUser) {
                responsePayload.blocked = true;
            }
            return res.status(200).json(EncryptData(responsePayload));

            // return res.status(200).json(({ status: true, message: "Messages retrieved successfully", data: resp }));
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_messages_found") }));
        }
    } catch (error) {
        // console.log("errorr", error)
        catchErrorResponse(res, error);
    }
}

/*
 * METHOD : POST
 * BODY: (member, messageid, text)
 * URL : /v1/chat/editMessage
 */
export const editMessage = async (req, res) => {
    console.log("editMessage", req.body);
    try {
        const { body: { member, messageid, text }, user } = req;
        const io = req.app.get("io")
        let resp = await MessageModel.findOneAndUpdate(
            { _id: new ObjectId(messageid) },
            { $set: { text: text, edited_status: true } },
            { new: true }
        ).populate({ path: "chatId", select: "_id name username profile randomIndex" }).lean();
        console.log("responses_edit", resp);

        if (resp) {

            await Promise.all(member?.map(async (values) => {

                console.log("values_all_delete_backend", values);
                // SocketEmit("updateResponse", resp, values.toString());
                // io.sockets.in(values.toString()).emit("updateResponse", "Something went wrong");

                let findUser = await User.findOne({ _id: { $in: member } });
                console.log("findUser", findUser);

                if (findUser) {
                    io?.sockets?.in(values?.toString()).emit("updateResponse", resp);
                    // SocketEmit("updateResponse", resp, values.toString());
                }
            }));


            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "message_edited"), data: resp }));
        } else {

            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "message_not_edited"), data: resp }));
        }

    } catch (error) {
        // Send error response in case of an exception
        catchErrorResponse(res, error);
    }
};

/*
 * METHOD : POST
 * BODY: (memberid, id, action, delteperson)
 * URL : /v1/chat/deleteMessage
 */
export const deleteMessage = async (req, res) => {
    console.log("deleteMessage", req.body);
    try {
        const { body: { memberid, id, userId, action, delteperson }, user } = req;
        const io = req.app.get("io");

        const findUser = await User.findById(delteperson);
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        const messageIds = id?.map((msgId) => new ObjectId(msgId));
        console.log("messageIds", messageIds);

        let responseCollection = [];

        if (action === "every") {
            if (!Array.isArray(memberid) || memberid?.length == 0) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "member_id_list_required") }));
            }

            await Promise.all(
                memberid?.map(async (member) => {
                    if (!ObjectId.isValid(member)) return;

                    const findMember = await User.findById(member);
                    if (!findMember) return;

                    for (const messageId of messageIds) {
                        let resp = await MessageModel.findOneAndUpdate(
                            { _id: messageId },
                            { $addToSet: { messageDelete: { id: new ObjectId(member), action: "every" } } },
                            { new: true }
                        )
                            .populate({ path: "chatId", select: "_id username profile randomIndex online_status" })
                            .lean();
                        resp?.file.length > 0 && resp.file.map(async (img) => {
                            const deleteImg = img?.slice(1)
                            let vibe = await deleteImageFromS3(deleteImg)
                            console.log("vibesss", vibe);

                        })
                        resp?.voicerecord.length > 0 && resp.voicerecord.map(async (voicerec) => {
                            const deleteImg = voicerec?.slice(1)
                            await deleteImageFromS3(deleteImg)
                        })
                        console.log("DELETET_every", resp);

                        io?.sockets?.in(member?.toString()).emit("deleteResponse_every", resp || "Something went wrong");

                        responseCollection.push(resp ? { status: true, message: t((user && user.language) ? user.language : "english", "deleted_successfully"), data: resp } : { status: false, message: "Not deleted" });
                    }
                })
            );
        }
        else {
            for (const messageId of messageIds) {
                let resp = await MessageModel.findOneAndUpdate(
                    { _id: messageId },
                    { $addToSet: { messageDelete: { id: new ObjectId(delteperson), action: "me" } } },
                    { new: true }
                )
                    .populate({ path: "chatId", select: "_id username profile randomIndex online_status" })
                    .lean();

                io.sockets.in(delteperson?.toString()).emit("deleteResponse_me", resp || "Something went wrong");

                responseCollection.push(resp ? { status: true, message: t((user && user.language) ? user.language : "english", "deleted_successfully"), data: resp } : { status: false, message: t((user && user.language) ? user.language : "english", "not_deleted") });
            }
        }

        console.log("responseCollection", responseCollection);
        return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "deletion_completed"), data: responseCollection }));

    } catch (error) {
        console.error("Error in deleteMessage:", error);
        return res.status(200).json(EncryptData({ status: false, message: t((req.user && req.user.language) ? req.user.language : "english", "server_error"), error: error.message }));
    }
};

// export const deleteMessage = async (req, res) => {
//     console.log("deleteMessage", req.body);
//     try {
//         const { memberid, id, userId, action, delteperson } = req.body
//         const io = req.app.get('io')
//         let findUser = await User.findOne({ _id: new ObjectId(delteperson) })
//         console.log("findUser_deleted_me", findUser);
//         if (!findUser) {
//             return res.status(200).json(EncryptData({ status: false, message: "User not found" }));
//         }
//         const messageIds = id.map((msgId) => new ObjectId(msgId));
//         console.log("messageIds", messageIds);
//         let responseCollection = [];
//         if (action == "every") {
//             for (const messageId of messageIds) {

//                 await Promise.all(memberid?.map(async (values) => {
//                     console.log("vvalues_all_delete_backend", values);
//                     let findUser = await User.findOne({ _id: new ObjectId(values) })
//                     console.log("findUser_deleted", findUser);
//                     if (!findUser) {
//                         return res.status(200).json(EncryptData({ status: false, message: "User not found" }));
//                     }
//                     let resp = await MessageModel.findOneAndUpdate({ _id: messageId }, { $addToSet: { "messageDelete": { id: new ObjectId(values), "action": "every" } } }, { new: true }).populate("chatId").lean()
//                     console.log("responsessss", resp);
//                     io.sockets.in(values?.toString()).emit("deleteResponse_every", resp);

//                     if (resp) {
//                         responseCollection.push({ status: true, message: "Deleted successfully", data: resp });
//                     } else {
//                         io.sockets.in(values?.toString()).emit("deleteResponse_every", "Something went wrong");
//                         responseCollection.push({ status: false, message: "Not deleted" });
//                     }
//                 }));
//             }
//         }
//         else {
//             for (const messageId of messageIds) {
//                 let resp = await MessageModel.findOneAndUpdate({ _id: messageId }, { $addToSet: { "messageDelete": { id: new ObjectId(delteperson), "action": "me" } } }, { new: true }).populate("chatId").lean()

//                 io.sockets.in(delteperson?.toString()).emit("deleteResponse_me", resp);

//                 if (resp) {
//                     responseCollection.push({ status: true, message: "Deleted successfully", data: resp });
//                 } else {
//                     io.sockets.in(delteperson?.toString()).emit("deleteResponse_me", "Something went wrong");
//                     responseCollection.push({ status: false, message: "Not deleted" });
//                 }

//             }
//         }
//         console.log("responseCollection", responseCollection);
//         return res.status(200).json(EncryptData({ status: true, message: "Deleted completed", data: responseCollection }));
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }


/*
 * METHOD : POST
 * BODY: (instanceId,chatId)
 * URL : /v1/chat/SeenUser
 */
// export const SeenUser = async (req, res) => {
//     console.log("req_body", req.body);
//     try {
//         const { instanceId, chatId } = req.body
//         let resp = await MessageModel.updateMany({ instanceId: instanceId, "seenStatus": { $nin: [new ObjectId(chatId)] } }, { $push: { "seenStatus": new ObjectId(chatId) } })
//         console.log("response", resp);
//         if (resp) {
//             SocketEmit("SEEN_STATUS", resp, instanceId.toString());

//             res.status(200).json({ status: true, message: "seen", data: resp })
//         }
//         else {
//             SocketEmit("SEEN_STATUS", resp, instanceId.toString());

//             res.status(200).json({ status: false, message: "not seen", data: resp })

//         }

//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }

/*
 * METHOD : POST
 * BODY: (chatId, instanceId)
 * URL : /v1/chat/SeenUser
 */
// export const SeenUser = async (req, res) => {
//     console.log("req_body_SeenUser", req.body);
//     try {
//         const { chatId, instanceId } = req.body;
//         const io = req.app.get("io");
//         const resp = await Message.updateMany(
//             { instanceId: instanceId, "seenStatus.seen": { $ne: new ObjectId(chatId) } },
//             {
//                 $push: { "seenStatus": { seen: new ObjectId(chatId), date: new Date() } }
//             }
//         );

//         if (resp) {
//             io.sockets.in(instanceId.toString()).emit("SEEN_STATUS", {
//                 instanceId: instanceId,
//                 chatId: chatId,
//                 seenStatus: new ObjectId(chatId),
//                 date: new Date(),
//             });

//             return res.status(200).json(EncryptData({ status: true, message: "Message marked as read", data: resp }));
//         } else {

//             return res.status(200).json(EncryptData({ status: false, message: "Message was already read or no changes made", data: resp }));
//         }
//     } catch (error) {
//         console.log("error", error);
//         catchErrorResponse(res, error)
//         // return res.status(200).json(EncryptData({ status: false, message: "Error updating seen status", error: error.message }));
//     }
// };


/*
 * METHOD : POST
 * BODY: (page, limit, userId, type(groupchat,eventchat))
 * URL : /v1/chat/getInitialchatdata
 */
export const getInitialchatdata = async (req, res) => {
    console.log("getInitialchatdata reqbodydata", req.body);
    const url = req.originalUrl.split("?")[0];

    try {
        const { body: { page, limit, userId, type }, user } = req
        const body = req.body || {};
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        // console.log("skiplimits", skip, "page", page, "limit", limit, type)
        // const io = req?.app?.get("io")
        const findUser = await User.findOne({ _id: new ObjectId(userId) })

        // Prefer the location the client sent (active device GPS or
        // user-picked location). Fall back to the stored profile location
        // only when the client did not provide one. Previously this used
        // the profile coordinates unconditionally, causing groups created
        // in another city to leak into the feed when the user moved.
        const ll = body.latLong;
        let reqLat = body.latitude;
        let reqLng = body.longitude;
        if (ll && typeof ll === "object") {
            if (reqLat === undefined || reqLat === null || reqLat === "") {
                reqLat = ll.lat ?? ll.latitude;
            }
            if (reqLng === undefined || reqLng === null || reqLng === "") {
                reqLng = ll.long ?? ll.longitude;
            }
        }
        const parseNum = (v) => {
            if (v === undefined || v === null) return null;
            if (typeof v === "string" && v.trim() === "") return null;
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : null;
        };
        const clientLat = parseNum(reqLat);
        const clientLng = parseNum(reqLng);

        const storedCoords = Array.isArray(findUser?.location?.coordinates)
            ? findUser.location.coordinates
            : [];
        const effectiveLng = clientLng != null ? clientLng : storedCoords[0];
        const effectiveLat = clientLat != null ? clientLat : storedCoords[1];

        const clientDistance = parseNum(body.distance);
        // Default discovery radius matches the existing 100km behaviour.
        const distanceKilometer = (clientDistance != null && clientDistance > 0)
            ? clientDistance * 1000
            : 100 * 1000;

        const viewerHobbyObjectIds = (Array.isArray(findUser?.hobbies) ? findUser.hobbies : [])
            .filter((h) => ObjectId.isValid(String(h)))
            .map((h) => new ObjectId(h));

        let payload = {
            DBName: ChatModel, uesrId: userId, page: skip, limit: limit,
            longitude: effectiveLng,
            latitude: effectiveLat,
            distanceKilometer,
            type: type === "eventchat" ? "eventchat" : "groupchat",
            viewerHobbyIds: viewerHobbyObjectIds,
        }
        let chats = await getInstanceLastmessage(payload)
        // console.log("chatsss1", chats.data, "ChatDDATARTATA", JSON.stringify(chats, null, 2));
        let userDetail;
        // let Respuser;
        let chatData = await Promise.all(chats?.data?.map(async (chat) => {
            // console.log("chatsss1_chatsss1", chat);

            let otherMembers = chat?.members || [];
            // ?.filter(member => !member.equals(req.body.userId));
            // console.log("otherMembers", otherMembers);
            let memberDetails = await Promise.all(otherMembers?.map(async (memberId) => {
                // console.log("memberDetails", memberId);

                let user = await User.findOne({ _id: memberId })
                // console.log("users", user);

                userDetail = user;
                return user ? { _id: user?._id, name: user?.name, online_status: user?.online_status, bioimage: user?.bioimage, randomIndex: user?.randomIndex, username: user?.username, userblocked: user?.userblocked, profile: user?.profile } : null;
            }));
            memberDetails = memberDetails.filter(Boolean);
            return {
                chatName: chat?.chatName,
                groupAdmin: chat?.groupAdmin,
                messageDelete: chat?.messageDelete,
                groupCreater: chat?.groupCreater,
                isGroupchat: chat?.isGroupchat,
                isPrivate: chat?.isPrivate,
                Image: chat?.Image ? chat?.Image : "",
                groupIndex: chat?.groupIndex ? chat?.groupIndex : "",
                ImagePath: chat?.isGroupchat ? `/GroupImage/` : `/PersonalProfile/`,
                groupDiscription: chat?.isGroupchat ? chat?.groupDiscription : "",
                CurrentMessage: chat?.lastMessage ? chat?.lastMessage : "",
                UnreadMessageCount: chat?.UnreadMessageCount?.unread ? chat?.UnreadMessageCount?.unread : 0,
                name: userDetail?.name,
                profile: userDetail?.profile,
                randomIndex: userDetail?.randomIndex,
                username: userDetail?.username,
                CreatedAt: chat?.createdAt,
                _id: chat?._id,
                grouphobbies: chat?.grouphobbies ? chat?.grouphobbies : [],
                eventId: chat?.eventId ? chat?.eventId : [],
                requestedUsers: chat?.requested_users ? chat?.requested_users : [],
                ishidegroup: chat?.ishidegroup,
                members: memberDetails ? memberDetails?.filter(member => member !== null) : res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "no_messages_found") }))
            };
        }));
        // console.log("chatDatachatData", chatData);
        // Respond with the collected chat data
        const responseData = {
            status: true, message: t((user && user.language) ? user.language : "english", "instance_list"), data: chatData
        };
        // const redisKey = (!isEmpty(page) || page !== "all") ? `${url}:${user?._id}:page:${page}:limit:${limit}` : `${url}:${user?._id}`;
        // const data = await redisClient.setEx(redisKey, 300, JSON.stringify(responseData))
        // console.log("🚀 ~ getInitialchatdata ~ data:", data, redisKey)

        return res.status(200).json(EncryptData(responseData));

    } catch (error) {
        catchErrorResponse(res, error)
    }
};

export const getInitialEventchatdata = async (req, res) => {
    console.log("getInitialEventchatdata reqbodydata", req.body);
    const url = req.originalUrl.split("?")[0];

    try {
        const { body: { page, limit, userId, type }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        // console.log("skiplimits", skip, "page", page, "limit", limit, type)
        // const io = req?.app?.get("io")
        // const findUser = await User.findOne({ _id: new ObjectId(userId) })

        let payload = {
            DBName: ChatModel, uesrId: userId, page: skip, limit: limit
        }
        let chats = await getInstanceEventLastmessage(payload)
        console.log("chatsss2222221", chats.data, "ChatDDATARTATA", JSON.stringify(chats, null, 2));
        let userDetail;
        // let Respuser;
        let chatData = await Promise.all(chats?.data?.map(async (chat) => {
            // console.log("chatsss1_chatsss1", chat);

            let otherMembers = chat?.members || [];
            // ?.filter(member => !member.equals(req.body.userId));
            // console.log("otherMembers", otherMembers);
            let memberDetails = await Promise.all(otherMembers?.map(async (memberId) => {
                // console.log("memberDetails", memberId);

                let user = await User.findOne({ _id: memberId })
                // console.log("users", user);

                userDetail = user;
                return user ? { _id: user?._id, name: user?.name, online_status: user?.online_status, bioimage: user?.bioimage, randomIndex: user?.randomIndex, username: user?.username, userblocked: user?.userblocked, profile: user?.profile } : null;
            }));
            memberDetails = memberDetails.filter(Boolean);
            return {
                chatName: chat?.chatName,
                groupAdmin: chat?.groupAdmin,
                messageDelete: chat?.messageDelete,
                groupCreater: chat?.groupCreater,
                isGroupchat: chat?.isGroupchat,
                isPrivate: chat?.isPrivate,
                Image: chat?.Image ? chat?.Image : "",
                groupIndex: chat?.groupIndex ? chat?.groupIndex : "",
                ImagePath: chat?.isGroupchat ? `/GroupImage/` : `/PersonalProfile/`,
                groupDiscription: chat?.isGroupchat ? chat?.groupDiscription : "",
                CurrentMessage: chat?.lastMessage ? chat?.lastMessage : "",
                UnreadMessageCount: chat?.UnreadMessageCount?.unread ? chat?.UnreadMessageCount?.unread : 0,
                name: userDetail?.name,
                profile: userDetail?.profile,
                randomIndex: userDetail?.randomIndex,
                username: userDetail?.username,
                CreatedAt: chat?.createdAt,
                _id: chat?._id,
                grouphobbies: chat?.grouphobbies ? chat?.grouphobbies : [],
                eventId: chat?.eventId ? chat?.eventId : [],
                requestedUsers: chat?.requested_users ? chat?.requested_users : [],
                ishidegroup: chat?.ishidegroup,
                members: memberDetails ? memberDetails?.filter(member => member !== null) : res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "no_messages_found") }))
            };
        }));
        // console.log("chatDatachatData", chatData);
        // Respond with the collected chat data
        const responseData = { status: true, message: t((user && user.language) ? user.language : "english", "instance_list"), data: chatData };
        // const redisKey = (!isEmpty(page) || page !== "all") ? `${url}:${user?._id}:page:${page}:limit:${limit}` : `${url}:${user?._id}`;
        // await redisClient.setEx(redisKey, 300, JSON.stringify(responseData))
        return res.status(200).json(EncryptData(responseData));

    } catch (error) {
        catchErrorResponse(res, error)
    }
};

// export const getInitialchatdata = async (req, res) => {
//     console.log("getInitialchatdata reqbodydata", req.body);
//     try {
//         let payload = { DBName: ChatModel, uesrId: req.body.userId };
//         let chats = await getInstanceLastmessage(payload); // Fetch chats with the last message

//         if (!chats || chats.data.length === 0) {
//             return res.status(200).json({ status: true, message: "No chats found", data: [] });
//         }

//         // Process chat data and fetch members in parallel
//         let chatData = await Promise.all(chats.data.map(async (chat) => {
//             let otherMembers = chat.members.filter(member => !member.equals(req.body.userId));

//             // Fetch user details for other members in one batch query
//             let memberDetails = await User.find({ _id: { $in: otherMembers } }, 'name _id MychatDiscription profile');

//             // Construct chat data
//             return {
//                 chatName: chat?.chatName,
//                 groupAdmin: chat?.groupAdmin,
//                 groupCreater: chat?.groupCreater,
//                 isGroupChat: chat.isGroupchat,
//                 Image: chat?.Image || "",
//                 ImagePath: chat?.isGroupchat ? `/GroupImage/` : `/PersonalProfile/`,
//                 groupDiscription: chat?.isGroupchat ? chat?.groupDiscription : "",
//                 CurrentMessage: chat?.lastMessage || "",
//                 members: memberDetails.map(member => ({
//                     id: member._id,
//                     name: member.name,
//                     MychatDiscription: member.MychatDiscription,
//                     profile: member.profile
//                 }))
//             };
//         }));

//         // Send the response with chat data
//         res.status(200).json({ status: true, message: "Instance list", data: chatData });

//     } catch (error) {
//         catchErrorResponse(res, error);
//     }
// };



/*
 * METHOD : POST
 * BODY: (instanceId, userId, members)
 * URL : /v1/chat/AddGroupAdmin
 */
export const AddGroupAdmin = async (req, res) => {
    console.log("Request Body:", req.body);
    try {
        const { body: { instanceId, userId, members }, user } = req;

        if (!instanceId || !userId) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "missing_fields_instance_user") }));
        }

        let [findUser, groupCheck] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }),
            ChatModel.findOne({ _id: new ObjectId(instanceId), isGroupchat: true }).populate('groupAdmin'),
        ])
        const blockuser = members?.some(el => findUser?.userblocked?.map(id => id.toString()).includes(el.toString()));
        if (findUser && findUser?.userblocked?.length > 0 && blockuser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_blocked") }))
        }

        if (!groupCheck) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "not_group_chat") }));
        }
        else {
            // Check if the user is a group admin
            let [group, adminsCheck, membersCheck] = await Promise.all([
                ChatModel.findOne({ _id: new ObjectId(instanceId), "groupAdmin": { $in: [userId] } }).populate('groupAdmin'),
                ChatModel.findOne({ _id: new ObjectId(instanceId), "groupAdmin": { $in: members } }),
                ChatModel.findOne({ _id: new ObjectId(instanceId), "members": { $in: members } })
            ]);
            if (!group) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "group_not_found_or_not_admin") }));
            }

            // Check if the provided members are already group admins
            if (adminsCheck) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "members_already_admins") }));
            }

            // Check if the provided members are part of the group
            if (!membersCheck) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "members_not_in_group") }));
            }

            // Add new admins and update chat name
            let result = await ChatModel.findOneAndUpdate(
                { _id: new ObjectId(instanceId) },
                {
                    $addToSet: { groupAdmin: { $each: members } }  // Adds unique values to groupAdmin array
                },
                { new: true }
            );

            return res.json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "add_new_group_admin"), data: result }));
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (instanceId, userId, members)
 * URL : /v1/chat/DeleteGroupAdmin
 */
export const DeleteGroupAdmin = async (req, res) => {
    console.log("Request Body:", req.body);
    try {
        const { body: { instanceId, userId, members }, user } = req;

        // Check for required fields
        if (!instanceId || !userId || !Array.isArray(members) || members.length === 0) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "missing_fields_instance_members") }));
        }

        // Fetch group details and check if it’s a group chat
        const groupCheck = await ChatModel.findOne({ _id: new ObjectId(instanceId), isGroupchat: true }).populate('groupAdmin');
        if (!groupCheck) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "not_group_chat_2") }));
        }

        // Check if the requester is a group admin
        if (!groupCheck.groupAdmin.some(admin => admin._id.toString() === userId)) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "only_admins_remove_admins") }));
        }

        // Ensure the requester isn't trying to remove themselves
        if (members.includes(userId)) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "cannot_remove_self_admin") }));
        }

        // Remove specified members from the groupAdmin array
        const result = await ChatModel.findOneAndUpdate(
            { _id: new ObjectId(instanceId) },
            { $pull: { groupAdmin: { $in: members } } },
            { new: true }
        ).populate({ path: 'groupAdmin', select: "_id username profile randomIndex" });

        console.log("Result_delete:", result);

        return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "selected_admins_removed"), data: result }));
    } catch (error) {
        catchErrorResponse(res, error);
    }
};


/*
 * METHOD : POST
 * BODY: (instanceId, userId, groupDiscription, chatName, deleteProfile, members, newMemberAdd, type, grouphobbies, isPrivate, hide_group, deletedGroupImg)
 * URL : /v1/chat/AddEditGroupchat
 */
export const AddEditGroupchat = async (req, res) => {
    console.log("requestEditgroup", req.body, req.files);
    try {
        const io = req?.app?.get("io");
        let { body: { instanceId, userId, groupDiscription = "", chatName = "", deleteProfile = "", members, newMemberAdd, removeMember, type, grouphobbies, isPrivate, hide_group, deletedGroupImg, latitude = "", longitude = "", groupAddress = "" }, user } = req;
        members = members?.length > 0 ? ParsingFunc(members) : [];
        newMemberAdd = newMemberAdd?.length > 0 ? ParsingFunc(newMemberAdd) : [];
        grouphobbies = grouphobbies?.length > 0 ? ParsingFunc(grouphobbies) : [];
        removeMember = removeMember?.length > 0 ? ParsingFunc(removeMember) : [];
        deletedGroupImg = (deletedGroupImg?.length > 0 && Array.isArray(deletedGroupImg)) ? typeof deletedGroupImg == "string" ? ParsingFunc(deletedGroupImg) : deletedGroupImg : [];
        isPrivate = typeof isPrivate == "string" ? ParsingFunc(isPrivate) : isPrivate;
        hide_group = typeof hide_group == "string" ? ParsingFunc(hide_group) : hide_group;
        console.log("🚀 ~ AddEditGroupchat ~ deletedGroupImg:", deletedGroupImg)
        let files = req?.files && req?.files?.groupImages;

        let [findUser, groupCheck, group] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }, { _id: 1, privacy_status: 1, blockStatus: 1, plan: 1, fcmToken: 1, pushNotification: 1, userblocked: 1, location: 1, username: 1, language: 1, hobbies: 1 }).populate("plan"),
            ChatModel.findOne({ _id: new ObjectId(instanceId), isGroupchat: true })
                .populate({ path: 'groupAdmin', select: "_id username name profile randomIndex location" })
                .populate('grouphobbies'),
            ChatModel.findOne({ _id: new ObjectId(instanceId), groupAdmin: { $in: [userId] } })
                .populate({ path: 'groupAdmin', select: "_id username name profile randomIndex location" })
                .populate('grouphobbies')
        ])
        if (groupCheck?.members?.length > 250) {
            return res.json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "Too_many_members") }));
        }
        const blockuser = members?.some(el => findUser?.userblocked?.map(id => id.toString()).includes(el.toString()));
        if (findUser && findUser?.userblocked?.length > 0 && blockuser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_blocked") }))
        }
        // Validate required fields
        if (!instanceId || !userId) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "missing_fields_instance_user") }));
        }

        // Check if the chat is a group chat
        if (!groupCheck) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "not_group_chat") }));
        }

        // Verify if the user is an admin
        if (!group) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_not_admin") }));
        }

        if (!userHasActivePlan(findUser)) {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "free_hobby_subscribe"),
            }));
        }

        let profile = group?.Image; // Keep the current image by default

        const isAdmin = groupCheck.groupAdmin.some(admin => admin._id.toString() == userId.toString());
        if (!isAdmin) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "only_admins_add_remove") }));
        }

        // Handle profile deletion if requested
        if (deleteProfile == true && group?.Image) {
            const deleteImg = group?.Image?.slice(1)
            await deleteImageFromS3(deleteImg)
            profile = "";
        }

        // Process image upload only if deleteProfile is NOT true
        if (deleteProfile !== true && req.files && req.files.image) {
            const deleteImg = group?.Image?.slice(1)
            await deleteImageFromS3(deleteImg)
            let img = req.files.image;
            profile = await ImageAddFunc([
                {
                    files: img,
                    filePath: "groupProfile"
                },
            ]);
            console.log("New profile image:", profile);
        }

        if (deletedGroupImg.length > 0) {
            if (groupCheck.groupImages && Array.isArray(groupCheck.groupImages)) {
                // Iterate through each image in DeleteImage
                deletedGroupImg?.map(async (images) => {
                    console.log("imagesToDelete", images);
                    const deleteImg = images?.slice(1)
                    await deleteImageFromS3(deleteImg)
                    const updatedEvent = await ChatModel.findOneAndUpdate(
                        { _id: new ObjectId(instanceId), groupImages: { $in: images } },
                        { $pull: { groupImages: images } }, // Use $in to pull multiple images
                        { new: true }
                    );
                    console.log("Updated Event after removing images:", updatedEvent);
                })

            } else {
                console.log("Event image field is not an array.");
            }
        }

        if (files) {
            if (!Array.isArray(files)) {
                files = [req?.files?.groupImages];
            }
            if (Array.isArray(files)) {
                await Promise.all(files.map(async (img, i) => {
                    console.log("imnmfar", img);
                    let CompressImage = await Imagecompress({ image: img })
                    console.log("CompressImage", CompressImage);
                    const s3Url = await uploadImageToS3({ fileBuffer: CompressImage, fileMimetype: "image/webp", filePath: "groupImages", index: i });
                    await ChatModel.findOneAndUpdate(
                        { _id: new ObjectId(instanceId) },
                        { $push: { groupImages: s3Url } },
                        { new: true }
                    );
                }));
            }
        }
        longitude = isEmpty(longitude) ? findUser?.location?.coordinates[0] : longitude;
        latitude = isEmpty(latitude) ? findUser?.location?.coordinates[1] : latitude;
        const updateFields = {};
        if (chatName) updateFields.chatName = chatName;
        if (groupDiscription) updateFields.groupDiscription = groupDiscription;
        if (members) updateFields.members = members.length > 0 ? members : groupCheck.members;
        if (grouphobbies) updateFields.grouphobbies = grouphobbies.length > 0 ? grouphobbies : groupCheck.grouphobbies;
        if (isPrivate != undefined) updateFields.isPrivate = isPrivate;
        if (hide_group != undefined) updateFields.ishidegroup = hide_group;
        if (req.files && req.files.image) {
            updateFields.Image = profile;
            updateFields.deleteProfile = false;
        }
        if (!isEmpty(groupAddress)) {
            updateFields.groupAddress = groupAddress;
        }
        updateFields.location = {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: [longitude, latitude]
        }
        let response = await User.find({ _id: { $in: newMemberAdd } })
        response?.length > 0 && response.map(async (res) => {
            if (isPushNotificationEnabled(res?.pushNotification)) {
                await sendPushNotification({
                    type: "add group",
                    tokens: res?.fcmToken,
                    title: "Added to group",
                    content: `${findUser?.username} has added you to Group - ${groupCheck.chatName}`,
                    extraData: { _id: res?._id, chatGroupId: groupCheck?._id, "type": "editchat" }
                });
            }
            /*   const activitysave = {
                  DBName: Notification,
                  Data: {
                      userId: new ObjectId(userId),
                      action: "New Group",
                      status: findUser?.privacy_status,
                      from: new ObjectId(userId),
                      to: new ObjectId(res?._id),
                      message: `${findUser?.username} has added you to a group.`,
                      type: "Edit New Group",
                      groupId: result?._id
                  }
              }
              await Save(activitysave) */
            await saveNotification({
                userId: new ObjectId(userId),
                action: "New Group",
                status: findUser?.privacy_status,
                from: new ObjectId(userId),
                to: new ObjectId(res?._id),
                message: `${findUser?.username} has added you to a group.`,
                type: "Edit New Group",
                groupId: result?._id,
                io
            })
            if (type == "Add" && newMemberAdd.length > 0) {
                await AddRemoveCreateGroup({
                    userId: res?._id,
                    isGroupchats: true,
                    instanceId: instanceId,
                    messageData: `${res?.username} added`,
                    groupmembers: members,
                    io: io
                });
            }
        })
        let result = await ChatModel.findOneAndUpdate(
            { _id: new ObjectId(instanceId) },
            { $set: updateFields },
            { new: true }
        );

        // const withOutMyId = newMemberAdd?.length > 0 ? newMemberAdd.filter((id) => id != userId) : [];

        /*    response?.length > 0 && response?.map(async (ids) => {
               if (ids?._id?.toString() === userId.toString()) return;
               const activitysave = {
                   DBName: Notification,
                   Data: {
                       userId: new ObjectId(userId),
                       action: "New Group",
                       status: findUser?.privacy_status,
                       from: new ObjectId(userId),
                       to: new ObjectId(ids?._id),
                       message: `${findUser?.username} has added you to a group.`,
                       type: "Edit New Group",
                       groupId: result?._id
   
                   }
               }
               await Save(activitysave)
           }) */
        if (result) {
            console.log("grouddedddddddddd")
            io?.sockets?.to(instanceId?.toString()).emit("NEW_MEMBERS_ADD", result);
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "group_edited_success"), data: result }));
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "failed_update_group") }));
        }

    } catch (error) {
        console.error("Error editing group chat:", error);
        return res.status(200).json(EncryptData({ status: false, message: t((req.user && req.user.language) ? req.user.language : "english", "server_error"), error }));
    }
};
// export const EditGroupchat = async (req, res) => {
//     console.log("requestEditgroup", req.body, req.files);
//     try {
//         const { instanceId, userId, groupDiscription, chatName,deleteProfile } = req.body;

//         // Validate required fields
//         if (!instanceId || !userId) {
//             return res.status(200).json({ status: false, message: "Missing required fields: instanceId or userId." });
//         }

//         // Check if the chat is a group chat
//         let groupCheck = await ChatModel.findOne({ _id: instanceId, isGroupchat: true }).populate('groupAdmin');
//         if (!groupCheck) {
//             return res.status(404).json({ status: false, message: "This is not a group chat." });
//         }

//         // Verify if the user is an admin
//         let group = await ChatModel.findOne({ _id: instanceId, groupAdmin: { $in: [userId] } }).populate('groupAdmin');
//         if (!group) {
//             return res.status(403).json({ status: false, message: "User is not an admin." });
//         }

//         // Image processing if an image is uploaded
//         let profile = group.Image; // Keep the current image by default
//         if (req.files && req.files.image) {
//             const imageFolderPath = `public/GroupImage/`;
//             const oldImagePath = `${imageFolderPath}${group.Image}`;

//             // Remove old image if it exists
//             if (group.Image && fs.existsSync(oldImagePath)) {
//                 console.log("Unlinking old image from folder:", oldImagePath);
//                 fs.unlinkSync(oldImagePath);
//             }

//             // Upload the new image
//             let img = req.files.image;
//             profile = await ImageAddFunc([
//                 {
//                     path: imageFolderPath,
//                     files: img,
//                     filename: Date.now() + ".webp",
//                 },
//             ]);
//             console.log("New profile image:", profile);
//         }

//         // Construct the update object dynamically
//         const updateFields = {};
//         if (chatName) updateFields.chatName = chatName;
//         if (groupDiscription) updateFields.groupDiscription = groupDiscription;
//         if (req.files && req.files.image){
//             updateFields.Image = profile;
//             updateFields.deleteProfile = false;
//         }


//         // Update the group chat with new values
//         let result = await ChatModel.findOneAndUpdate(
//             { _id: instanceId },
//             { $set: updateFields },
//             { new: true }
//         );

//         if (result) {
//             res.status(200).json({ status: true, message: "Group edited successfully.", data: result });
//         } else {
//             res.status(500).json({ status: false, message: "Failed to update group." });
//         }

//     } catch (error) {
//         console.error("Error editing group chat:", error);
//         return res.status(500).json({ status: false, message: "Internal server error.", error });
//     }
// };

/*
 * METHOD : GET
 * PARAMS: (instanceId,userId)
 * URL : /v1/chat/InstanceDetails
 */
export const InstanceDetails = async (req, res) => {
    console.log("querssss", req.query);
    try {
        const { query: { instanceId, userId }, user } = req
        console.log("userIDssss", userId, new ObjectId(userId), new Object(userId));
        let [findUser, resp] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }),
            ChatModel.findOne({ _id: new ObjectId(instanceId) }).populate({ path: "members", options: { sort: { username: -1 } } }).populate({ path: "requestedUsers", select: "_id name username profile randomIndex" }).lean()
        ])

        console.log("findUsers", findUser);
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));

        }

        console.log("responses", resp);
        // let unblockedUsers = resp?.members?.filter(val => val.blockStatus == "unblocked");
        //     let Data = {...resp,...{members:[unblockedUsers]}}
        //     console.log("Data", JSON.stringify(Data));

        // console.log("unblockedUsers", unblockedUsers);
        // let filteredUsers = unblockedUsers.filter(user => user !== null);

        // // Get the count
        // let countUnblockedUsers = filteredUsers.length;
        // console.log("countUnblockedUsers", countUnblockedUsers);
        if (resp) {
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "instance_details"), data: resp, ImagePath: `/PersonalProfile/` }));
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_messages_found") }));
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId, MychatDiscription)
 * URL : /v1/chat/EditMychatdescription
 */
// export const EditMychatdescription = async (req, res) => {
//     console.log("fdgdfgdfgfg", req.body);
//     try {
//         const { userId, MychatDiscription } = req.body
//         let findUser = await User.findOneAndUpdate({ _id: userId }, { MychatDiscription: MychatDiscription })
//         if (findUser) {
//             return res.status(200).json(EncryptData({ status: true, message: "Edit description successfully", data: findUser, ImagePath: `/PersonalProfile/` }));

//         }
//         else {
//             return res.status(200).json(EncryptData({ status: false, message: "No user found" }));

//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }


/*
 * METHOD : POST
 * BODY: (instanceId, userId, members, oldMembRemove, type)
 * URL : /v1/chat/RemoveGroupMembers
 */
export const RemoveGroupMembers = async (req, res) => {
    console.log("RequestAddRemoveGroupMembers_Body:", req.body);
    try {
        let { body: { instanceId, userId, members, oldMembRemove, type }, user } = req;
        members = ParsingFunc(members)
        oldMembRemove = ParsingFunc(oldMembRemove)
        const io = req.app.get("io");

        // Validate required fields
        if (!instanceId || !userId) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "missing_fields_instance_user") }));
        }

        // Find the group chat and check if it exists and is a group chat
        let groupChat = await ChatModel.findOne({ _id: instanceId, isGroupchat: true }).populate('groupAdmin');
        if (!groupChat) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "not_group_chat") }));
        }

        // Check if the requesting user is a group admin
        const isAdmin = groupChat?.groupAdmin?.some(admin => admin._id.toString() == userId.toString());
        if (!isAdmin) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "only_admins_add_remove") }));
        }
        let oldMembRemoveuser;

        if (type == "Remove") {
            oldMembRemoveuser = Array.isArray(oldMembRemove) ? oldMembRemove : [oldMembRemove];
        }
        let response = await User.find({ _id: { $in: oldMembRemoveuser } })
        response.length > 0 && response.map(async (res) => {
            console.log("🚀 ~ RemoveGroupMembers ~ res:", res)
            if (isPushNotificationEnabled(res?.pushNotification)) {
                await sendPushNotification({
                    type: "remove group",
                    tokens: res?.fcmToken,
                    title: "removed group",
                    content: `${res?.username} is removed to group ${groupChat.chatName}`,
                    extraData: { _id: res?._id, "type": "notification" }
                });
            }
            if (type == "Remove" && oldMembRemoveuser.length > 0) {
                console.log("🚀 ~ RemoveGroupMembers ~ oldMembRemoveuser.length:", oldMembRemoveuser.length)
                await AddRemoveCreateGroup({
                    userId: res?._id,
                    isGroupchats: true,
                    instanceId: instanceId,
                    messageData: `${res.username} removed`,
                    groupmembers: members,
                    io: io
                });
            }
            // await AddRemoveCreateGroup({ userId: res, isGroupchats: true, instanceId: instanceId, messageData: `${res.username} removed`, groupmembers: members, io: io })

        })


        // Update the group members
        const updatedGroup = await ChatModel.findOneAndUpdate(
            { _id: new ObjectId(instanceId) },
            { $set: { members } },
            { new: true }
        );

        console.log("Updated Group:", updatedGroup);

        if (updatedGroup) {
            console.log("dfgdfgdfgfgggggggggggggggggg", "NEW_MEMBERS_ADD");
            io?.sockets?.to(instanceId?.toString()).emit("NEW_MEMBERS_ADD", updatedGroup);
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "group_members_updated"), data: updatedGroup }));
        } else {
            console.log("eeeeeeeeeeeeeeeeeeeeeeeeee");
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "failed_update_group_members") }));
        }

    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (instanceId, userId)
 * URL : /v1/chat/ExitGroup
 */

/* //new code available
export const ExitGroup = async (req, res) => {
    console.log("Request Body:", req.body);
    try {
        const io = req.app.get("io");
        const { instanceId, userId } = req.body;

        const group = await ChatModel.findOne({ _id: new ObjectId(instanceId) });

        if (!group) {
            return res.status(200).json(EncryptData({ status: false, message: "Group not found" }));
        }

        if (!group?.members?.some(member => member.toString() == userId)) {
            return res.status(200).json(EncryptData({ status: false, message: "User is not a member of the group" }));
        }

        const isCreator = group?.groupCreater?.toString() == userId;
        const isAdmin = group?.groupAdmin?.some(admin => admin.toString() == userId);

        // Step 1: Remove user from members and groupAdmin
        let updateData = { $pull: { members: new ObjectId(userId) } };
        if (isAdmin) {
            updateData.$pull.groupAdmin = new ObjectId(userId);
        }
        await ChatModel.updateOne({ _id: new ObjectId(instanceId) }, updateData);

        // Step 2: Assign a new admin if needed
        if (isCreator || (isAdmin && group?.groupAdmin?.length == 1)) {
            const remainingMembers = group.members
                .map(mem => mem.toString())
                .filter(memId => memId != userId); // Exclude the exiting user

            if (remainingMembers?.length > 0) {
                await ChatModel.updateOne(
                    { _id: new ObjectId(instanceId) },
                    { $push: { groupAdmin: new ObjectId(remainingMembers[0]) } }
                );
            }
        }

        const updatedGroup = await ChatModel.findOne({ _id: new ObjectId(instanceId) });

        // Emit socket event
        io.sockets.in(instanceId?.toString()).emit("EXITGROUP", updatedGroup);

        return res.status(200).json(EncryptData({
            status: true,
            message: "User removed from group",
            data: updatedGroup
        }));

    } catch (error) {
        console.error("Error in ExitGroup:", error);
        return catchErrorResponse(res, error);
    }
}; */


export const ExitGroup = async (req, res) => {
    console.log("requestGroup", req.body);
    try {
        const io = req.app.get("io")

        const { body: { instanceId, userId }, user } = req;

        const [findUser, Exitgroup] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }),
            ChatModel.findOneAndUpdate(
                { _id: new ObjectId(instanceId), "members": { $in: [new ObjectId(userId)] } },
                { $pull: { "members": new ObjectId(userId) } },
                { new: true }
            )
        ]);
        await AddRemoveCreateGroup({ userId: userId, isGroupchats: true, instanceId: instanceId, messageData: "Exit group", groupmembers: Exitgroup?.members, io: io })

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        if (Exitgroup) {
            io?.sockets?.in(instanceId.toString()).emit("EXITGROUP", Exitgroup);

            // SocketEmit("EXITGROUP", Exitgroup, instanceId.toString());

            return res.status(200).json(EncryptData({
                status: true,
                message: t((user && user.language) ? user.language : "english", "user_removed_from_group"),
                data: Exitgroup
            }));
        } else {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "group_or_user_not_found")
            }));
        }

    } catch (error) {

        return catchErrorResponse(res, error);
    }
};

export const MembersDetails = async (data, SocketIO) => {
    console.log("Request Body:", data);
    try {
        const { instanceId, userId } = data;
        if (!ObjectId.isValid(instanceId) || !ObjectId.isValid(userId)) {
            console.warn("MembersDetails skipped due to invalid ids", data);
            return null;
        }
        let chatInstance = await ChatModel.findOne({ _id: new ObjectId(instanceId) });
        console.log("chatInstance", chatInstance)
        if (!chatInstance) {
            return null;
        }
        // Filter out the current user from the members list
        let otherMembers = chatInstance?.members?.filter(member => !member.equals(userId));
        // Fetch details of each member excluding the current user
        let memberDetails = await Promise.all(otherMembers.map(async (memberId) => {
            try {
                let user = await User.findOne({ _id: memberId });
                return user;
            } catch (err) {
                console.error(`Error fetching user ${memberId}:`, err);
                return null;
            }
        }));
        memberDetails = memberDetails?.filter(user => user !== null);
        if (memberDetails) {
            SocketIO.to(instanceId?.toString()).emit("MEMBER_RESPONSE", memberDetails);
        }

    } catch (error) {
        console.error("Error in MembersDetails:", error);
    }
};

/*
 * METHOD : POST
 * BODY: (instanceId, userId)
 * URL : /v1/chat/InstanceDelete
 */
export const InstanceDelete = async (req, res) => {
    console.log("instance_data", req.body);
    try {
        const { body: { instanceId, userId }, user } = req;
        const io = req.app.get("io")

        const objectIds = instanceId.map(id => new ObjectId(id));

        const allInstances = await ChatModel.find({ _id: { $in: objectIds } });

        if (!allInstances.length) {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "chat_not_found")
            }));
        }

        for (const instance of allInstances) {
            if (instance.isGroupchat && !instance.groupAdmin?.includes(userId)) {
                return res.status(200).json(EncryptData({
                    status: false,
                    message: t((user && user.language) ? user.language : "english", "only_admins_delete_group")
                }));
            }
        }

        const [findUser, deleteGroups] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }),
            ChatModel.deleteMany({ _id: { $in: objectIds } })
        ]);

        if (!findUser) {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "user_nf")
            }));
        }

        if (deleteGroups?.deletedCount > 0) {
            io?.sockets?.to(user?._id?.toString()).emit("InstanceResponse", { isGroupchat: true });

            return res.status(200).json(EncryptData({
                status: true,
                message: t((user && user.language) ? user.language : "english", "deleted_successfully"),
            }));
        } else {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "not_deleted")
            }));
        }

    } catch (error) {
        console.log("error", error);
        catchErrorResponse(res, error);
    }
};

/* export const InstanceDelete = async (req, res) => {
    console.log("instance_data", req.body);
    try {

        const { body: { instanceId, userId }, user } = req;
        // let findInstance = await ChatModel.findOne({ _id: new ObjectId(instanceId[0]) })
        const objectIds = instanceId.map(id => new ObjectId(id));
        let findInstance = await ChatModel.findOne({ _id: { $in: objectIds } })
        console.log("findInstance", findInstance);

        if (findInstance?.isGroupchat && !findInstance?.groupAdmin?.includes(userId)) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "only_admins_delete_group") }))
        }
        // if (!findInstance?.isGroupchat) {
        //     return res.status(200).json(EncryptData({ status: false, message: "This is not group." }))

        // }
        const [findUser, Deletegroup] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }),
            ChatModel.findOneAndDelete(
                { _id: { $in: objectIds } },
                { new: true }
            )
            // ChatModel.findOneAndDelete(
            //     { _id: new ObjectId(instanceId[0]), isGroupchat: true },
            //     { new: true }
            // )

        ]);
        // ChatModel.updateMany(
        //     { _id: { $in: instanceId }, "members": { $in: [new ObjectId(userId)] } },
        //     { $pull: { "members": new ObjectId(userId) } },
        //     { new: true }
        // )
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        // let Data = { ...Deletegroup, ...{ randomIndex: findUser?.randomIndex, bioimage: findUser?.bioimage } }
        if (Deletegroup) {
            return res.status(200).json(EncryptData({
                status: true,
                message: t((user && user.language) ? user.language : "english", "deleted_successfully"),
                // data: Data
            }));
        } else {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "not_deleted")
            }));
        }

    } catch (error) {
        console.log("error", error);
        catchErrorResponse(res, error)
    }
}; */

/*
 * METHOD : POST
 * BODY: (userId,page,limit)
 * URL : /v1/chat/getChatersAndFollowersList
 */
// export const getChatersAndFollowersList = async (req, res) => {
//     // console.log("getInitialchatdata reqbodydata", req.body);
//     // const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
//     try {
//         const { userId, page, limit,username,type } = req.body
//         const regex = `^${username}`;
//         const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
//         let getfollowingusers = await follownotify.find({ from: new ObjectId(userId), status: "completed" }).skip(parseInt(skip)).limit(parseInt(limit)).populate({ path: "to", select: "_id profile name username MychatDiscription randomIndex blockStatus" })
//         console.log("getfollowingusers", getfollowingusers)

//         // if(type == "search"){
//             for(let i=0;i<getfollowingusers?.length;i++){
//                 let Username;
//                 let Searchrecords = getfollowingusers[i];
//                 console.log("sssvvvvvvvvv",Searchrecords);
//                  Username = Searchrecords.to.username
//                 let eventQuery = {

//                     Username :  { $regex: regex, $options: 'i' }
//                 };
//                 console.log("fgfrgrtyhtfffffff",eventQuery);
//                 // let getfollowingusers = await follownotify.find( eventQuery ).skip(parseInt(skip)).limit(parseInt(limit)).populate({ path: "to", select: "_id profile name username MychatDiscription randomIndex blockStatus" })


//             }
//         // }

//         if (getfollowingusers) {
//             return res.status(200).json(EncryptData({ status: true, message: "Followings list", data: getfollowingusers }));

//         }
//         else {
//             return res.status(200).json(EncryptData({ status: false, message: "Something error", data: getfollowingusers }));

//         }

//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// };
export const getChatersAndFollowersList = async (req, res) => {
    const url = req.originalUrl.split("?")[0];

    try {
        const { body: { userId, page, limit, username }, user } = req;
        const regex = new RegExp(`^${username}`, 'i');

        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        const findUser = await User.findOne({ _id: new ObjectId(userId) })
        console.log("🚀 ~ getChatersAndFollowersList ~ findUser:", findUser?.userblocked)
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }

        // const [fromUser, toUser] = await Promise.all([
        //     await follownotify.findOne({from:new ObjectId(userId), to})
        // ])

        let query = {
            from: new ObjectId(userId),
            to: { $nin: findUser?.userblocked },
            status: "completed"
        };
        console.log("🚀 ~ getChatersAndFollowersList ~ query:", query)

        let getFollowingUsers;
        if (username.toString()) {
            getFollowingUsers = await follownotify.find(query).skip(skip).limit(parseInt(limit))
                .populate({
                    path: "to",
                    match: { username: regex },
                    select: "_id profile name username randomIndex blockStatus",
                });
            getFollowingUsers = getFollowingUsers.filter(user => user?.to !== null);
        }
        else {
            getFollowingUsers = await follownotify.find(query).skip(skip).limit(parseInt(limit))
                .populate({
                    path: "to",
                    select: "_id profile name username randomIndex blockStatus",
                });
            getFollowingUsers = getFollowingUsers.filter(user => user?.to !== null);

        }
        // else {
        //     return res
        //         .status(200)
        //         .json(EncryptData({ status: true, message: "Something went wrong", data: getFollowingUsers }));
        // }
        console.log("GeegetFollowingUsers", getFollowingUsers);
        const responseData = { status: true, message: t((user && user.language) ? user.language : "english", "followings_list"), data: getFollowingUsers };
        // const redisKey = (!isEmpty(page) || page !== "all") ? `${url}:${user?._id}:page:${page}:limit:${limit}` : `${url}:${user?._id}`;
        // await redisClient.setEx(redisKey, 300, JSON.stringify(responseData))

        if (getFollowingUsers?.length > 0) {
            return res
                .status(200)
                .json(EncryptData(responseData));
        } else {
            return res
                .status(200)
                .json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_followings_found"), data: [] }));
        }
    } catch (error) {
        catchErrorResponse(res, error);
    }
};

/*
 * METHOD : POST
 * BODY: (userId, instanceId)
 * URL : /v1/chat/Clearchat
 */
export const Clearchat = async (req, res) => {
    console.log("reqclearchat", req.body);
    try {
        const { body: { userId, instanceId }, user } = req;
        // Update messages
        const clearMessage = await MessageModel.updateMany(
            { instanceId: instanceId, groupmembers: { $in: [new ObjectId(userId)] } },
            { $pull: { groupmembers: new ObjectId(userId) } }
        );

        console.log("clearMessage", clearMessage);

        if (clearMessage.modifiedCount > 0) {

            return res.status(200).json(EncryptData({
                status: true,
                message: t((user && user.language) ? user.language : "english", "messages_cleared"),
                data: clearMessage
            }));
        } else {
            return res.status(200).json(EncryptData({
                status: false,
                message: t((user && user.language) ? user.language : "english", "no_messages_to_clear"),
                data: clearMessage
            }));
        }
    } catch (error) {
        console.error("Error in Clearchat:", error);
        catchErrorResponse(res, error);
    }
};

/*
 * METHOD : POST
 * BODY: (userId, instanceId, type, isGroupchat)
 * URL : /v1/chat/GroupJoinandUnjoin
 */
export const GroupJoinandUnjoin = async (req, res) => {
    console.log("GroupJoinandUnjoin", req.body);
    try {
        const { body: { userId, instanceId, type, isGroupchat }, user } = req
        // let findUser = await User.findOne({ _id: new ObjectId(userId) })
        // let findGroup = await ChatModel.findOne({ isGroupchat: true, _id: new ObjectId(instanceId) })
        const io = req.app.get("io")
        let [findUser, findGroup] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }),
            ChatModel.findOne({ isGroupchat: true, _id: new ObjectId(instanceId) })
        ])
        const toUser = findGroup.members.filter(id => id.toString() !== userId)
        console.log("fgfindGroup", findGroup, toUser);
        const findToUser = await User.findOne({ _id: new ObjectId(toUser?.[0]) })
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        if (!isGroupchat) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "not_group_chat") }))
        }
        if (!findGroup) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "no_group") }))
        }
        let joinandUnjoinUser;
        if (type == "joingroup") {
            let findGroup = await ChatModel.findOne({ isGroupchat: true, _id: new ObjectId(instanceId) })
            console.log("fdgertrter", findGroup);
            if (findGroup?.members?.includes(userId)) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "already_joined_group") }))
            }
            // if (findGroup) {
            //     return res.status(200).json(EncryptData({ status: false, message: "Your already joined" }))
            // }
            if (findGroup?.isPrivate) {
                joinandUnjoinUser = await ChatModel.findOneAndUpdate({ "isGroupchat": true, _id: new ObjectId(instanceId) }, { $push: { "requestedUsers": new ObjectId(userId) } }, { new: true })
                    .populate({ path: "members", select: "_id userblocked username profile randomIndex userblocked" })
                    .populate({ path: "requestedUsers", select: "_id userblocked username profile randomIndex" })
                if (isPushNotificationEnabled(findToUser?.pushNotification)) {
                    await sendPushNotification({
                        type: "groupjoinrequest",
                        tokens: findToUser?.fcmToken,
                        title: "Group Join Request",
                        content: `${findUser?.username} has sent you a group join request`,
                        extraData: { _id: findToUser?._id, chatGroupId: findGroup?._id, "type": "grouprequest" }
                    });
                }

            }
            else {
                joinandUnjoinUser = await ChatModel.findOneAndUpdate({ "isGroupchat": true, _id: new ObjectId(instanceId) }, { $push: { "members": [new ObjectId(userId)] } }, { new: true })
                    .populate({ path: "members", select: "_id userblocked username profile randomIndex userblocked" })
                    .populate({ path: "requestedUsers", select: "_id userblocked username profile randomIndex" })
                await AddRemoveCreateGroup({ userId: userId, isGroupchats: true, instanceId: instanceId, messageData: `${findUser?.username} has joined`, groupmembers: joinandUnjoinUser?.members, io: io })
                if (isPushNotificationEnabled(findToUser?.pushNotification)) {
                    await sendPushNotification({
                        type: "groupjoinrequest",
                        tokens: findToUser?.fcmToken,
                        title: "Group Joined",
                        content: `${findUser?.username} has joined ${findGroup?.chatName}`,
                        extraData: { _id: findToUser?._id, chatGroupId: findGroup?._id, "type": "grouprequest" }
                    });
                }
            }
        }
        else if (type == "unjoingroup") {
            let findGroup = await ChatModel.findOne({ isGroupchat: true, _id: new ObjectId(instanceId), groupCreater: new ObjectId(userId) })
            console.log("fdgertrterssss", findGroup);
            if (findGroup) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "cannot_unjoin_creator") }))
            }
            joinandUnjoinUser = await ChatModel.findOneAndUpdate({ "isGroupchat": true, _id: new ObjectId(instanceId), "members": { $in: new ObjectId(userId) } }, { $pull: { "members": new ObjectId(userId) } }, { new: true })
                .populate({ path: "members", select: "_id userblocked username profile randomIndex userblocked" })
                .populate({ path: "requestedUsers", select: "_id userblocked username profile randomIndex" })
            // await AddRemoveCreateGroup({ userId: userId, isGroupchats: true, instanceId: instanceId, messageData: `${findUser?.username} has leaved`, type: "unjoingroup", groupmembers: joinandUnjoinUser?.members, io: io })
            /* await AddRemoveCreateGroup({ userId: userId, isGroupchats: true, instanceId: instanceId, messageData: `${findUser?.username} has leaved`, groupmembers: joinandUnjoinUser?.members, io: io }) */

        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
        console.log("joinandUnjoinUser", joinandUnjoinUser);
        if (joinandUnjoinUser) {
            io?.sockets?.to(userId?.toString()).emit("UnjoinGroup", { status: true, message: "Successfully exited group", data: joinandUnjoinUser })
            return res.status(200).json(EncryptData({ status: true, message: type == "joingroup" ? "Joined" : "Successfully exited group", data: joinandUnjoinUser }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error"), data: joinandUnjoinUser }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}

/*
 * METHOD : POST
 * BODY: (userId,instanceId,type)
 * URL : /v1/chat/PrivateGroupAcceptReject
 */
export const PrivateGroupAcceptReject = async (req, res) => {
    console.log("ghPrivateGroupAcceptReject", req.body);

    try {
        const { body: { userId, instanceId, type }, user } = req;
        const io = req.app.get("io");

        const [findUser, findInstanceGroup] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }),
            getGroupCreaterDetails({ instanceId, DBName: ChatModel })
        ]);
        const findGroup = findInstanceGroup?.data?.[0];
        // const toUser = findGroup.members.filter(id => id.toString() !== userId)
        // const findToUser = await User.findOne({ _id: new ObjectId(toUser?.[0]) })

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }));
        }

        if (!findGroup) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "group_not_found_2") }));
        }

        let updatedGroup;

        if (type === "accept") {
            const isAlreadyMember = findGroup?.members?.some(memberId => memberId.toString() === userId);

            if (isAlreadyMember) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_already_exists") }));
            }

            updatedGroup = await ChatModel.findOneAndUpdate(
                {
                    isGroupchat: true,
                    _id: new ObjectId(instanceId),
                    requestedUsers: { $in: new ObjectId(userId) }
                },
                {
                    $push: { members: new ObjectId(userId) },
                    $pull: { requestedUsers: new ObjectId(userId) }
                },
                { new: true }
            )
                .populate({ path: "members", select: "_id userblocked username profile randomIndex userblocked" })
                .populate({ path: "requestedUsers", select: "_id userblocked username profile randomIndex userblocked" });
            if (isPushNotificationEnabled(findUser?.pushNotification)) {
                await sendPushNotification({
                    type: "groupjoinrequestaccept",
                    tokens: findUser?.fcmToken,
                    title: "Join group request accepted",
                    content: `${findGroup?.groupCreaterDetail?.username} has accepted your join group request`,
                    extraData: { _id: findUser?._id, "type": "notification" }
                });
            }
            await AddRemoveCreateGroup({
                userId: findUser?._id,
                isGroupchats: true,
                instanceId,
                messageData: `${findUser?.username} has joined`,
                groupmembers: updatedGroup?.members,
                io
            });

        } else if (type === "reject") {
            updatedGroup = await ChatModel.findOneAndUpdate(
                {
                    isGroupchat: true,
                    _id: new ObjectId(instanceId),
                    requestedUsers: { $in: new ObjectId(userId) }
                },
                {
                    $pull: { requestedUsers: new ObjectId(userId) }
                },
                { new: true }
            )
                .populate({ path: "members", select: "_id userblocked username profile randomIndex userblocked" })
                .populate({ path: "requestedUsers", select: "_id userblocked username profile randomIndex userblocked" });
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_request_type") }));
        }

        if (updatedGroup) {
            return res.status(200).json(EncryptData({
                status: true,
                statusCode: type === "accept",
                message: type === "accept" ? t((user && user.language) ? user.language : "english", "accepted") : t((user && user.language) ? user.language : "english", "rejected"),
                data: updatedGroup
            }));
        } else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "operation_failed") }));
        }

    } catch (error) {
        catchErrorResponse(res, error);
    }
};

/* export const PrivateGroupAcceptReject = async (req, res) => {
    console.log("ghPrivateGroupAcceptReject", req.body);
    try {
        const { userId, instanceId, type } = req.body
        let [findUser, findGroup] = await Promise.all([
            User.findOne({ _id: new ObjectId(userId) }),
            ChatModel.findOne({ isGroupchat: true, _id: new ObjectId(instanceId) })
        ])
        console.log("fgfindGroup", findGroup);
        const io = req.app.get("io")

        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: "User not found" }))
        }
        let PrivateGroupjoinandUnjoinUser;
        if (type == "accept") {
            const findGroup = await ChatModel.findOne({ isGroupchat: true, _id: new ObjectId(instanceId), members: { $nin: new ObjectId(userId) } })
            // let findGroup = await ChatModel.findOne({ isGroupchat: true, _id: new ObjectId(instanceId) })

            if (findGroup) {
                return res.status(200).json(EncryptData({ status: false, message: "This user already exists." }))
            }
            PrivateGroupjoinandUnjoinUser = await ChatModel.findOneAndUpdate({ "isGroupchat": true, _id: new ObjectId(instanceId), "requestedUsers": { $in: new ObjectId(userId) } }, { $push: { "members": [new ObjectId(userId)] }, $pull: { "requestedUsers": new ObjectId(userId) } }, { new: true })
                .populate("members")
                .populate("requestedUsers")
            console.log("PrivateGroupjoinandUnjoinUser_122333", PrivateGroupjoinandUnjoinUser);
            await AddRemoveCreateGroup({ userId: userId, isGroupchats: true, instanceId: instanceId, messageData: "New user joined", io: io })

        }
        else if (type == "reject") {
            PrivateGroupjoinandUnjoinUser = await ChatModel.findOneAndUpdate({ "isGroupchat": true, _id: new ObjectId(instanceId), "requestedUsers": { $in: new ObjectId(userId) } }, { $pull: { "requestedUsers": new ObjectId(userId) } }, { new: true })
                .populate("members")
                .populate("requestedUsers")

        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
        }
        console.log("PrivateGroupjoinandUnjoinUser", PrivateGroupjoinandUnjoinUser);
        if (PrivateGroupjoinandUnjoinUser) {
            return res.status(200).json(EncryptData({ status: true, statusCode: type == "accept" ? true : false, message: type == "accept" ? "Accepted" : "Rejected", data: PrivateGroupjoinandUnjoinUser }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: "Something went wrong", data: PrivateGroupjoinandUnjoinUser }))

        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
} */

/*
 * METHOD : POST
 * BODY: (userId, grouphobbies, type(searchgroup,searcheventgroup), chatname, page, limit)
 * URL : /v1/chat/UserSearchHobbyBasedGroupFilter
 */
export const UserSearchHobbyBasedGroupFilter = async (req, res) => {
    console.log("🚀 ~ UserSearchHobbyBasedGroupFilter ~ req:", req.body)
    try {
        const { user } = req;
        const body = req.body || {};
        let { userId, grouphobbies, type, chatname, page, limit, latitude, longitude, distance } = body;
        /** Some clients send coords only inside `latLong`; merge before parsing. */
        const ll = body.latLong;
        if (ll && typeof ll === "object") {
            if (latitude === undefined || latitude === null || latitude === "") {
                latitude = ll.lat ?? ll.latitude;
            }
            if (longitude === undefined || longitude === null || longitude === "") {
                longitude = ll.long ?? ll.longitude;
            }
        }
        grouphobbies = typeof grouphobbies == "string" ? ParsingFunc(grouphobbies) : grouphobbies;
        if (!Array.isArray(grouphobbies)) {
            grouphobbies = [];
        }
        /** Avoid isEmpty() treating numeric 0 as empty (valid latitude). */
        const parseCoord = (v) => {
            if (v === undefined || v === null) return null;
            if (typeof v === "string" && v.trim() === "") return null;
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : null;
        };
        const reqLat = parseCoord(latitude);
        const reqLng = parseCoord(longitude);
        const reqDist = parseFloat(distance);
        const hasSearchCenter = reqLat != null && reqLng != null;
        const hasDistance = Number.isFinite(reqDist) && reqDist > 0;

        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        const regex = `^${chatname}`;
        const findUser = await User.findOne({ _id: new ObjectId(userId) }).populate("plan");
        if (!findUser) {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "user_nf") }))
        }
        const validHobbies = normalizeHobbyObjectIds(grouphobbies);
        if (type == "filter") {
            /**
             * Mirror the default (unfiltered) feed:  *don't* hide groups the
             * user created or is a member of.  The user expects "extend radius
             * + apply hobbies" to return everything within range that matches,
             * including their own group.  The exclusion was the reason Reset
             * showed the list but the filtered search returned [].
             */
            const matchFilter = { isGroupchat: true, iseventchat: false, ishidegroup: false, "isblocked": "unblocked" };
            if (validHobbies.length === 0) {
                /**
                 * Legacy branch returned `allChatsGroups` (no $geoNear), so any map pin /
                 * radius from the client was ignored and users saw groups from everywhere.
                 * If the client sent distance or coordinates, return an empty list instead of
                 * a global dump; keep the old behaviour only when there is no location intent.
                 */
                if (hasSearchCenter || hasDistance) {
                    return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "similar_hobbies_groups"), data: [] }))
                }
                const AllChats = await allChatsGroups({ DBName: ChatModel, page: page, skip: skip, limit: limit });
                // await ChatModel.find({ isGroupchat: true, iseventchat: false, "isblocked": "unblocked", ishidegroup: false })
                //     .skip(skip)
                //     .limit(limit)
                //     .populate({ path: "requestedUsers", select: "_id username profile randomIndex MychatDiscription userblocked" })
                //     .populate({ path: "members", select: "_id username profile randomIndex MychatDiscription userblocked" });

                return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "all_chats"), data: AllChats?.data }))
            }
            // if (validHobbies?.length > 0) {
            //     matchFilter.grouphobbies = { $in: validHobbies };
            // }
            // matchFilter.members = { $not: {$in:[new ObjectId(userId)]} }
            let latAndlong;
            if (hasDistance) {
                if (hasSearchCenter) {
                    console.log("dynamic_group");
                    latAndlong = await findDistanceAndLocation({ longitude: reqLng, latitude: reqLat });
                }
                else if (findUser?.location?.coordinates?.length == 2) {
                    console.log("static_group");

                    latAndlong = await findDistanceAndLocation({
                        longitude: findUser?.location?.coordinates[0],
                        latitude: findUser?.location?.coordinates[1]
                    });
                }
                else {
                    return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_location") }));
                }
            }
            else {
                return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "similar_hobbies_groups"), data: [] }))
            }
            console.log("🚀 ~ UserSearchHobbyBasedGroupFilter ~ latAndlong:", latAndlong)

            if (
                !latAndlong ||
                !Number.isFinite(latAndlong.parsedLatitude) ||
                !Number.isFinite(latAndlong.parsedLongitude)
            ) {
                return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "invalid_location") }));
            }

            const distanceKilometer = reqDist > 0 ? reqDist * 1000 : 100 * 1000;
            const activePlan = findUser?.plan?.find(plan => plan?.isActive == "started");
            let typeFilter = activePlan ? "activeplan" : "notactiveplan";
            const viewerProfileHobbyIds = (Array.isArray(findUser?.hobbies) ? findUser.hobbies : [])
                .filter((h) => ObjectId.isValid(String(h)))
                .map((h) => new ObjectId(h));
            const nearbyGroups = await filterNearbyGroupLists({ DBName: ChatModel, userId: findUser._id, matchFilter: matchFilter, validHobbies: validHobbies, viewerProfileHobbyIds, page: page, skip: skip, limit: limit, type, longitude: latAndlong.parsedLongitude, latitude: latAndlong.parsedLatitude, type: typeFilter, distanceKilometer: distanceKilometer })
            console.log("23nearbyGroups", JSON.stringify(nearbyGroups, null, 2));

            // await ChatModel.find(matchFilter)
            //     .skip(skip)
            //     .limit(limit)
            //     .populate({ path: "members", select: "_id username profile randomIndex userblocked" })
            //     .populate({ path: "groupAdmin", select: "_id username profile randomIndex" })
            //     .populate({ path: "groupCreater", select: "_id username profile randomIndex" })
            //     .populate({ path: "grouphobbies", select: "_id hobbyname plan" })
            //     .populate({ path: "requestedUsers", select: "_id username profile randomIndex userblocked" });

            // _debug is surfaced so the frontend (Metro log) can see why a
            // filtered search returned zero rows even when the backend log
            // isn't accessible.  Safe to leave on — it's a tiny object.
            return res.status(200).json(EncryptData({
                status: true,
                message: t((user && user.language) ? user.language : "english", "similar_hobbies_groups"),
                data: nearbyGroups?.data,
                _debug: nearbyGroups?._debug,
            }))
        }
        else if (type == "searchgroup" || type == "searcheventgroup") {
            let eventQuery = {
                isGroupchat: true,
                ishidegroup: false,
                iseventchat: type == "searchgroup" ? false : true,
                isblocked: "unblocked"
            };
            // Prefer the active client location (device GPS or filter pick)
            // over the user's stored profile coordinates. The default radius
            // remains 100km when the client didn't supply one.
            const storedCoords = Array.isArray(findUser?.location?.coordinates)
                ? findUser.location.coordinates
                : [];
            const searchLng = hasSearchCenter ? reqLng : storedCoords[0];
            const searchLat = hasSearchCenter ? reqLat : storedCoords[1];
            const searchDistanceKilometer = hasDistance ? reqDist * 1000 : 100 * 1000;
            const AllChats = await nearbyGroupLists({ DBName: User, userId: findUser._id, matchFilter: eventQuery, page: page, skip: skip, limit: limit, type, longitude: searchLng, latitude: searchLat, distanceKilometer: searchDistanceKilometer, chatName: regex, iseventchat: type == "searchgroup" ? false : true });
            console.log("AllChatsAllChats", JSON.stringify(AllChats, null, 2));

            //  await ChatModel.find(eventQuery)
            //     .skip(skip)
            //     .limit(limit)
            //     .populate({ path: "members", select: "_id username profile randomIndex userblocked" })
            //     .populate({ path: "groupAdmin", select: "_id username profile randomIndex" })
            //     .populate({ path: "groupCreater", select: "_id username profile randomIndex" })
            //     .populate({ path: "grouphobbies", select: "_id hobbyname plan" })
            //     .populate({ path: "requestedUsers", select: "_id username profile randomIndex userblocked" });
            return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "search_groups"), data: AllChats?.data }))
        }
        else {
            return res.status(200).json(EncryptData({ status: false, message: t((user && user.language) ? user.language : "english", "error") }))
        }
    } catch (error) {
        catchErrorResponse(res, error)
    }
}
// console.log("🚀 ~ UserSearchHobbyBasedGroupFilter ~ UserSearchHobbyBasedGroupFilter:", UserSearchHobbyBasedGroupFilter)
// console.log("🚀 ~ UserSearchHobbyBasedGroupFilter ~ UserSearchHobbyBasedGroupFilter:", UserSearchHobbyBasedGroupFilter)

// -----------Reference for ffmpeg------------------------------->
// export const Audiofile = async (files) => {
//     console.log("AudiofileAudiofile", files)
//     try {
//         // Check if an audio file is uploaded
//         // if (!req.files || !req.files.audioFile) {
//         //     throw new Error('No file uploaded.');
//         // }

//         const audioFile = files;
//         console.log("filesssss", audioFile);
//         // Path to the uploaded audio file
//         // const inputFilePath = audioFile.tempFilePath || audioFile.path;

//         // Set the desired output format (default to 'mp4')
//         const outputFormat = 'mp4';

//         // Directory to save the output video
//         const outputDir = './public/Chatimage/';
//         // const fName = path.parse(audioFile.name).name;
//         // console.log("fNamefName:", fName,outputFormat);

//         // Output file path with the correct extension
//         const outputFilePath = path.join(outputDir, `${Date.now() + String(audioFile.name).split(".")[0]}.${outputFormat}`);
//         await fs.promises.mkdir(outputDir, { recursive: true });
//         console.log("gggggggggggg", outputFilePath, `${Date.now() + audioFile.name.split(".")[0]}.${outputFormat}`)
//         // console.log("Input audio file path:", inputFilePath);
//         // console.log("Output video file path:", outputFilePath);
//         await audioFile?.mv(outputDir + audioFile.name);
//         // // Ensure the output directory exists
//         // if (!fs.existsSync(outputDir)) {
//         //     fs.mkdirSync(outputDir, { recursive: true });
//         // }

//         // Process the conversion using ffmpeg
//         await new Promise((resolve, reject) => {
//             ffmpeg()
//                 .input(outputDir + audioFile.name) // Input the audio file
//                 .outputOptions('-shortest') // Match audio duration
//                 .output(outputFilePath) // Output to the specified file path
//                 .videoCodec('libx264') // Use a video codec like 'libx264' for video conversion
//                 .audioCodec('aac') // Use 'aac' for audio codec
//                 .on('start', commandLine => console.log('FFmpeg command:', commandLine))
//                 .on('progress', progress => console.log(`Progress: ${progress.percent}%`))
//                 .on('error', (err, stdout, stderr) => {
//                     console.error('FFmpeg error:', err, stderr);
//                     reject(err);
//                 })
//                 .on('end', () => {
//                     console.log('Conversion completed.');
//                     resolve();
//                 })
//                 .run();
//         });

//         // Return a success message with the output file path
//         return outputFilePath;
//         // videoPath: `/audio/${path.basename(outputFilePath)}`,

//     } catch (error) {
//         console.error('Error during conversion:', error);
//         // return res.status(500).json({ message: 'Conversion failed', error: error.message });
//     }
// };
// --------------------------------------------------------------------->

/*
 * METHOD : POST
 * BODY: (page, limit, userId, searchText)
 * URL : /v1/chat/getSingleInitialchatdata
 */
export const getSingleInitialchatdata = async (req, res) => {
    const url = req.originalUrl.split("?")[0];

    try {
        const { body: { page, limit, userId, searchText }, user } = req
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * parseInt(limit)
        let payload = { DBName: ChatModel, uesrId: userId, page: skip, limit: limit, searchText: searchText }
        let chats = await getSingleInstanceLastmessage(payload)
        let userDetail;
        chats.data = chats?.data.filter((el) => el != undefined)
        let chatData = await Promise.all(chats?.data?.map(async (chat) => {
            // console.log("chat_chatchat_chat", chat.lastMessage);
            if (chat?.lastMessage) {
                let otherMembers = chat?.members;

                // if (!Array.isArray(otherMembers)) {
                //     otherMembers = [otherMembers];
                // }
                let memberDetails = await Promise.all(otherMembers?.map(async (memberId) => {
                    let user = await User.findOne({ _id: memberId })
                    userDetail = user;
                    return user ? {
                        _id: user?._id, name: user?.name, MychatDiscription: user?.MychatDiscription, online_status: user?.online_status, bioimage: user?.bioimage, randomIndex: user?.randomIndex, username: user?.username, userblocked: user?.userblocked, profile: user?.profile,
                        //  isblockedUser: memberId.isblockedUser
                    } : null;
                }));
                return {
                    chatName: chat?.chatName,
                    groupAdmin: chat?.groupAdmin,
                    messageDelete: chat?.messageDelete,
                    groupCreater: chat?.groupCreater,
                    isGroupchat: chat?.isGroupchat,
                    isPrivate: chat?.isPrivate,
                    Image: chat?.Image ? chat?.Image : "",
                    groupIndex: chat?.groupIndex ? chat?.groupIndex : "",
                    ImagePath: chat?.isGroupchat ? `/GroupImage/` : `/PersonalProfile/`,
                    groupDiscription: chat?.isGroupchat ? chat?.groupDiscription : "",
                    CurrentMessage: chat?.lastMessage ? chat?.lastMessage : "",
                    UnreadMessageCount: chat?.UnreadMessageCount?.unread ? chat?.UnreadMessageCount?.unread : 0,
                    name: userDetail?.name,
                    profile: userDetail?.profile,
                    randomIndex: userDetail?.randomIndex,
                    username: userDetail?.username,
                    CreatedAt: chat?.createdAt,
                    _id: chat?._id,
                    grouphobbies: chat?.grouphobbies ? chat?.grouphobbies : [],
                    requestedUsers: chat?.requested_users ? chat?.requested_users : [],
                    members: memberDetails ? memberDetails.filter(member => member !== null) : res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "no_messages_found") }))
                };
            }

        }));
        const responseData = { status: true, message: t((user && user.language) ? user.language : "english", "instance_list"), data: chatData };
        // const redisKey = (!isEmpty(page) || page !== "all") ? `${url}:${user?._id}:page:${page}:limit:${limit}` : `${url}:${user?._id}`;
        // await redisClient.setEx(redisKey, 300, JSON.stringify(responseData))
        return res.status(200).json(EncryptData({ status: true, message: t((user && user.language) ? user.language : "english", "instance_list"), data: chatData }));

    } catch (error) {
        catchErrorResponse(res, error)
    }
};

/* export const getSingleInitialchatdata = async (req, res) => {
    try {
        const { body: { page, limit, userId, searchText }, user } = req;
        console.log("page_searchText", page, limit, userId, searchText)
        const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit;
        const payload = { DBName: ChatModel, uesrId: userId, page: skip, limit, searchText };

        let chats = await getSingleInstanceLastmessage(payload);
        chats.data = chats?.data.filter((el) => el != undefined);
        console.log("getSingleInstanceLastmessage===========>");

        const chatData = await Promise.all(chats.data.map(async (chat) => {
            console.log("chats_data_records===========>");

            let memberDetails = await Promise.all(
                chat?.members?.map(async (memberId) => {
                    const user = await User.findOne({ _id: memberId });
                    if (!user) return null;
                    return {
                        _id: user._id,
                        name: user.name,
                        MychatDiscription: user.MychatDiscription,
                        online_status: user.online_status,
                        bioimage: user.bioimage,
                        randomIndex: user.randomIndex,
                        username: user.username,
                        userblocked: user.userblocked,
                        profile: user.profile,
                        isblockedUser: memberId.isblockedUser, // you may want to review this
                    };
                })
            );
            console.log("memberDetails", memberDetails);

            const userDetail = memberDetails?.find((usrId) => usrId._id.toString() != userId.toString()) || memberDetails[0];
console.log("userDetail",userDetail, memberDetails?.find((usrId) => usrId._id.toString() != userId.toString()) || memberDetails[0])
            return {
                chatName: chat?.chatName,
                groupAdmin: chat?.groupAdmin,
                messageDelete: chat?.messageDelete,
                groupCreater: chat?.groupCreater,
                isGroupchat: chat?.isGroupchat,
                isPrivate: chat?.isPrivate,
                Image: chat?.Image || "",
                groupIndex: chat?.groupIndex || "",
                ImagePath: chat?.isGroupchat ? `/GroupImage/` : `/PersonalProfile/`,
                groupDiscription: chat?.isGroupchat ? chat?.groupDiscription : "",
                CurrentMessage: chat?.lastMessage || null,
                UnreadMessageCount: chat?.UnreadMessageCount?.unread || 0,
                name: userDetail?.name || "",
                profile: userDetail?.profile || "",
                randomIndex: userDetail?.randomIndex || "",
                username: userDetail?.username || "",
                CreatedAt: chat?.createdAt,
                _id: chat?._id,
                grouphobbies: chat?.grouphobbies || [],
                requestedUsers: chat?.requested_users || [],
                members: memberDetails.filter(Boolean),
            };
        }));

        return res.status(200).json(
            EncryptData({
                status: true,
                message: t(user?.language || "english", "instance_list"),
                data: chatData,
            })
        );
    } catch (error) {
        catchErrorResponse(res, error);
    }
}; */

/*
 * METHOD : POST
 * BODY: (userId, instanceId, hide_group)
 * URL : /v1/chat/HideGroup
 */
// export const HideGroup = async (req, res) => {
//     try {
//         const { userId, instanceId, hide_group } = req.body

//         let findUser = await User.findOne({ _id: new ObjectId(userId) })
//         if (!findUser) {
//             return res.status(200).json(EncryptData({ status: false, message: "User not found" }))
//         }

//         let resp = await ChatModel.findOneAndUpdate({ _id: new ObjectId(instanceId) }, { ishidegroup: hide_group }, { new: true })
//         const result = resp?.ishidegroup ? "Enable" : "Disable"

//         if (resp) {
//             return res.status(200).json(EncryptData({ status: true, message: `${result} successfully` }))
//         }
//         else {
//             return res.status(200).json(EncryptData({ status: false, message: "Something error" }))
//         }
//     } catch (error) {
//         catchErrorResponse(res, error)
//     }
// }
