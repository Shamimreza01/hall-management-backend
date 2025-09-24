import mongoose from "mongoose"; // You MUST import mongoose itself to start a session
import HallClearance from "../models/hallClearance.model.js";
import User from "../models/user.model.js";
import getList from "../utils/getList.js";
import { hallClearanceValidationSchema } from "../validations/hallClearance.validation.js";

export const createHallClearance = async (req, res) => {
  const session = await mongoose.startSession();
  console.log("Request Body:", req.body);
  try {
    session.startTransaction();

    const { error } = hallClearanceValidationSchema.validate(req.body);
    if (error) {
      throw { status: 400, message: error.details[0].message };
    }

    // ✅ FIX 1: Destructure ALL required fields from the request body.
    const { semester, year, clearanceReason, reasonDetails } = req.body;
    const { id } = req.user;

    const student = await User.findById(id).session(session);

    if (!student) {
      throw { status: 404, message: "Student not found" };
    }
    if (student.approvalStatus !== "approved") {
      throw {
        status: 403,
        message:
          "Forbidden: Your account is not approved to make this request.",
      };
    }
    if (student.balance < 0) {
      throw { status: 400, message: "Insufficient balance" };
    }

    // ✅ FIX 2: Implement a more intelligent duplicate check.
    let existingClearanceQuery = {
      student: student._id,
      status: "pending", // Only check for other PENDING requests
    };
    let duplicateErrorMessage = "You already have a pending clearance request.";

    if (clearanceReason === "semesterFinal") {
      existingClearanceQuery.year = year;
      existingClearanceQuery.semester = semester;
      duplicateErrorMessage = `You have already submitted a clearance request for semester ${semester}, ${year}.`;
    } else {
      // For "deallocation" or "others", check if there's any other pending non-semester request.
      existingClearanceQuery.clearanceReason = {
        $in: ["deallocation", "others"],
      };
      duplicateErrorMessage = `You already have a pending ${clearanceReason} request.`;
    }

    const existingClearance = await HallClearance.findOne(
      existingClearanceQuery
    ).session(session);

    if (existingClearance) {
      throw { status: 409, message: duplicateErrorMessage };
    }

    // ✅ FIX 3: Pass all the required fields to the constructor.
    const hallClearance = new HallClearance({
      student: student._id,
      year,
      roll: student.studentDetails.roll,
      hall: req.hallId,
      department: student.studentDetails.department,
      clearanceReason,
      semester,
      reasonDetails,
    });

    await hallClearance.save({ session });

    student.studentDetails.clearanceHistory.push(hallClearance._id);
    await student.save({ session });

    await session.commitTransaction();

    return res.status(201).json(hallClearance);
  } catch (error) {
    await session.abortTransaction();

    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }

    // This can still be a failsafe for rare race conditions
    if (error.code === 11000) {
      return res.status(409).json({
        error: `A clearance request for this semester/year already exists.`,
      });
    }

    console.error("Failed to create hall clearance:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await session.endSession();
  }
};
export const getHallClearances = getList(HallClearance, (req) => ({
  hall: req.hallId,
}));

export const getMyHallClearances = getList(
  HallClearance,
  (req) => ({
    student: req.user.id,
  }),
  [
    { path: "reviewedBy", select: "name" },
    { path: "hall", select: "name" },
  ],
  null,
  { createdAt: -1 }
);

export const verifyHallClearance = async (req, res) => {
  try {
    console.log(req.body);
    const { clearanceId } = req.body;

    const hallClearance = await HallClearance.findOne({ clearanceId });

    if (!hallClearance) {
      return res.status(404).json({ error: "Hall clearance not found." });
    }
    // FIX in verifyHallClearance
    const { roll, clearanceReason, status, reviewedAt } = hallClearance; // Changed approvedAt to reviewedAt
    const clearanceData = {
      clearanceId,
      clearanceReason,
      roll,
      status,
      reviewedAt, // Changed approvedAt to reviewedAt
    };

    return res.status(200).json(clearanceData);
  } catch (error) {
    console.error("Failed to verify hall clearance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getHallClearanceById = async (req, res) => {
  try {
    const hallClearance = await HallClearance.findById(req.params.id).populate([
      { path: "hall", select: "name" }, // Populate hall as before
      { path: "reviewedBy", select: "name" }, // Populate reviewedBy as before
      {
        path: "student", // Populate the 'student' field on HallClearance
        select: "-password", // Exclude sensitive data
        populate: {
          path: "studentDetails.room", // NOW, go inside the populated 'student' and populate its 'room' field
          select: "roomNumber", // Example: select only the room number
        },
      },
    ]);

    if (hallClearance.student._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to view this clearance." });
    }
    if (!hallClearance) {
      return res.status(404).json({ error: "Hall clearance not found." });
    }

    return res.status(200).json(hallClearance);
  } catch (error) {
    console.error("Failed to get hall clearance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approveHallClearance = async (req, res) => {
  try {
    console.log("iam from here");
    const hallClearance = await HallClearance.findById(req.params.id);

    if (!hallClearance) {
      return res.status(404).json({ error: "Clearance request not found." });
    }
    if (hallClearance.hall.toString() !== req.hallId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to approve this request." });
    }
    // Add a check to prevent re-approving an already approved request
    if (hallClearance.status === "approved") {
      return res
        .status(400)
        .json({ error: "This clearance has already been approved." });
    }

    hallClearance.status = "approved";
    hallClearance.reviewedBy = req.user.id;

    await hallClearance.save();

    return res.status(200).json(hallClearance);
  } catch (error) {
    console.error("Failed to approve hall clearance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const rejectHallClearance = async (req, res) => {
  try {
    const hallClearance = await HallClearance.findById(req.params.id);

    if (!hallClearance) {
      return res.status(404).json({ error: "Clearance request not found." });
    }
    if (hallClearance.hall.toString() !== req.hallId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to approve this request." });
    }
    // Add a check to prevent re-approving an already approved request
    if (
      hallClearance.status === "approved" ||
      hallClearance.status === "rejected"
    ) {
      return res
        .status(400)
        .json({ error: "This clearance has already been processed." });
    }
    const { rejectionReason } = req.body;
    if (!rejectionReason || rejectionReason.trim() === "") {
      return res
        .status(400)
        .json({ error: "Rejection reason is required to reject a request." });
    }
    hallClearance.status = "rejected";
    hallClearance.rejectionReason = rejectionReason;
    hallClearance.reviewedBy = req.user.id;

    await hallClearance.save();
    return res.status(200).json(hallClearance);
  } catch (error) {
    console.error("Failed to reject hall clearance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const cancelMyHallClearance = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const clearanceId = req.params.id;
    const userId = req.user.id;

    const hallClearance = await HallClearance.findById(clearanceId).session(
      session
    );

    if (!hallClearance) {
      throw { status: 404, message: "Clearance request not found." };
    }
    if (hallClearance.student.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to cancel this request.",
      };
    }
    if (hallClearance.status !== "pending") {
      throw {
        status: 400,
        message: `Cannot cancel a request with status '${hallClearance.status}'.`,
      };
    }
    await HallClearance.findByIdAndDelete(clearanceId).session(session);

    await User.updateOne(
      { _id: userId },
      { $pull: { "studentDetails.clearanceHistory": clearanceId } }
    ).session(session);

    await session.commitTransaction();

    return res
      .status(200)
      .json({ message: "Clearance request successfully canceled." });
  } catch (error) {
    await session.abortTransaction();
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Failed to cancel hall clearance:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await session.endSession();
  }
};
