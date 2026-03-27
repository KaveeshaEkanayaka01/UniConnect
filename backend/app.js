import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    const port = Number(process.env.PORT) || 5000;
    const server = app.listen(port, () =>
      console.log(`Server running on port ${port}`)
    );

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.log(
          `Server is already running on port ${port}. Reusing existing instance.`
        );
        process.exit(0);
      }

      console.error("Server startup error:", error.message);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err.message);
  });
