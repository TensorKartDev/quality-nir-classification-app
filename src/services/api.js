import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:10000";

// API Service Functions
export const findNonConformances = (payload) => {
  return axios.post(`${BASE_URL}/find_non_conformances/`, payload);
};

export const getInsights = (payload) => {
  return axios.post(`${BASE_URL}/get_insights/`, payload);
};

export const addFeedback = (payload) => {
  return axios.post(`${BASE_URL}/add_hitl_feedback/`, payload);
};