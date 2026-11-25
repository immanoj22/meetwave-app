import mongoose from "mongoose"

const Schema = mongoose.Schema;

const genderSchema = new Schema({
    gendername: {
        type: String,
        default: ""
    }

},{timestamps:true})



module.exports = mongoose.model("gender", genderSchema, "gender")
