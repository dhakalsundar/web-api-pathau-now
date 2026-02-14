'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/app/components/DataTable';
import { ConfirmationModal } from '@/app/components/ConfirmationModal';
import { adminService } from '@/app/lib/services';
import Link from 'next/link';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);
  const limit = pageSize;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          router.push('/admin/login');
          return;
        }

        // Fetch users with pagination
        const response = await adminService.getAllUsers({
          page,
          limit,
          search: searchTerm || undefined,
          role: roleFilter || undefined,
        });

        // Handle response data structure
        const usersData = response.data?.users || response.data?.data || [];
        const total = response.data?.total || response.pagination?.total || 0;
        
        setUsers(Array.isArray(usersData) ? usersData : []);
        setTotalUsers(total);
        setError('');
      } catch (err: any) {
        console.error('Error fetching users:', err);
        const errorMessage = 
          err.response?.data?.error?.message || 
          err.response?.data?.message || 
          err.message || 
          'Failed to load users';
        setError(errorMessage);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router, searchTerm, roleFilter, page, limit]);

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      setDeleteLoading(true);
      setError('');
      await adminService.deleteUser(selectedUserId);
      
      // Remove user from list
      setUsers(users.filter(u => u._id !== selectedUserId));
      setShowDeleteConfirm(false);
      setSelectedUserId(null);
      setSelectedUserEmail('');
      
      // Show success toast or message
      console.log('User deleted successfully');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        err.message || 
        'Failed to delete user';
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteConfirm = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setShowDeleteConfirm(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? '✅ Active' : '❌ Inactive';
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    { key: 'email', label: 'Email', width: '200px' },
    { key: 'name', label: 'Name', width: '150px' },
    { key: 'phoneNumber', label: 'Phone', width: '130px' },
    { key: 'role', label: 'Role', width: '100px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'createdDate', label: 'Created Date', width: '130px' },
  ];

  const formattedUsers = users.map((u: any) => ({
    email: u.email,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || '-',
    phoneNumber: u.phoneNumber || '-',
    role: u.role?.toUpperCase() || 'CUSTOMER',
    status: getStatusBadge(u.isActive),
    createdDate: formatDate(u.createdAt),
    id: u._id,
    isActive: u.isActive,
  }));

  return (
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
              <option value="CUSTOMER">Customer</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
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
              onClick: (row) => openDeleteConfirm(row.id, row.email),
              color: 'red',
            },
          ]}
        />
        
        {/* Pagination Controls */}
        {!loading && formattedUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{formattedUsers.length}</span> users
              {totalUsers > formattedUsers.length && ` of ${totalUsers} total`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={formattedUsers.length < limit || loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete the user "${selectedUserEmail}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={deleteLoading}
        icon="⚠️"
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedUserId(null);
          setSelectedUserEmail('');
        }}
      />
    </div>
  );
}
