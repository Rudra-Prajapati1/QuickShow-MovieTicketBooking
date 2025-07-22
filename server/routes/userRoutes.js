import express from "express";
import {
  fetchFavorites,
  fetchUserBookings,
  updateFavorite,
} from "../controllers/userController.js";
import { protectUser } from "../middleware/protectUser.js";
import { submitFeedback } from "../controllers/feedbackController.js";

const userRouter = express.Router();

userRouter.get("/bookings", protectUser, fetchUserBookings);
userRouter.post("/update-favorite", protectUser, updateFavorite);
userRouter.get("/favorites", protectUser, fetchFavorites);
userRouter.post("/submit-feedback", protectUser, submitFeedback);

export default userRouter;
