
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parcelService } from '@/app/lib/services';
import { getUserDetails } from '@/lib/cookies';

export default function CreateParcelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTrackingId, setNewTrackingId] = useState('');

  const [formData, setFormData] = useState({
    senderName: '',
    senderAddress: '',
    senderPhone: '',
    senderEmail: '',
    senderLatitude: null,
    senderLongitude: null,
    recipientName: '',
    recipientAddress: '',
    recipientPhone: '',
    recipientEmail: '',
    weight: '',
    price: '',
    parcelType: 'PARCEL',
    deliveryType: 'STANDARD',
      status:"PENDING",
  });

  useEffect(() => {
    // Pre-fill sender with logged-in user info if available
    const userData = getUserDetails();
    if (userData) {
      try {
        const senderName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || '';
        setFormData((prev) => ({
          ...prev,
          senderName: senderName,
          senderEmail: userData.email || '',
        }));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.senderName.trim()) return 'Sender name is required';
    if (!formData.senderAddress.trim()) return 'Sender address is required';
    if (!formData.senderPhone.trim()) return 'Sender phone is required';
    if (formData.senderPhone.trim().length < 10) return 'Sender phone must be at least 10 characters';

    if (!formData.recipientName.trim()) return 'Recipient name is required';
    if (!formData.recipientAddress.trim()) return 'Recipient address is required';
    if (!formData.recipientPhone.trim()) return 'Recipient phone is required';
    if (formData.recipientPhone.trim().length < 10)
      return 'Recipient phone must be at least 10 characters';

    if (!formData.weight || parseFloat(formData.weight) <= 0) return 'Valid weight is required';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid price is required';

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        sender: {
          name: formData.senderName,
          address: formData.senderAddress,
          phoneNumber: formData.senderPhone,
          email: formData.senderEmail || undefined,
        },
        recipient: {
          name: formData.recipientName,
          address: formData.recipientAddress,
          phoneNumber: formData.recipientPhone,
          email: formData.recipientEmail || undefined,
        },
        weight: parseFloat(formData.weight),
        price: parseFloat(formData.price),
        parcelType: formData.parcelType,
        deliveryType: formData.deliveryType,
      };

      const response = await parcelService.createParcel(payload);

      if (response.data) {
        setNewTrackingId(response.data.trackingNumber);
        setSuccess(`Parcel created successfully! Tracking ID: ${response.data.trackingNumber}`);

        // Reset form
        setFormData({
          senderName: '',
          senderAddress: '',
          senderPhone: '',
          senderEmail: '',
          senderLatitude: null,
          senderLongitude: null,
          recipientName: '',
          recipientAddress: '',
          recipientPhone: '',
          recipientEmail: '',
          weight: '',
          price: '',
 
          status:"PENDING",
          parcelType: 'PARCEL',
          deliveryType: 'STANDARD',
        });

        // Recover sender info
        const userData = getUserDetails();
        if (userData) {
          try {
            const senderName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || '';
            setFormData((prev) => ({
              ...prev,
              senderName: senderName,
              senderEmail: userData.email || '',
            }));
          } catch (e) {
            console.error('Failed to recover user data:', e);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to create parcel:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to create parcel. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">✚ Create New Parcel</h1>
        <p className="text-gray-600">Fill in the details below to book a new parcel delivery</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700 font-medium"> {success}</p>
          <div className="mt-4 flex gap-3">
            <Link
              href={`/user/track?id=${newTrackingId}`}
              className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold"
            >
               Track This Parcel
            </Link>
            <Link
              href="/user/parcels"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-semibold"
            >
               View My Parcels
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sender Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6"> From (Sender Information)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sender Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleInputChange}
                placeholder="Enter sender name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleInputChange}
                placeholder="Enter phone number (10+ digits)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="email"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="senderAddress"
                value={formData.senderAddress}
                onChange={handleInputChange}
                placeholder="Enter full address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Recipient Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6"> To (Recipient Information)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recipient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder="Enter recipient name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="recipientPhone"
                value={formData.recipientPhone}
                onChange={handleInputChange}
                placeholder="Enter phone number (10+ digits)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="email"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="recipientAddress"
                value={formData.recipientAddress}
                onChange={handleInputChange}
                placeholder="Enter full address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Parcel Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6"> Parcel Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parcel Type <span className="text-red-500">*</span>
              </label>
              <select
                name="parcelType"
                value={formData.parcelType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="PARCEL"> Parcel</option>
                <option value="DOCUMENT"> Document</option>
                <option value="FOOD"> Food</option>
                <option value="FRAGILE"> Fragile</option>
                <option value="HEAVY"> Heavy</option>
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
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="STANDARD"> Standard (3-5 days)</option>
                <option value="EXPRESS"> Express (1-2 days)</option>
                <option value="SAME_DAY"> Same Day</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="Enter weight in kg"
                step="0.1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                onChange={handleInputChange}
                placeholder="Enter delivery price"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold disabled:bg-gray-400"
          >
            {loading ? ' Creating...' : ' Create Parcel'}
          </button>
          <Link
            href="/user/dashboard"
            className="flex-1 px-8 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
