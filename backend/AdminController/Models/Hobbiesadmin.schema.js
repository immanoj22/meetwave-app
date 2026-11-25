import mongoose from "mongoose";
const Schema = mongoose.Schema;


const hobbiesSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    subcategoryId: {
        type: String,
        default: "000000000000000000000000"
    },
    // {type:mongoose.Schema.Types.ObjectId,ref:"subcategories"},
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        default: ""
    },
    // {type:mongoose.Schema.Types.ObjectId,ref:"categories"},
    // groupId:{
    //     type:String,
    //     default:"000000000000000000000000"
    // },
    // {type:mongoose.Schema.Types.ObjectId,ref:"groupCategory"},

    hobbyname: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    plan: {
        type: String,
        default: ""
    },
    // planId: {type:mongoose.Schema.Types.ObjectId,ref:"plan"},
    planStatus: {
        type: Boolean,
        default: false
    },
    hideshow: {
        type: String,
        default: "visible"
    },
    paid_level: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    hideshow: {
        type: String,
        default: "visible"
    },
}, { timestamps: true })

hobbiesSchema.index({ hobbyname: 1 });
const Hobbies = mongoose.model("adminHobbies", hobbiesSchema, "adminHobbies");
export default Hobbies;
