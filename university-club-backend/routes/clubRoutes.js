import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  createClub,
  updateClub,
  getClubs,
  joinClub,
  submitExpense,
  verifyExpense,
  addEvent,
} from "../controllers/clubController.js";

const router = express.Router();

// View all clubs
router.get("/", protect, getClubs);

// Create club (Admin/Club admin)
router.post("/", protect, authorize("system_admin", "club_admin"), createClub);

// Update club (Admin/Club admin)
router.put("/:id", protect, authorize("system_admin", "club_admin"), updateClub);

// Join a club (Students)
router.post("/join/:id", protect, authorize("student"), joinClub);

// Submit expense (Members)
router.post("/expense/:id", protect, authorize("student", "club_admin"), submitExpense);

// Verify expense (Admin/Treasurer)
router.put("/expense/verify/:clubId/:expenseId", protect, authorize("system_admin", "treasurer"), verifyExpense);

// Add event (Admin/Club admin)
router.post("/event/:id", protect, authorize("system_admin", "club_admin"), addEvent);

export default router;