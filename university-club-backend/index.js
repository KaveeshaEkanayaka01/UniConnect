// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";      // Your auth CRUD routes
import studentRoutes from "./routes/studentRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/elections", electionRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    // Start server
    const port = Number(process.env.PORT) || 5000;
    const server = app.listen(port, () =>
      console.log(`Server running on port ${port}`)
    );

    // Handle server errors
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

// Optional: root route test
app.get("/", (req, res) => res.send("Server is running!"));