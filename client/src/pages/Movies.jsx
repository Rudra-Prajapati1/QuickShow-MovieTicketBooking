import React from "react";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";

const Movies = () => {
  const { shows, loading } = useAppContext();

  if (loading || shows.length === 0) {
    return <Loading />;
  }

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0" />
      <BlurCircle bottom="110px" right="100px" />

      <h1 className="font-medium text-xl my-4 ">Now Showing</h1>
      <div className="flex flex-wrap max-sm:justify-center gap-9 max-md:mt-10">
        {shows.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) 
};

export default Movies;
