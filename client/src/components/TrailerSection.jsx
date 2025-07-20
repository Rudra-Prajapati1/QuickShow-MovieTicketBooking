import React, { useEffect, useState } from "react";
import BlurCircle from "./BlurCircle";
import ReactPlayer from "react-player";
import { useAppContext } from "../context/AppContext";

const TrailerSection = ({ id }) => {
  const { axios } = useAppContext();
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMovieTrailer = async () => {
    try {
      const { data } = await axios.get(`api/show/trailer/${id}`);
      if (data.success) {
        setTrailerUrl(data.trailer_url);
      }
    } catch (error) {
      console.error("Failed to fetch trailer:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieTrailer();
  }, [id]);

  return (
    <>
      <p id="trailer" className="text-xl font-medium mt-20">
        Trailer
      </p>

      <BlurCircle />
      <div className="py-20 pt-0 max-md:pb-0 overflow-hidden">
        <div className="relative mt-6">
          {loading ? (
            <p className="text-center text-gray-400 mt-10">
              Loading trailer...
            </p>
          ) : trailerUrl ? (
            <ReactPlayer
              url={trailerUrl}
              controls
              className="mx-auto max-w-full rounded-full"
              width="1280px"
              height="600px"
            />
          ) : (
            <p className="text-center text-gray-400 text-sm mt-10">
              Trailer not available for this movie.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default TrailerSection;
