'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/api/axios';
import { useToast } from '@/app/context/ToastContext';

interface ShipmentBookingFormProps {
  onSuccess?: (trackingNumber: string) => void;
  redirectToTracking?: boolean;
}

/**
 * Shipment Booking Form Component
 * Collects sender, receiver, pickup, delivery, weight, and price information
 * 
 * @example
 * <ShipmentBookingForm />
 * 
 * @example
 * <ShipmentBookingForm 
 *   redirectToTracking={true}
 *   onSuccess={(trackingNumber) => console.log('Booked:', trackingNumber)}
 * />
 */
export default function ShipmentBookingForm({
  onSuccess,
  redirectToTracking = true,
}: ShipmentBookingFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    pickupAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    deliveryAddress: '',
    parcelType: 'PARCEL',
    weight: '',
    price: '',
    deliveryType: 'STANDARD',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate price if weight changes and price is empty
    if (name === 'weight' && !formData.price) {
      const calculatedPrice = calculatePrice(parseFloat(value));
      setFormData(prev => ({ ...prev, price: calculatedPrice.toString() }));
    }
  };

  const calculatePrice = (weight: number): number => {
    if (!weight || weight <= 0) return 0;
    const basePrice = 100; // Base price in Nepali Rupees
    const pricePerKg = 20; // Price per kg in NPR
    return Math.round(basePrice + weight * pricePerKg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.senderName.trim()) {
        addToast('Please enter sender name', 'error');
        setLoading(false);
        return;
      }

      if (!formData.senderPhone.trim() || formData.senderPhone.replace(/\D/g, '').length < 10) {
        addToast('Please enter valid sender phone number (10 digits)', 'error');
        setLoading(false);
        return;
      }

      if (!formData.pickupAddress.trim()) {
        addToast('Please enter pickup address', 'error');
        setLoading(false);
        return;
      }

      if (!formData.receiverName.trim()) {
        addToast('Please enter receiver name', 'error');
        setLoading(false);
        return;
      }

      if (!formData.receiverPhone.trim() || formData.receiverPhone.replace(/\D/g, '').length < 10) {
        addToast('Please enter valid receiver phone number (10 digits)', 'error');
        setLoading(false);
        return;
      }

      if (!formData.deliveryAddress.trim()) {
        addToast('Please enter delivery address', 'error');
        setLoading(false);
        return;
      }

      if (!formData.weight || parseFloat(formData.weight) <= 0) {
        addToast('Please enter valid weight', 'error');
        setLoading(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        addToast('Please enter valid price', 'error');
        setLoading(false);
        return;
      }

      // Prepare parcel data
      const parcelPayload = {
        sender: {
          name: formData.senderName.trim(),
          address: formData.pickupAddress.trim(),
          phoneNumber: formData.senderPhone.trim(),
          email: formData.senderEmail.trim() || undefined,
        },
        recipient: {
          name: formData.receiverName.trim(),
          address: formData.deliveryAddress.trim(),
          phoneNumber: formData.receiverPhone.trim(),
          email: formData.receiverEmail.trim() || undefined,
        },
        weight: parseFloat(formData.weight),
        price: parseFloat(formData.price),
        parcelType: formData.parcelType,
        deliveryType: formData.deliveryType,
      };

      // Submit to API
      const response = await axios.post('/parcels', parcelPayload);

      const trackingNumber = response.data?.data?.trackingNumber;

      if (!trackingNumber) {
        throw new Error('No tracking number returned');
      }

      // Show success toast
      addToast(` Parcel booked! Tracking: ${trackingNumber}`, 'success', 4000);

      // Call optional callback
      if (onSuccess) {
        onSuccess(trackingNumber);
      }

      // Redirect to tracking page after a short delay
      if (redirectToTracking) {
        setTimeout(() => {
          router.push(`/track/${trackingNumber}`);
        }, 1500);
      }

      // Reset form
      setFormData({
        senderName: '',
        senderPhone: '',
        senderEmail: '',
        pickupAddress: '',
        receiverName: '',
        receiverPhone: '',
        receiverEmail: '',
        deliveryAddress: '',
        parcelType: 'PARCEL',
        weight: '',
        price: '',
        deliveryType: 'STANDARD',
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to book parcel';

      addToast(`Error: ${errorMessage}`, 'error', 4000);
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 max-w-2xl">
      {/* Sender Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>👤</span> Sender Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sender Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sender Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="senderPhone"
              value={formData.senderPhone}
              onChange={handleChange}
              placeholder="+977 98 XXXXX XXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sender Email <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="email"
              name="senderEmail"
              value={formData.senderEmail}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pickup Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              placeholder="Full pickup address with details"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Receiver Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span></span> Receiver Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Receiver Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="receiverName"
              value={formData.receiverName}
              onChange={handleChange}
              placeholder="Recipient full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Receiver Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="receiverPhone"
              value={formData.receiverPhone}
              onChange={handleChange}
              placeholder="+977 98 XXXXX XXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Receiver Email <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="email"
              name="receiverEmail"
              value={formData.receiverEmail}
              onChange={handleChange}
              placeholder="recipient.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              placeholder="Full delivery address with details"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Parcel Details Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span></span> Parcel Details
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Weight (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="0.5"
              min="0.1"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Parcel Type <span className="text-red-500">*</span>
            </label>
            <select
              name="parcelType"
              value={formData.parcelType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            >
              <option value="DOCUMENT"> Document</option>
              <option value="PARCEL"> Parcel</option>
              <option value="FOOD"> Food</option>
              <option value="FRAGILE"> Fragile Items</option>
              <option value="HEAVY"> Heavy Items</option>
              <option value="OTHER"> Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Delivery Type <span className="text-red-500">*</span>
            </label>
            <select
              name="deliveryType"
              value={formData.deliveryType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            >
              <option value="STANDARD"> Standard (2-3 days)</option>
              <option value="EXPRESS"> Express (1 day)</option>
              <option value="SAME_DAY"> Same Day</option>
            </select>
          </div>
        </div>

        {/* Price Info */}
        {formData.weight && formData.price && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Calculated Price:</span> Rs{calculatePrice(parseFloat(formData.weight))}
              {parseFloat(formData.price) !== calculatePrice(parseFloat(formData.weight)) && (
                <span className="ml-2 text-gray-600">(Custom: Rs{formData.price})</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>
      <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total Price</span>
          <span className="text-3xl font-bold text-amber-600">
            Rs{formData.price || '0'}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold text-lg rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin"></span>
            Processing...
          </>
        ) : (
          <>
            <span>✓</span>
            Book Parcel
          </>
        )}
      </button>

      {/* Note */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        <span className="text-red-500">*</span> Required fields | Price can be auto-calculated based on weight
      </p>
    </form>
  );
}
