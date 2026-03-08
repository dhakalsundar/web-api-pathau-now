'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExpandableRowSkeleton, ListItemSkeleton } from '@/app/components/Skeletons/SkeletonLoader';
import { riderService, adminService } from '@/app/lib/services';

interface Rider {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  vehicleType?: string;
  vehicleNumber?: string;
  assignedParcels?: any[];
  rating?: number;
  totalDeliveries?: number;
  isActive: boolean;
}

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: string;
  riderId?: string;
}

export default function AdminRidersPage() {
  const router = useRouter();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    isActive: '',
    search: '',
  });
  const [expandedRiderId, setExpandedRiderId] = useState<string | null>(null);

  useEffect(() => {
    fetchRiders();
    fetchShipments();
  }, [filters]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const filterObj: any = {};
      if (filters.status) filterObj.status = filters.status;
      if (filters.isActive !== '') filterObj.isActive = filters.isActive === 'true';

      let response;
      if (filters.search) {
        response = await riderService.searchRiders(filters.search);
      } else {
        response = await riderService.getAllRiders(1, 100, filterObj);
      }

      // Extract riders from response - handle different response structures
      const ridersList = Array.isArray(response?.data?.results) ? response.data.results : 
                         Array.isArray(response?.data?.riders) ? response.data.riders :
                         Array.isArray(response?.data) ? response.data : 
                         Array.isArray(response?.results) ? response.results : 
                         Array.isArray(response) ? response : [];
      
      setRiders(ridersList);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load riders');
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchShipments = async () => {
    try {
      const response = await adminService.getAllAdminParcels(1, 200, {});
      // Defensive: Handle different response structures
      const shipmentsList = Array.isArray(response) ? response : 
                            Array.isArray(response?.data) ? response.data : 
                            Array.isArray(response?.data?.results) ? response.data.results : 
                            Array.isArray(response?.results) ? response.results : [];
      setShipments(shipmentsList);
    } catch (err: any) {
      console.error('Failed to load parcels');
      setShipments([]);
    }
  };

  const handleToggleActive = async (riderId: string, currentStatus: boolean) => {
    try {
      setActionLoading((prev) => ({ ...prev, [riderId]: true }));
      await riderService.updateRider(riderId, { isActive: !currentStatus });
      setSuccess(` Rider ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchRiders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update rider status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [riderId]: false }));
    }
  };

  const handleAssignShipment = async (riderId: string, shipmentId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`assign-${riderId}`]: true }));
      const rider = riders.find(r => r._id === riderId);
      const currentAssigned = rider?.assignedParcels || [];
      await riderService.updateRider(riderId, {
        assignedParcels: [...currentAssigned, shipmentId]
      });
      setSuccess(' Shipment assigned successfully');
      fetchRiders();
      setExpandedRiderId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign shipment');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`assign-${riderId}`]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'OFFLINE':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '🟢';
      case 'BUSY':
        return '🟡';
      case 'OFFLINE':
        return '⚫';
      default:
        return '⚪';
    }
  };

  const filteredRiders = Array.isArray(riders) ? riders.filter(r => {
    if (filters.search) {
      return r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
             r.phoneNumber.includes(filters.search);
    }
    return true;
  }) : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">🚴 Riders</h1>
              <p className="text-gray-600">Manage delivery partners</p>
            </div>
            <button
              onClick={() => router.push('/admin/riders/new')}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              + New Rider
            </button>
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
               {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Name or phone..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Status</option>
                  <option value="AVAILABLE">🟢 Available</option>
                  <option value="BUSY">🟡 Busy</option>
                  <option value="OFFLINE">⚫ Offline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Active Status</label>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All</option>
                  <option value="true"> Active</option>
                  <option value="false"> Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: '', isActive: '', search: '' })}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Riders Table */}
          {loading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <ExpandableRowSkeleton key={i} columnCount={6} />
                ))}
            </div>
          ) : filteredRiders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-xl text-gray-600"> No riders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRiders.map((rider) => (
                <div
                  key={rider._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* Rider Summary Row */}
                  <div className="p-6 cursor-pointer hover:bg-gray-50 transition" onClick={() => setExpandedRiderId(expandedRiderId === rider._id ? null : rider._id)}>
                    <div className="grid grid-cols-6 items-center gap-4">
                      {/* Name */}
                      <div>
                        <p className="font-semibold text-gray-900">{rider.name}</p>
                        <p className="text-xs text-gray-600">{rider.email || 'No email'}</p>
                      </div>

                      {/* Phone */}
                      <div>
                        <p className="text-sm text-gray-700">📱 {rider.phoneNumber}</p>
                      </div>

                      {/* Availability */}
                      <div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(rider.status)}`}>
                          {getStatusIcon(rider.status)} {rider.status}
                        </span>
                      </div>

                      {/* Assigned Parcels */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{rider.assignedParcels?.length || 0} 📦</p>
                        <p className="text-xs text-gray-600">Assigned</p>
                      </div>

                      {/* Active Status */}
                      <div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          rider.isActive
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {rider.isActive ? ' Active' : ' Inactive'}
                        </span>
                      </div>

                      {/* Expand Icon */}
                      <div className="text-right">
                        <span className="text-2xl">{expandedRiderId === rider._id ? '▼' : '▶'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRiderId === rider._id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Rider Details */}
                        <div>
                          <h3 className="font-bold text-gray-900 mb-4"> Details</h3>
                          <dl className="space-y-3">
                            <div>
                              <dt className="text-xs font-semibold text-gray-600">Vehicle Type</dt>
                              <dd className="text-sm text-gray-900">{rider.vehicleType || '-'}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold text-gray-600">Vehicle Number</dt>
                              <dd className="text-sm text-gray-900">{rider.vehicleNumber || '-'}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold text-gray-600">Total Deliveries</dt>
                              <dd className="text-sm text-gray-900">{rider.totalDeliveries || 0}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold text-gray-600">Rating</dt>
                              <dd className="text-sm text-gray-900">{(rider.rating || 0).toFixed(1)}/5 ⭐</dd>
                            </div>
                          </dl>
                        </div>

                        {/* Actions */}
                        <div>
                          <h3 className="font-bold text-gray-900 mb-4">⚡ Actions</h3>
                          <div className="space-y-4">
                            {/* Toggle Active/Inactive */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status
                              </label>
                              <button
                                onClick={() => handleToggleActive(rider._id, rider.isActive)}
                                disabled={actionLoading[rider._id]}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                                  rider.isActive
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50'
                                }`}
                              >
                                {actionLoading[rider._id]
                                  ? ' Updating...'
                                  : rider.isActive
                                  ? ' Deactivate'
                                  : ' Activate'}
                              </button>
                            </div>

                            {/* Assign Shipment */}
                            {Array.isArray(shipments) && shipments.length > 0 && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Assign Shipment
                                </label>
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignShipment(rider._id, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  disabled={actionLoading[`assign-${rider._id}`]}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                                >
                                  <option value="">-- Select Shipment --</option>
                                  {Array.isArray(shipments) && shipments
                                    .filter(s => !s.riderId) // Only unassigned shipments
                                    .map((shipment) => (
                                      <option key={shipment._id} value={shipment._id}>
                                        {shipment.trackingNumber} ({shipment.status})
                                      </option>
                                    ))}
                                </select>
                                {actionLoading[`assign-${rider._id}`] && (
                                  <p className="text-xs text-gray-600 mt-1">⏳ Assigning...</p>
                                )}
                              </div>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => router.push(`/admin/riders/${rider._id}`)}
                              className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
                            >
                               Edit Rider
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
  
  );
}
