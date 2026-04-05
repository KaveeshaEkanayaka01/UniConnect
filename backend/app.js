import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

// Routes
import newsRoutes from "./routes/newsRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import credentialRoutes from "./routes/credentialRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import clubeventRoutes from "./routes/clubeventRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import mentorshipRoutes from "./routes/mentorshipRoutes.js";

dotenv.config();

const app = express();

// ✅ Middleware (use better version from dev)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static folder
app.use("/uploads", express.static(path.resolve("uploads")));

// ✅ Basic Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Club Management System API Running...",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

// ✅ Combine ALL routes
app.use("/news", newsRoutes);
app.use("/api/projects", projectRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/credentials", credentialRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/clubevents", clubeventRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/mentorships", mentorshipRoutes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.message || "File upload error",
    });
  }

  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ✅ MongoDB + Server (use better dev version)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    const port = Number(process.env.PORT) || 5000;

    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

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
    process.exit(1);
  });