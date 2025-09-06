import React from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Footer = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  return (
    <footer className="px-6 pt-8 md:px-16 lg:px-36 mt-40 w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
        <div className="md:max-w-96">
          <img className="w-36 h-auto" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm">
            QuickShow is an online movie ticket booking platform.
            <br />
            <span>
              Created & Inspired From Youtube Tutorial:{" "}
              <a
                href="https://youtu.be/Pez37wmUaQM?si=Jhax9uSQg4e_nTse"
                className="underline italic font-bold"
              >
                GreatStack
              </a>{" "}
              .
            </span>{" "}
            <br />
            <span>
              {" "}
              Created & Modified By{" "}
              <span className="font-bold underline">
                Rudra Jitesh Prajapati
              </span>
            </span>{" "}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <img
              src={assets.googlePlay}
              alt="google play"
              className="h-9 w-auto"
            />
            <img src={assets.appStore} alt="app store" className="h-9 w-auto" />
          </div>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <Link
                  onClick={() => {
                    scrollTo(0, 0);
                  }}
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (user) {
                      scrollTo(0, 0);
                      navigate("/feedback");
                    } else {
                      toast.error("You need to login/signup first");
                    }
                  }}
                  className="cursor-pointer whitespace-nowrap"
                >
                  <span className="max-md:hidden">Give</span> Feedback
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <a
                href="mailto:prajapatirudra817@gmail.com"
                className="text-primary underline"
              >
                prajapatirudra817@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-4 text-center text-sm pb-5">
        Copyright {new Date().getFullYear()} © QuickShow. All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
