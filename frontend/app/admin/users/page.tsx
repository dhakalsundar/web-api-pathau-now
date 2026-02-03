'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import DataTable from '@/app/components/DataTable';
import { adminService } from '@/app/lib/services';
import Link from 'next/link';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(user);
        if (userData.role !== 'admin' && userData.role !== 'ADMIN') {
          router.push('/');
          return;
        }

        // Fetch users
        const response = await adminService.getAllUsers({
          page: 1,
          limit: 50,
          search: searchTerm,
          role: roleFilter,
        });

        setUsers(response.data?.users || response.data || []);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router, searchTerm, roleFilter]);

  const columns = [
    { key: 'email', label: 'Email', width: '200px' },
    { key: 'firstName', label: 'First Name', width: '150px' },
    { key: 'lastName', label: 'Last Name', width: '150px' },
    { key: 'phoneNumber', label: 'Phone', width: '130px' },
    { key: 'role', label: 'Role', width: '100px' },
  ];

  const formattedUsers = users.map((u: any) => ({
    email: u.email,
    firstName: u.firstName || '-',
    lastName: u.lastName || '-',
    phoneNumber: u.phoneNumber || '-',
    role: u.role?.toUpperCase() || '-',
    id: u._id,
  }));

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={[]} userRole="ADMIN" userName="Admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 User Management</h1>
              <p className="text-gray-600">Manage all users in the system</p>
            </div>
            <Link
              href="/admin/users/create"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              ➕ Create User
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
              ❌ {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={formattedUsers}
              isLoading={loading}
              emptyMessage="No users found"
              actions={[
                {
                  label: 'View',
                  onClick: (row) => router.push(`/admin/users/${row.id}`),
                  color: 'blue',
                },
                {
                  label: 'Edit',
                  onClick: (row) => router.push(`/admin/users/${row.id}/edit`),
                  color: 'amber',
                },
                {
                  label: 'Delete',
                  onClick: (row) => {
                    if (window.confirm('Are you sure you want to delete this user?')) {
                      // Handle delete
                    }
                  },
                  color: 'red',
                },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
