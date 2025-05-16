"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { api } from "../../../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await api.post("/api/auth/login", { email, password });
  
      console.log("Respons dari API:", response);
  
      if (!response.data || !response.data.token) {
        setError("Token tidak diterima dari server");
        return;
      }
  
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
  
      router.push("/pages/dashboard");
  
    } catch (err) {
  console.error("Error login:", err);

  if (err.response) {
    // Jika server memberikan respons dengan status tertentu
    if (err.response.status === 401) {
      setError("Username atau password salah");
    } else if (err.response.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("Terjadi kesalahan saat login.");
    }
  } else if (err.request) {
    setError("Server tidak merespons. Cek backend.");
  } else {
    setError("Terjadi kesalahan saat memproses permintaan.");
  }
}
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-600 px-4">
      
      {/* Tombol Back */}
      <button
        onClick={() => router.back()}
        className="self-start text-white text-3xl mb-4 hover:scale-95 transition-transform text-[50px] hover:text-purple-200 cursor-pointer"
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

        {/* Password */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            required
          />
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
