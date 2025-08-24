import express from "express";
import { createNotice, getNotices } from "../controllers/notice.controller.js";
import assignUserHall from "../middlewares/assignHall.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
import upload from "../middlewares/upload.middleware.js";
const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("Provost", "ViceProvost", "VC"),
  assignUserHall,
  upload.array("attachments"),
  createNotice
);
router.get("/", isAuthenticated, assignUserHall, getNotices);

export default router;
