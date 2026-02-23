import axios, { AxiosResponse } from "axios";
import toast from "react-hot-toast";

import { useSiteState } from "@/app/store/SiteStore";


export type ApiErrorBody = {
  success?: boolean;
  message?: string;
  error?: string;
};

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
    showErrorToast(error?.response)
    return Promise.reject(error);
  }
);

const showErrorToast = (response: AxiosResponse<ApiErrorBody>) => {
  if (response?.data?.message){
    toast.error(response.data.message)
  }else{
    toast.error("Request failed. Please try again later.");
  }
};