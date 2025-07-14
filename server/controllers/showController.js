import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

const fetchAllNowPlayingMovies = async () => {
  const allMovies = [];

  const { data: firstPage } = await axios.get(
    `https://api.themoviedb.org/3/movie/now_playing`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    }
  );

  allMovies.push(...firstPage.results);

  const totalPages = Math.min(firstPage.total_pages, 5); // up to 5 pages

  for (let page = 2; page <= totalPages; page++) {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );
    allMovies.push(...data.results);
  }
  return allMovies;
};

//API to get Now-Playing Movies
export const fetchNowPlayingMovies = async (req, res) => {
  try {
    const movies = await fetchAllNowPlayingMovies();
    res.json({ success: true, movies });
  } catch (error) {
    console.error("[fetchNowPlayingMovies]", error);
    res.json({ success: false, message: error.message });
  }
};

//API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      //Fetch movie details and credits from TMDB API
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),

        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);

      const movieDetailsData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieDetailsData.title,
        overview: movieDetailsData.overview,
        poster_path: movieDetailsData.poster_path,
        backdrop_path: movieDetailsData.backdrop_path,
        genres: movieDetailsData.genres,
        casts: movieCreditsData.cast,
        release_date: movieDetailsData.release_date,
        original_language: movieDetailsData.original_language,
        tagline: movieDetailsData.tagline || "",
        vote_average: movieDetailsData.vote_average,
        runtime: movieDetailsData.runtime,
      };

      //Add to movie to DB
      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];

    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    //Trigger inngest event
    await inngest.send({
      name: "app/show.added",
      data: {
        movieTitle: movie.title,
      },
    });

    res.json({ success: true, message: "Show Added Successfully." });
  } catch (error) {
    console.error("[addShow]", error);
    res.json({ success: false, message: error.message });
  }
};

//API to get all shows from the database
export const fetchShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    //filter unique shows
    const uniqueShows = new Set(shows.map((show) => show.movie));

    res.json({ success: true, shows: Array.from(uniqueShows) });
  } catch (error) {
    console.error("[fetchShows]", error);
    res.json({ success: false, message: error.message });
  }
};

//API to get all upcoming movies
export const fetchUpcomingMovies = async (req, res) => {
  try {
    const upcomingMovies = [];

    const { data: firstPage } = await axios.get(
      `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );

    upcomingMovies.push(...firstPage.results);

    const totalPages = Math.min(firstPage.total_pages, 5);

    for (let page = 2; page <= totalPages; page++) {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }
      );
      upcomingMovies.push(...data.results);
    }

    const today = new Date().toISOString().split("T")[0];

    // Filter movies that are upcoming and non-adult
    const movies = upcomingMovies.filter(
      (movie) =>
        movie.release_date > today &&
        movie.adult === false &&
        movie.original_language === "en"
    );

    res.json({ success: true, movies });
  } catch (error) {
    console.error("[fetchUpcomingMovies]", error);
    res.json({ success: false, message: error.message });
  }
};

//API to get a single show from the database
export const fetchShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    //get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);
    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error("[fetchShow]", error);
    res.json({ success: false, message: error.message });
  }
};
