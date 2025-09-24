import mongoose from "mongoose";
import ResidencyExtension from "../models/residencyExtension.model.js";
import User from "../models/user.model.js";

export const applyGroupExtensionPolicy = async (req, res) => {
  const { academicSession, departments, newExpiryDate, reason } = req.body;
  const { id: provostId } = req.user;
  const provostHallId = req.hallId;

  if (!provostHallId) {
    return res
      .status(403)
      .json({ message: "Access denied: Hall not assigned." });
  }

  // --- Input Validation ---
  if (!academicSession || typeof academicSession !== "string") {
    return res
      .status(400)
      .json({ message: "A valid 'academicSession' is required." });
  }
  if (!Array.isArray(departments) || departments.length === 0) {
    return res
      .status(400)
      .json({ message: "The 'departments' field must be a non-empty array." });
  }
  if (!newExpiryDate || isNaN(new Date(newExpiryDate))) {
    return res
      .status(400)
      .json({ message: "A valid 'newExpiryDate' is required." });
  }
  if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
    return res.status(400).json({
      message: "A meaningful 'reason' of at least 10 characters is required.",
    });
  }

  try {
    // Find all students who match the policy criteria, scoped to the Provost's hall.
    const studentsToUpdate = await User.find({
      "studentDetails.academicSession": academicSession,
      "studentDetails.department": { $in: departments },
      hall: provostHallId,
      role: "student",
    })
      .select("_id")
      .lean();

    if (studentsToUpdate.length === 0) {
      return res.status(404).json({
        message: "No students were found matching the specified criteria.",
      });
    }

    const batchId = new mongoose.Types.ObjectId();
    const processedAt = new Date();
    const expiryDate = new Date(newExpiryDate);

    const extensionRecords = studentsToUpdate.map((student) => ({
      student: student._id,
      hall: provostHallId,
      newExpiryDate: expiryDate,
      reason,
      type: "group_policy",
      status: "approved",
      processedBy: provostId,
      processedAt,
      batchId,
      academicSession,
      departments,
    }));

    // STEP 1: Bulk insert the historical records.
    await ResidencyExtension.insertMany(extensionRecords);

    // ✅ STEP 2 (CRITICAL FIX): Manually trigger the recalculation for each student
    // because insertMany() does not trigger 'save' hooks.
    await Promise.all(
      studentsToUpdate.map((student) =>
        User.recalculateAndSaveExpiry(student._id)
      )
    );

    res.status(200).json({
      message: `Group policy has been successfully applied and records updated for ${studentsToUpdate.length} students.`,
      batchId: batchId,
      studentCount: studentsToUpdate.length,
    });
  } catch (error) {
    console.error("Error applying group extension policy:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

export const approveExtension = async (req, res) => {
  const { id: extensionId } = req.params;
  const { id: provostId } = req.user;
  const provostHallId = req.hallId;

  if (!provostHallId) {
    return res
      .status(403)
      .json({ message: "Access denied: Hall not assigned." });
  }

  try {
    const extension = await ResidencyExtension.findById(extensionId);

    if (!extension) {
      return res.status(404).json({ message: "Extension request not found." });
    }
    if (extension.status !== "pending") {
      return res.status(400).json({
        message: `This request is already '${extension.status}' and cannot be changed.`,
      });
    }
    if (String(extension.hall) !== String(provostHallId)) {
      return res.status(403).json({
        message:
          "Forbidden. You do not have permission to approve this request.",
      });
    }

    extension.status = "approved";
    extension.processedBy = provostId;
    extension.processedAt = new Date();
    await extension.save(); // This WILL trigger the post-save hook correctly.

    res.status(200).json({
      message:
        "Extension approved. The student's record has been updated automatically.",
      data: extension,
    });
  } catch (error) {
    console.error("Error approving extension:", error);
    res
      .status(500)
      .json({ message: "An error occurred during the approval process." });
  }
};
export const rejectExtension = async (req, res) => {
  const { id: extensionId } = req.params;
  const { rejectionReason } = req.body;
  const { id: provostId } = req.user;
  const provostHallId = req.hallId;

  if (
    !rejectionReason ||
    typeof rejectionReason !== "string" ||
    rejectionReason.trim().length < 5
  ) {
    return res
      .status(400)
      .json({ message: "A valid rejection reason is required." });
  }

  try {
    const extension = await ResidencyExtension.findById(extensionId);

    if (!extension) {
      return res.status(404).json({ message: "Extension request not found." });
    }
    if (extension.status !== "pending") {
      return res.status(400).json({
        message: `This request is already '${extension.status}' and cannot be changed.`,
      });
    }
    if (String(extension.hall) !== String(provostHallId)) {
      return res.status(403).json({
        message:
          "Forbidden. You do not have permission to reject this request.",
      });
    }

    extension.status = "rejected";
    extension.rejectionReason = rejectionReason;
    extension.processedBy = provostId;
    extension.processedAt = new Date();
    await extension.save();

    res.status(200).json({
      message: "Extension request has been rejected.",
      data: extension,
    });
  } catch (error) {
    console.error("Error rejecting extension:", error);
    res
      .status(500)
      .json({ message: "An error occurred during the rejection process." });
  }
};

export const getGroupPolicyHistory = async (req, res) => {
  const provostHallId = req.hallId;

  if (!provostHallId) {
    return res
      .status(403)
      .json({ message: "Access denied: Hall not assigned." });
  }

  try {
    const history = await ResidencyExtension.aggregate([
      {
        $match: {
          hall: new mongoose.Types.ObjectId(provostHallId),
          type: "group_policy",
        },
      },
      {
        $group: {
          _id: "$batchId",
          reason: { $first: "$reason" },
          appliedBy: { $first: "$processedBy" },
          appliedAt: { $first: "$createdAt" },
          academicSession: { $first: "$academicSession" },
          departments: { $first: "$departments" },
          studentCount: { $sum: 1 },
        },
      },
      { $sort: { appliedAt: -1 } },
    ]);

    await User.populate(history, { path: "appliedBy", select: "name" });

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching group policy history:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching history." });
  }
};

export const requestResidencyExtension = async (req, res) => {
  const { newExpiryDate, reason } = req.body;
  const { id: studentId } = req.user;
  const studentHallId = req.hallId;

  if (!studentHallId) {
    return res
      .status(403)
      .json({ message: "Access denied: Hall not assigned." });
  }

  // --- Input Validation ---
  if (!newExpiryDate || isNaN(new Date(newExpiryDate))) {
    return res
      .status(400)
      .json({ message: "A valid 'newExpiryDate' is required." });
  }
  if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
    return res.status(400).json({
      message: "A meaningful reason of at least 10 characters is required.",
    });
  }

  try {
    const existingPendingRequest = await ResidencyExtension.findOne({
      student: studentId,
      status: "pending",
    });
    if (existingPendingRequest) {
      return res.status(409).json({
        message:
          "You already have a pending extension request. Please wait for it to be processed.",
      });
    }

    const extensionRequest = new ResidencyExtension({
      student: studentId,
      hall: studentHallId,
      newExpiryDate: new Date(newExpiryDate),
      reason,
      type: "individual_request",
    });
    await extensionRequest.save();

    res.status(201).json({
      message:
        "Your extension request has been submitted successfully for approval.",
      data: extensionRequest,
    });
  } catch (error) {
    console.error("Error requesting residency extension:", error);
    res
      .status(500)
      .json({ message: "An error occurred while submitting your request." });
  }
};
