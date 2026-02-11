import axios from "axios";
import { useSiteState } from "@/app/store/SiteStore";

let pending = 0;

const setLoading = (value: boolean) => {
  useSiteState.setState({ isLoading: value });
};


export const api = axios.create({
  baseURL: "/", // BFF routes
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    pending += 1;
    setLoading(true);
    return config;
  },
  (error) => {
    pending = Math.max(0, pending - 1);
    if (pending === 0) setLoading(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    pending = Math.max(0, pending - 1);
    if (pending === 0) setLoading(false);
    return response;
  },
  (error) => {
    pending = Math.max(0, pending - 1);
    if (pending === 0) setLoading(false);
    return Promise.reject(error);
  }
);

// Auth API functions
export const logout = async () => {
  try {
    await api.post("/api/auth/logout");
    useSiteState.getState().clearUser();
    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};