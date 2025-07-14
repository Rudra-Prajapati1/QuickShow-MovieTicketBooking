import React from "react";
import BlurCircle from "../components/BlurCircle";

const Upcoming = () => {
  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="100px" />
      <BlurCircle bottom="0" right="100px" />

      <h1 className="font-medium text-xl my-4">Upcoming Movies</h1>
      <div className="flex flex-wrap max-sm:justify-center gap-9"></div>
    </div>
  );
};

export default Upcoming;
