// import { Server } from 'socket.io';
import User from "./UserController/Models/user_schema"
import MessageModel from "./Chat/Models/Message_schema"
import { MembersDetails } from './Chat/controller/chatcontroller';
import ChatModel from './Chat/Models/instance_schema';
import mongoose from "mongoose"
import { GroupLikeEventGroupjoinRequestUsersCounts, notifyUsers, socketCreateMessage } from './Helper/common';
import { clearUserActiveChatInstance, setUserActiveChatInstance } from './Helper/activeChatPresence';
import { messageDetails } from "./Helper/mongooseHelper";
var ObjectId = mongoose.Types.ObjectId

let SocketIO = ""
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const emitSeenStatusPayload = async (instanceId, readerId, resp) => {
    const seenPayload = {
        instanceId: String(instanceId),
        chatId: String(readerId),
        resp,
    };

    SocketIO.to(String(instanceId)).emit("SEEN_STATUS", seenPayload);

    const chatMembers = await ChatModel.findOne({ _id: new ObjectId(instanceId) })
        .select("members")
        .lean();

    (chatMembers?.members ?? []).forEach((memberId) => {
        const member = String(memberId);
        if (member && member !== String(readerId)) {
            SocketIO.to(member).emit("SEEN_STATUS", seenPayload);
        }
    });
};

const markMessagesReadForUser = async (instanceId, readerId, options = {}) => {
    const { isGroupchat = false } = options;
    const readerObjectId = new ObjectId(readerId);
    const query = {
        instanceId: new ObjectId(instanceId),
        "seenStatus.seen": { $ne: readerObjectId },
    };

    if (isGroupchat) {
        query.groupmembers = { $in: [readerObjectId] };
    }

    const messages = await MessageModel.find(query).select("_id");

    if (!messages?.length) {
        return false;
    }

    const bulkOps = messages.map((msg) => ({
        updateOne: {
            filter: { _id: msg._id },
            update: {
                $push: {
                    seenStatus: {
                        seen: new ObjectId(readerId),
                        date: new Date(),
                    },
                },
            },
        },
    }));

    const resp = await MessageModel.bulkWrite(bulkOps);
    await emitSeenStatusPayload(instanceId, readerId, resp);
    return true;
};

export const Createsocket = async (io, app) => {
    SocketIO = io;
    app.set('io', io)
    
    io.on('connect', async (socket) => {
        // console.log("🚀 ~ Createsocket ~ socket:", socket)
        console.log('User connected', socket.id);
        socket.emit("socketId", socket.id)
        const connectedUserId = socket.handshake?.query?.id
            ? String(socket.handshake.query.id)
            : null;

        if (connectedUserId) {
            socket.join(connectedUserId);
        }

        app.set('socket', socket)

        socket.on('JOINROOM', (roomId) => {
            console.log('user_joined', roomId);
            socket.join(roomId?.toString());
        });

        socket.on('REMOVE_ROOM', (data = {}) => {
            try {
                const roomId = data?.instanceId ?? data;
                if (!roomId) {
                    return;
                }
                socket.leave(roomId?.toString());
            } catch (error) {
                console.error("REMOVE_ROOM error:", error);
            }
        });

        socket.on('APP_PRESENCE', (data = {}) => {
            try {
                const userId = data?.userId ?? connectedUserId;
                if (!userId) {
                    return;
                }

                const normalizedUserId = String(userId);
                const active = data?.active === true;
                const instanceId = data?.instanceId ? String(data.instanceId) : null;

                if (active && instanceId) {
                    setUserActiveChatInstance(normalizedUserId, instanceId);
                } else {
                    clearUserActiveChatInstance(normalizedUserId, instanceId);
                }
            } catch (error) {
                console.error("APP_PRESENCE error:", error);
            }
        });

        socket.on('SENDMessage', async (data) => {
            await socket.emit("Messages", data)
        });

        //Blue tick purpose
        socket.on("SEEN_UNSEEN", async (data) => {
            const { instanceId, chatId, status } = data;
            if (!isValidObjectId(instanceId) || !isValidObjectId(chatId)) {
                console.warn("SEEN_UNSEEN skipped due to invalid ids", data);
                return;
            }

            let joinusers;
            let findRoomId = await ChatModel.findOne({ _id: new ObjectId(instanceId), "members": { $in: new ObjectId(chatId) } });

            try {
                if (findRoomId) {
                    if (status) {
                        joinusers = await ChatModel.findOneAndUpdate(
                            { _id: new ObjectId(instanceId), "joinMembers": { $ne: new ObjectId(chatId) } },
                            { $push: { joinMembers: new ObjectId(chatId) } },
                            { new: true }
                        );
                    } else {
                        joinusers = await ChatModel.findOneAndUpdate(
                            { _id: new ObjectId(instanceId) },
                            { $pull: { joinMembers: new ObjectId(chatId) } },
                            { new: true }
                        );
                    }

                    if (joinusers) {
                        console.log("Updated_joinusers", joinusers);
                        let read = await SocketIO.to(instanceId?.toString()).emit("READ_UNREAD", joinusers);
                        console.log("read", read);

                    } else {
                        console.log("No changes made to joinusers");
                    }
                } else {
                    console.log("Room not found or user is not a member.");
                }
            } catch (error) {
                console.error("Error processing SEEN_UNSEEN event:", error);
            }
        });

        //Seen unseen users update purpose
        socket.on("GETSEENDATA", async (data) => {
            console.log("GenseenData", data);
            try {
                const { chatId, instanceId } = data;
                if (!isValidObjectId(instanceId) || !isValidObjectId(chatId)) {
                    console.warn("GETSEENDATA skipped due to invalid ids", data);
                    return;
                }

                const chatInstance = await ChatModel.findOne({ _id: new ObjectId(instanceId) })
                    .select("isGroupchat members")
                    .lean();

                const isGroupchat = chatInstance?.isGroupchat === true;
                const unreadFilter = isGroupchat
                    ? {
                        groupmembers: { $in: [new ObjectId(chatId)] },
                        "seenStatus.seen": { $ne: new ObjectId(chatId) },
                    }
                    : {
                        "seenStatus.seen": { $ne: new ObjectId(chatId) },
                    };

                const messages = await MessageModel.find({
                    instanceId: new ObjectId(instanceId),
                    ...unreadFilter,
                }).select("_id");

                if (messages?.length > 0) {
                    await markMessagesReadForUser(instanceId, chatId, { isGroupchat });
                    let result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: chatId, io: SocketIO })
                    SocketIO?.to(chatId?.toString()).emit("Singlechat_counts", { SingleChatCounts: result?.SingleChatCounts });

                } else {
                    await emitSeenStatusPayload(instanceId, chatId, "No updates needed");
                }
            } catch (error) {
                console.log("error", error);
            }
        });

        //create message send purpose
        socket.on("CREATEMESSAGE", async (data, ack) => {
            console.log("Message_request_sockets:", data);
            try {
                const { chatId, instanceId, text, messageId, replyMsgId } = data;
                if (!isValidObjectId(instanceId) || !isValidObjectId(chatId)) {
                    console.warn("CREATEMESSAGE skipped due to invalid ids", data);
                    SocketIO.to(instanceId?.toString()).emit("messageResponse", "Invalid chat payload");
                    if (typeof ack === "function") {
                        ack({ status: false, message: "Invalid chat payload" });
                    }
                    return;
                }

                const findchat = await ChatModel.findOne({ _id: new ObjectId(instanceId) }).populate({ path: "members", select: "_id profile username randomIndex userblocked" })
                console.log("Finduser_findchat", findchat);
                if (!findchat) {
                    SocketIO.to(instanceId?.toString()).emit("messageResponse", "Chat not found");
                    if (typeof ack === "function") {
                        ack({ status: false, message: "Chat not found" });
                    }
                    return;
                }


                // let BlockUser = [];
                /* if (!findchat.isGroupchat) {
                    let members = findchat?.members?.filter(member => member._id.toString() === chatId.toString());
                    const blockUser = members?.map((el => el.userblocked)).flat()
                    let findBlockUser = blockUser?.some(id => id.toString() !== chatId.toString());
                    if (findBlockUser) {
                        console.log("bbbbbbb", BlockUser);

                        BlockUser = findchat?.members
                            .filter(item => !blockUser?.map(id => id.toString()).includes(item._id.toString()))
                            .map(item => item._id);
                    } else {
                        console.log("nnnnnnnnnnn", BlockUser);

                        BlockUser = findchat?.members.map(el => el._id);
                    }
                } */
                // console.log("errrrrruuuuuuuuuuuuu", BlockUser);
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
                    // check if any blocked user is *not* the same as chatId
                    //     const hasBlockedOther = blockUser.some(
                    //         (id) => id.toString() != chatId.toString()
                    //     );
                    // console.log("hasBlockedOther", hasBlockedOther);

                    //     if (hasBlockedOther) {
                    //         // exclude blocked users
                    //         BlockUser = findchat?.members
                    //             .filter(
                    //                 (item) =>
                    //                     !blockUser
                    //                         .map((id) => id.toString())
                    //                         .includes(item._id.toString())
                    //             )
                    //             .map((item) => item._id);
                    //         console.log("Blocked case →", BlockUser);
                    //     } 
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
                console.log("Final BlockUser:", BlockUser);
                BlockUser = BlockUser?.map(el => el.toString())
                const result = findchat?.members.filter(item => !BlockUser.includes(item._id.toString()));
                let Currentmembers = findchat?.isGroupchat ? findchat?.members : result;
                console.log("BlockUser=======>", BlockUser, Currentmembers, findchat?.members);

                const payload = {
                    chatId: new ObjectId(chatId),
                    instanceId: new ObjectId(instanceId),
                    senderId: findchat?.members?.filter(member => !member.equals(chatId)),
                    replyMessage: isValidObjectId(replyMsgId)
                        ? new ObjectId(replyMsgId)
                        : "000000000000000000000000",
                    text: text || '',
                    // voicerecord: [],
                    // file: [],
                    // compressfile: [],
                    groupmembers: Currentmembers
                };

                const message = new MessageModel(payload);
                const savedMessage = await message.save();

                if (!savedMessage) {
                    SocketIO.to(instanceId?.toString()).emit("messageResponse", "Something went wrong");
                    if (typeof ack === "function") {
                        ack({ status: false, message: "Something went wrong" });
                    }
                    return;
                }

                const member = findchat?.members?.filter(member => !member.equals(chatId));
                // Emit socket event for the new message
                const messages = await messageDetails({ DBName: MessageModel, savedMessageId: savedMessage?._id })
                const Displayprofile = messages?.data?.[0];
                if (Displayprofile) {
                    SocketIO.to(instanceId?.toString()).emit("messageResponse", { ...Displayprofile, messageId: messageId ? messageId : "" });
                }

                const isBlocked = BlockUser?.includes(member?.[0]?._id?.toString()) || false;
                console.log("socket_isBlocked", isBlocked, !isBlocked, member?.[0]?._id, BlockUser, BlockUser?.includes(member?.[0]?._id?.toString()));

                // await notifyUsers(member, savedMessage, [], text, chatId, SocketIO, findchat, BlockUser);
                notifyUsers(member, savedMessage, [], text, chatId, SocketIO, findchat, BlockUser);
                // await socketCreateMessage({ findchat, chattingPerson: member?.[0], io, member, BlockUser, chatId })
                if (!findchat?.isGroupchat && !isBlocked) {
                    console.log("KKKKKKKKKKKKK--------->");
                    const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: member?.[0]?._id, io, BlockUser });
                    console.log("resultresult", result);

                    SocketIO.to(member?.[0]?._id?.toString()).emit("Singlechat_counts", {
                        SingleChatCounts: result?.SingleChatCounts
                    });
                }
                if (findchat?.isGroupchat && findchat?.iseventchat) {
                    const tasks = member?.map(async (value) => {
                        console.log("valuevalue", value);

                        const isBlocked = BlockUser?.includes(value._id?.toString()) || false;
                        if (!isBlocked) {
                            console.log("HBDDDDDDDDDDDDD");

                            try {
                                const result = await GroupLikeEventGroupjoinRequestUsersCounts({ userId: value._id, io });
                                SocketIO.to(value._id.toString()).emit("eventchat_counts", {
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
                if (typeof ack === "function") {
                    ack({
                        status: true,
                        message: "Message sent successfully",
                        data: {
                            _id: savedMessage?._id?.toString?.() || "",
                            instanceId: instanceId?.toString?.() || String(instanceId),
                            messageId: messageId ? String(messageId) : "",
                        }
                    });
                }
            } catch (error) {
                console.error("Error sending message:", error);
                if (typeof ack === "function") {
                    ack({
                        status: false,
                        message: error?.message || "Error sending message",
                    });
                }
            }
        })

        const emitTypingToRecipients = (eventName, data) => {
            const senderId = String(data?.id ?? '');
            const memberIds = (data?.members || []).map(
                (member) => String(member?._id ?? member?.id ?? member)
            ).filter(Boolean);
            const recipients = [...new Set(
                memberIds.filter((memberId) => memberId && memberId !== senderId)
            )];

            const payload = {
                ...data,
                instanceId: data?.instanceId ? String(data.instanceId) : data?.instanceId,
            };

            recipients.forEach((userId) => {
                SocketIO.to(userId).emit(eventName, payload);
            });

            if (data?.instanceId) {
                SocketIO.to(String(data.instanceId)).emit(eventName, payload);
            }
        };

        socket.on("TYPING", async (data) => {
            emitTypingToRecipients("TYPING", data);
        });

        socket.on('STOPTYPING', async (data) => {
            emitTypingToRecipients("STOPTYPING", data);
        });

        socket.on('MEMBER_LIST', async (data) => {
            await MembersDetails(data, SocketIO)
        });

        socket.on('disconnecting', async () => {
            console.log('user disconnected', socket?.id);
            if (connectedUserId) {
                clearUserActiveChatInstance(String(connectedUserId));
            }
            if (!isValidObjectId(connectedUserId)) {
                return;
            }
            let user = String(connectedUserId)
            let resp = await User.findOneAndUpdate({ _id: new ObjectId(user) }, { $set: { online_status: false, lastSeenDate: new Date() } }, { new: true })
            await ChatModel.updateMany({ "members": { $in: [new ObjectId(user)] } }, { $pull: { "joinMembers": new ObjectId(user) } }, { new: true })
            socket.broadcast.emit("ONLINE_OFFLINE", { userId: user, online_status: false, resp })
            socket.broadcast.emit("STOPTYPING", { id: user, forceClear: true })
        });

    })
}
