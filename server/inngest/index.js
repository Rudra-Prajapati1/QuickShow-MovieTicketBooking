import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";
import Movie from "../models/Movie.js";
const { fromZonedTime } = await import("date-fns-tz");

export const inngest = new Inngest({ id: "rjp-movie-ticking-booking" });

//Inngest function to save user data in database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.create(userData);
  }
);

//Inngest function to delete user data from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id);
  }
);

//Inngest function to update user data from database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.findByIdAndUpdate(id, userData);
  }
);

// Inngest function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    // Wait for 10 minutes before checking for payment
    await step.sleep("wait-for-10-minutes", "10m");

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      // If booking still exists and payment is not made, release seats and delete booking
      if (booking && !booking.isPaid) {
        const show = await Show.findById(booking.show);

        // This check is important in case the show was deleted for some reason
        if (show) {
          booking.bookedSeats.forEach((seat) => {
            delete show.occupiedSeats[seat];
          });

          show.markModified("occupiedSeats");
          await show.save();
        }

        await Booking.findByIdAndDelete(booking._id);
      }
    });
  }
);

//Inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },

  async ({ event, step }) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");

    await sendEmail({
      to: booking.user.email,
      subject: `Payment confirmation: "${booking.show.movie.title}" booked`,
      body: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>Hey, ${booking.user.name}</h2>
              <p>Your booking for <strong style="color: #F84565;">"${
                booking.show.movie.title
              }"</strong> is confirmed.</p>
              <p>
                <strong>Date : </strong> ${new Date(
                  booking.show.showDateTime
                ).toLocaleDateString("en-US", {
                  timeZone: "Asia/Kolkata",
                })}<br/>
                <strong>Time : </strong> ${new Date(
                  booking.show.showDateTime
                ).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}
              </p>
              <p>
                <strong>Seats : </strong> ${booking.bookedSeats.join(", ")}<br/>
                <strong>Total Tickets : </strong> ${
                  booking.bookedSeats.length
                }<br/>
                <strong>Total Amount : </strong> $${booking.amount}
              </p>
              <p>Enjoy the show! 🍿🥤</p>
              <p>Thanks for booking with us!<br/> - RJP's QuickShow Team</p>
            </div>`,
    });
  }
);

//Inngest function to send reminders
const sendShowReminders = inngest.createFunction(
  { id: "send-show-remainders" },
  { cron: "0 */8 * * *" }, //Every 8 hours
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

    //Prepare reminder Tasks
    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.find({
        showDateTime: { $gte: windowStart, $lte: in8Hours },
      }).populate("movie");

      const tasks = [];

      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;

        const userIds = [...new Set(Object.values(show.occupiedSeats))];

        if (userIds.length === 0) continue;

        const users = await User.find({ _id: { $in: userIds } }).select(
          "name email"
        );

        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showTime: show.showDateTime,
          });
        }
      }

      return tasks;
    });

    if (reminderTasks.length === 0) {
      return { sent: 0, message: "No reminders to send." };
    }

    //Sent reminder emails
    const results = await step.run("send-all-reminders", async () => {
      return await Promise.allSettled(
        reminderTasks.map((task) =>
          sendEmail({
            to: task.userEmail,
            subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
            body: `
                <div style="font-family: Arial, sans-serif"; padding: 20px>
                  <h2>Hello, ${task.userName}<h2>
                  <p>This a quick reminder that your movie: </p>
                  <h3 style="color: #F84565">"${task.movieTitle}"</h3>
                  <p>is scheduled for <strong>${new Date(
                    task.showTime
                  ).toLocaleDateString("en-US", {
                    timeZone: "Asia/Kolkata",
                  })}</strong> at <strong>${new Date(
              task.showTime
            ).toLocaleTimeString("en-US", {
              timeZone: "Asia/Kolkata",
            })}</strong>.</p>
                <p>It starts in approximately <strong>8 hours</strong> - make sure you're ready!</p><br />
                <a href="rjp-quickshow.netlify.app">rjp-quickshow.netlify.app<a>
                <p>Enjoy the show!<br/> RJP's QuickShow Team</p>
                </div>
              `,
          })
        )
      );
    });

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    return {
      sent,
      failed,
      message: `Sent ${sent} reminders, ${failed} failed.`,
    };
  }
);

const sendNewShowNotifications = inngest.createFunction(
  { id: "send-new-show-notification" },
  { event: "app/show.added" },

  async ({ event }) => {
    const { movieTitle } = event.data;

    const users = await User.find({});

    for (const user of users) {
      const userEmail = user.email;
      const userName = user.name;

      const subject = `🎬 New Show Added: ${movieTitle}`;

      const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px">
          <h2>Hey, ${userName}</h2>
          <p>We've have added a new show to our library:</p>
          <h3 style="color: #F84565;">"${movieTitle}"</h3>
          <p>Visit our website</p>
          <a href="rjp-quickshow.netlify.app">rjp-quickshow.netlify.app<a>
          <br />
          <p>Thanks, <br/> RJP's QuickShow Team</p>
        </div>
      `;

      await sendEmail({
        to: userEmail,
        subject,
        body,
      });
    }

    return { message: "Notification sent." };
  }
);

const addDailyMovieShows = inngest.createFunction(
  { id: "add-multiple-daily-shows" },
  { cron: "30 0 * * *" }, // Runs daily at 12:30 AM IST

  async ({ step }) => {
    const movies = await step.run("fetch-all-movies", async () => {
      return await Movie.find({}).select("_id").lean();
    });

    const showHours = [12, 15, 18, 21]; // 12 PM, 3 PM, 6 PM, 9 PM IST
    const timeZone = "Asia/Kolkata";

    let addedCount = 0;
    const showsToCreate = [];

    for (const movie of movies) {
      for (const hour of showHours) {
        const now = new Date();
        const istDate = new Intl.DateTimeFormat("en-CA", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(now); // e.g., "2025-07-17"

        const dateTimeString = `${istDate}T${String(hour).padStart(
          2,
          "0"
        )}:00:00`;
        const showTimeUtc = fromZonedTime(dateTimeString, timeZone);

        const exists = await Show.findOne({
          movie: movie._id,
          showDateTime: showTimeUtc,
        });

        if (exists) continue;

        showsToCreate.push({
          movie: movie._id,
          showDateTime: showTimeUtc,
          showPrice: 10,
          occupiedSeats: {},
        });
      }
    }

    if (showsToCreate.length > 0) {
      await step.run("create-new-shows", async () => {
        await Show.insertMany(showsToCreate);
      });
      addedCount = showsToCreate.length;
    }

    return {
      success: true,
      added: addedCount,
      message: `${addedCount} show(s) created successfully.`,
    };
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
  sendShowReminders,
  sendNewShowNotifications,
  addDailyMovieShows,
];
