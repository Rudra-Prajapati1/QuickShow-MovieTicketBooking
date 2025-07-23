import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import BlurCircle from "./BlurCircle";
import { ArrowRight } from "lucide-react";
import UpcomingMovieCard from "./UpcomingMovieCard";
import Loading from "./Loading";
import useWindowWidth from "../hooks/useWindowWidth";
import SkeletonCard from "./SkeletonCard";

const UpcomingFeaturedSection = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();

  let sliceCount = 4;
  if (width >= 1024 && width < 1536) {
    // lg (≥1024) and xl (<1536)
    sliceCount = 3;
  }
  const { upcomingMovies, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex flex-wrap gap-9 mt-8 px-6 md:px-16 lg:px-24 xl:px-44 pt-40">
        {Array.from({ length: sliceCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return upcomingMovies.length > 0 ? (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <BlurCircle top="130px" left="50px" />
        <p className="text-gray-300 font-medium text-xl">Upcoming Movies</p>
        <button
          onClick={() => {
            navigate("/upcoming-movies");
            scrollTo(0, 0);
          }}
          className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
        >
          View All
          <ArrowRight className="group-hover:translate-x-0.75 transition w-4.5 h-4.5" />
        </button>
      </div>

      <div className="flex flex-wrap max-sm:justify-center gap-9 mt-8">
        {upcomingMovies.slice(0, sliceCount).map((moive) => (
          <UpcomingMovieCard key={moive.id} movie={moive} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/upcoming-movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 bg-primary text-sm hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default UpcomingFeaturedSection;
