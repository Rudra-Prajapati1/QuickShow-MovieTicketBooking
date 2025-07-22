import Feedback from "../models/Feedback.js"; // Assuming Mongoose model

export const submitFeedback = async (req, res) => {
  try {
    const { rating, message, userId } = req.body;

    if (!rating) {
      return res.json({ message: "Fill Require Details" });
    }

    await Feedback.create({ rating, message, user: userId });

    res.json({ success: true, message: "Feedback Successfully Submitted" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

export const fetchAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error Getting feedback:", error);
    res.json({ success: false, message: "Internal Server Error" });
  }
};
