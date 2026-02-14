'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
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
  };
  recipient: {
    name: string;
    address: string;
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

  console.log('🟢 MyParcelsPage component rendered');

  useEffect(() => {
    console.log('🟠 useEffect triggered, filterStatus:', filterStatus);
    fetchUserParcels();
  }, [filterStatus]);

  const fetchUserParcels = async () => {
    try {
      console.log('🔍 Starting fetchUserParcels...');
      setLoading(true);
      const user = localStorage.getItem('user');
      console.log('👤 User from localStorage:', user);

      if (!user) {
        console.log('⚠️ No user found, redirecting to login');
        router.push('/login');
        return;
      }

      const userData = JSON.parse(user);
      console.log('📝 Parsed user data:', userData);
      
      console.log('📤 Calling API with params:', { page: 1, limit: 50, status: filterStatus });
      const response = await shipmentService.getUserShipments({
        page: 1,
        limit: 50,
        status: filterStatus || undefined,
      });
      
      console.log('✅ Full API Response:', response);
      console.log('📦 Response.data:', response.data);
      
      const parcelsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.results || [];
      
      console.log('🎯 Extracted parcels:', parcelsData);
      setParcels(parcelsData);
      setError('');
    } catch (err: any) {
      console.error('❌ Error fetching parcels:', err);
      setError(err.response?.data?.message || 'Failed to load parcels');
      setParcels([]);
    } finally {
      setLoading(false);
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

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 font-medium">❌ {error}</p>
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
                <option value="PENDING">⏳ Pending</option>
                <option value="PICKED_UP">📦 Picked Up</option>
                <option value="IN_TRANSIT">🚚 In Transit</option>
                <option value="OUT_FOR_DELIVERY">🚴 Out for Delivery</option>
                <option value="DELIVERED">✅ Delivered</option>
                <option value="FAILED">❌ Failed</option>
                <option value="CANCELLED">🛑 Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <Link
                href="/booking"
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
              <Link key={parcel._id} href={`/track/${parcel.trackingNumber}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden border-l-4 border-amber-500">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* Tracking Number */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">TRACKING ID</p>
                        <p className="font-mono font-bold text-amber-600 text-sm">{parcel.trackingNumber}</p>
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
                        <p className="text-lg font-bold text-gray-900">৳{parcel.price || '—'}</p>
                      </div>

                      {/* Date */}
                      <div className="text-right">
                        <p className="text-xs text-gray-600 font-semibold mb-1">DATE</p>
                        <p className="text-xs text-gray-700">{formatDate(parcel.createdAt)}</p>
                        <p className="text-xs text-amber-600 font-semibold mt-1">View Details →</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && parcels.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Your Statistics</h2>
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
                  ৳{parcels.reduce((sum, p) => sum + (p.price || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Spent</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
