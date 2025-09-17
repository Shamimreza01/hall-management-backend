import express from "express";
import {
  approveHallClearance,
  cancelMyHallClearance,
  createHallClearance,
  getHallClearanceById,
  getHallClearances,
  getMyHallClearances,
  rejectHallClearance,
  verifyHallClearance,
} from "../controllers/hallClearance.controller.js";
import assignHall from "../middlewares/assignHall.middleware.js";
import authorizeRole from "../middlewares/authorizeRoles.middleware.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  authorizeRole("student"),
  assignHall,
  createHallClearance
);
router.get(
  "/",
  isAuthenticated,
  authorizeRole("Provost"),
  assignHall,
  getHallClearances
);
router.get(
  "/my",
  isAuthenticated,
  authorizeRole("student"),
  getMyHallClearances
);
router.get(
  "/:id",
  isAuthenticated,
  authorizeRole("student"),
  getHallClearanceById
);
router.patch(
  "/:id/approve",
  isAuthenticated,
  authorizeRole("Provost"),
  assignHall,
  approveHallClearance
);
router.patch(
  "/:id/reject",
  isAuthenticated,
  authorizeRole("Provost"),
  assignHall,
  rejectHallClearance
);
router.patch(
  "/:id/cancel",
  isAuthenticated,
  authorizeRole("student"),
  cancelMyHallClearance
);
router.post("/verify", verifyHallClearance);

export default router;
