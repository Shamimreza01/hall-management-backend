import express from "express";
import {
  approvedStudentsList,
  approveStudent,
  pendingStudentsList,
  rejectedStudentsList,
  rejectStudent,
  removeStudent,
  studentsList,
} from "../controllers/student.controller.js";
import assignUserHall from "../middlewares/assignHall.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";

const router = express.Router();

router.patch(
  "/:userId/approve",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  approveStudent
);
router.patch(
  "/:userId/reject",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  rejectStudent
);
router.patch(
  "/:userId/remove",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  removeStudent
);
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  studentsList
);
router.get(
  "/pending-students",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  pendingStudentsList
);
router.get(
  "/approved-students",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  approvedStudentsList
);
router.get(
  "/rejected-students",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  rejectedStudentsList
);
export default router;
