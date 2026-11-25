import mongoose from "mongoose"

const Schema = mongoose.Schema;

const planSchema = new Schema({
    planType: {
        type: String,
        default: ""
    },
    plan_description: {
        type: String,
        default: ""
    },
    plan_days: [{
        planDays: {
            type: Number,
            default: 0
        },
        planPrice: {
            type: Number,
            default: 0
        },
        bonuswords: {
            type: String,
            default: ""
        },
        status: {               //true, false
            type: Boolean,
            default: false
        },
        plansBenifits:[]
    }],
    hideshow: {
        type: String,
        default: "visible"
    },
    level: {
        type: Number,
        default: 0
    },
    delete: {
        type: Boolean,
        default: false
    }


}, { timestamps: true })



module.exports = mongoose.model("plan", planSchema, "plan")
