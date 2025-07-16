import express from "express";
import {
  addShow,
  fetchNowPlayingMovies,
  fetchShow,
  fetchShows,
  fetchUpcomingMovies,
  getMovieTrailer,
} from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get("/now-playing", protectAdmin, fetchNowPlayingMovies);
showRouter.post("/add", protectAdmin, addShow);
showRouter.get("/all", fetchShows);
showRouter.get("/upcoming-movies", fetchUpcomingMovies);
showRouter.get("/trailer/:movieId", getMovieTrailer);
showRouter.get("/:movieId", fetchShow);

export default showRouter;
