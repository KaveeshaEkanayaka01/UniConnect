import axios from "axios";

const API = "http://localhost:5000/api/projects";

export const getProjects = () => axios.get(API);

export const createProject = (data) =>
  axios.post(`${API}/create`, data);

export const likeProject = (id) =>
  axios.put(`http://localhost:5000/api/projects/like/${id}`);

export const deleteProject = (id) =>
  axios.delete(`${API}/${id}`);

export const updateProject = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const addComment = (id, data) =>
  axios.post(`${API}/comment/${id}`, data);

export const getComments = (id) =>
  axios.get(`${API}/comments/${id}`);

export const deleteComment = (commentId) =>
  axios.delete(`${API}/comment/${commentId}`);