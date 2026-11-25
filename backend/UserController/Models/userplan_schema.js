import mongoose from "mongoose"

const Schema = mongoose.Schema;

const userplanSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "plan" },
    planType: {
        type: String,
        default: ""
    },
    planDays: {
        type: Number,
        default: 0
    },
    planPrice: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: new Date()
    },
    EndDate: {
        type: Date,
        default: new Date()
    },
    isActive: {
        type: String,
        default: "comingsoon"                    //comingsoon, started, expired
    },
    delete: {
        type: Boolean,
        default: false
    },
    subscriptionStatus: {
        type: String,
        default: "nosubscribe"                    //trial, cancel, refunded, subscribed, nosubscribe
    },
    status: {
        type: String,
        default: ""
    },
    periodicType: {
        type: String,
        default: ""
    },
    gracePeriod: {
        type: Number,
        default: 15
    },
    subscriptionEndDate: {
        type: Date,
        default: null
    },

}, { timestamps: true })

module.exports = mongoose.model("userplan", userplanSchema, "userplan")
