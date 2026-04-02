import express from "express";
import upload from "../middleware/upload.js";

import {
  createProject,
  getProjects,
  deleteProject,
  updateProject,
  likeProject,
  addComment,
  getComments
  , deleteComment
} from "../controllers/projectController.js";

const router = express.Router();


router.post("/create", upload.array("images"), createProject);

router.get("/", getProjects);

router.delete("/:id", deleteProject);

// update must come before /like to avoid route conflict if used without prefix
router.put("/:id", upload.array("images"), updateProject);

router.put("/like/:id", likeProject);

router.post("/comment/:id", addComment);

router.get("/comments/:id", getComments);

// delete a comment by comment id (admin)
router.delete("/comment/:id", deleteComment);

export default router;