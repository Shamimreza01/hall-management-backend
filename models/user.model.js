import mongoose from "mongoose";

const studentDetailsSchema = new mongoose.Schema(
  {
    roll: {
      type: String,
      index: true,
    },
    registration: {
      type: String,
      index: true,
    },
    academicSession: {
      type: String,
      required: true,
      index: true,
    },
    admissionYear: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "CSE",
        "EEE",
        "EECE",
        "ICE",
        "CIVIL",
        "ARCH",
        "URP",
        "MATH",
        "PHY",
        "PHARM",
        "CHEM",
        "STAT",
        "BBA",
        "THM",
        "ECO",
        "BAN",
        "SOCIAL WORK",
        "ENG",
        "PUBLIC A",
        "HISTORY",
        "GEOGRAPHY",
      ],
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    fatherName: String,
    motherName: String,
    fatherPhone: String,
    emergencyContact: String,
    permanentAddress: String,
    medicalInfo: String,

    HallName: {
      type: String,
    },
    provostName: {
      type: String,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    position: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["current", "grace", "delinquent", "exempt"],
      default: "current",
    },
    balance: {
      type: Number,
      default: 0,
    },
    lateFees: {
      type: Number,
      default: 0,
    },
    clearanceHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HallClearance",
      },
    ],

    lastPaymentDate: Date,
    nextPaymentDate: Date,

    canHaveGuests: {
      type: Boolean,
      default: false,
    },
    restrictions: [String],
  },
  { _id: false }
);

// This for all user => VC,Provost, vice-Provost, student
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "viceProvost", "Provost", "vc"],
    },

    phone: {
      type: String,
      match: /^[0-9]{8,15}$/,
    },
    altPhone: {
      type: String,
      match: /^[0-9]{8,15}$/,
    },
    profilePhoto: {
      type: String,
      public_id: String,
    },

    designation: {
      type: String,
    },
    responsibilities: {
      type: String,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "former"],
      default: "pending",
    },
    formerHistory: {
      type: [
        {
          formerDate: Date,
          hall: { type: mongoose.Schema.Types.ObjectId, ref: "Hall" },
        },
      ],
    },
    rejectionReason: {
      type: String,
    },

    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
    },

    studentDetails: studentDetailsSchema,

    lastLogin: Date,
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🎯 Virtuals for easier access
UserSchema.virtual("roomNumber").get(function () {
  return this.studentDetails?.room?.roomNumber;
});
UserSchema.virtual("session").get(function () {
  return this.studentDetails?.academicSession;
});

// 📈 Indexes
UserSchema.index({ hall: 1, role: 1 });
UserSchema.index({
  "studentDetails.academicSession": 1,
  "studentDetails.department": 1,
});

const User = mongoose.model("User", UserSchema);
export default User;
