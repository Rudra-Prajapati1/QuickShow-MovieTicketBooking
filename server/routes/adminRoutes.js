import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import {
  fetchAllBookings,
  fetchAllShows,
  fetchDashboardData,
  isAdmin,
} from "../controllers/adminController.js";
import { fetchAllFeedbacks } from "../controllers/feedbackController.js";

const adminRouter = express.Router();

adminRouter.get("/is-admin", protectAdmin, isAdmin);
adminRouter.get("/dashboard", protectAdmin, fetchDashboardData);
adminRouter.get("/all-shows", protectAdmin, fetchAllShows);
adminRouter.get("/all-bookings", protectAdmin, fetchAllBookings);
adminRouter.get("/all-feedbacks", protectAdmin, fetchAllFeedbacks);

export default adminRouter;
