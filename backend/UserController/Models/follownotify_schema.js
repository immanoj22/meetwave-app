import mongoose from "mongoose"

const Schema = mongoose.Schema;

const followSchema = new Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,ref:"User",
        default: ""
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,ref:"User",
        default: ""
    },
    notification: {
        type: Boolean,
        default: false       //true, false
    },
    status: {
        type: String,
        default: "pending"       //pending, completed
    },
    message_type:{
        type:String,
        default:""
    },
    seen:{
        type:Boolean,
        default:false            //true, false
    },

    followto:{
        type:String,
        default:""
    }

}, { timestamps: true })



module.exports = mongoose.model("followuser", followSchema,"followuser")
