import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("accessToken");
      Cookies.remove("user");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const apiService = {
  // Authentication
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),

  // Transactions
  getTransactions: (params?: string) =>
    api.get(`/transactions${params ? `?${params}` : ""}`),

  createTransaction: (data: any) => api.post("/transactions", data),

  updateTransaction: (id: string, data: any) =>
    api.put(`/transactions/${id}`, data),

  deleteTransaction: (id: string) => api.delete(`/transactions/${id}`),

  // Analytics
  getAnalyticsOverview: (startDate?: string, endDate?: string) => {
    let query = "";
    if (startDate && endDate) {
      query = `?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;
    } else if (startDate) {
      query = `?startDate=${encodeURIComponent(startDate)}`;
    } else if (endDate) {
      query = `?endDate=${encodeURIComponent(endDate)}`;
    }
    return api.get(`/analytics/overview${query}`);
  },

  getAnalyticsMonthly: (startDate?: string, endDate?: string) => {
    let query = "";
    if (startDate && endDate) {
      query = `?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;
    } else if (startDate) {
      query = `?startDate=${encodeURIComponent(startDate)}`;
    } else if (endDate) {
      query = `?endDate=${encodeURIComponent(endDate)}`;
    }
    return api.get(`/analytics/monthly${query}`);
  },

  getAnalyticsCategories: (startDate?: string, endDate?: string) => {
    let query = "";
    if (startDate && endDate) {
      query = `?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;
    } else if (startDate) {
      query = `?startDate=${encodeURIComponent(startDate)}`;
    } else if (endDate) {
      query = `?endDate=${encodeURIComponent(endDate)}`;
    }
    return api.get(`/analytics/categories${query}`);
  },

  // Users (Admin only)
  getUsers: (params?: string) => api.get(`/users${params ? `?${params}` : ""}`),

  updateUserRole: (id: string, role: string) =>
    api.put(`/users/${id}/role`, { role }),

  resetUserPassword: (id: string, newPassword: string) =>
    api.put(`/users/${id}/password`, { newPassword }),

  deleteUser: (id: string) => api.delete(`/users/${id}`),
};
