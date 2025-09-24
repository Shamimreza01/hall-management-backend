import express from "express";
import {
  applyGroupExtensionPolicy,
  approveExtension,
  getGroupPolicyHistory,
  rejectExtension,
  requestResidencyExtension,
} from "../controllers/residencyExtension.controller.js";
import assignHall from "../middlewares/assignHall.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";

const router = express.Router();

router.post(
  "/request",
  isAuthenticated,
  authorizeRoles("student"),
  assignHall,
  requestResidencyExtension
);

router.post(
  "/group-policy",
  isAuthenticated,
  authorizeRoles("Provost", "viceProvost"),
  assignHall,
  applyGroupExtensionPolicy
);

router.patch(
  "/:id/approve",
  isAuthenticated,
  authorizeRoles("Provost", "viceProvost"),
  assignHall,
  approveExtension
);

router.patch(
  "/:id/reject",
  isAuthenticated,
  authorizeRoles("Provost", "viceProvost"),
  assignHall,
  rejectExtension
);

router.get(
  "/group-policy-history",
  isAuthenticated,
  authorizeRoles("Provost", "viceProvost"),
  assignHall,
  getGroupPolicyHistory
);

export default router;
