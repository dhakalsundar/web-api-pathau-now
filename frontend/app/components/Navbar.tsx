'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-amber-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">PN</span>
            </div>
            <div>
              <div className="font-extrabold text-lg text-gray-900">PathauNow</div>
              <div className="text-xs text-amber-600 font-semibold">Fast Delivery</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-amber-600 font-medium transition">
              Home
            </Link>
            <Link href="/track" className="text-gray-700 hover:text-amber-600 font-medium transition">
              Track
            </Link>
            <Link href="/booking" className="text-gray-700 hover:text-amber-600 font-medium transition">
              Book
            </Link>
            <Link href="/(public)/about" className="text-gray-700 hover:text-amber-600 font-medium transition">
              About
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-gray-700 hover:text-amber-600 font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <Link href="/" className="block py-2 text-gray-700 hover:text-amber-600">
              Home
            </Link>
            <Link href="/track" className="block py-2 text-gray-700 hover:text-amber-600">
              Track
            </Link>
            <Link href="/booking" className="block py-2 text-gray-700 hover:text-amber-600">
              Book Parcel
            </Link>
            <Link href="/(public)/about" className="block py-2 text-gray-700 hover:text-amber-600">
              About
            </Link>
            <div className="border-t border-gray-200 mt-4 pt-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" className="block py-2 text-amber-600 font-semibold mb-2">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
