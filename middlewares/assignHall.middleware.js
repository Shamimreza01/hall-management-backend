// middlewares/assignHall.js
import User from "../models/user.model.js";

const assignUserHall = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    // Only for Provost or Vice Provost
    if (!["Provost", "viceProvost", "student"].includes(role)) return next();

    const user = await User.findById(id).select("hall");

    if (!user || !user.hall) {
      return res
        .status(403)
        .json({ message: "Hall assignment not found for this user." });
    }

    // Attach hallId to req
    req.hallId = user.hall.toString();
    next();
  } catch (err) {
    console.error("assignUserHall error:", err);
    res
      .status(500)
      .json({ message: "Internal server error while assigning hall." });
  }
};
export default assignUserHall;
