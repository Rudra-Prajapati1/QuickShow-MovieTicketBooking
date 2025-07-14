import React from "react";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";
import UpcomingMovieCard from "../components/UpcomingMovieCard";

const Upcoming = () => {
  const { upcomingMovies } = useAppContext();
  return upcomingMovies.length > 0 ? (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="100px" />
      <BlurCircle bottom="0" right="100px" />

      <h1 className="font-medium text-xl my-4">Upcoming Movies</h1>
      <div className="flex flex-wrap max-sm:justify-center gap-9">
        {upcomingMovies.map((movie) => (
          <UpcomingMovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">No movies available</h1>
    </div>
  );
};

export default Upcoming;
