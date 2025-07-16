import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { genreMap } from "../lib/genreMap";
import { StarIcon } from "lucide-react";

const UpcomingMovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { imageBaseURL } = useAppContext();

  return (
    <div
      className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl 
    hover:-translate-y-1 transition duration-300 w-74 lg:w-62 xl:w-66"
    >
      <img
        src={imageBaseURL + movie.backdrop_path}
        alt={movie.title}
        onClick={() => {
          navigate(`/upcoming-movies/${movie.id}`);
          scrollTo(0, 0);
        }}
        className="rounded-lg h-52 w-full object-cover cursor-pointer"
      />
      <p className="font-semibold mt-2">{movie.title}</p>
      <p className="text-sm text-gray-400 mt-2">
        {new Date(movie.release_date).getFullYear()} ●{" "}
        {movie.genre_ids
          ?.slice(0, 2)
          .map((id) => genreMap[id])
          .join(" | ")}
      </p>
      <div className="flex items-center justify-center mt-4 pb-3 w-full">
        <button
          onClick={() => {
            navigate(`/upcoming-movies/${movie.id}`);
            scrollTo(0, 0);
          }}
          className=" px-2 py-2 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default UpcomingMovieCard;
