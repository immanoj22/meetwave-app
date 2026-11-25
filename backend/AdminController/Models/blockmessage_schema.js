import mongoose from "mongoose"

const Schema = mongoose.Schema;


const blockSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
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



module.exports = mongoose.model("blockuser", blockSchema,"blockuser")
