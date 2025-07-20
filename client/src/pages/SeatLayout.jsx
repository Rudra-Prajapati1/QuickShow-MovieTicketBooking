import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import ButtonLoader from "../components/ButtonLoader";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const navigate = useNavigate();

  const { id, date } = useParams();

  const { axios, getToken, user } = useAppContext();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);

      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please select a time first");
    }

    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast("You can only select up to 5 seats");
    }

    if (occupiedSeats.includes(seatId)) {
      return toast("This seat is already booked");
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex justify-between gap-2 mt-2">
      <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isSelected = selectedSeats.includes(seatId);
          const isOccupied = occupiedSeats.includes(seatId);
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-7 w-7 md:h-8 md:w-8 rounded border border-primary/60 text-xs transition-colors cursor-pointer
                ${isSelected ? "bg-primary text-white" : ""}
                ${
                  isOccupied
                    ? "bg-primary-dull opacity-50"
                    : " hover:bg-primary/20"
                }
              `}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  const fetchOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/booking/seats/${selectedTime.showId}`
      );

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");

      if (!selectedTime || !selectedSeats.length) {
        return toast.error("Please select a time and seats");
      }

      setBookingLoading(true);

      const { data } = await axios.post(
        "/api/booking/create",
        {
          showId: selectedTime.showId,
          selectedSeats,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    getShow();
  }, []);

  useEffect(() => {
    if (selectedTime) {
      setSelectedSeats([]);
      fetchOccupiedSeats();
    }
  }, [selectedTime]);

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      {/* Avaliable Timing */}
      <div className="w-full md:w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:top-30">
        <p className=" text-lg px-6 md:text-left text-center font-semibold">
          Movie:{" "}
          <span className="text-xl text-primary font-bold">
            {show.movie.title}
          </span>
        </p>
        <p className="text-lg font-semibold px-6 text-center md:text-left">
          Available Timings for: <span className=" text-primary">{date}</span>
        </p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-2 justify-items-center px-4 md:px-0 md:space-y-1">
          {show.dateTime[date]?.map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center justify-center gap-2 w-full md:w-max md:rounded-r-md px-4 py-2 cursor-pointer transition rounded-md
                ${
                  selectedTime?.time === item.time
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20"
                }`}
            >
              <ClockIcon className="w-5 h-5" />
              <p className="text-md">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-26">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0px" />
        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
        <img
          src={assets.screenImage}
          alt="Screen"
          className="w-full max-w-md"
        />
        <p className="text-gray-400 text-sm mb-6">SCREEN THIS WAY</p>

        <div className="flex flex-col items-center mt-6 text-xs text-gray-300 w-full px-2">
          <div className="flex flex-col items-center mb-4 md:mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          <div className="flex flex-col md:flex-row items-start w-full justify-center gap-4 md:gap-12 mb-4 md:mb-6">
            <div className="flex flex-col items-center w-full md:w-auto">
              {groupRows[1].map((row) => renderSeats(row))}
            </div>
            <div className="flex flex-col items-center w-full md:w-auto">
              {groupRows[2].map((row) => renderSeats(row))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start w-full justify-center gap-4 md:gap-12">
            <div className="flex flex-col items-center w-full md:w-auto">
              {groupRows[3].map((row) => renderSeats(row))}
            </div>
            <div className="flex flex-col items-center w-full md:w-auto">
              {groupRows[4].map((row) => renderSeats(row))}
            </div>
          </div>
        </div>

        <button
          onClick={bookTickets}
          disabled={bookingLoading}
          className="flex items-center gap-2 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull 
    transition rounded-full font-medium cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {bookingLoading ? (
            <ButtonLoader size={18} />
          ) : (
            <>
              Proceed to Checkout
              <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
