"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../utils/api";
import Navbar from "./navbar";
import { toast, ToastContainer } from "react-toastify";
import { isSameDay } from 'date-fns';
import "react-toastify/dist/ReactToastify.css";

export default function CreateBookingForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    roomId: "",
    startDate: searchParams.get("startDate") || "",
    endDate: "",
    startTime: "",
    endTime: "",
    participantCount: "",
    eventName: "",
    description: "",
    penanggungJawab: ""
  });
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fungsi untuk mengecek apakah hari Sabtu/Minggu
  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Fungsi untuk menghitung durasi booking per ruangan
  const getFullBookedRoomsForDay = (bookings, day, allRooms) => {
    if (!bookings || !Array.isArray(bookings)) return [];
    const dayBookings = bookings.filter((booking) => {
      const bookingDates = getDatesInRange(booking.startDate, booking.endDate);
      return bookingDates.some((d) => isSameDay(d, new Date(day)));
    });

    const roomDurations = {};
    dayBookings.forEach((booking) => {
      if (!booking.startTime || !booking.endTime || !booking.room?.name) return;
      const start = parseInt(booking.startTime.split(":")[0], 10);
      const end = parseInt(booking.endTime.split(":")[0], 10);
      const duration = end - start;
      if (!roomDurations[booking.room.name]) {
        roomDurations[booking.room.name] = 0;
      }
      roomDurations[booking.room.name] += duration;
    });

    return Object.entries(roomDurations)
      .filter(([_, totalHours]) => totalHours >= 7)
      .map(([roomName]) => roomName);
  };

  // Helper: ambil semua tanggal di antara startDate dan endDate
  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let currentDate = start;
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Fetch semua room dan filter yang tidak full booked
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/bookings");
        const allBookings = response.data || [];
        const roomsResponse = await api.get("/api/rooms/");
        const allRooms = roomsResponse.data.rooms || [];

        // Ambil semua booking yang relevan
        const relevantBookings = allBookings.filter(booking => {
          if (!booking.startDate || !formData.startDate) return false;
          const bookingStartDate = new Date(booking.startDate);
          const selectedDate = new Date(formData.startDate);
          return (
            isSameDay(bookingStartDate, selectedDate) ||
            (new Date(booking.startDate) <= selectedDate &&
             new Date(booking.endDate) >= selectedDate)
          );
        });

        // Dapatkan room yang full booked di tanggal terpilih
        const fullBookedRooms = getFullBookedRoomsForDay(
          relevantBookings,
          formData.startDate,
          allRooms
        );

        // Filter room yang bukan full booked
        const availableRooms = allRooms.filter(
          (room) => !fullBookedRooms.includes(room.name)
        );

        setRooms(allRooms); // simpan semua room untuk reference
        setFilteredRooms(availableRooms); // hanya room yang tersedia
      } catch (err) {
        console.error(err);
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };
    if (formData.startDate && !isWeekend(formData.startDate)) {
      fetchRooms();
    }
  }, [formData.startDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        !formData.roomId ||
        !formData.startDate ||
        !formData.endDate ||
        !formData.startTime ||
        !formData.endTime ||
        !formData.participantCount ||
        !formData.eventName ||
        !formData.description ||
        !formData.penanggungJawab
      ) {
        throw new Error("All fields are required.");
      }

      const formattedData = {
        roomId: parseInt(formData.roomId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        participantCount: parseInt(formData.participantCount),
        eventName: formData.eventName,
        description: formData.description,
        penanggungJawab: formData.penanggungJawab,
      };

      await api.post("/api/bookings", formattedData);

      toast.success("✅ Booking created successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // 🔥 TAMBAHAN LOGIKA JIKA ROOM NAME ADALAH "ZOOM MEETING"
      const selectedRoom = rooms.find((room) => room.id === parseInt(formData.roomId));
      const isZoomMeeting = selectedRoom?.name === "ZOOM MEETING";

      if (isZoomMeeting) {
        const { eventName, startDate, endDate, startTime, endTime, penanggungJawab } = formData;

        const message = `Assalamualaikum Admin, Booking ZOOM MEETING %0A %0AEvent Name: ${eventName}%0AStart Date: ${startDate}%0AEnd Date: ${endDate}%0AStart Time: ${startTime}%0AEnd Time: ${endTime}%0APenanggung Jawab: ${penanggungJawab}`;
        const whatsappURL = `https://wa.me/6285771736517?text= ${message}`;

        window.open(whatsappURL, '_blank');
      }

      setTimeout(() => {
        router.push("/pages/dashboard");
      }, 2000);

    } catch (err) {
      console.error(err);
      let errorMessage = "Error creating booking. Please try again.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error("❌ Failed to create booking.", {
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-purple-600 py-6 px-8">
            <h1 className="text-3xl font-bold text-white">Create New Booking</h1>
            <p className="text-purple-200 mt-2">Fill in the details to book a room</p>
          </div>
          <div className="p-8">
            {/* Notifikasi Error */}
            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Form Booking */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Room Name & Participant Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    required
                  >
                    <option className="text-gray-400" value="">Select a room</option>
                    {filteredRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Participant Count</label>
                  <input
                    type="number"
                    name="participantCount"
                    value={formData.participantCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-black"
                    placeholder="Enter number of participants"
                    style={{ colorScheme: '#d1d5db' }}
                    required
                  />
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-black"
                    required
                  />
                </div>
              </div>

              {/* Start Time & End Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-black"
                    required
                  />
                </div>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-black"
                  placeholder="Enter event name"
                   style={{ colorScheme: '#d1d5db' }}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-black"
                  rows="4"
                  placeholder="Enter event description"
                   style={{ colorScheme: '#d1d5db' }}
                  required
                ></textarea>
              </div>

              {/* Penanggung Jawab */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penanggung Jawab</label>
                <input
                  type="text"
                  name="penanggungJawab"
                  value={formData.penanggungJawab}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-black"
                  placeholder="Enter person in charge"
                   style={{ colorScheme: '#d1d5db' }}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Create Booking"
                  )}
                </button>
              </div>

              {/* Cancel Button */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => router.push("/pages/bookings")}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                >
                  Cancel and Return to Bookings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}