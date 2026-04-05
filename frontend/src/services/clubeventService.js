import API from "../components/Auth/axios";

export const getClubEvents = async (clubId) => {
  const res = await API.get(`/clubevents/club/${clubId}`);
  return res.data;
};

export const getPendingClubEvents = async () => {
  const res = await API.get("/clubevents/pending/all");
  return res.data;
};

export const getClubEventById = async (eventId) => {
  const res = await API.get(`/clubevents/${eventId}`);
  return res.data;
};

export const createClubEvent = async (formData) => {
  const res = await API.post("/clubevents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateClubEvent = async (eventId, formData) => {
  const res = await API.put(`/clubevents/${eventId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const approveClubEvent = async (eventId, payload) => {
  const res = await API.put(`/clubevents/${eventId}/approve`, payload);
  return res.data;
};

export const rejectClubEvent = async (eventId, payload) => {
  const res = await API.put(`/clubevents/${eventId}/reject`, payload);
  return res.data;
};

export const deleteClubEvent = async (eventId) => {
  const res = await API.delete(`/clubevents/${eventId}`);
  return res.data;
};