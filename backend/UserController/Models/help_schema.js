import mongoose from "mongoose"

const Schema = mongoose.Schema;

const helpSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    feature: {
        type: String,
        default: ""          //which feature issue (mobile,web)
    },
    description: {
        type: String,
        default: ""          //what issue explanation
    },
    // help:{
    //     type:String,
    //     default:""          //what help in admin
    // },
    // image:{
    //     type:Array,
    //     default:[]          //optional(issue screenshot)
    // },
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



module.exports = mongoose.model("Help", helpSchema, "Help")
