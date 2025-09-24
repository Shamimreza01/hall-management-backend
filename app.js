import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import hallRoutes from "./routes/hall.routes.js";
import hallClearanceRoutes from "./routes/hallClearance.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import provostRoutes from "./routes/provost.routes.js";
import ResidencyExtensionRoutes from "./routes/residencyExtension.routes.js";
import roomRoutes from "./routes/room.routes.js";
import studentRoutes from "./routes/student.routes.js";
dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: ["http://localhost:5173", "https://pusthall.netlify.app"],
    credentials: true, // ✅ allow cookies (JWT)
  })
);

app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => res.send("Hall management Server Running"));

app.use("/api/auth", authRoutes);
app.use("/api/provosts", provostRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clearance", hallClearanceRoutes);
app.use("/api/extensions", ResidencyExtensionRoutes);
app.use("/api/guest-request", (req, res) => {
  res.send("wait bro wait, the developer is eating now");
});

export default app;
