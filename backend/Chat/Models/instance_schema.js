import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    iseventchat: { type: Boolean, default: false },

    isGroupchat: {
        type: Boolean,
        default: false
    },
    Image: {
        type: String,
        default: ''
    },
    groupImages: { type: Array, default: [] },
    chatName: { type: String, default: "" },
    groupAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groupCreater: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    groupDiscription: {
        type: String,
        default: ""
    },
    deleteProfile: {
        type: Boolean,
        default: true
    },
    isblocked: {
        type: String,
        default: "unblocked"
    },
    blockedReason: {
        type: String,
        default: ""
    },
    groupIndex: {
        type: String,
        default: ''
    },
    joinMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    grouphobbies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'adminHobbies' }],
    isPrivate: {
        type: Boolean,
        default: false        //public - false, private - true
    },
    requestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ishidegroup: {
        type: Boolean,
        default: false
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    groupAddress: { type: String, default: '' }
    // isdeletegroup: {
    //     type: Boolean,
    //     default: false        
    // },
}, { timestamps: true, });
const ChatModel = mongoose.model("Instance", ChatSchema, "Instance")
ChatSchema.index({ chatName: 1 });
ChatSchema.index({ location: "2dsphere" });
export default ChatModel;