import React from "react";

const ButtonLoader = ({ size = 18, color = "#ffffff" }) => {
  return (
    <div
      className="animate-spin rounded-full border-2 border-white border-t-transparent"
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderTopColor: "transparent",
      }}
    />
  );
};

export default ButtonLoader;
