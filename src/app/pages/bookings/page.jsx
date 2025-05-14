"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import Navbar from "../../components/Navbar";
import BookingCard from "../../components/BookingCard";

// Fungsi bantu untuk decode JWT jika role disimpan di payload token
const getRoleFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role; // Sesuaikan dengan struktur payload token Anda
  } catch (e) {
    console.error("Gagal decode token", e);
    return null;
  }
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'past'
  const router = useRouter();

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const role = getRoleFromToken(token); // Ambil role dari token

      let endpoint = "/api/bookings/user"; // Default untuk user
      if (role === "admin") {
        endpoint = "/api/bookings"; // Ganti ke endpoint admin
      }

      const response = await api.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [router]);

  const isPast = (booking) => {
    const start = new Date(booking.startDate);
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    start.setHours(hours, minutes, 0, 0);
    return new Date() > start;
  };

  const filteredBookings = bookings.filter((b) =>
    activeTab === "upcoming" ? !isPast(b) : isPast(b)
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6">Bookings</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === "upcoming"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Acara Akan Datang
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === "past"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Acara Selesai
          </button>
        </div>

        {/* Content */}
        {filteredBookings.length === 0 ? (
          <p className="text-gray-500 text-center">
            Tidak ada booking {activeTab === "upcoming" ? "akan datang" : "yang sudah selesai"}.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onDeleted={fetchBookings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}