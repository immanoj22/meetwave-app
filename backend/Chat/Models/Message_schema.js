// import { array } from "joi";
import mongoose from "mongoose";
const MessageSchema = mongoose.Schema(
    {
        instanceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Instance"
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'

        },
        senderId: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        text: {
            type: String,
            default: ""
        },
        messageData: {
            type: String,
            default: ""
        },
        file: {
            type: Array,
            default: []
        },
        compressfile: {
            type: Array,
            default: []
        },
        voicerecord: {
            type: Array,
            default: []
        },
        // compressAudio: {
        //     type: Array,
        //     default: []
        // },
        seenStatus: {
            type: Array,
            default: []
        },
        // seenStatus: [{
        //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        //     seenAt: { type: Date, default: Date.now } // Timestamp when the message was seen
        // }],
        messageDelete: {
            type: Array,
            default: []
        },
        edited_status: {
            type: Boolean,
            default: false
        },
        delete_image: {
            type: Boolean,
            default: false
        },
        groupmembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        replyMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'messages',
            default: null
        },
        // timestamp: { type: Date, default: new Date() },
    }, { timestamps: true, }

);
const Message = mongoose.model("Message", MessageSchema)
export default Message