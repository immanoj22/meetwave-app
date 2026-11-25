import mongoose from "mongoose"

const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
    subcategoryId:{
        type:mongoose.Schema.Types.ObjectId,
        default:""
    },
    // {type:mongoose.Schema.Types.ObjectId,ref:"subcategories"},
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        default:""
    },
    // {type:mongoose.Schema.Types.ObjectId,ref:"categories"},
    group:{
        type:String,
        default:""
    },
    description:{
        type:String,
        default:""
    },


}, { timestamps: true })



module.exports = mongoose.model("groupCategory", subcategorySchema,"groupCategory")
