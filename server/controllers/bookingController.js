import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { getAuth } from "@clerk/express";
// import Stripe from "stripe";

//Function to check availability of selected seats for a movie
const fetchSeatsAvailablity = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);

    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats;

    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isAnySeatTaken;
  } catch (error) {
    console.error("[fetchSeatsAvailablity]", error);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    //Check if seat is available for the selected seats
    const isAvailable = await fetchSeatsAvailablity(showId, selectedSeats);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected seats are not available.",
      });
    }

    //Get the show details
    const showData = await Show.findById(showId).populate("movie");

    //Create a new booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");

    await showData.save();

    //Stripe Gateway initialize
    // const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    // //Creating line items from stripe
    // const lineItems = [
    //   {
    //     price_data: {
    //       currency: "aud",
    //       product_data: {
    //         name: showData.movie.title,
    //       },
    //       unit_amount: Math.floor(booking.amount * 100),
    //     },
    //     quantity: 1,
    //   },
    // ];

    // const session = await stripeInstance.checkout.sessions.create({
    //   success_url: `${origin}/loading/my-bookings`,
    //   cancel_url: `${origin}/my-bookings`,
    //   line_items: lineItems,
    //   mode: "payment",
    //   metadata: {
    //     bookingId: booking._id.toString(),
    //   },
    //   expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
    // });

    // booking.paymentLink = session.url;
    // await booking.save();

    // res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("[createBooking]", error);
    res.json({ success: false, message: error.message });
  }
};

export const fetchOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    const occupiedSeats = Object.keys(showData.occupiedSeats);

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error("[fetchOccupiedSeats]", error);
    res.json({ success: false, message: error.message });
  }
};
