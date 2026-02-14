'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminService } from '@/app/lib/services';
import Link from 'next/link';

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await adminService.getUserById(userId);
        setUser(response.data);
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

  if (loading) {
    return (
      <main className="overflow-y-auto">
        <div className="p-8 text-center">
          <p className="text-xl text-gray-600">⏳ Loading user details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="overflow-y-auto">
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">👤 View User</h1>
              <p className="text-gray-600">User ID: {userId}</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
                ❌ {error}
              </div>
            )}

            {user && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
                {/* Avatar */}
                <div className="flex items-start gap-8 mb-8">
                  <img
                    src={user.avatar || 'https://via.placeholder.com/150?text=Avatar'}
                    alt="User Avatar"
                    className="w-32 h-32 rounded-lg border-2 border-gray-300 object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {user.firstName} {user.lastName}
                    </h2>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">Email:</span> {user.email}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Phone:</span> {user.phoneNumber || '-'}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Role:</span>{' '}
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                          {user.role?.toUpperCase() || 'CUSTOMER'}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Link
                    href={`/admin/users/${userId}/edit`}
                    className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold text-center"
                  >
                    ✏️ Edit User
                  </Link>
                  <Link
                    href="/admin/users"
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
                  >
                    Back
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }
