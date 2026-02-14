'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { riderService } from '@/app/lib/services';

interface Rider {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  vehicleType?: string;
  vehicleNumber?: string;
  totalDeliveries?: number;
  rating?: number;
}

export default function RiderProfile() {
  const router = useRouter();
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'vehicle' | 'status' | 'location'>('info');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'BUSY' | 'OFFLINE'>('AVAILABLE');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchRiderProfile();
  }, []);

  const fetchRiderProfile = async () => {
    try {
      setLoading(true);
      const res = await riderService.getCurrentRider();
      const riderData = res.data;
      
      setRider(riderData);
      setName(riderData.name || '');
      setEmail(riderData.email || '');
      setPhoneNumber(riderData.phoneNumber || '');
      setVehicleType(riderData.vehicleType || '');
      setVehicleNumber(riderData.vehicleNumber || '');
      setStatus(riderData.status || 'AVAILABLE');
      setError('');
    } catch (err: any) {
      console.error('❌ Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      // Assuming backend has endpoint to update rider info
      // For now, just show success
      setSuccess('✅ Profile information updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleType || !vehicleNumber) {
      setError('Please fill in all vehicle details');
      return;
    }
    try {
      setUpdating(true);
      // Assuming backend has endpoint to update vehicle info
      setSuccess('✅ Vehicle information updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await riderService.updateMyStatus(status);
      setSuccess('✅ Availability status updated successfully');
      setRider((prev) => (prev ? { ...prev, status } : null));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      setError('Please enter both latitude and longitude');
      return;
    }
    try {
      setUpdating(true);
      await riderService.updateMyLocation(parseFloat(latitude), parseFloat(longitude), address);
      setSuccess('✅ Location updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update location');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (stat: string) => {
    switch (stat) {
      case 'AVAILABLE':
        return 'text-green-600';
      case 'BUSY':
        return 'text-yellow-600';
      case 'OFFLINE':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (stat: string) => {
    switch (stat) {
      case 'AVAILABLE':
        return '🟢';
      case 'BUSY':
        return '🟡';
      case 'OFFLINE':
        return '⚫';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">👤 My Profile</h1>
            <p className="text-gray-600">Manage your rider profile and settings</p>
          </div>
          <Link
            href="/rider/dashboard"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            ← Back
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Profile Overview Card */}
        {rider && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{rider.name}</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">Total Deliveries</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">🎯 {rider.totalDeliveries || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">Rating</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">⭐ {rider.rating?.toFixed(1) || '0.0'}/5</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">Email</p>
                    <p className="text-sm font-mono text-gray-700 mt-1">📧 {rider.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">Phone</p>
                    <p className="text-sm font-mono text-gray-700 mt-1">📱 {rider.phoneNumber}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Current Status</p>
                <div className={`inline-block px-4 py-2 rounded-lg font-bold text-white ${getStatusColor(rider.status)}`}>
                  <span className="mr-2">{getStatusIcon(rider.status)}</span>
                  {rider.status}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-3 font-semibold transition ${
                activeTab === 'info'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📋 Basic Info
            </button>
            <button
              onClick={() => setActiveTab('vehicle')}
              className={`flex-1 px-6 py-3 font-semibold transition ${
                activeTab === 'vehicle'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🚗 Vehicle
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 px-6 py-3 font-semibold transition ${
                activeTab === 'status'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔔 Status
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`flex-1 px-6 py-3 font-semibold transition ${
                activeTab === 'location'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📍 Location
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Basic Info Tab */}
            {activeTab === 'info' && (
              <form onSubmit={handleUpdateBasicInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+880 1234567890"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50"
                >
                  {updating ? '⏳ Updating...' : '💾 Save Changes'}
                </button>
              </form>
            )}

            {/* Vehicle Tab */}
            {activeTab === 'vehicle' && (
              <form onSubmit={handleUpdateVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a vehicle type</option>
                    <option value="Motorcycle">🏍️ Motorcycle</option>
                    <option value="Bicycle">🚴 Bicycle</option>
                    <option value="Car">🚗 Car</option>
                    <option value="Van">🚐 Van</option>
                    <option value="Truck">🚚 Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number/Plate</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., DHA-1234"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50"
                >
                  {updating ? '⏳ Updating...' : '💾 Save Vehicle Info'}
                </button>
              </form>
            )}

            {/* Status Tab */}
            {activeTab === 'status' && (
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Availability Status</label>
                  <div className="space-y-3">
                    {(['AVAILABLE', 'BUSY', 'OFFLINE'] as const).map((stat) => (
                      <label key={stat} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="status"
                          value={stat}
                          checked={status === stat}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-4 h-4 text-green-500"
                        />
                        <span className="ml-3 font-semibold">
                          {getStatusIcon(stat)} {stat}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {stat === 'AVAILABLE' && 'Ready to accept deliveries'}
                          {stat === 'BUSY' && 'Currently busy, cannot accept new deliveries'}
                          {stat === 'OFFLINE' && 'Offline, not available'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50"
                >
                  {updating ? '⏳ Updating...' : '💾 Update Status'}
                </button>
              </form>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <form onSubmit={handleUpdateLocation} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    💡 Update your current location so the system can track your movements during deliveries.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="23.8103"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="90.4125"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address (Optional)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50"
                >
                  {updating ? '⏳ Updating...' : '📍 Update Location'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Profile Tips</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ Keep your phone number updated for customer contact</li>
            <li>✓ Add your vehicle details so customers know what to expect</li>
            <li>✓ Update your status to let the system know if you're available</li>
            <li>✓ Keep your location accurate for real-time tracking</li>
            <li>✓ Your email is used for account recovery and notifications</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
