import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, ref: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
