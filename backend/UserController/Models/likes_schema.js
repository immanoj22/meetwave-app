import mongoose from "mongoose"

const Schema = mongoose.Schema;

const likesSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId, ref:"User",
        default:""
    },
    likeId:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
    status: {
        type: Boolean,
        default: false
    },


}, { timestamps: true })



module.exports = mongoose.model("Like", likesSchema)
