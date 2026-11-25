import mongoose from "mongoose"

const Schema = mongoose.Schema;

const followrequestSchema = new Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,ref:"User",
        default: ""
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,ref:"User",
        default: ""
    },
    request: {
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
    followto:{
        type:String,
        default:""
    }


}, { timestamps: true })



module.exports = mongoose.model("Request", followrequestSchema)
