import mongoose from "mongoose";
const Schema = mongoose.Schema;

const commentsSchema = new Schema({
    eventId: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: "Event" 
        },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" },
    comments: {
        type: String,
        default: ""
    }


},{timestamps:true})

const Comment = mongoose.model("comments", commentsSchema,"comments");
export default Comment;