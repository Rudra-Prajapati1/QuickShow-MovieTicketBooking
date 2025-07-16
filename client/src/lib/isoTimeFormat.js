const isoTimeFormat = (dateTime) => {
  const date = new Date(dateTime);
  if (isNaN(date)) return "Invalid Time";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // Force IST
  });
};

export default isoTimeFormat;
