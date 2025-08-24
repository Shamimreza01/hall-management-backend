import Hall from "../models/hall.model.js";
import User from "../models/user.model.js";
import getList from "../utils/getList.js";
export const approveProvost = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Find user with role check
    const user = await User.findOne({ _id: userId, role: "Provost" });
    if (!user) {
      return res.status(404).json({ message: "Provost not found." });
    }

    if (user.approvalStatus === "approved") {
      return res.status(400).json({ message: "Provost already approved." });
    }

    if (!user.hall) {
      return res.status(400).json({ message: "Hall not assigned to provost." });
    }

    // ✅ Find the hall
    const hall = await Hall.findById(user.hall);
    if (!hall) {
      return res.status(404).json({ message: "Hall not found." });
    }

    if (hall.provost) {
      return res.status(400).json({
        message:
          "This hall already has a provost. Remove the existing one first.",
      });
    }

    // ✅ Approve provost
    user.approvalStatus = "approved";
    user.rejectionReason = undefined;
    await user.save();

    // ✅ Assign provost to hall
    hall.provost = user._id;
    await hall.save();

    res.status(200).json({
      message: "Provost approved and assigned to hall successfully.",
      provostId: user._id,
      hallName: hall.name,
    });
  } catch (error) {
    console.error("Error in approveProvost:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const rejectProvost = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findOne({ _id: userId, role: "Provost" });

    if (!user) {
      return res.status(404).json({ message: "Provost not found." });
    }

    if (user.approvalStatus === "approved") {
      return res
        .status(400)
        .json({ message: "Cannot reject an already approved provost." });
    }

    user.approvalStatus = "rejected";
    user.rejectionReason = reason || "No reason provided";
    await user.save();

    res.status(200).json({ message: "Provost request rejected successfully." });
  } catch (error) {
    console.error("Error rejecting provost:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeProvost = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId, role: "Provost" });

    if (!user) {
      return res.status(404).json({ message: "Provost not found." });
    }

    if (!user.hall) {
      return res
        .status(400)
        .json({ message: "This provost is not assigned to any hall." });
    }

    const hall = await Hall.findById(user.hall);
    if (!hall) {
      return res.status(404).json({ message: "Hall not found." });
    }

    if (!hall.provost || hall.provost.toString() !== user._id.toString()) {
      return res
        .status(400)
        .json({ message: "This provost is not the current hall provost." });
    }

    // ✅ Remove provost from hall
    hall.provost = null;
    await hall.save();

    // ✅ Reset user's status if needed
    user.approvalStatus = "former";
    user.formerHistory.push({ formerDate: new Date(), hall: hall._id });
    user.hall = null;
    await user.save();

    res.status(200).json({ message: "Provost removed successfully." });
  } catch (error) {
    console.error("Error removing provost:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const provostAssign = async (req, res) => {
  try {
    const { userId } = req.params;
    const { hallId } = req.body;

    // Find the user and hall
    const user = await User.findById(userId);
    const hall = await Hall.findById(hallId);

    if (!user || user.role !== "Provost") {
      return res.status(404).json({ message: "Provost not found." });
    }

    if (!hall) {
      return res.status(404).json({ message: "Hall not found." });
    }

    // Check if hall is already assigned to another provost
    if (hall.provost) {
      return res.status(400).json({
        message: "This hall is already assigned to another provost.",
      });
    }

    // Assign the hall to the provost
    user.hall = hall._id;
    hall.provost = user._id;
    user.approvalStatus = "approved";

    await user.save();
    await hall.save();

    res.status(200).json({
      message: "Provost assigned to hall successfully.",
      provostId: user._id,
      hallName: hall.name,
    });
  } catch (error) {
    console.error("Error in provostAssign:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const provostList = getList(User, (req) => ({ role: "Provost" }), {
  path: "hall formerHistory.hall",
  select: "name",
});

export const pendingProvostsList = getList(
  User,
  (req) => ({ role: "Provost", approvalStatus: "pending" }),
  { path: "hall", select: "name" }
);
export const approvedProvostsList = getList(
  User,
  (req) => ({ role: "Provost", approvalStatus: "approved" }),
  { path: "hall formerHistory.hall", select: "name" }
);
export const rejectedProvostsList = getList(
  User,
  (req) => ({ role: "Provost", approvalStatus: "rejected" }),
  { path: "hall", select: "name" }
);
export const formerProvostsList = getList(
  User,
  (req) => ({ role: "Provost", approvalStatus: "former" }),
  { path: "hall", select: "name" }
);
