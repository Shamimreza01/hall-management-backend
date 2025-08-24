import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Hall from "../models/hall.model.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { loginValidation } from "../validations/login.validation.js";
import {
  provostRegistrationValidation,
  studentReistrationValidation,
} from "../validations/user.validation.js";

export const studentsRegistration = async (req, res) => {
  try {
    // ✅ 1. Joi validation
    const { error } = studentReistrationValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // ✅ 2. Extract data
    const {
      name,
      email,
      password,
      phone,
      altPhone,
      roll,
      registration,
      academicSession,
      admissionYear,
      department,
      fatherName,
      motherName,
      fatherPhone,
      emergencyContact,
      permanentAddress,
      bloodGroup,
      medicalInfo,
      hall,
      room,
      position,
    } = req.body;

    // ✅ 3. Validate hall
    const foundHall = await Hall.findById(hall);
    if (!foundHall)
      return res.status(404).json({ message: "Selected hall is invalid." });

    // ✅ 4. Validate room
    const foundRoom = await Room.findById(room);
    if (!foundRoom || foundRoom.hall.toString() !== hall)
      return res
        .status(404)
        .json({ message: "Selected room is invalid or not in selected hall." });

    // ✅ 5. Check if email/roll already exists
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(409).json({ message: "Email already registered." });

    const rollExists = await User.findOne({ "studentDetails.roll": roll });
    if (rollExists)
      return res.status(409).json({ message: "Roll already registered." });
    const regExists = await User.findOne({
      "studentDetails.registration": registration,
    });
    if (regExists)
      return res
        .status(409)
        .json({ message: "Registration already registered." });

    let profilePhotoUrl = null;
    if (!req.file) {
      return res.status(400).json({ message: "Profile photo is required." });
    }

    const cloudinaryResult = await uploadBufferToCloudinary(
      req.file.buffer,
      "hall-management/students"
    );
    profilePhotoUrl = cloudinaryResult.secure_url;

    // ✅ 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 7. Create new student user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      altPhone,
      profilePhoto: profilePhotoUrl,
      role: "student",
      hall,
      approvalStatus: "pending",
      studentDetails: {
        roll,
        registration,
        academicSession,
        admissionYear,
        department,
        fatherName,
        motherName,
        fatherPhone,
        emergencyContact,
        permanentAddress,
        bloodGroup,
        medicalInfo,
        room,
        position,
        HallName: foundHall.name,
        provostName: foundHall.provost,
      },
    });

    await newUser.save();

    // ✅ 8. Response
    return res.status(201).json({
      message: "Student registered successfully. Awaiting approval.",
      studentId: newUser._id,
    });
  } catch (error) {
    console.error("Student registration error:", error);
    return res
      .status(500)
      .json({ message: "Server error during registration." });
  }
};

export const registerProvost = async (req, res) => {
  const { error } = provostRegistrationValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const {
    name,
    email,
    password,
    phone,
    altPhone,
    profilePhoto,
    hall,
    secretCode,
  } = req.body;
  // 🔐 Check secret code
  const hallCheck = await Hall.findById(hall);
  if (!hallCheck) {
    return res.status(404).json({ message: "Hall not found." });
  }
  if (secretCode !== hallCheck?.secretCode) {
    return res
      .status(403)
      .json({ message: "Unauthorized registration attempt." });
  }

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(409).json({ message: "User already exists." });

  let profilePhotoUrl = null;
  if (!req.file) {
    return res.status(400).json({ message: "Profile photo is required." });
  }
  if (req.file) {
    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      "hall-management/provosts"
    );
    profilePhotoUrl = result.secure_url;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    altPhone,
    profilePhoto: profilePhotoUrl,
    role: "Provost",
    hall,
    approvalStatus: "pending",
  });

  await user.save();

  return res
    .status(201)
    .json({ message: "Registration submitted. Awaiting approval by VC." });
};

export const registerViceProvost = async (req, res) => {
  const { error } = provostRegistrationValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const {
    name,
    email,
    password,
    phone,
    altPhone,
    profilePhoto,
    hall,
    designation,
    responsibilities = [],
    secretCode,
  } = req.body;

  // 🔐 Check secret code
  if (secretCode !== process.env.VICE_PROVOST_REG_SECRET) {
    return res
      .status(403)
      .json({ message: "Unauthorized registration attempt." });
  }

  // 🔍 Check if already registered
  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(409).json({ message: "User already exists." });

  let profilePhotoUrl = null;
  if (req.file) {
    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      "hall-management/viceprovosts"
    );
    profilePhotoUrl = result.secure_url;
  }
  console.log("okk run");

  // 🔐 Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    altPhone,
    profilePhoto: profilePhotoUrl,
    role: "viceProvost",
    designation,
    responsibilities,
    hall,
    approvalStatus: "pending", // VC must approve
  });

  await user.save();

  return res
    .status(201)
    .json({ message: "Registration submitted. Awaiting approval by VC." });
};

export const login = async (req, res) => {
  const { error } = loginValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials." });

  if (user.approvalStatus === "pending") {
    return res.status(403).json({ message: "Account pending approval." });
  }
  if (user.approvalStatus === "rejected")
    return res.status(403).json({
      rejectionReason: user.rejectionReason,
      message: "Your account has been rejected by the authority.",
    });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid credentials." });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true, // ✅ required for HTTPS (Render)
      sameSite: "none", // ✅ cross-site cookies
      maxAge: 1000 * 60 * 60 * 72, // 72 hours
      path: "/",
    })
    .status(200)
    .json({
      message: "Login successful",
    });
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // ✅ same flags as login
    sameSite: "none",
    path: "/", // ✅ must match path used when setting the cookie
  });
  res.json({ message: "Logged out successfully." });
};

export const getCurrentUser = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  const me = await User.findById(user.id);
  if (!me) {
    return res.status(404).json({ message: "User not found." });
  }
  let hall;
  if (user.role !== "vc") {
    hall = await Hall.findById(me.hall);
    if (!hall) {
      return res.status(404).json({ message: "Hall not found." });
    }
    if (hall.isActive === false) {
      return res.status(403).json({ message: "Hall is not active." });
    }
  }
  let room;
  if (me.studentDetails) {
    room = await Room.findById(me.studentDetails.room);
  }

  res.status(200).json({
    user: {
      id: me._id,
      name: me.name,
      email: me.email,
      role: me.role,
      profilePhoto: me.profilePhoto,
      hall: hall,
      hallName: hall?.name,
      approvalStatus: me.approvalStatus,
      studentDetails: me.studentDetails || null,
      roomNumber: room?.roomNumber || null,
    },
  });
};
