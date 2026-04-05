import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createMentorProfile,
  getClubMentors,
  getRecommendedMentors,
  createMentorshipRequest,
  getMyMentorshipRequests,
  getMentorRequests,
  updateMentorshipRequestStatus,
} from "../controllers/mentorshipController.js";

const router = express.Router();

// Mentor profile
router.post(
  "/club/:clubId/mentor-profile",
  protect,
  authorizeRoles("STUDENT", "CLUB_ADMIN", "CLUB_MEMBER", "SYSTEM_ADMIN"),
  createMentorProfile
);

// All mentors in a club
router.get("/club/:clubId/mentors", protect, getClubMentors);

// Recommendation engine
router.post("/club/:clubId/recommend", protect, getRecommendedMentors);

// Student creates request
router.post("/club/:clubId/request", protect, createMentorshipRequest);

// Student requests
router.get("/my-requests", protect, getMyMentorshipRequests);

// Mentor inbox
router.get("/mentor-requests", protect, getMentorRequests);

// Update request status
router.put("/request/:requestId/status", protect, updateMentorshipRequestStatus);

export default router;