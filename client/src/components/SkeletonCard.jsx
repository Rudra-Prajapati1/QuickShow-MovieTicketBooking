import React from "react";

const SkeletonCard = () => {
  return (
    <div
      className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl
      w-74 lg:w-62 xl:w-66 animate-pulse"
    >
      {/* Image Placeholder */}
      <div className="rounded-lg h-52 w-full bg-gray-700" />

      {/* Title Placeholder */}
      <div className="h-4 bg-gray-600 rounded mt-3 w-3/4" />

      {/* Metadata (year | genre | time) */}
      <div className="h-3 bg-gray-600 rounded mt-3 w-full" />

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-4 pb-3">
        {/* Buy Button Placeholder */}
        <div className="h-8 w-24 rounded-full bg-gray-700" />
        {/* Rating Placeholder */}
        <div className="h-4 w-12 bg-gray-700 rounded" />
      </div>
    </div>
  );
};

export default SkeletonCard;
