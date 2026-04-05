import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadEventImage } from "../middleware/uploadMiddleware.js";
import {
  createClubEvent,
  getClubEvents,
  getPendingClubEvents,
  getClubEventById,
  updateClubEvent,
  approveClubEvent,
  rejectClubEvent,
  deleteClubEvent,
} from "../controllers/clubeventController.js";

const router = express.Router();

// Get all approved events for a club
router.get("/club/:clubId", protect, getClubEvents);

// Get all pending event requests for system admin
router.get(
  "/pending/all",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  getPendingClubEvents
);

// Get one event by event id
router.get("/:id", protect, getClubEventById);

// Create event request
router.post("/", protect, uploadEventImage.single("image"), createClubEvent);

// Update event request
router.put("/:id", protect, uploadEventImage.single("image"), updateClubEvent);

// Approve event request
router.put(
  "/:id/approve",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  approveClubEvent
);

// Reject event request
router.put(
  "/:id/reject",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  rejectClubEvent
);

// Delete event request
router.delete("/:id", protect, deleteClubEvent);

export default router;