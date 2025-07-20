import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import { useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { useEffect } from "react";
import { genreMap } from "../lib/genreMap";
import { PlayCircleIcon } from "lucide-react";
import TrailerSection from "../components/TrailerSection";

const UpcomingMovieDetails = () => {
  const {
    upcomingMovies,
    imageBaseURL,

    favoriteMovies,
  } = useAppContext();

  const { id } = useParams();

  const [upcomingMovie, setUpcomingMovie] = useState();

  const fetchUpcomingMovie = async () => {
    const movie = upcomingMovies.find((movie) => movie.id === Number(id));

    if (movie) {
      setUpcomingMovie(movie);
    }
  };

  useEffect(() => {
    fetchUpcomingMovie();
  }, [id]);

  return upcomingMovie ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={imageBaseURL + upcomingMovie.poster_path}
          alt={upcomingMovie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary">ENGLISH</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {upcomingMovie.title}
          </h1>

          <p className="text-gray-400 mt-2 text-md leading-tight max-w-2xl">
            {upcomingMovie.overview}
          </p>
          <p>
            <span className="text-primary">Releasing Date</span> :{" "}
            {upcomingMovie.release_date}
          </p>
          <p>
            <span className="text-primary">Genres</span> :{" "}
            {upcomingMovie.genre_ids
              ?.slice(0, 2)
              .map((id) => genreMap[id])
              .join(" | ")}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button
              className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition 
              rounded-md font-medium cursor-pointer active:scale-95"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
          </div>
        </div>
      </div>
      <TrailerSection id={id} />
    </div>
  ) : (
    <Loading />
  );
};

export default UpcomingMovieDetails;
