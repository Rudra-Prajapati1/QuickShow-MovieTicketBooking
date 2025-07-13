import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Loading = () => {
  const { nextUrl } = useParams(); // nextUrl = "my-bookings"
  const navigate = useNavigate();

  useEffect(() => {
    if (nextUrl === "my-bookings") {
      setTimeout(() => {
        navigate("/my-bookings");
      }, 5000);
    }
  }, [nextUrl, navigate]);

  return (
    <div className="flex justify-center items-center h-[90vh]">
      <div className="animate-spin rounded-full h-14 w-14 border-2 border-t-primary"></div>
    </div>
  );
};

export default Loading;
