import mongoose from "mongoose"

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    adminname: {
        type: String,
        default: ""
    },
    email:
    {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    hashpassword: {
        type: String,
        default: ""
    },
    OTP:{
        type:String,
        default:""
    },
    hobby_limit: {
        type: Number,
        default: 0
    },
    eventImage_limit: {
        type: Number,
        default: 0
    },
    islogin:{
        type:Boolean,
        default:false
    },

},{timestamps:true})



module.exports = mongoose.model("admin", adminSchema, "admin")
