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
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.status === "approved";
      },
    },
  },
  {
    timestamps: true,
  }
);
hallClearanceSchema.index({ status: 1, hall: 1, year: -1 });

function generateRandomSuffix() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

hallClearanceSchema.pre("validate", function (next) {
  if (this.isNew) {
    const randomPart = generateRandomSuffix();
    const semester =
      this.clearanceReason === "deallocation"
        ? "DE"
        : this.clearanceReason === "others"
        ? "OT"
        : this.semester;
    this.clearanceId = `CL-${this.department}-${semester}-${this.year}-${randomPart}`;
  }
  next();
});

hallClearanceSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "approved") {
    this.approvedAt = new Date();
  }
  next();
});

const HallClearance = mongoose.model("HallClearance", hallClearanceSchema);

export default HallClearance;
