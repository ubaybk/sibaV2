// api.js

import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "https://puskesmascilandak.jakarta.go.id/sibav2BE";

// Buat instance axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fungsi cek apakah token expired
function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // exp dalam detik
  } catch (e) {
    console.error("Token tidak valid", e);
    return true;
  }
}
// Interceptor request: tambahkan token dan cek masa berlaku
// Interceptor hanya untuk request yang butuh auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor response (opsional): tangkap error seperti 400, 401, dll.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 dan belum pernah retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Di sini bisa tambahkan logika refresh token jika tersedia
      // Contoh:
      // const newToken = await refreshToken();
      // localStorage.setItem("token", newToken);
      // return api(originalRequest); // ulangi request dengan token baru

      // Sementara kita redirect ke login
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/pages/login";
      return Promise.reject(new Error("Sesi habis. Silakan login kembali."));
    }

    return Promise.reject(error);
  }
);