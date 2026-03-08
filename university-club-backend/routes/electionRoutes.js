import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  createElection,
  updateElection,
  getElections,
  voteInElection,
  completeElection,
} from "../controllers/electionController.js";

const router = express.Router();

// View elections
router.get("/", protect, getElections);

// Create election (Admin / Club admin)
router.post("/", protect, authorize("system_admin", "club_admin"), createElection);

// Update election (Admin / Club admin)
router.put("/:id", protect, authorize("system_admin", "club_admin"), updateElection);

// Vote in election (Students)
router.post("/vote", protect, authorize("student"), voteInElection);

// Complete election (Admin / Club admin)
router.put("/complete/:id", protect, authorize("system_admin", "club_admin"), completeElection);

export default router;