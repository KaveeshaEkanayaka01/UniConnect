import express from "express";
import { uploadPDF } from "../middleware/uploadMiddleware.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createClub,
  getAllClubs,
  getActiveClubs,
  getPendingClubs,
  getClubById,
  getClubDashboard,
  updateClub,
  uploadConstitution,
  downloadConstitution,
  approveClub,
  rejectClub,
  addMember,
  removeMember,
  updateMemberRole,
  deleteClub,
  requestJoinClub,
  getJoinRequests,
  getAllJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  checkJoinStatus,
  cancelJoinRequest,
  getMyClubs,
} from "../controllers/clubController.js";

const router = express.Router();

// ================= PUBLIC =================
router.get("/", getAllClubs);
router.get("/active", getActiveClubs);
router.get("/:id/constitution/download", downloadConstitution);

// ================= PROTECTED =================
router.get("/my-clubs", protect, getMyClubs);

// SYSTEM ADMIN ONLY
router.get(
  "/pending",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  getPendingClubs
);

router.post(
  "/",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  uploadPDF.single("constitution"),
  createClub
);

router.post(
  "/:id/constitution",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  uploadPDF.single("constitution"),
  uploadConstitution
);

// ================= CLUB ACCESS =================
// SYSTEM_ADMIN + CLUB_ADMIN (controller checks ownership)
router.get("/:clubId/dashboard", protect, getClubDashboard);

router.put(
  "/:id",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"),
  updateClub
);

// ================= MEMBER MANAGEMENT =================
router.post(
  "/:id/members",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"),
  addMember
);

router.delete(
  "/:id/members/:userId",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"),
  removeMember
);

router.put(
  "/:clubId/members/:userId",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"),
  updateMemberRole
);

// ================= JOIN REQUESTS =================
router.post("/:id/join", protect, requestJoinClub);
router.delete("/:id/join-request", protect, cancelJoinRequest);
router.get("/:id/join-status", protect, checkJoinStatus);

// Only club admins/system admins can manage join requests
router.get(
  "/:id/join-requests",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"),
  getJoinRequests
);

router.get(
  "/:id/join-requests/all",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"),
  getAllJoinRequests
);

router.put(
  "/:clubId/join-requests/:requestId/approve",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"),
  approveJoinRequest
);

router.put(
  "/:clubId/join-requests/:requestId/reject",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "CLUB_ADMIN"),
  rejectJoinRequest
);

// ================= SYSTEM ADMIN ONLY =================
router.put(
  "/:id/approve",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  approveClub
);

router.put(
  "/:id/reject",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  rejectClub
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SYSTEM_ADMIN"),
  deleteClub
);

// ================= LAST =================
router.get("/:id", getClubById);

export default router;