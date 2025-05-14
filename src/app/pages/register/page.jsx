"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { api } from "../../../utils/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/register", { name, email, password });
      router.push("/pages/login");
    } catch (err) {
      setError("Error registering user");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-600 px-4">
      
      <button
        onClick={() => router.back()}
        className="self-start text-white text-3xl mt-5 mb-4 hover:scale-95 transition-transform text-[50px] hover:text-purple-200 cursor-pointer"
      >
        <IoArrowBackCircleSharp />
      </button>

      {/* Form Register */}
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md text-black"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logoSibaV2.png" alt="SIBA Logo" className="w-50 h-50" />
        </div>

        <h2 className="text-2xl font-bold text-center text-purple-600">Register to SIBA V2</h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Name */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

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

        {/* Tombol Register */}
        <button
          type="submit"
          className="w-full px-4 py-2 mt-6 text-white bg-purple-600 rounded-md hover:bg-purple-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
