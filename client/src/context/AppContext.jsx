import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [trailer, setTrailer] = useState({});
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const imageBaseURL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch admin status
  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("api/admin/is-admin", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access the admin dashboard");
      }
    } catch (error) {
      console.error("[fetchIsAdmin]", error);
    }
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error("[fetchShows]", data.message);
      }
    } catch (error) {
      console.error("[fetchShows]", error);
    }
  };

  const fetchUpcomingMovies = async () => {
    try {
      const { data } = await axios.get("api/show/upcoming-movies");
      if (data.success) {
        setUpcomingMovies(data.movies);
      } else {
        toast.error("[fetchUpcomingMovies]", data.message);
      }
    } catch (error) {
      console.error("[fetchUpcomingMovies]", error);
    }
  };

  const fetchAllTrailers = async () => {
    if (upcomingMovies.length === 0) return;

    const trailerPromises = upcomingMovies.map((movie) =>
      axios.get(`api/show/trailer/${movie.id}`)
    );

    const responses = await Promise.allSettled(trailerPromises);
    const trailersMap = {};

    responses.forEach((res, index) => {
      if (res.status === "fulfilled" && res.value.data.success) {
        const movieId = upcomingMovies[index].id;
        trailersMap[movieId] = {
          url: res.value.data.trailer_url,
          key: res.value.data.video_key,
        };
      }
    });

    setTrailer(trailersMap);
  };

  const fetchFavoriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setFavoriteMovies(data.movies);
      } else {
        toast.error("[fetchFavoriteMovies]", data.message);
      }
    } catch (error) {
      console.error("[fetchFavoriteMovies]", error);
    }
  };

  // Initial Data Load
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchShows(), fetchUpcomingMovies()]);
      } catch (error) {
        console.error("Initial Load Error", error);
        toast.error("Error loading movies.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Load trailers when upcomingMovies change
  useEffect(() => {
    fetchAllTrailers();
  }, [upcomingMovies]);

  // Load user-related data
  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    }
  }, [user]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favoriteMovies,
    fetchFavoriteMovies,
    imageBaseURL,
    upcomingMovies,
    fetchUpcomingMovies,
    loading,
    trailer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
