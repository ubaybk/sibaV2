'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Home, Calendar, Shield, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('user'); // Default ke 'user'

  useEffect(() => {
    // Ambil data user dari localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserName(parsedUser.name || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fungsi decode JWT untuk ambil role
    const getRoleFromToken = (token) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || 'user';
      } catch (e) {
        console.error('Gagal decode token', e);
        return 'user';
      }
    };

    if (token) {
      const role = getRoleFromToken(token);
      setUserRole(role);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-purple-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className=" rounded-full mr-2">
              <img src="/logoSibaV2.png" alt="SIBA Logo" className="w-10 h-10" />
              </div>
              <span className="text-white text-xl font-bold">SIBAV2</span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/pages/dashboard" className="flex items-center text-white hover:bg-purple-700 px-3 py-2 rounded transition duration-150">
              <Home size={18} className="mr-1" />
              <span>Dashboard</span>
            </Link>
            <Link href="/pages/bookings" className="flex items-center text-white hover:bg-purple-700 px-3 py-2 rounded transition duration-150">
              <Calendar size={18} className="mr-1" />
              <span>My Booking</span>
            </Link>

            {/* Hanya tampilkan Admin Panel jika user adalah admin */}
            {userRole === 'admin' && (
              <Link href="/pages/admin/user" className="flex items-center text-white hover:bg-purple-700 px-3 py-2 rounded transition duration-150">
                <Shield size={18} className="mr-1" />
                <span>Admin Panel</span>
              </Link>
            )}
            
            {/* User greeting */}
            <div className="flex items-center text-white px-3 py-2 border-l border-purple-400 ml-2">
              <User size={18} className="mr-1 text-purple-200" />
              <span>Hallo, {userName || 'User'}</span>
            </div>

            <button 
              onClick={logout} 
              className="flex items-center text-white bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg ml-2 transition duration-150"
            >
              <LogOut size={18} className="mr-1" />
              <span>Logout</span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-white hover:bg-purple-700 p-2 rounded transition duration-150"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-purple-700 rounded-b-lg pb-2">
            <div className="flex flex-col space-y-2 px-4 pt-2 pb-3">
              {/* User greeting in mobile view */}
              <div className="flex items-center text-white border-b border-purple-500 pb-2 mb-1">
                <User size={18} className="mr-2 text-purple-200" />
                <span>Hallo, {userName || 'User'}</span>
              </div>
              
              <Link 
                href="/pages/dashboard" 
                className="flex items-center text-white hover:bg-purple-800 px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} className="mr-2" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/pages/bookings" 
                className="flex items-center text-white hover:bg-purple-800 px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar size={18} className="mr-2" />
                <span>My Booking</span>
              </Link>

              {/* Admin panel di mobile */}
              {userRole === 'admin' && (
                <Link 
                  href="/pages/admin/user" 
                  className="flex items-center text-white hover:bg-purple-800 px-3 py-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield size={18} className="mr-2" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button 
                onClick={logout} 
                className="flex items-center text-white hover:bg-purple-800 w-full text-left px-3 py-2 rounded"
              >
                <LogOut size={18} className="mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}