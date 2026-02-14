'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/lib/services';
import Navbar from '@/app/components/Navbar';

export default function RiderRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    vehicleType: '',
    vehicleNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || formData.name.trim().length < 2) {
      setError('Name is required (minimum 2 characters)');
      setLoading(false);
      return;
    }

    if (!formData.email) {
      setError('Email address is required');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim().length < 10) {
      setError('Phone number is required (minimum 10 digits)');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phoneNumber,
        role: 'RIDER',
        vehicleType: formData.vehicleType || undefined,
        vehicleNumber: formData.vehicleNumber || undefined,
      };

      console.log('📤 [RIDER REGISTER] Sending payload:', payload);
      
      const response = await authService.register(payload);

      console.log('✅ [RIDER REGISTER] Success:', response);
      setSuccess('✅ Rider account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        router.push('/login/rider');
      }, 2000);
    } catch (err: any) {
      console.error('❌ [RIDER REGISTER] Error:', err);
      console.error('📋 [RIDER REGISTER] Response data:', err.response?.data);
      
      // Extract detailed error messages from backend validation
      let errorMessage = 'Registration failed';
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorDetails = err.response.data.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join(' | ');
        errorMessage = `Validation Error: ${errorDetails}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Navbar />

      <div className="container mx-auto px-6 py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🏍️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Become a Rider</h1>
              <p className="text-gray-600 mt-2">Join our delivery network and start earning</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold text-sm">
                ❌ {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-4 text-green-700 font-semibold text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+880 1234567890"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="rider@example.com"
                  required
                />
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="BIKE">🏍️ Bike/Motorcycle</option>
                    <option value="CAR">🚗 Car</option>
                    <option value="VAN">🚐 Van/Truck</option>
                  </select>
                </div>

                {/* Vehicle Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number/Plate</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., DHA-1234"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? '⏳ Creating account...' : '🚀 Create Rider Account'}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <strong>Ready to start delivering?</strong>
              </p>
              <ul className="text-xs text-green-700 space-y-1">
                <li>✓ Complete profile with vehicle details</li>
                <li>✓ Start receiving delivery assignments</li>
                <li>✓ Track your performance and earnings</li>
                <li>✓ Update your status and location</li>
              </ul>
            </div>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600 text-sm">Already have a rider account?</p>
              <Link href="/login/rider" className="block text-green-600 hover:text-green-700 font-semibold">
                Sign In
              </Link>
              <Link href="/register/choose" className="block text-green-600 hover:text-green-700 font-semibold text-sm">
                ← Choose different account type
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
