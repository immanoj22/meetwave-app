import mongoose from "mongoose";
const Schema = mongoose.Schema;


const hobbiesSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    subcategoryId: { type: String, default: "" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
    // groupId:{type:mongoose.Schema.Types.ObjectId,ref:"groupCategory"},
    hobbyId: { type: mongoose.Schema.Types.ObjectId, ref: "adminHobbies" },
    name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    // paidStatus:{
    //     type:String,
    //     default:"unpaid"
    // },
    planType: {
        type: String,
        default: ""
    },

    eligible_plan: {
        type: String,
        default: ""
    },
    paid_level: {
        type: Number,
        default: 0
    },
  

}, { timestamps: true })

hobbiesSchema.index({ name: 1 });
const Hobbies = mongoose.model("Hobbies", hobbiesSchema);
export default Hobbies;
