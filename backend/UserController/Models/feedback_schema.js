import mongoose from "mongoose"

const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    feedback: {
        type: String,
        default: ""          //which feature issue (mobile,web)
    },

    email:{
        type:String,
        default:""
    },
    maySent:{
        type:String,
        default:"pending"
    },
    status:{
        type:Boolean,
        default:false
    }



}, { timestamps: true })



module.exports = mongoose.model("feedback",feedbackSchema, "feedback")
