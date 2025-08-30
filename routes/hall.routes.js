import express from "express";
import {
  activateHall,
  activeHallsList,
  createHall,
  deactivateHall,
  deactivateHallsList,
  hallDetails,
  hallListForReg,
  hallsList,
  updateHall,
} from "../controllers/hall.controller.js";
import assignUserHall from "../middlewares/assignHall.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";

const router = express.Router();

router.post("/create", isAuthenticated, authorizeRoles("vc"), createHall);
router.patch(
  "/:hallId/update",
  isAuthenticated,
  authorizeRoles("vc"),
  updateHall
);
router.patch(
  "/:hallId/deactivate",
  isAuthenticated,
  authorizeRoles("vc"),
  deactivateHall
);
router.patch(
  "/:hallId/activate",
  isAuthenticated,
  authorizeRoles("vc"),
  activateHall
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
router.get(
  "/halldetails",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  hallDetails
);

export default router;
