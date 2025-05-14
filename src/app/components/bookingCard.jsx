"use client"

import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../utils/api';
import { useRouter } from 'next/navigation';

export default function BookingCard({ booking, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const currentUser = userString ? JSON.parse(userString) : null;
  const router = useRouter();

  // Fungsi decode token untuk ambil role
  const getRoleFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'user';
    } catch (e) {
      console.error('Gagal decode token', e);
      return 'user';
    }
  };

  const token = localStorage.getItem('token');
  const userRole = token ? getRoleFromToken(token) : 'user';

  // Cek apakah user adalah owner dari booking ini
  const isOwner = currentUser && currentUser.id === booking.userId;

  // Cek apakah booking sudah lewat
  const isPastBooking = () => {
    const startDate = new Date(booking.startDate);
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);

    return new Date() > startDate;
  };

  // Fungsi format tampilan tanggal dan waktu
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      setIsDeleting(true);
      await api.delete(`/api/bookings/${booking.id}`);
      alert('Booking deleted successfully.');
      if (onDeleted) onDeleted();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Apakah user boleh edit/delete booking ini?
  const canEditOrDelete = (isOwner || userRole === 'admin') && !isPastBooking();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      {/* Status bar */}
      <div className="bg-purple-600 h-2 w-full"></div>
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-purple-700">{booking.eventName}</h2>
            <p className="text-sm text-purple-500 mt-1">
              Penanggung Jawab: {booking.penanggungJawab}
            </p>
          </div>
          
          <div className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
            {booking.participantCount} Participants
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-700 text-sm line-clamp-2">{booking.description}</p>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-gray-700 text-sm">{booking.room.name}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700 text-sm">{formatDate(booking.startDate)}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700 text-sm">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="text-gray-700 text-sm">Status: <span className="font-medium text-green-600">Booked</span></span>
          </div>
        </div>

        {/* Tombol Edit & Delete */}
        {canEditOrDelete && (
          <div className="mt-6 flex space-x-3">
            {/* Tombol Edit */}
            <Link href={`/pages/bookings/${booking.id}`} className="flex-1">
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-medium">
                Edit
              </button>
            </Link>

            {/* Tombol Delete */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        )}

        {/* Jika booking sudah lewat */}
        {!canEditOrDelete && isPastBooking() && (
          <div className="mt-6">
            <button
              disabled
              className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg cursor-default font-medium"
            >
              SELESAI
            </button>
          </div>
        )}
      </div>
    </div>
  );
}