'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from '@/lib/api/axios';
import Navbar from '@/app/components/Navbar';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/auth/forgot-password', {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccess(' OTP sent to your email! Check your inbox and spam folder.');
        
        // Redirect to verify OTP page after 2 seconds
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <Navbar />

      <div className="container mx-auto px-6 py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl"></span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
              <p className="text-gray-600 mt-2">Don't worry, we'll help you reset it.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-4 text-green-700 font-semibold text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                   Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Enter the email associated with your account. We'll send you an OTP to reset your password.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                  loading || !email
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  ' Send OTP'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-600 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Back to Login */}
            <p className="text-center text-gray-700">
              Remember your password?{' '}
              <Link href="/login/customer" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign In
              </Link>
            </p>

            {/* Register Link */}
            <p className="text-center text-gray-700 mt-4">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
