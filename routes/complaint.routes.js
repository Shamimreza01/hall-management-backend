import express from "express";
import {
  createComplaint,
  getComplaints,
  myComplaints,
} from "../controllers/complaint.controller.js";
import assignUserHall from "../middlewares/assignHall.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("student"),
  assignUserHall,
  upload.array("attachments"),
  createComplaint
);
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  getComplaints
);
router.get(
  "/my-complaints",
  isAuthenticated,
  authorizeRoles("student"),
  myComplaints
);

export default router;
