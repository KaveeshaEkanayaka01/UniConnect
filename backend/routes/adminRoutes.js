import express from "express";
import {
  assignRewards,
  createUserByAdmin,
  deleteUserByAdmin,
  getAllBadges,
  getUsers,
  updateUserByAdmin,
} from "../controllers/adminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"));

router.get("/users", getUsers);
router.post("/users", createUserByAdmin);
router.put("/users/:userId", updateUserByAdmin);
router.delete("/users/:userId", deleteUserByAdmin);

router.get("/badges", getAllBadges);
router.post("/users/:userId/rewards", assignRewards);

export default router;
