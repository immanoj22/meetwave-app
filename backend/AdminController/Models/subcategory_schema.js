import mongoose from "mongoose"

const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
    subcategory: {
        type: String,
        default: ""
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
    description: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 0
    },
    hideshow: {
        type: String,
        default: "visible"
    },

}, { timestamps: true })



subcategorySchema.index({ subcategory: 1 });
module.exports = mongoose.model("subcategories", subcategorySchema, "subcategories")
