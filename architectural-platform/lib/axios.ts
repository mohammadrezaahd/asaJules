import axios from "axios";
import { getSession } from "next-auth/react";
import environments from "./config";

const axiosInstance = axios.create({
  baseURL: environments.uri.api_url,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.token) {
      config.headers.Authorization = `Bearer ${session.user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;