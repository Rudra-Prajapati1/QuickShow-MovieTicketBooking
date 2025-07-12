import express from "express";
import {
  createBooking,
  fetchOccupiedSeats,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", fetchOccupiedSeats);

export default bookingRouter;
