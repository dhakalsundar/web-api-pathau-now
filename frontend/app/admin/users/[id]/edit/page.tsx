'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { adminService } from '@/app/lib/services';
import Link from 'next/link';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await adminService.getUserById(userId);
        const userData = response.data;
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumber: userData.phoneNumber || '',
          role: userData.role || 'customer',
        });
        if (userData.avatar) {
          setPreview(userData.avatar);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setMessage('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('firstName', formData.firstName);
      formDataObj.append('lastName', formData.lastName);
      formDataObj.append('phoneNumber', formData.phoneNumber);
      formDataObj.append('role', formData.role);
      if (avatar) {
        formDataObj.append('avatar', avatar);
      }

      await adminService.updateUser(userId, formDataObj);
      setMessage('✅ User updated successfully');
      setTimeout(() => router.push('/admin/users'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar items={[]} userRole="ADMIN" userName="Admin" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 text-center">
            <p className="text-xl text-gray-600">⏳ Loading user details...</p>
          </div>
        </main>
      </div>
    );
  }

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">✏️ Edit User</h1>
              <p className="text-gray-600">Update user information - ID: {userId}</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
                ❌ {error}
              </div>
            )}

            {message && (
              <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-4 text-green-700 font-semibold">
                {message}
              </div>
            )}

            {user && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
                {/* Avatar Section */}
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
                      <p className="font-semibold">Update profile picture</p>
                      <p>JPG, PNG or GIF (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter first name"
                      />
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

                  <div className="grid md:grid-cols-2 gap-6">
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

                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold disabled:opacity-50"
                    >
                      {updating ? '⏳ Saving...' : '✅ Save Changes'}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
