const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    features: [{ type: String }],
    successPaths: [{ type: String }],
    duration: { type: String, default: "N/A" },
    image: { type: String }, // Made optional
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Course", courseSchema);
