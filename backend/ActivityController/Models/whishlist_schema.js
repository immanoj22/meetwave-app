import mongoose from "mongoose"

const Schema = mongoose.Schema;
// const WhishSchema = new Schema({

//     whishlists: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
 
// })
const EventwhishSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    save_eventId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]

}, { timestamps: true })



module.exports = mongoose.model("Eventwhish", EventwhishSchema, "Eventwhish")
