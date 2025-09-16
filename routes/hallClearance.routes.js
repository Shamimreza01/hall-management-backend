import express from "express";
import {
  approveHallClearance,
  createHallClearance,
  getHallClearanceById,
  getHallClearances,
  getMyHallClearances,
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
router.post("/verify", verifyHallClearance);

export default router;
