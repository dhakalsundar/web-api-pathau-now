'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/api/axios';
import Navbar from '@/app/components/Navbar';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  // Format OTP display (show as individual digits with spacing)
  const displayOtp = otp.split('').join(' ').padEnd(11, '_');

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError(' OTP must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otp
      });

      if (response.data.success && response.data.data.verified) {
        setSuccess(' OTP verified successfully! Redirecting...');
        
        // Redirect to reset password page after 1.5 seconds
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/forgot-password', {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccess(' OTP resent to your email!');
        setOtp('');
        setResendCooldown(60); // 60 seconds cooldown
        
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />

      <div className="container mx-auto px-6 py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl"></span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Verify OTP</h1>
              <p className="text-gray-600 mt-2">Enter the 6-digit code sent to your email</p>
              <p className="text-sm text-gray-500 mt-1">({email})</p>
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
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  Enter Your 6-Digit OTP
                </label>
                
                {/* OTP Input */}
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="000000"
                  className="w-full px-4 py-4 text-center text-3xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                  disabled={loading}
                />
                
                {/* OTP Display */}
                <div className="text-center mt-4 font-mono text-2xl text-gray-600 letter-spacing">
                  {displayOtp}
                </div>

                <p className="text-sm text-gray-600 mt-4 text-center">
                  🔍 Check your email and spam folder for the code. It expires in 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                  loading || otp.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  '✓ Verify OTP'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-600 text-sm">NEED HELP?</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Resend OTP */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || resendCooldown > 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition border-2 ${
                  resendLoading || resendCooldown > 0
                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-50 active:scale-95'
                }`}
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resending...
                  </span>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend OTP'
                )}
              </button>

              <Link
                href="/forgot-password"
                className="w-full py-3 px-4 rounded-lg font-semibold text-center text-gray-600 border-2 border-gray-300 hover:bg-gray-50 transition active:scale-95"
              >
                ← Back to Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
