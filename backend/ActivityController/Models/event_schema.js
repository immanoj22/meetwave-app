import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Interested = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // status:{               //true, false
    //     type:Boolean,
    //     default:false
    // },
    joinstatus: {               //true, false
        type: Boolean,
        default: false
    }
})

const EventSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    eventTitle: {
        type: String,
        default: ""
    },
    startDate: {
        type: Date,
        default: ""
    },
    endDate: {
        type: Date,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: Array,
        default: []
    },
    event_status: {
        type: String,
        default: "comingsoon"  //started, finished, comingsoon
    },
    upcomingEvent_status: {
        type: String,
        default: ""  //finished, comingsoon
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    eventinterested: [Interested],
    privacy_status: {
        type: String,
        default: ""             //public, private
    },
    isblocked: {
        type: String,
        default: "unblocked"
    },
    blockedReason: {
        type: String,
        default: ""
    },
    delete: {
        type: Boolean,
        default: false
    },
    isSaved: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: Boolean, default: false } // Store individual status for each user
    }],
    eventAddress: {
        type: String,
        default: ""
    },
    eventhobbies: [{ type: mongoose.Types.ObjectId, ref: "adminHobbies" }],
    eventprofile: {
        type: String,
        default: ""
    },
    eventRandomIndex: {
        type: String,
        default: ""
    },
    // relatedHobbies: [{type: mongoose.Schema.Types.ObjectId, ref: "hobbies"}]
    ishideInEvent: {
        type: Boolean,
        default: false        
    },
}, { timestamps: true })

const Event = mongoose.model("Event", EventSchema);
EventSchema.index({ eventTitle: 1 });
EventSchema.index({ location: '2dsphere' });
export default Event;