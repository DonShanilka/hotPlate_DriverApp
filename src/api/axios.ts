import axios from "axios";

export const API_URL = "http://192.168.1.10:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
