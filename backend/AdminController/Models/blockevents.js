import mongoose from "mongoose"

const Schema = mongoose.Schema;


const blockSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Event"
    },
    blockedReason: {
        type: String,
        default: ""
    },
    isblocked: {
        type: String,
        default: ""       //blocked, unblocked
    },


}, { timestamps: true })



module.exports = mongoose.model("blockevent", blockSchema,"blockevent")
