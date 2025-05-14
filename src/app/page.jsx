"use client";
import { useEffect } from "react";
import { RiLoginCircleFill } from "react-icons/ri";

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/pages/dashboard";
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-purple-600 text-white px-6 text-center">
      {/* Logo */}
      <img src="/logoSibaV2.png" alt="SIBA Logo" className="w-50 h-50 mb-8" />

      {/* Judul */}
      <h2 className="text-xl">Find a Room</h2>
      <h1 className="text-3xl font-bold mb-4">SIBA V2</h1>
      <p className="text-sm text-purple-200 mb-10">
        Sistem Booking Aula Cilandak
      </p>

      {/* Tombol Login */}
      <div className="w-full max-w-xs">
        <a href="/pages/login">
        <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 shadow hover:bg-purple-200 cursor-pointer transform hover:scale-95 transition-transform">
  <RiLoginCircleFill className="w-5 h-5 text-purple-600 mr-2" />
  Login
</button>

        </a>
      </div>

      {/* Sign up */}
      <p className="mt-6 text-sm text-purple-200">
        Don’t have an account?{" "}
        <a
  href="/pages/register"
  className="text-white font-semibold underline transform hover:scale-200 transition-transform hover:text-purple-200"
>
  Sign Up
</a>

      </p>
    </div>
  );
}
