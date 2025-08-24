import express from "express";
import { adminStats } from "../controllers/admin.controller.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
const router = express.Router();

router.get("/stats", isAuthenticated, authorizeRoles("vc"), adminStats);

export default router;
