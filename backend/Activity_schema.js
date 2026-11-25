import mongoose from "mongoose"

const Schema = mongoose.Schema;
const activitySchema = new Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref:"User"
    },
    // Adminid: {
    //     type: String,
    //     default: ""
    // },
    action: {
        type: String,
        default: ""
    },
    from: {
        type: mongoose.Schema.ObjectId,
        ref:"User"
    },
    to: {
        type: mongoose.Schema.ObjectId,
        ref:"User"
    },
    status: {
        type: String,
        default:""
    },
    seen: {
        type: Boolean,
        default:false
    },
    message: {
        type: String,
        default: ""
    },
    eventId:{
        type:mongoose.Schema.ObjectId,
        ref:"Event"
    },
    type: {
        type: String,
        default: ""
    },
    followUserId:{
        type: mongoose.Schema.Types.ObjectId,ref:"followuser",
        default: null
    },
    display:{
        type:Boolean,
        default:true
    },
   
}, { timestamps: true })



module.exports = mongoose.model("notification", activitySchema,"notification")