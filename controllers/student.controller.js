import cloudinary from "../config/cloudinary.js";
import Hall from "../models/hall.model.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import getList from "../utils/getList.js";

export const approveStudent = async (req, res) => {
  const steps = [];

  try {
    const { userId } = req.params;

    // Step 1: Checking student existence
    steps.push("checking student existence");
    const student = await User.findOne({ _id: userId, role: "student" });
    if (!student) {
      return res
        .status(404)
        .json({ steps, message: "Student does not exist." });
    }

    // Step 2: Checking provost authority
    steps.push("checking provost authority");
    if (student.hall.toString() !== req.hallId) {
      return res.status(403).json({
        steps,
        message: "You are not authorized to manage this student.",
      });
    }

    // Step 3: Already approved?
    steps.push("checking approval status");
    if (student.approvalStatus === "approved") {
      return res
        .status(400)
        .json({ steps, message: "Student already approved." });
    }

    // Step 4: Check position conflict
    steps.push("checking position conflict");
    const conflictingStudents = await User.find({
      role: "student",
      _id: { $ne: student._id },
      "studentDetails.room": student.studentDetails.room,
      "studentDetails.position": student.studentDetails.position,
      approvalStatus: { $in: ["approved", "pending"] },
    });

    if (conflictingStudents.length >= 1) {
      return res.status(409).json({
        steps,
        message: `Position '${student.studentDetails.position}' is already requested or occupied.`,
      });
    }

    // Step 5: Room existence
    steps.push("checking room existence");
    const room = await Room.findById(student.studentDetails.room);
    if (!room) {
      return res
        .status(404)
        .json({ steps, message: "Assigned room does not exist." });
    }

    // Step 6: Capacity check
    steps.push("checking room capacity");
    const approvedCount = await User.countDocuments({
      role: "student",
      approvalStatus: "approved",
      "studentDetails.room": room._id,
    });

    if (approvedCount >= room.capacity) {
      return res.status(409).json({
        steps,
        message: "Room is already full. Cannot assign more students.",
      });
    }

    // Step 7: Approve student
    steps.push("approving student");
    student.approvalStatus = "approved";
    student.rejectionReason = undefined;
    await student.save();

    // Step 8: Update room & hall
    steps.push("updating room occupancy");
    room.occupants.push(student._id);
    room.currentOccupancy += 1;
    await room.save();

    steps.push("updating hall occupancy");
    await Hall.findByIdAndUpdate(student.hall, {
      $inc: { currentOccupants: 1 },
    });

    steps.push("done");
    return res.status(200).json({
      steps,
      message: "Student approved and assigned to room successfully.",
    });
  } catch (err) {
    console.error("Student approval error:", err);
    return res.status(500).json({
      steps,
      message: "Internal server error during approval process.",
    });
  }
};

export const rejectStudent = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ message: "Rejection reason is required." });
    }

    const student = await User.findOne({
      _id: userId,
      role: "student",
      hall: req.hallId,
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    if (student.hall.toString() !== req.hallId) {
      return res
        .status(403)
        .json({ message: "You can only manage students from your own hall." });
    }

    if (student.approvalStatus === "rejected") {
      return res.status(400).json({ message: "Already rejected." });
    }

    student.approvalStatus = "rejected";
    student.rejectionReason = reason;
    if (student.studentDetails.room?._id) {
      await Room.updateOne(
        { _id: student.studentDetails.room._id },
        { $pull: { occupants: student._id } }
      );

      // Optionally also unset student's room field
      student.studentDetails.room = undefined;
    }

    await student.save();

    res.status(200).json({ message: "Student rejected successfully." });
  } catch (err) {
    console.error("Reject student error:", err);
    res.status(500).json({ message: "Server error while rejecting student." });
  }
};
export const removeStudent = async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await User.findOne({
      _id: userId,
      role: "student",
      hall: req.hallId,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // ✅ Extract public_id from profilePhoto
    if (student.profilePhoto) {
      const urlParts = student.profilePhoto.split("/");
      const fileName = urlParts[urlParts.length - 1]; // e.g., "d3wpycrtdkvpyrh5vlq6.jpg"
      const folder = urlParts[urlParts.length - 2]; // e.g., "students"
      const publicId = `hall-management/${folder}/${fileName.split(".")[0]}`;

      // delete from cloudinary
      await cloudinary.uploader.destroy(publicId);
    }
    if (student.studentDetails.room?._id) {
      await Room.updateOne(
        { _id: student.studentDetails.room._id },
        { $pull: { occupants: student._id } }
      );

      // Optionally also unset student's room field
      student.studentDetails.room = undefined;
    }
    // ✅ delete from DB
    await student.deleteOne();

    res
      .status(200)
      .json({ message: "Student and profile photo removed successfully." });
  } catch (err) {
    console.error("Remove student error:", err);
    res.status(500).json({ message: "Server error while removing student." });
  }
};
export const studentsList = getList(
  User,
  (req) => ({ hall: req.hallId, role: "student" }),
  [
    { path: "hall", select: "name" },
    { path: "studentDetails.room", select: "roomNumber floor" },
  ],
  { defaultSort: { createdAt: -1 } }
);
export const pendingStudentsList = getList(
  User,
  (req) => ({ hall: req.hallId, role: "student", approvalStatus: "pending" }),
  [
    { path: "hall", select: "name" },
    { path: "studentDetails.room", select: "roomNumber floor" },
  ]
);
export const approvedStudentsList = getList(
  User,
  (req) => ({ hall: req.hallId, role: "student", approvalStatus: "approved" }),
  [
    { path: "hall", select: "name" },
    { path: "studentDetails.room", select: "roomNumber floor" },
  ]
);
export const rejectedStudentsList = getList(
  User,
  (req) => ({ hall: req.hallId, role: "student", approvalStatus: "rejected" }),
  [
    { path: "hall", select: "name" },
    { path: "studentDetails.room", select: "roomNumber floor" },
  ]
);
