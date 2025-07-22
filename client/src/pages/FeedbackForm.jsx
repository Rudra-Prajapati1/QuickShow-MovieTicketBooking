import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { StarIcon } from "lucide-react";
import toast from "react-hot-toast";
import ButtonLoader from "../components/ButtonLoader";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

const FeedbackForm = () => {
  const { axios, user, getToken } = useAppContext();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return <Loading />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !message) return toast.error("Please provide a rating.");

    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/user/submit-feedback",
        {
          rating,
          message,
          userId: user.id,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );
      setRating(0);
      setMessage("");
      toast.success(data.message);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative my-40 mb-60 w-full max-md:w-[85%] max-w-xl mx-auto border bg-primary/10 border-primary/20 rounded-lg p-8">
      <BlurCircle bottom="-100px" />
      <BlurCircle top="0" right="-200px" />
      <h1 className="text-center text-2xl font-semibold underline text-primary mb-6">
        Share Your Experience
      </h1>

      <form className="space-y-6 text-white mt-10" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center max-md:block">
          <label className="text-lg max-md:mb-10">Username : </label>
          <input
            type="text"
            readOnly
            className="w-[80%] max-md:w-full max-md:mt-2 px-4 py-2 bg-white/10 rounded-md text-white border border-white/20"
            value={user.fullName}
          />
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="text-lg">Rating : </label>
          <div className="flex gap-3 min-md:ml-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                size={28}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-amber-300"
                    : "text-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-lg">Your Feedback : </label>
          <textarea
            rows={5}
            placeholder="Write your thoughts here..."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white resize-none mt-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3 text-lg bg-primary/70 hover:bg-primary-dull 
          flex items-center justify-center transition rounded-md border border-primary/90 font-medium active:scale-95"
        >
          {loading ? <ButtonLoader /> : <>Submit</>}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
