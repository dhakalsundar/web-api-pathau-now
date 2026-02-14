'use client';

import Navbar from '@/app/components/Navbar';
import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Book Your Shipment</h1>
          <p className="text-gray-600">Fill in the details below to book a shipment delivery</p>
        </div>

        {/* Form */}
        <ShipmentBookingForm />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-sm">
          <p>&copy; 2024 PathauNow. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
