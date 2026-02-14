'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { shipmentService } from '@/app/lib/services';

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: string;
  weight?: number;
  price?: number;
  parcelType?: string;
  deliveryType?: string;
  sender: {
    name: string;
    address: string;
    phoneNumber: string;
    email?: string;
  };
  recipient: {
    name: string;
    address: string;
    phoneNumber: string;
    email?: string;
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
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    fetchUserParcels();
  }, [filterStatus, page]);

  const fetchUserParcels = async () => {
    try {
      setLoading(true);

      const response = await shipmentService.getUserShipments({
        page,
        limit,
        status: filterStatus || undefined,
      });

      const parcelsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || [];
      setParcels(parcelsData);
      setError('');
    } catch (err: any) {
      console.error('Failed to load parcels:', err);
      setError(err.response?.data?.message || 'Failed to load parcels');
      setParcels([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getParcelTypeIcon = (parcelType?: string) => {
    switch (parcelType) {
      case 'DOCUMENT':
        return '📄';
      case 'FOOD':
        return '🍱';
      case 'FRAGILE':
        return '🥚';
      case 'HEAVY':
        return '💪';
      default:
        return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredParcels = parcels.filter((parcel) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      parcel.trackingNumber.toLowerCase().includes(searchLower) ||
      parcel.recipient.name.toLowerCase().includes(searchLower) ||
      parcel.sender.name.toLowerCase().includes(searchLower) ||
      parcel.recipient.address.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 My Parcels</h1>
        <p className="text-gray-600">View and manage all your parcels</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Tracking ID, recipient, sender..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Create Button */}
          <div className="flex items-end">
            <Link
              href="/user/create-parcel"
              className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold text-center"
            >
              ✚ Create New Parcel
            </Link>
          </div>
        </div>
      </div>

      {/* Parcels Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-xl text-gray-600">⏳ Loading parcels...</p>
          </div>
        </div>
      ) : filteredParcels.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Tracking ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">To (Recipient)</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Delivery</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map((parcel) => (
                  <tr key={parcel._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <span className="font-mono font-semibold text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded">
                        {parcel.trackingNumber}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">{parcel.recipient.name}</p>
                        <p className="text-xs text-gray-500">{parcel.recipient.address}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-2xl" title={parcel.parcelType}>
                        {getParcelTypeIcon(parcel.parcelType)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                          parcel.status
                        )}`}
                      >
                        {parcel.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {parcel.deliveryType || '-'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">৳{parcel.price}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{formatDate(parcel.createdAt)}</td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/user/track?id=${parcel.trackingNumber}`}
                        className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredParcels.length}</span> of{' '}
              <span className="font-semibold">{parcels.length}</span> parcels
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-xl text-gray-600 mb-6">
            {searchTerm ? 'No parcels match your search' : 'No parcels found'}
          </p>
          <Link
            href="/user/create-parcel"
            className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
          >
            ✚ Create Your First Parcel
          </Link>
        </div>
      )}
    </div>
  );
}
