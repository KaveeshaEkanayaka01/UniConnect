import Project from "../models/Project.js";
import Comment from "../models/Comment.js";


// Create Project
export const createProject = async (req, res) => {
  try {
    if (req.files && req.files.length > 3) {
      return res.status(400).json({ message: "You can upload up to 3 images" });
    }

    const images = req.files.map(file => file.filename);

    const project = new Project({
      projectName: req.body.projectName,
      description: req.body.description,
      category: req.body.category,
      clubName: req.body.clubName,
      projectDate: req.body.projectDate,
      status: req.body.status,
      images
    });

    await project.save();

    res.json(project);

  } catch (error) {
    res.status(500).json(error.message);
  }
};


// Get All Projects
export const getProjects = async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
};


// Delete Project
export const deleteProject = async (req, res) => {

  await Project.findByIdAndDelete(req.params.id);

  res.json({ message: "Project deleted" });

};

// Update Project (admin)
export const updateProject = async (req, res) => {
  try {
    if (req.files && req.files.length > 3) {
      return res.status(400).json({ message: "You can upload up to 3 images" });
    }

    const updateData = { ...req.body };
    // if new files uploaded, replace image list
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.filename);
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json(error.message);
  }
};


// Like Project
export const likeProject = async (req, res) => {
  try {
    console.log("Like request for project:", req.params.id);
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },  // increment by 1
      { new: true, runValidators: true }  // return updated document
    );

    console.log("Updated project:", project);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // ensure likes is a number and not a weird large string
    project.likes = Number(project.likes);

    res.json(project);

  } catch (error) {
    console.error("Error in likeProject:", error);
    res.status(500).json(error.message);
  }
};


// Add Comment
export const addComment = async (req, res) => {

  const comment = new Comment({
    projectId: req.params.id,
    userName: req.body.userName,
    text: req.body.text
  });

  await comment.save();

  res.json(comment);

};


// Get Comments
export const getComments = async (req, res) => {

  const comments = await Comment.find({
    projectId: req.params.id
  });

  res.json(comments);

};


// Delete Comment (admin)
export const deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};