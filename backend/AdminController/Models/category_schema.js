import mongoose from "mongoose"

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    category:{
        type:String,
        default:""
    },
    // subcategoryId: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "subcategory",
    //     default: ""
    // }],
    description:{
        type:String,
        default:""
    },
    hideshow:{
        type:String,
        default:"visible"
    },
    order:{
        type:Number,
        default:0
    }

}, { timestamps: true })



categorySchema.index({ category: 1 });
module.exports = mongoose.model("categories", categorySchema,"categories")
