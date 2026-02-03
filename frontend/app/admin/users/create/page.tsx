'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { authService } from '@/app/lib/services';
import Link from 'next/link';

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'customer',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.firstName) errors.firstName = 'First name is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Use FormData for multipart/form-data to support file upload
      const formDataObj = new FormData();
      formDataObj.append('email', formData.email);
      formDataObj.append('password', formData.password);
      formDataObj.append('firstName', formData.firstName);
      formDataObj.append('lastName', formData.lastName);
      formDataObj.append('phoneNumber', formData.phoneNumber);
      formDataObj.append('role', formData.role);
      if (avatar) {
        formDataObj.append('avatar', avatar);
      }

      // Call API to create user
      const response = await authService.createUserByAdmin(formDataObj);

      // Redirect to users list
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={[]} userRole="ADMIN" userName="Admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/admin/users"
                className="text-amber-600 hover:text-amber-700 font-semibold mb-4 inline-block"
              >
                ← Back to Users
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">➕ Create New User</h1>
              <p className="text-gray-600">Add a new user to the system</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
                ❌ {error}
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
              {/* Avatar Upload */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Avatar</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={preview || 'https://via.placeholder.com/120?text=Avatar'}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-lg border-2 border-gray-300 object-cover"
                    />
                    <label className="absolute bottom-0 right-0 bg-amber-500 text-white rounded-full p-2 cursor-pointer hover:bg-amber-600 transition">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4.5-9 3 4 2.5-4 3.5 7z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold">Upload a profile picture</p>
                    <p>JPG, PNG or GIF (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`}
                      placeholder="Enter email"
                    />
                    {validationErrors.email && <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`}
                      placeholder="Enter password (min 6 chars)"
                    />
                    {validationErrors.password && <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`}
                      placeholder="Confirm password"
                    />
                    {validationErrors.confirmPassword && <p className="text-red-600 text-sm mt-1">{validationErrors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`}
                      placeholder="Enter first name"
                    />
                    {validationErrors.firstName && <p className="text-red-600 text-sm mt-1">{validationErrors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold disabled:opacity-50"
                  >
                    {loading ? '⏳ Creating...' : '✅ Create User'}
                  </button>
                  <Link
                    href="/admin/users"
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
