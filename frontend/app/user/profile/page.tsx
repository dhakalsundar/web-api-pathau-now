'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { authService } from '@/app/lib/services';

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumber: userData.phoneNumber || '',
        });
        if (userData.avatar) {
          setPreview(userData.avatar);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const formDataObj = new FormData();
      formDataObj.append('firstName', formData.firstName);
      formDataObj.append('lastName', formData.lastName);
      formDataObj.append('phoneNumber', formData.phoneNumber);
      if (avatar) {
        formDataObj.append('avatar', avatar);
      }

      const response = await authService.updateProfile(user.id, formDataObj);
      
      // Update localStorage
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage('✅ Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.message || 'Failed to update profile'}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <p className="text-xl text-gray-600">⏳ Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">👤 My Profile</h1>
            <p className="text-gray-600">Update your personal information</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${message.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'} font-semibold`}>
              {message}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
            {/* Avatar Section */}
            <div className="mb-8 flex flex-col items-center">
              <div className="relative">
                <img
                  src={preview || 'https://via.placeholder.com/150?text=Avatar'}
                  alt="Profile Avatar"
                  className="w-32 h-32 rounded-full border-4 border-amber-500 object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-amber-500 text-white rounded-full p-2 cursor-pointer hover:bg-amber-600 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
              <p className="mt-4 text-center text-sm text-gray-600">Click the icon to change avatar</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold disabled:opacity-50"
                >
                  {updating ? '⏳ Saving...' : '✅ Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
