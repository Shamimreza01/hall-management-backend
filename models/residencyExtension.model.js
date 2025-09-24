import mongoose from "mongoose";
import User from "./user.model.js";

const residencyExtensionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    newExpiryDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["individual_request", "group_policy"],
      required: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    academicSession: {
      type: String,
    },
    departments: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

residencyExtensionSchema.post("save", async function (doc, next) {
  const wasJustApproved = doc.isModified("status") && doc.status === "approved";
  const isNewAndApproved = doc.isNew && doc.status === "approved";

  if (wasJustApproved || isNewAndApproved) {
    try {
      await User.recalculateAndSaveExpiry(doc.student);
    } catch (error) {
      console.error(
        `CRITICAL: Failed to update effectiveExpiryDate for student ${doc.student} after extension ${doc._id} was approved.`,
        error
      );
    }
  }

  next();
});

const ResidencyExtension = mongoose.model(
  "ResidencyExtension",
  residencyExtensionSchema
);

export default ResidencyExtension;
