import express from "express";
import {
  fetchFavorites,
  fetchUserBookings,
  updateFavorite,
} from "../controllers/userController.js";
import { protectUser } from "../middleware/protectUser.js";

const userRouter = express.Router();

userRouter.get("/bookings", protectUser, fetchUserBookings);
userRouter.post("/update-favorite", protectUser, updateFavorite);
userRouter.get("/favorites", protectUser, fetchFavorites);

export default userRouter;
