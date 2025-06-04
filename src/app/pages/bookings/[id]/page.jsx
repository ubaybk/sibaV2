"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../utils/api";
import Navbar from "../../../components/navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BookingDetail() {
  const params = useParams();
  const id = params?.id;

  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    roomId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    participantCount: "",
    eventName: "",
    description: "",
    penanggungJawab: "",
  });
  const [rooms, setRooms] = useState([]); // Daftar ruangan
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        console.log("Fetching booking with ID:", id); // Debugging
        const response = await api.get(`/api/bookings/${id}`);
        console.log("API Response:", response.data); // Debugging

        const bookingData = response.data.booking;

        // Validasi data sebelum menggunakannya
        if (!bookingData.startDate || !bookingData.endDate) {
          throw new Error(
            "Start date or end date is missing in the API response."
          );
        }

        setBooking(bookingData);
        setFormData({
          roomId: bookingData.roomId.toString(), // Pastikan roomId adalah string
          startDate: bookingData.startDate.split("T")[0], // Format YYYY-MM-DD
          endDate: bookingData.endDate.split("T")[0], // Format YYYY-MM-DD
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          participantCount: bookingData.participantCount.toString(),
          eventName: bookingData.eventName,
          description: bookingData.description,
          penanggungJawab: bookingData.penanggungJawab,
        });
      } catch (err) {
        console.error("API Error:", err);
        toast.error("Error fetching booking details.");
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await api.get("/api/rooms");
        setRooms(response.data.rooms); // Simpan daftar ruangan
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Error fetching rooms.");
      }
    };

    if (id) {
      fetchBooking();
      fetchRooms(); // Ambil daftar ruangan
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Validasi formData
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

      console.log("Updating booking with data:", formData); // Debugging
      await api.put(`/api/bookings/${id}`, formData);
      router.push("/pages/bookings");
    } catch (err) {
  console.error("Update Error:", err);

  if (err.response && err.response.data && err.response.data.message) {
    toast.error(err.response.data.message);
  } else {
    toast.error("Error updating booking.");
  }
}

  };

  if (!booking) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="container bg-white mx-auto p-4">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6">
          Edit Booking
        </h1>

        {/* Menampilkan pesan error */}
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Dropdown Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Room Name
            </label>
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input fields lainnya */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Participant Count
            </label>
            <input
              type="number"
              name="participantCount"
              value={formData.participantCount}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Name
            </label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Penanggung Jawab
            </label>
            <input
              type="text"
              name="penanggungJawab"
              value={formData.penanggungJawab}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Update Booking
          </button>
        </form>
      </div>
    </div>
  );
}
