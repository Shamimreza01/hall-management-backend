import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required."],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters."],
    },
    content: {
      type: String,
      required: [true, "Notice content is required."],
      trim: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: function () {
        return this.visibility === "private";
      },
    },
    attachments: [
      {
        url: {
          type: String,
          trim: true,
        },
        fileName: String,
        fileType: String,
        fileSize: Number,
        public_id: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
noticeSchema.virtual("hallName", {
  ref: "Hall",
  localField: "hall",
  foreignField: "_id",
  justOne: true,
});

// 📌 Indexes for faster queries
noticeSchema.index({ title: "text", content: "text" });

// 📌 Auto deactivate expired notices
noticeSchema.pre("save", function (next) {
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.isActive = false;
  }
  next();
});

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;
