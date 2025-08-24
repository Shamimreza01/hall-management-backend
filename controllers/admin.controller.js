import Complaint from "../models/complaint.model.js";
import Hall from "../models/hall.model.js";
import Notice from "../models/notice.model.js";
import User from "../models/user.model.js";

export const adminStats = async (req, res) => {
  try {
    const approvedStudent = await User.countDocuments({
      approvalStatus: "approved",
      role: "student",
    });
    const hallCount = await Hall.countDocuments({ isActive: true });
    const pendingProvostCount = await User.countDocuments({
      role: "Provost",
      approvalStatus: "pending",
    });
    const activeProvostCount = await User.countDocuments({
      role: "Provost",
      approvalStatus: "approved",
    });
    const pendingStudentCount = await User.countDocuments({
      role: "student",
      approvalStatus: "pending",
    });
    const rejectedProvostCount = await User.countDocuments({
      role: "Provost",
      approvalStatus: "rejected",
    });
    const rejectedStudentCount = await User.countDocuments({
      role: "student",
      approvalStatus: "rejected",
    });
    const pendingComplaintCount = await Complaint.countDocuments({
      status: "pending",
    });
    const noticeCount = await Notice.countDocuments();

    res.status(200).json({
      approvedStudentCount: approvedStudent,
      hallCount,
      pendingProvostCount,
      activeProvostCount,
      noticeCount,
      pendingProvostCount,
      noticeCount,
      rejectedProvostCount,
      rejectedStudentCount,
      pendingComplaintCount,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
