import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      required: true,
      index: true,
    },
    roomType: {
      type: String,
      enum: ["2-bed", "4-bed", "6-bed", "public room"],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["vacant", "occupied", "partially-occupied"],
      default: "vacant",
    },
    floor: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available beds
RoomSchema.virtual("availableBeds").get(function () {
  return this.capacity - this.currentOccupancy;
});

// Auto-update status based on currentOccupancy
RoomSchema.pre("save", function (next) {
  if (this.isModified("currentOccupancy")) {
    if (this.currentOccupancy === 0) this.status = "vacant";
    else if (this.currentOccupancy < this.capacity)
      this.status = "partially-occupied";
    else this.status = "occupied";
  }
  next();
});

// Index combinations for filtering
RoomSchema.index({ hall: 1, roomNumber: 1 }, { unique: true });
RoomSchema.index({ hall: 1, status: 1 });

const Room = mongoose.model("Room", RoomSchema);
export default Room;
