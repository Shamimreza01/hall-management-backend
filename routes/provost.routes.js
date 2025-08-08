import express from "express";
import {
  approvedProvostsList,
  approveProvost,
  pendingProvostsList,
  rejectedProvostsList,
  rejectProvost,
  removeProvost,
} from "../controllers/provost.controller.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware.js";

const router = express.Router();

router.patch(
  "/:userId/approve",
  isAuthenticated,
  authorizeRoles("vc"),
  approveProvost
);

router.patch(
  "/:userId/reject",
  isAuthenticated,
  authorizeRoles("vc"),
  rejectProvost
);

router.patch(
  "/:userId/remove",
  isAuthenticated,
  authorizeRoles("vc"),
  removeProvost
);
router.get(
  "/pending-provosts",
  isAuthenticated,
  authorizeRoles("vc"),
  pendingProvostsList
);
router.get(
  "/rejected-Provosts",
  isAuthenticated,
  authorizeRoles("vc"),
  rejectedProvostsList
);
router.get(
  "/approved-provosts",
  isAuthenticated,
  authorizeRoles("vc"),
  approvedProvostsList
);

export default router;
