'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/api/axios';
import Navbar from '@/app/components/Navbar';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email] = useState(emailParam || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^\w]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (passwords.newPassword.length < 6) {
      setError(' Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError(' Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/reset-password', {
        email: email.trim(),
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });

      if (response.data.success) {
        setSuccess(' Password reset successfully! Redirecting to login...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login/customer');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      <Navbar />

      <div className="container mx-auto px-6 py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl"></span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Password</h1>
              <p className="text-gray-600 mt-2">Secure your account with a strong password</p>
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
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                   New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? '' : ''}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwords.newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">Strength</span>
                      <span className="text-xs font-semibold text-gray-600">{strengthText[passwordStrength - 1]}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor[passwordStrength - 1]} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 6) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      <p>✓ At least {passwords.newPassword.length >= 6 ? '6 characters' : '6 characters (required)'}</p>
                      {passwords.newPassword.length >= 12 && <p>✓ 12+ characters for better security</p>}
                      {/[A-Z]/.test(passwords.newPassword) && <p>✓ Contains uppercase letter</p>}
                      {/[0-9]/.test(passwords.newPassword) && <p>✓ Contains number</p>}
                      {/[^\w]/.test(passwords.newPassword) && <p>✓ Contains special character</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                   Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${
                      passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword
                        ? 'border-green-500 focus:ring-green-500'
                        : passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    {showConfirmPassword ? '' : ''}
                  </button>
                </div>
                {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <p className="text-sm text-red-600 mt-2"> Passwords do not match</p>
                )}
                {passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword && (
                  <p className="text-sm text-green-600 mt-2"> Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                  loading || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  '✓ Reset Password'
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
              <Link href="/login/customer" className="text-green-600 hover:text-green-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
