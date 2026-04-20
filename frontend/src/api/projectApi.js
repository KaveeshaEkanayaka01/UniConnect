import axios from "axios";

const API = "http://localhost:5000/api/projects";

// GET all projects
export const getProjects = () => axios.get(API);

// CREATE project
export const createProject = (data) => axios.post(`${API}/create`, data);

// LIKE project
export const likeProject = (id) => axios.put(`${API}/like/${id}`);

// DELETE project
export const deleteProject = (id) => axios.delete(`${API}/${id}`);

// UPDATE project
export const updateProject = (id, data) => axios.put(`${API}/${id}`, data);

// ADD comment
export const addComment = (id, data) => axios.post(`${API}/comment/${id}`, data);

// GET comments
export const getComments = (id) => axios.get(`${API}/comments/${id}`);

// DELETE comment
export const deleteComment = (commentId) =>
  axios.delete(`${API}/comment/${commentId}`);