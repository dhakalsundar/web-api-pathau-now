'use client';

import { useState } from 'react';
import Navbar from '@/app/components/Navbar';
import { shipmentService } from '@/app/lib/services';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    weight: '',
    deliveryType: 'STANDARD',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePrice = () => {
    const basePrice = 50;
    const perKgPrice = 10;
    const weight = parseFloat(formData.weight) || 0;
    const deliveryMultiplier = formData.deliveryType === 'EXPRESS' ? 1.5 : 1;
    return Math.round((basePrice + weight * perKgPrice) * deliveryMultiplier);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const shipmentData = {
        sender: {
          name: formData.senderName,
          phone: formData.senderPhone,
          address: formData.senderAddress,
        },
        recipient: {
          name: formData.recipientName,
          phone: formData.recipientPhone,
          address: formData.recipientAddress,
        },
        weight: parseFloat(formData.weight),
        price: calculatePrice(),
        deliveryType: formData.deliveryType,
        notes: formData.notes,
      };

      const response = await shipmentService.createShipment(shipmentData);
      
      setSuccess(`✅ Parcel booked successfully! Tracking: ${response.data.trackingNumber}`);
      
      setTimeout(() => {
        router.push(`/track/${response.data.trackingNumber}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book parcel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Book Your Parcel</h1>
          <p className="text-gray-600">Fill in the details below to book a parcel delivery</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-green-50 border-2 border-green-300 rounded-lg p-4 text-green-700 font-semibold">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
          {/* Sender Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Sender Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <textarea
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Recipient Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Recipient Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <textarea
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Parcel Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Parcel Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg) *</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Type *</label>
                <select
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="STANDARD">Standard (2-3 days)</option>
                  <option value="EXPRESS">Express (Same day)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Any special instructions or notes"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Price Summary */}
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Price Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Base Price</span>
                <span className="font-semibold text-gray-900">৳50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Weight Charge (৳10/kg × {formData.weight || 0}kg)</span>
                <span className="font-semibold text-gray-900">৳{((parseFloat(formData.weight) || 0) * 10).toFixed(2)}</span>
              </div>
              {formData.deliveryType === 'EXPRESS' && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Express Delivery Charge (50%)</span>
                  <span className="font-semibold text-gray-900">৳{((calculatePrice() - calculatePrice() / 1.5).toFixed(2))}</span>
                </div>
              )}
              <div className="border-t border-amber-200 pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-amber-600">৳{calculatePrice()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? '⏳ Processing...' : '✓ Book Parcel'}
            </button>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
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
