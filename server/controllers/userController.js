import { clerkClient, getAuth } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// API to get user bookings
export const fetchUserBookings = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const bookings = await Booking.find({ user: userId })
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("[fetchUserBookings]", error);
    res.json({ success: false, message: error.message });
  }
};

// API to update favorite movie in Clerk user metadata
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const { userId } = getAuth(req);

    const user = await clerkClient.users.getUser(userId);

    if (!user.privateMetadata.favorites) {
      user.privateMetadata.favorites = [];
    }

    let actionType = "";

    if (!user.privateMetadata.favorites.includes(movieId)) {
      user.privateMetadata.favorites.push(movieId);
      actionType = "added";
    } else {
      user.privateMetadata.favorites = user.privateMetadata.favorites.filter(
        (item) => item !== movieId
      );
      actionType = "removed";
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });

    res.json({
      success: true,
      message: `Favorite movie ${actionType} successfully.`,
    });
  } catch (error) {
    console.error("[updateFavorite]", error);
    res.json({ success: false, message: error.message });
  }
};

// API to fetch favorite movies
export const fetchFavorites = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata.favorites;

    //Get Movies from database
    const movies = await Movie.find({ _id: { $in: favorites } });

    res.json({ success: true, movies });
  } catch (error) {
    console.error("[fetchFavorites] ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
