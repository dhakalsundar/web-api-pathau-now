'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/track/${trackingNumber}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-amber-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
                Fast, Reliable <span className="text-amber-500">Parcel Delivery</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Track your parcels in real-time. Professional courier service with transparent pricing and reliable delivery to your doorstep.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold rounded-lg hover:shadow-lg transition transform hover:scale-105"
              >
                📦 Book Parcel Now
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-amber-400 text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition"
              >
                Login / Sign Up
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">50K+</p>
                <p className="text-sm text-gray-600">Parcels Delivered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">98%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">24/7</p>
                <p className="text-sm text-gray-600">Support</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 border border-amber-200">
              <img
                src="https://images.unsplash.com/photo-1556740722-97cbbba6eaaa?w=500&h=500&fit=crop"
                alt="Delivery Person"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section className="bg-gradient-to-r from-gray-900 via-amber-900 to-gray-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-4">Track Your Parcel</h2>
            <p className="text-amber-100 text-center mb-8">Enter your tracking number to see live updates and delivery status</p>

            <form onSubmit={handleTrack} className="flex gap-4 flex-col sm:flex-row">
              <input
                type="text"
                placeholder="Enter tracking number (e.g., PN123ABC45)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSearching ? '🔄 Searching...' : '🔍 Track Now'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose PathauNow?</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '⚡',
              title: 'Ultra-Fast Delivery',
              description: 'Same-day delivery available in major cities'
            },
            {
              icon: '📍',
              title: 'Real-Time Tracking',
              description: 'Know exactly where your parcel is at all times'
            },
            {
              icon: '🛡️',
              title: 'Safe & Secure',
              description: 'Your parcels insured and handled with care'
            },
            {
              icon: '💰',
              title: 'Affordable Pricing',
              description: 'Transparent rates with no hidden charges'
            },
            {
              icon: '📱',
              title: 'Easy Booking',
              description: 'Book from mobile or web in just 2 minutes'
            },
            {
              icon: '🎯',
              title: 'Professional Riders',
              description: 'Trained and verified delivery partners'
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-8 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition text-center"
            >
              <p className="text-5xl mb-4">{feature.icon}</p>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-white mb-4">PathauNow</p>
              <p className="text-sm">Fast, reliable, and professional parcel delivery service.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Quick Links</p>
              <ul className="text-sm space-y-2">
                <li><Link href="/booking" className="hover:text-amber-400">Book Parcel</Link></li>
                <li><Link href="/track" className="hover:text-amber-400">Track Parcel</Link></li>
                <li><Link href="/(public)/about" className="hover:text-amber-400">About Us</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Support</p>
              <ul className="text-sm space-y-2">
                <li><Link href="/(public)/contact" className="hover:text-amber-400">Contact Us</Link></li>
                <li><Link href="/(public)/privacy" className="hover:text-amber-400">Privacy Policy</Link></li>
                <li><Link href="/(public)/terms" className="hover:text-amber-400">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Contact</p>
              <p className="text-sm">📧 support@pathaunow.com</p>
              <p className="text-sm">📞 +880 1700 123456</p>
              <p className="text-sm">📍 Dhaka, Bangladesh</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 PathauNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
