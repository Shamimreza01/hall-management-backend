import mongoose from "mongoose";

// models/complaint.model.js
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    attachments: [
      {
        url: String,
        public_id: String,
        fileName: String,
        fileType: String,
        fileSize: Number,
      },
    ],
  },
  { timestamps: true }
);

const ComplaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    category: {
      type: String,
      enum: [
        "electricity",
        "cleaning",
        "water",
        "maintenance",
        "security",
        "internet",
        "furniture",
        "other",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
      index: true,
    },

    priority: { type: Number, min: 1, max: 5, default: 3, index: true },

    hall: { type: mongoose.Schema.Types.ObjectId, ref: "Hall", required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    attachments: [
      {
        url: String,
        public_id: String,
        fileName: String,
        fileType: String,
        fileSize: Number,
      },
    ],

    resolvedAt: Date,
    dueDate: Date,

    comments: [commentSchema],

    statusHistory: [
      {
        previousStatus: {
          type: String,
          enum: ["pending", "in-progress", "resolved", "rejected"],
        },
        newStatus: {
          type: String,
          enum: ["pending", "in-progress", "resolved", "rejected"],
        },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for days since creation
ComplaintSchema.virtual("daysOpen").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

ComplaintSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      previousStatus: this.originalStatus || null,
      newStatus: this.status,
      changedBy: this.modifiedBy || this.assignedTo,
      changedAt: Date.now(),
      note: this.modificationNote || "Status changed",
    });
  }
  next();
});
// Indexes
ComplaintSchema.index({ hall: 1, status: 1 });
ComplaintSchema.index({ createdBy: 1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ category: 1 });
ComplaintSchema.index({ hall: 1, status: 1, priority: -1 });
ComplaintSchema.index({ createdBy: 1, status: 1 });

const Complaint = mongoose.model("Complaint", ComplaintSchema);
export default Complaint;
