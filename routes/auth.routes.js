import express from "express";
import {
  getCurrentUser,
  login,
  logout,
  registerProvost,
  registerViceProvost,
  studentsRegistration,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/register-student",
  upload.single("profilePhoto"),
  studentsRegistration
);
router.post(
  "/register-provost",
  upload.single("profilePhoto"),
  registerProvost
);
router.post(
  "/register-viceprovost",
  upload.single("profilePhoto"),
  registerViceProvost
);
router.get("/me", isAuthenticated, getCurrentUser);
router.post("/login", login);
router.post("/logout", logout);
export default router;
