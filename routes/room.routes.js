import express from "express";
import {
  bulkCreateRoomRange,
  createRoom,
  getRoomWiseStudents,
  roomList,
  roomListUsingHallId,
} from "../controllers/room.controller.js";
import { assignUserHall } from "../middlewares/assignHall.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware.js";
const router = express.Router();

router.get(
  "/students",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  getRoomWiseStudents
);
router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  createRoom
);
router.post(
  "/bulkCreate",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  bulkCreateRoomRange
);
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("Provost"),
  assignUserHall,
  roomList
);
router.get("/reg/", roomListUsingHallId);
export default router;
