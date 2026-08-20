"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import Navbar from "../../components/navbar";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isBefore
} from "date-fns";
import idLocale from "date-fns/locale/id";
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Info, MapPin, User, Tag } from "lucide-react";

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();

  // 1. OPTIMASI: Gabungkan fetching & gunakan Promise.all
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Jalankan kedua request secara PARALEL, bukan berurutan
        const [bookingsRes, roomsRes] = await Promise.all([
          api.get("/api/bookings"),
          api.get("/api/rooms/")
        ]);

        if (Array.isArray(bookingsRes.data)) setBookings(bookingsRes.data);
        if (roomsRes.data && Array.isArray(roomsRes.data.rooms)) setRooms(roomsRes.data.rooms);
        
      } catch (err) {
        console.error("API Error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
        }
      } finally {
        setLoading(false); // Pastikan loading false HANYA setelah semua data siap
      }
    };

    fetchData();
  }, [router]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // 2. OPTIMASI: Memoize daysInMonth agar tidak dihitung ulang setiap render
  const daysInMonth = useMemo(() => 
    eachDayOfInterval({ start: monthStart, end: monthEnd }), 
    [currentMonth]
  );

  // 3. OPTIMASI KRITIS: Buat "Lookup Map" untuk booking per tanggal
  // Ini mengubah kompleksitas dari O(N^3) menjadi O(1) saat render kalender!
  const bookingsByDateMap = useMemo(() => {
    const map = {};
    bookings.forEach((booking) => {
      const dates = eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
      
      dates.forEach((date) => {
        const dateKey = format(date, "yyyy-MM-dd");
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(booking);
      });
    });
    return map;
  }, [bookings]);

  // Fungsi helper sekarang sangat cepat (hanya lookup dictionary)
  const getBookingsForDay = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return bookingsByDateMap[dateKey] || [];
  };

  const getFullBookedRoomsForDay = (day) => {
    const dayBookings = getBookingsForDay(day);
    const roomDurations = {};
  
    dayBookings.forEach((booking) => {
      if (!booking.startTime || !booking.endTime || !booking.room?.name) return;
  
      const start = parseInt(booking.startTime.split(":")[0], 10);
      const end = parseInt(booking.endTime.split(":")[0], 10);
      const duration = end - start;
  
      roomDurations[booking.room.name] = (roomDurations[booking.room.name] || 0) + duration;
    });
  
    return Object.entries(roomDurations)
      .filter(([_, totalHours]) => totalHours >= 7)
      .map(([roomName]) => roomName);
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleDateClick = (day) => setSelectedDate(day);

  const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return "Invalid Date";
    try {
      const localDate = new Date(dateString).toISOString().split("T")[0];
      const date = new Date(`${localDate}T${timeString}:00`);
      return isNaN(date.getTime()) ? "Invalid Date" : format(date, "dd MMMM yyyy, HH:mm", { locale: idLocale });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const isPastWorkingTime = (date) => {
    const now = new Date();
    const selected = new Date(date);
    if (isToday(selected)) {
      const endTime = new Date();
      endTime.setHours(16, 0, 0, 0);
      return now > endTime;
    }
    return isBefore(selected, now);
  };

  const getBookingStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-purple-600 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header Calendar */}
          <div className="bg-purple-600 text-white px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 mr-3" />
              <h1 className="text-2xl font-bold">Jadwal Booking Aula</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-purple-500 transition-colors" aria-label="Previous month">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold min-w-40 text-center capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: idLocale })}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-purple-500 transition-colors" aria-label="Next month">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Calendar View */}
            <div className="w-full lg:w-3/5 p-6">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                  <div key={day} className="text-center font-medium py-2 text-gray-700">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="h-24 bg-gray-50 rounded-lg"></div>
                ))}

                {daysInMonth.map((day) => {
                  const dayBookings = getBookingsForDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const fullBookedRooms = getFullBookedRoomsForDay(day);
                  const hasBookings = dayBookings.length > 0;
                  
                  let dayClass = "h-24 rounded-lg p-2 transition-all duration-200 border ";
                  dayClass += isToday(day) ? "border-purple-500 " : "border-gray-200 ";
                  dayClass += isSelected ? "bg-purple-50 shadow-md transform scale-[1.02] border-2 border-yellow-400 " : "bg-white hover:bg-purple-50 ";
                  dayClass += "cursor-pointer ";

                  return (
                    <div key={day.toString()} onClick={() => handleDateClick(day)} className={dayClass}>
                      <div className="flex justify-between">
                        <span className={`text-sm font-medium ${isToday(day) ? "text-black rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                          {format(day, "d")}
                        </span>
                        {hasBookings && (
                          <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 flex items-center">
                            {dayBookings.length}
                          </span>
                        )}
                      </div>

                      {fullBookedRooms.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {fullBookedRooms.map((roomName) => (
                            <span key={roomName} className="px-1 py-0.5 text-[8px] leading-none font-medium rounded bg-red-100 text-red-700 whitespace-nowrap">
                              {roomName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="h-24 bg-gray-50 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Booking Details for Selected Date */}
            <div className="w-full lg:w-2/5 p-6 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-purple-800 flex items-center capitalize">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  {format(selectedDate, "EEEE, d MMMM yyyy", { locale: idLocale })}
                </h3>
                
                {getFullBookedRoomsForDay(selectedDate).length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-1">Ruangan Full Booked:</p>
                    <div className="flex flex-wrap gap-1">
                      {getFullBookedRoomsForDay(selectedDate).map((roomName) => (
                        <span key={roomName} className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                          {roomName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {getBookingsForDay(selectedDate).length > 0 ? (
                  getBookingsForDay(selectedDate).map((booking) => (
                    <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
                      <h4 className="font-bold text-lg text-purple-700 truncate">{booking.eventName || "Booking"}</h4>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-md ${getBookingStatusClass(booking.status)}`}>
                          {booking.status || "unknown"}
                        </span>
                        <span className="text-xs text-gray-500">ID: {booking.id}</span>
                      </div>
                      
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 mr-2 text-purple-600 mt-0.5 shrink-0" />
                          <p>{formatDateTime(booking.startDate, booking.startTime)} - {booking.endTime}</p>
                        </div>
                        <div className="flex items-start">
                          <Users className="h-4 w-4 mr-2 text-purple-600 mt-0.5 shrink-0" />
                          <p>{booking.participantCount} orang</p>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 text-purple-600 mt-0.5 shrink-0" />
                          <p>{booking.room?.name || "Tidak tersedia"}</p>
                        </div>
                        <div className="flex items-start">
                          <User className="h-4 w-4 mr-2 text-purple-600 mt-0.5 shrink-0" />
                          <p>{booking.penanggungJawab || "Tidak tersedia"}</p>
                        </div>
                        {booking.description && (
                          <div className="flex items-start">
                            <Info className="h-4 w-4 mr-2 text-purple-600 mt-0.5 shrink-0" />
                            <p className="text-gray-600">{booking.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Tidak ada booking pada tanggal ini</p>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                {getFullBookedRoomsForDay(selectedDate).length < rooms.length && !isPastWorkingTime(selectedDate) && (
                  <button
                    onClick={() => router.push(`/pages/createBooking?startDate=${format(selectedDate, "yyyy-MM-dd")}`)}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium flex items-center justify-center"
                  >
                    <Tag className="h-5 w-5 mr-2" />
                    Buat Booking Baru
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
