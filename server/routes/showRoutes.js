import express from "express";
import {
  addShow,
  fetchNowPlayingMovies,
  fetchShow,
  fetchShows,
} from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get("/now-playing", protectAdmin, fetchNowPlayingMovies);
showRouter.post("/add", protectAdmin, addShow);
showRouter.get("/all", fetchShows);
showRouter.get("/:movieId", fetchShow);
// showRouter.get("/upcoming", )

export default showRouter;
