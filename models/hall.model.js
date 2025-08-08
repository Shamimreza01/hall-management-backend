import mongoose from "mongoose";

const hallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    totalFloors: {
      type: Number,
      required: true,
      min: 1,
    },

    totalBlocks: {
      type: Number,
      default: 4,
    },

    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },

    provost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Provost
    },

    viceProvosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Vice Provosts for various responsibilities
      },
    ],

    totalCapacity: {
      type: Number,
      default: 0,
    },

    currentOccupants: {
      type: Number,
      default: 0,
    },

    facilities: {
      type: [String],
      default: [],
    },

    contactEmail: {
      type: String,
    },

    contactPhone: {
      type: String,
      match: /^\+880[0-9]{10}$/,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🎯 Virtual to get available capacity
hallSchema.virtual("availableCapacity").get(function () {
  return this.totalCapacity - this.currentOccupants;
});

// 📈 Indexes
hallSchema.index({ name: 1 }, { unique: true });
hallSchema.index({ gender: 1, isActive: 1 });

const Hall = mongoose.model("Hall", hallSchema);
export default Hall;
