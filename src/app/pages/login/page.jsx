"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleSharp, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { api } from "../../../utils/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password
  const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await api.post("/api/auth/login", { email, password });

    if (!response.data || !response.data.token) {
      toast.error("Token tidak diterima dari server");
      return;
    }

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // Tampilkan toast sukses
    toast.success("Login berhasil!", {
      autoClose: 1000,
      onClose: () => {
        router.push("/pages/dashboard"); // Redirect setelah toast ditutup
      }
    });

  } catch (err) {
    console.error("Error login:", err);

    let errorMessage = "Terjadi kesalahan saat login.";

    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.request) {
      errorMessage = "Server tidak merespons. Cek backend.";
    }

    setError(errorMessage);
    toast.error(errorMessage);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-600 px-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {/* Tombol Back */}
      <button
        onClick={() => router.back()}
        className="self-start text-white text-3xl mb-4 hover:scale-95 transition-transform text-[50px] hover:text-purple-200 cursor-pointer"
        aria-label="Kembali"
      >
        <IoArrowBackCircleSharp />
      </button>

      {/* Form Login */}
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md text-black"
      >
        <div className="flex justify-center mb-6">
          <img src="/logoSibaV2.png" alt="SIBA Logo" className="w-20 h-20" />
        </div>

        <h2 className="text-2xl font-bold text-center text-purple-600">Login to SIBA V2</h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Email */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        {/* Password dengan Toggle */}
        <div className="mt-4 relative">
          <label className="block text-sm font-medium">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
          </button>
        </div>

        {/* Tombol Login */}
        <button
          type="submit"
          className="w-full px-4 py-2 mt-6 text-white bg-purple-600 rounded-md hover:bg-purple-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}