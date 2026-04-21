import Project from "../models/Project.js";
import Comment from "../models/Comment.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    if (req.files && req.files.length > 3) {
      return res.status(400).json({ message: "You can upload up to 3 images" });
    }

    const images = req.files ? req.files.map((file) => file.filename) : [];

    const project = new Project({
      projectName: req.body.projectName,
      description: req.body.description,
      category: req.body.category,
      clubName: req.body.clubName,
      projectDate: req.body.projectDate,
      status: req.body.status,
      images,
    });

    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Project
export const deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    if (req.files && req.files.length > 3) {
      return res.status(400).json({ message: "You can upload up to 3 images" });
    }

    const updateData = {
      projectName: req.body.projectName,
      description: req.body.description,
      category: req.body.category,
      clubName: req.body.clubName,
      projectDate: req.body.projectDate,
      status: req.body.status,
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.filename);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like Project
export const likeProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    // Prefer logged-in user's full name when available
    const userName = req.user?.fullName || req.body.userName || "Anonymous";

    const comment = new Comment({
      projectId: req.params.id,
      userName,
      text: req.body.text,
    });

    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Comments
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      projectId: req.params.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};