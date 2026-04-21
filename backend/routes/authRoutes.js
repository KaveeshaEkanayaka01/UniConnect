import express from "express";
import {
	register,
	login,
	getMe,
	changePassword,
	deactivateAccount,
	forgotPassword,
	resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register new user
router.post("/register", register);

// Login
router.post("/login", login);

// Get current user
router.get("/me", protect, getMe);

// Change password for logged in users
router.put("/change-password", protect, changePassword);

// Deactivate the current account
router.put("/deactivate-account", protect, deactivateAccount);

// Send reset link to email
router.post("/forgot-password", forgotPassword);

// Reset password using token
router.post("/reset-password/:token", resetPassword);

export default router;
