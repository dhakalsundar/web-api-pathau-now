'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!editData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!editData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Update user data in localStorage (in a real app, this would call an API)
      const updatedUser = {
        ...user,
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-20">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-xl text-gray-600">⏳ Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
          <p className="text-red-700 font-medium mb-4">❌ Failed to load profile</p>
          <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">👤 Profile Settings</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700 font-medium">✅ {success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Avatar Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow p-8 border border-amber-200">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-white">{user.name[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-semibold">
                {user.role ? user.role.toUpperCase() : 'CUSTOMER'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📋 Account Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
              >
                ✎ Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            // Edit Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:bg-gray-400"
                >
                  {saving ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Display Information
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">FULL NAME</p>
                  <p className="text-lg text-gray-900 font-semibold">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">EMAIL ADDRESS</p>
                  <p className="text-lg text-gray-900 font-semibold">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">PHONE NUMBER</p>
                    <p className="text-lg text-gray-900 font-semibold">{user.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">MEMBER SINCE</p>
                  <p className="text-lg text-gray-900 font-semibold">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔒 Account Security</h2>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">Password</p>
              <p className="text-gray-600 text-sm mb-4">••••••••••••••</p>
              <button className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
                Change Password →
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">Two-Factor Authentication</p>
              <p className="text-gray-600 text-sm mb-4">Not enabled</p>
              <button className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
                Enable 2FA →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔗 Quick Links</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/user/dashboard"
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <p className="font-semibold text-blue-900">📊 Dashboard</p>
              <p className="text-sm text-blue-700">View your dashboard overview</p>
            </Link>
            <Link
              href="/user/parcels"
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
            >
              <p className="font-semibold text-green-900">📦 My Parcels</p>
              <p className="text-sm text-green-700">View all your parcels</p>
            </Link>
            <Link
              href="/user/create-parcel"
              className="p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
            >
              <p className="font-semibold text-amber-900">✚ Create Parcel</p>
              <p className="text-sm text-amber-700">Book a new parcel</p>
            </Link>
            <Link
              href="/user/track"
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
            >
              <p className="font-semibold text-purple-900">🔍 Track Parcel</p>
              <p className="text-sm text-purple-700">Track by tracking ID</p>
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-lg shadow p-8 border border-red-200">
          <h2 className="text-2xl font-bold text-red-900 mb-6">⚠️ Danger Zone</h2>

          <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold">
            🗑️ Delete Account
          </button>
          <p className="text-sm text-red-700 mt-2">
            Once you delete your account, there is no going back. Please be certain.
          </p>
        </div>
      </div>
    </div>
  );
}
