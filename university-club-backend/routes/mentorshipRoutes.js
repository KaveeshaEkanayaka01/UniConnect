import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  MatchMento,
  requestMentor,
  getMentorRequest,
  respondToRequest,
  getStudentMentorships,
} from "../controllers/mentorshipController.js";

const router = express.Router();

// 1️⃣ Match mentors for student
// Only students can see matching mentors
router.get("/match", protect, authorize("student"), MatchMento);

// 2️⃣ Send mentorship request to a mentor
// Students only
router.post("/request/:mentorId", protect, authorize("student"), requestMentor);

// 3️⃣ Mentor sees incoming requests
// Mentors only
router.get("/requests", protect, authorize("mentor"), getMentorRequest);

// 4️⃣ Mentor responds to a request (ACCEPT/REJECT)
// Mentors only
router.put("/respond/:id", protect, authorize("mentor"), respondToRequest);

// 5️⃣ Get all mentorships of logged-in user (mentor or student)
router.get("/", protect, getStudentMentorships);

export default router;