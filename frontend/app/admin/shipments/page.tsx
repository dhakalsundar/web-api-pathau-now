'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExpandableRowSkeleton } from '@/app/components/Skeletons/SkeletonLoader';
import { adminService, shipmentService } from '@/app/lib/services';
import Link from 'next/link';

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  sender: { name: string };
  recipient: { name: string };
  price: number;
  createdAt: string;
  riderId?: string;
}

export default function AdminShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    fetchShipments();
  }, [filters]);

  useEffect(() => {
    fetchShipments();
  }, [page, pageSize]);

  const fetchShipments = async () => {
    try {
      setLoading(true);

      let response;
      const filterObj: any = {};
      if (filters.status) filterObj.status = filters.status;

      if (filters.search) {
        response = await adminService.searchAdminShipments(filters.search, page, pageSize);
      } else {
        response = await adminService.getAllAdminShipments(page, pageSize, filterObj);
      }

      setShipments(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [shipmentId]: true }));
      await shipmentService.updateShipmentStatus(shipmentId, newStatus);
      setSuccess(`✅ Shipment status updated to ${newStatus}`);
      fetchShipments();
      setExpandedId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update shipment status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [shipmentId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_TRANSIT':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'CANCELLED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'PICKED_UP':
        return '📦';
      case 'IN_TRANSIT':
        return '🚚';
      case 'OUT_FOR_DELIVERY':
        return '🚴';
      case 'DELIVERED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'CANCELLED':
        return '🚫';
      default:
        return '❓';
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊', badge: 0 },
    { label: 'Shipments', href: '/admin/shipments', icon: '📦', badge: 0 },
    { label: 'Riders', href: '/admin/riders', icon: '🚴', badge: 0 },
    { label: 'Users', href: '/admin/users', icon: '👥', badge: 0 },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈', badge: 0 },
  ];

  const statusOptions = [
    'PENDING',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'FAILED',
    'CANCELLED',
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">📦 Shipments</h1>
              <p className="text-gray-600">Manage all parcels • {totalCount} total</p>
            </div>
            <Link
              href="/booking"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              + New Shipment
            </Link>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-4 text-green-700 font-semibold">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
              ❌ {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Tracking</label>
                <input
                  type="text"
                  placeholder="Enter tracking number..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="PICKED_UP">📦 Picked Up</option>
                  <option value="IN_TRANSIT">🚚 In Transit</option>
                  <option value="OUT_FOR_DELIVERY">🚴 Out for Delivery</option>
                  <option value="DELIVERED">✅ Delivered</option>
                  <option value="FAILED">❌ Failed</option>
                  <option value="CANCELLED">🚫 Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Per Page</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setFilters({ status: '', search: '' })}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Shipments List */}
          {loading ? (
            <div className="space-y-4 mb-8">
              {Array(pageSize)
                .fill(0)
                .map((_, i) => (
                  <ExpandableRowSkeleton key={i} columnCount={7} />
                ))}
            </div>
          ) : shipments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-xl text-gray-600">📭 No shipments found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {shipments.map((shipment) => (
                  <div
                    key={shipment._id}
                    className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    {/* Shipment Summary Row */}
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedId(expandedId === shipment._id ? null : shipment._id)}
                    >
                      <div className="grid grid-cols-7 items-center gap-4">
                        {/* Tracking Number */}
                        <div>
                          <p className="font-mono font-bold text-amber-600">{shipment.trackingNumber}</p>
                          <p className="text-xs text-gray-600">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                        </div>

                        {/* Status */}
                        <div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(shipment.status)}`}>
                            {getStatusIcon(shipment.status)} {shipment.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Sender */}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{shipment.sender?.name || '-'}</p>
                          <p className="text-xs text-gray-600">Sender</p>
                        </div>

                        {/* Recipient */}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{shipment.recipient?.name || '-'}</p>
                          <p className="text-xs text-gray-600">Recipient</p>
                        </div>

                        {/* Price */}
                        <div>
                          <p className="text-sm font-bold text-gray-900">৳{shipment.price}</p>
                        </div>

                        {/* Rider */}
                        <div>
                          <p className="text-sm text-gray-600">{shipment.riderId ? '🏍️ Assigned' : '⚪ Unassigned'}</p>
                        </div>

                        {/* Expand Icon */}
                        <div className="text-right">
                          <span className="text-2xl">{expandedId === shipment._id ? '▼' : '▶'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === shipment._id && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <div className="grid md:grid-cols-3 gap-8">
                          {/* Shipment Details */}
                          <div>
                            <h3 className="font-bold text-gray-900 mb-4">📋 Details</h3>
                            <dl className="space-y-3">
                              <div>
                                <dt className="text-xs font-semibold text-gray-600">ID</dt>
                                <dd className="text-sm text-gray-900 font-mono">{shipment._id}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-semibold text-gray-600">Created</dt>
                                <dd className="text-sm text-gray-900">{new Date(shipment.createdAt).toLocaleString()}</dd>
                              </div>
                            </dl>
                          </div>

                          {/* Parties Details */}
                          <div>
                            <h3 className="font-bold text-gray-900 mb-4">👥 Parties</h3>
                            <dl className="space-y-3">
                              <div>
                                <dt className="text-xs font-semibold text-gray-600">From</dt>
                                <dd className="text-sm text-gray-900">{shipment.sender?.name || '-'}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-semibold text-gray-600">To</dt>
                                <dd className="text-sm text-gray-900">{shipment.recipient?.name || '-'}</dd>
                              </div>
                            </dl>
                          </div>

                          {/* Actions */}
                          <div>
                            <h3 className="font-bold text-gray-900 mb-4">⚡ Actions</h3>
                            <div className="space-y-4">
                              {/* Update Status */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleUpdateStatus(shipment._id, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  disabled={actionLoading[shipment._id]}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                                >
                                  <option value="">-- Select Status --</option>
                                  {statusOptions
                                    .filter(s => s !== shipment.status)
                                    .map((status) => (
                                      <option key={status} value={status}>
                                        {getStatusIcon(status)} {status.replace('_', ' ')}
                                      </option>
                                    ))}
                                </select>
                                {actionLoading[shipment._id] && (
                                  <p className="text-xs text-gray-600 mt-1">⏳ Updating...</p>
                                )}
                              </div>

                              {/* View Button */}
                              <button
                                onClick={() => router.push(`/admin/shipments/${shipment.trackingNumber}`)}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                              >
                                👁️ View Details
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => router.push(`/admin/shipments/${shipment.trackingNumber}/edit`)}
                                className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-bold">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-bold">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                  <span className="font-bold">{totalCount}</span> shipments
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    ⏮️ First
                  </button>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    ◀️ Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Page {page} of {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    Next ▶️
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    Last ⏭️
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
