import crypto from "crypto";
import mongoose from "mongoose";

const hallClearanceSchema = new mongoose.Schema(
  {
    clearanceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
      index: true,
    },
    roll: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    clearanceReason: {
      type: String,
      enum: ["semesterFinal", "deallocation", "others"],
      required: true, // It's good practice to require the reason itself
    },
    semester: {
      type: Number,
      required: function () {
        return this.clearanceReason === "semesterFinal";
      },
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    reasonDetails: {
      type: String,
      required: function () {
        return this.clearanceReason === "others";
      },
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      required: function () {
        return this.status === "rejected";
      },
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        // This logic is already correct
        return this.status === "approved" || this.status === "rejected";
      },
    },
    // REMOVED: `appliedAt` field is redundant because `timestamps: true` provides `createdAt`.
  },
  {
    // `timestamps: true` will add `createdAt` and `updatedAt` fields.
    // Use `createdAt` as the application timestamp.
    timestamps: true,
  }
);

// This compound index is excellent for querying.
hallClearanceSchema.index({ status: 1, hall: 1, year: -1 });

// Helper function remains the same.
function generateRandomSuffix() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

// IMPROVED: `pre('validate')` hook for clearanceId generation
hallClearanceSchema.pre("validate", function (next) {
  if (this.isNew) {
    const randomPart = generateRandomSuffix();
    let reasonCode;

    switch (this.clearanceReason) {
      case "semesterFinal":
        // Use a placeholder if semester isn't set, although validation should catch it.
        reasonCode = this.semester || "XX";
        break;
      case "deallocation":
        reasonCode = "DE";
        break;
      case "others":
        reasonCode = "OT";
        break;
      default:
        // Fallback for an unexpected reason
        reasonCode = "GN"; // General
    }

    this.clearanceId = `CL-${this.department}-${reasonCode}-${this.year}-${randomPart}`;
  }
  next();
});

// This pre-save hook is already correct and well-written.
hallClearanceSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    (this.status === "approved" || this.status === "rejected")
  ) {
    this.reviewedAt = new Date();
  }
  next();
});

const HallClearance = mongoose.model("HallClearance", hallClearanceSchema);

export default HallClearance;
