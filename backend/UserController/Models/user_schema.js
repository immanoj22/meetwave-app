import mongoose from "mongoose"

const Schema = mongoose.Schema;
const Users = new Schema({
    name: {
        type: String,
        default: ""
    },
    username: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    ageconfirm_status: {
        type: Boolean,
        default: false       //true, false
    },
    OTP: {
        type: String,
        default: ""
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String,
        default: ""
    },

    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    profile: {
        type: String,
        default: ""
    },
    verify_status: {
        type: Boolean,
        default: false         //true, false
    },
    TFA: {
        type: Boolean,
        default: false           //  false(disable), true(enable)
    },

    hobbies: [{ type: mongoose.Types.ObjectId, ref: "adminHobbies" }],

    authToken: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    age: {
        type: Number,
        default: 0
    },
    privacy_status: {
        type: String,
        default: "public"        //public, private
    },

    followersCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },
    /* likesCount: {
        type: Number,
        default: 0
    }, */
    blockStatus: {
        type: String,
        default: "unblocked"           //blocked, unblocked
    },

    blockedReason: {
        type: String,
        default: ""
    },
    plan: [{ type: mongoose.Schema.Types.ObjectId, ref: "userplan" }],
    // socketId: {
    //     type: String,
    //     default: ""
    // },
    login_status: {
        type: Boolean,
        default: false                 //true(login),false(not login)
    },
    emailUpdates: {
        type: Boolean,
        default: false                 //on-true,false-off
    },
    pushNotification: {
        type: Boolean,
        default: true                 //on-true,false-off
    },
    fcmToken: {
        type: Array,
        default: []
    },
    // socketId: {
    //     type: String,
    //     default: ""
    // },
    showinterest: {
        type: Boolean,
        default: true                //true-enable,false-disable
    },
    showgroups: {
        type: Boolean,
        default: true             //true-enable,false-disable
    },
    online_status: {
        type: Boolean,
        default: false             //true-online,false-offline
    },
    delete: {
        type: Boolean,
        default: false
    },
    /* report_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "userplan" }], */
    MychatDiscription: {
        type: String,
        default: ""
    },
    bioimage: {
        type: Array,
        default: []
    },
    randomIndex: {
        type: String,
        default: ""
    },
    transferEmailCreated: {
        type: Date,
        default: new Date()
    },
    alternativeEmail: {
        type: String,
        default: ""
    },
    transferAction: {
        type: String,
        default: ""               //change, cancel
    },

    /* homeAddress: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    }, */

    /* homeType: {
        type: String,
        default: ""               //change, cancel
    }, */
    locationDistance: {
        type: Number,
        default: 0               //change, cancel
    },
    personalAddress: {
        type: String,
        default: ""
    },
    userblocked: {
        type: Array,             //blocked, unblocked
        default: []
    },
    lastSeenDate: {
        type: Date,
        default: new Date()
    },
    // NotificationCount:{
    //     type:Number,
    //     default:0
    // }
    range: {
        type: Number,
        default: 50
    },
    newjoinerStatus: {
        type: Boolean,
        default: true
    },
    // singlechatcount:{
    //     type:Number,
    //     default:0
    // },
    password: {
        type: String,
        default: ""
    },
    ishidehobbies: {
        type: Boolean,
        default: false                //true-enable,false-disable
    },
    ishideevent: {
        type: Boolean,
        default: false
    },
    ishideprofile: {
        type: Boolean,
        default: false
    },
    ishideAllGroup: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        default: "english"
    },

}, { timestamps: true })

module.exports = mongoose.model("User", Users)
Users.index({ username: 1, email:1 });
Users.index({ location: '2dsphere' });
