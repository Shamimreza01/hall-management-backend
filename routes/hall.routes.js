import express from "express";
import {
  activeHallsList,
  createHall,
  deactivateHall,
  deactivateHallsList,
  hallListForReg,
  hallsList,
  updateHall,
} from "../controllers/hall.controller.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware.js";

const router = express.Router();

router.post("/create", isAuthenticated, authorizeRoles("vc"), createHall);
router.patch(
  "/:hallId/update",
  isAuthenticated,
  authorizeRoles("vc"),
  updateHall
);
router.patch(
  "/:hallId/deactive",
  isAuthenticated,
  authorizeRoles("vc"),
  deactivateHall
);

router.get("/", isAuthenticated, authorizeRoles("vc"), hallsList);
router.get("/hallList", hallListForReg);
router.get(
  "/active-halls",
  isAuthenticated,
  authorizeRoles("vc"),
  activeHallsList
);
router.get(
  "/deactive-halls",
  isAuthenticated,
  authorizeRoles("vc"),
  deactivateHallsList
);

export default router;
