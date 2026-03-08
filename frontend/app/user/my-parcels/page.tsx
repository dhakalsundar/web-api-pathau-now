'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { parcelService } from '@/app/lib/services';
import { getUserDetails } from '@/lib/cookies';

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: string;
  weight?: number;
  price?: number;
  parcelType?: string;
  deliveryType?: string;
  notes?: string;
  sender: {
    name: string;
    address: string;
    phoneNumber?: string;
  };
  recipient: {
    name: string;
    address: string;
    phoneNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function MyParcelsPage() {
  const router = useRouter();
  const [parcels, setParcels] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingParcel, setEditingParcel] = useState<Shipment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState('');

  console.log(' MyParcelsPage component rendered');

  useEffect(() => {
    console.log(' useEffect triggered, filterStatus:', filterStatus);
    fetchUserParcels();
  }, [filterStatus]);

  const fetchUserParcels = async () => {
    try {
      console.log(' Starting fetchUserParcels...');
      setLoading(true);
      const userData = getUserDetails();
      console.log(' User from cookies:', userData);

      if (!userData) {
        console.log(' No user found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log(' Parsed user data:', userData);
      
      console.log(' Calling API with params:', { page: 1, limit: 50, status: filterStatus });
      const response = await parcelService.getUserParcels({
        page: 1,
        limit: 50,
        status: filterStatus || undefined,
      });
      
      console.log(' Full API Response:', response);
      console.log(' Response.data:', response.data);
      
      const parcelsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.results || [];
      
      console.log(' Extracted parcels:', parcelsData);
      setParcels(parcelsData);
      setError('');
    } catch (err: any) {
      console.error(' Error fetching parcels:', err);
      setError(err.response?.data?.message || 'Failed to load parcels');
      setParcels([]);
    } finally {
      setLoading(false);
    }
  };

  const isParcelEditable = (parcel: Shipment) => {
    return parcel.status === 'PENDING';
  };

  const handleOpenEdit = (parcel: Shipment) => {
    setEditingParcel({ ...parcel });
    setShowEditModal(true);
  };

  const handleEditChange = (field: string, value: any) => {
    if (editingParcel) {
      setEditingParcel({
        ...editingParcel,
        [field]: value,
      });
    }
  };

  const handleEditNestedChange = (parent: string, field: string, value: any) => {
    if (editingParcel) {
      setEditingParcel({
        ...editingParcel,
        [parent]: {
          ...(editingParcel as any)[parent],
          [field]: value,
        },
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingParcel) return;
    
    try {
      setActionLoading({ ...actionLoading, [editingParcel._id]: true });
      
      // Only send editable fields
      const updateData = {
        weight: editingParcel.weight,
        price: editingParcel.price,
        deliveryType: editingParcel.deliveryType,
        notes: editingParcel.notes,
        sender: editingParcel.sender,
        recipient: editingParcel.recipient,
      };

      await parcelService.updateParcel(editingParcel._id, updateData);
      
      setSuccessMessage(' Parcel updated successfully');
      setShowEditModal(false);
      setEditingParcel(null);
      
      // Refresh parcels list
      await fetchUserParcels();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update parcel';
      setError(errorMsg);
    } finally {
      setActionLoading({ ...actionLoading, [editingParcel._id]: false });
    }
  };

  const handleDelete = async (parcelId: string) => {
    try {
      setActionLoading({ ...actionLoading, [parcelId]: true });
      
      await parcelService.deleteParcel(parcelId);
      
      setSuccessMessage(' Parcel deleted successfully');
      setShowDeleteConfirm(null);
      
      // Refresh parcels list
      await fetchUserParcels();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete parcel';
      setError(errorMsg);
    } finally {
      setActionLoading({ ...actionLoading, [parcelId]: false });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-200 text-gray-800';
      case 'PICKED_UP':
        return 'bg-blue-200 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-yellow-200 text-yellow-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-200 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-200 text-green-800';
      case 'FAILED':
        return 'bg-red-200 text-red-800';
      case 'CANCELLED':
        return 'bg-red-300 text-red-900';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getParcelTypeIcon = (parcelType?: string) => {
    switch (parcelType) {
      case 'DOCUMENT':
        return '';
      case 'FOOD':
        return '';
      case 'FRAGILE':
        return '';
      case 'HEAVY':
        return '';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredParcels = parcels.filter((parcel) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      parcel.trackingNumber.toLowerCase().includes(searchLower) ||
      parcel.recipient.name.toLowerCase().includes(searchLower) ||
      parcel.recipient.address.toLowerCase().includes(searchLower)
    );
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 My Parcels</h1>
          <p className="text-gray-600">View and track all your parcels in one place</p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 font-medium"> {error}</p>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search by Tracking ID or Recipient
              </label>
              <input
                type="text"
                placeholder="Enter tracking ID or recipient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING"> Pending</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT"> In Transit</option>
                <option value="OUT_FOR_DELIVERY"> Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED"> Failed</option>
                <option value="CANCELLED"> Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <Link
                href="/user/create-parcel"
                className="w-full px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg transition text-center"
              >
                + Create New Parcel
              </Link>
            </div>
          </div>
        </div>

        {/* Parcels List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-gray-600">Loading your parcels...</p>
            </div>
          </div>
        ) : filteredParcels.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Parcels Found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus
                ? 'Try adjusting your search or filters'
                : 'You haven\'t created any parcels yet'}
            </p>
            <Link
              href="/booking"
              className="inline-block px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              Create Your First Parcel
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredParcels.map((parcel) => (
              <div key={parcel._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4 border-amber-500">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                    {/* Tracking Number */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">TRACKING ID</p>
                      <Link href={`/track/${parcel.trackingNumber}`} className="font-mono font-bold text-amber-600 text-sm hover:text-amber-700">
                        {parcel.trackingNumber}
                      </Link>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">STATUS</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(parcel.status)}`}>
                        {parcel.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Parcel Type & Weight */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">PARCEL</p>
                      <p className="text-sm">
                        <span className="text-lg">{getParcelTypeIcon(parcel.parcelType)}</span>
                        {parcel.weight && <span className="text-gray-700 ml-1">{parcel.weight}kg</span>}
                      </p>
                    </div>

                    {/* Recipient */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">TO</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{parcel.recipient.name}</p>
                      <p className="text-xs text-gray-500 truncate">{parcel.recipient.address}</p>
                    </div>

                    {/* Price */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">PRICE</p>
                      <p className="text-lg font-bold text-gray-900">Rs{parcel.price || '—'}</p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">DATE</p>
                      <p className="text-xs text-gray-700">{formatDate(parcel.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleOpenEdit(parcel)}
                        disabled={!isParcelEditable(parcel) || actionLoading[parcel._id]}
                        className={`px-3 py-1 rounded text-sm font-semibold transition ${
                          isParcelEditable(parcel)
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        title={!isParcelEditable(parcel) ? 'Can only edit PENDING parcels' : 'Edit this parcel'}
                      >
                         Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(parcel._id)}
                        disabled={!isParcelEditable(parcel) || actionLoading[parcel._id]}
                        className={`px-3 py-1 rounded text-sm font-semibold transition ${
                          isParcelEditable(parcel)
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        title={!isParcelEditable(parcel) ? 'Can only delete PENDING parcels' : 'Delete this parcel'}
                      >
                         Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && parcels.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4"> Your Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">{parcels.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Parcels</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {parcels.filter((p) => p.status === 'DELIVERED').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Delivered</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {parcels.filter((p) => ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(p.status)).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">In Progress</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">
                  Rs{parcels.reduce((sum, p) => sum + (p.price || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Spent</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingParcel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">✏️ Edit Parcel</h2>
              
              <div className="space-y-4">
                {/* Tracking Number (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tracking Number</label>
                  <input 
                    type="text" 
                    value={editingParcel.trackingNumber} 
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={editingParcel.weight || 0} 
                      onChange={(e) => handleEditChange('weight', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (Rs)</label>
                    <input 
                      type="number" 
                      value={editingParcel.price || 0} 
                      onChange={(e) => handleEditChange('price', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Delivery Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Type</label>
                  <select 
                    value={editingParcel.deliveryType || 'STANDARD'}
                    onChange={(e) => handleEditChange('deliveryType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXPRESS">Express</option>
                    <option value="SAME_DAY">Same Day</option>
                  </select>
                </div>

                {/* Sender Info */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sender Information</h3>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Sender Name"
                      value={editingParcel.sender.name}
                      onChange={(e) => handleEditNestedChange('sender', 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Sender Address"
                      value={editingParcel.sender.address}
                      onChange={(e) => handleEditNestedChange('sender', 'address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Sender Phone"
                      value={editingParcel.sender.phoneNumber || ''}
                      onChange={(e) => handleEditNestedChange('sender', 'phoneNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recipient Information</h3>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Recipient Name"
                      value={editingParcel.recipient.name}
                      onChange={(e) => handleEditNestedChange('recipient', 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Recipient Address"
                      value={editingParcel.recipient.address}
                      onChange={(e) => handleEditNestedChange('recipient', 'address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Recipient Phone"
                      value={editingParcel.recipient.phoneNumber || ''}
                      onChange={(e) => handleEditNestedChange('recipient', 'phoneNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea 
                    value={editingParcel.notes || ''}
                    onChange={(e) => handleEditChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6 border-t pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading[editingParcel._id]}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold transition disabled:opacity-50"
                >
                  {actionLoading[editingParcel._id] ? ' Saving...' : ' Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4"> Delete Parcel?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this parcel? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={actionLoading[showDeleteConfirm]}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition disabled:opacity-50"
                >
                  {actionLoading[showDeleteConfirm] ? ' Deleting...' : ' Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
