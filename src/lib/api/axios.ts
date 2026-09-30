import axios from "axios";

import { storage } from "../../storage/order.storage";

const api = axios.create({
  baseURL: "http://192.168.1.100:5000/api",
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    if (error.response?.status === 401) {
      await storage.removeToken();
    }

    return Promise.reject(error);
  }
);

export default api;