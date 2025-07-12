// middleware/protectUser.js
import { getAuth } from "@clerk/express";

export const protectUser = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};
