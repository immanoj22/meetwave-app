import mongoose from "mongoose"

const Schema = mongoose.Schema;


const blockGroupSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"users",
        default: ""
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Instance",
        default: ""
    },
    blockedReason: {
        type: String,
        default: ""
    },
    blockStatus: {
        type: String,
        default: ""       //blocked, unblocked
    },


}, { timestamps: true })



module.exports = mongoose.model("blockGroup", blockGroupSchema,"blockGroup")
