import mongoose from "mongoose";
const Schema = mongoose.Schema;

var Cms = new Schema({
    identifier: {
        type: String,
        default:""
    },
    Title: {
        type: String,
        default:"",
   
    },
    Content: {
        type: String,
        default:"",
     
    },
    Link: {
        type: String,
        default:"",
       
    },
    image: {
        type: Array,
        default: []
    },
    status:{
        type:Boolean,
        default:false
    }


},{timestamps:true});

module.exports = mongoose.model('Cms', Cms, 'Cms');