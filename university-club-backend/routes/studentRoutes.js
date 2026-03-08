import express from "express";
import {
  getDashboard,
  updateProfile,
  addSkill,
  removeSkill,
  getBadges,
} from "../controllers/studentController.js";

import { protect } from "../middleware/authMiddleware.js";
import {
  MatchMento,
  requestMentor,
  getMentorRequest,
  respondToRequest,
  getStudentMentorships,
} from "../controllers/mentorshipController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

 router.get("/dashboard", getDashboard);

 router.put("/profile", updateProfile);

// ADD skill
router.post("/skills", addSkill);

// REMOVE skill
router.delete("/skills/:skillId", removeSkill);

// GET badges
router.get("/badges", getBadges);

router.get("/match", MatchMento);
router.post("/request/:mentorId", requestMentor);
router.get("/requests", getMentorRequest);
router.put("/respond/:id", respondToRequest);
router.get("/my", getStudentMentorships);




export default router;