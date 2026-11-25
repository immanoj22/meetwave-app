import mongoose from "mongoose"

const Schema = mongoose.Schema;

const Users = new Schema({
    report_from:{type:mongoose.Schema.Types.ObjectId,default:""},
    report_to: {type:mongoose.Schema.Types.ObjectId,default:""},
    // eventId :{type:mongoose.Schema.Types.ObjectId,ref:"Event"},
    // groupId:{type:mongoose.Schema.Types.ObjectId,ref:"Instance"},
    to: {type:mongoose.Schema.Types.ObjectId,default:""},

    type: {
        type: String,
        default: ""
    },
    message: {
        type: String,
        default: ""
    },
    delete: {
        type: Boolean,
        default: false
    },

}, { timestamps: true })

module.exports = mongoose.model("Report", Users,"Report")
