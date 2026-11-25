
import mongoose from "mongoose";
import CronController from "./cronController/croncontroller.js";
/**
 * Method for connecting to mongoDB
 * */

const initMongoDB = async (MongoURI)=>{
    mongoose.connect(
        MongoURI
        // {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true
            
        // }
    ).then(() => {
        console.log('MongoDB Connected Successfully',MongoURI)
        CronController
    })
        .catch((err) => {
            console.log('mongoerror',err);
        });
        mongoose.set('strictQuery', false);
}

export default initMongoDB;