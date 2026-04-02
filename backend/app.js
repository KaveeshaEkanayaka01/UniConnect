import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// Routes
import newsRoutes from "./routes/newsRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploaded images
app.use("/uploads", express.static("uploads"));


// Routes
app.use("/news", newsRoutes);
app.use("/api/projects", projectRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("Club Management System API Running...");
});


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err.message);
  });