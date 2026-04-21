import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createMentorProfile,
  getMyMentorProfile,
  updateMyMentorProfile,
  deleteMyMentorProfile,
  getClubMentors,
  getRecommendedMentors,
  createMentorshipRequest,
  getMyMentorshipRequests,
  getMentorRequests,
  updateMentorshipRequestStatus,
} from "../controllers/mentorshipController.js";

const router = express.Router();

router.post(
  "/club/:clubId/mentor-profile",
  protect,
  authorizeRoles("STUDENT", "CLUB_ADMIN", "CLUB_MEMBER", "SYSTEM_ADMIN"),
  createMentorProfile
);

router.get(
  "/club/:clubId/my-mentor-profile",
  protect,
  authorizeRoles("STUDENT", "CLUB_ADMIN", "CLUB_MEMBER", "SYSTEM_ADMIN"),
  getMyMentorProfile
);

router.put(
  "/club/:clubId/mentor-profile",
  protect,
  authorizeRoles("STUDENT", "CLUB_ADMIN", "CLUB_MEMBER", "SYSTEM_ADMIN"),
  updateMyMentorProfile
);

router.delete(
  "/club/:clubId/mentor-profile",
  protect,
  authorizeRoles("STUDENT", "CLUB_ADMIN", "CLUB_MEMBER", "SYSTEM_ADMIN"),
  deleteMyMentorProfile
);

router.get("/club/:clubId/mentors", protect, getClubMentors);
router.post("/club/:clubId/recommend", protect, getRecommendedMentors);
router.post("/club/:clubId/request", protect, createMentorshipRequest);
router.get("/my-requests", protect, getMyMentorshipRequests);
router.get("/mentor-requests", protect, getMentorRequests);
router.put("/request/:requestId/status", protect, updateMentorshipRequestStatus);

export default router;