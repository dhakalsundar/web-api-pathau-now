'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import DataTable from '@/app/components/DataTable';
import { adminService } from '@/app/lib/services';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      let response;
      if (filters.search) {
        response = await adminService.searchUsers(filters.search);
      } else {
        response = await adminService.getAllUsers(1, 50, filters.role || undefined);
      }

      setUsers(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊', badge: 0 },
    { label: 'Shipments', href: '/admin/shipments', icon: '📦', badge: 0 },
    { label: 'Riders', href: '/admin/riders', icon: '🚴', badge: 0 },
    { label: 'Users', href: '/admin/users', icon: '👥', badge: 0 },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈', badge: 0 },
  ];

  const columns = [
    { key: 'name', label: 'Name', width: '150px' },
    { key: 'email', label: 'Email', width: '200px' },
    { key: 'phone', label: 'Phone', width: '140px' },
    { key: 'role', label: 'Role', width: '120px' },
    { key: 'isActive', label: 'Status', width: '100px' },
    { key: 'createdAt', label: 'Joined', width: '120px' },
  ];

  const formattedData = users.map((u: any) => ({
    name: u.name || '-',
    email: u.email || '-',
    phone: u.phone || '-',
    role: u.role || 'CUSTOMER',
    isActive: u.isActive ? '✅ Active' : '❌ Inactive',
    createdAt: new Date(u.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">👥 Users</h1>
              <p className="text-gray-600">Manage user accounts</p>
            </div>
            <button
              onClick={() => router.push('/admin/users/new')}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              + New User
            </button>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
              ❌ {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Roles</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ role: '', search: '' })}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={formattedData}
            actions={[
              {
                label: 'View',
                onClick: (row) => router.push(`/admin/users/${row.email}`),
                color: 'blue',
              },
              {
                label: 'Edit',
                onClick: (row) => router.push(`/admin/users/${row.email}/edit`),
                color: 'amber',
              },
            ]}
            isLoading={loading}
            emptyMessage="No users found"
          />
        </div>
      </main>
    </div>
  );
}
