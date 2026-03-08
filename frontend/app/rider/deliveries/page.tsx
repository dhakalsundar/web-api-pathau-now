'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { riderService } from '@/app/lib/services';

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  sender: { name: string; address: string; phoneNumber: string };
  recipient: { name: string; address: string; phoneNumber: string };
  price: number;
  weight?: number;
  parcelType?: string;
  deliveryType?: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'assigned' | 'available';

export default function RiderDeliveriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as TabType) || 'available';
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [assigned, setAssigned] = useState<Shipment[]>([]);
  const [available, setAvailable] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch data whenever tab changes or when page is actively viewed
    fetchDeliveries();
    
    // Optionally refresh every 30 seconds to show real-time updates
    const refreshInterval = setInterval(fetchDeliveries, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [filterStatus, activeTab]);

  const fetchDeliveries = async () => {
    try {
      console.log(` Fetching ${activeTab} deliveries...`);
      setLoading(true);

      if (activeTab === 'assigned') {
        const response = await riderService.getMyAssignedParcels({
          page: 1,
          limit: 50,
          status: filterStatus || undefined,
        });
        
        const deliveriesData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        
        setAssigned(deliveriesData);
        console.log(' Assigned deliveries fetched:', deliveriesData.length);
      } else {
        const response = await riderService.getAvailableParcels({
          page: 1,
          limit: 50,
        });
        
        const deliveriesData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        
        setAvailable(deliveriesData);
        console.log(' Available parcels fetched:', deliveriesData.length);
      }
      
      setError('');
    } catch (err: any) {
      console.error(' Error fetching deliveries:', err);
      setError(err.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-200 text-gray-800';
      case 'ASSIGNED':
        return 'bg-green-200 text-green-800';
      case 'PICKED_UP':
        return 'bg-blue-200 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-indigo-200 text-indigo-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-200 text-yellow-800';
      case 'DELIVERED':
        return 'bg-green-200 text-green-800';
      case 'FAILED':
        return 'bg-red-200 text-red-800';
      case 'CANCELLED':
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '';
      case 'PICKED_UP':
        return '';
      case 'IN_TRANSIT':
        return '';
      case 'OUT_FOR_DELIVERY':
        return '';
      case 'DELIVERED':
        return '';
      case 'FAILED':
        return '';
      case 'CANCELLED':
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

  const deliveriesToDisplay = activeTab === 'assigned' ? assigned : available;
  const filteredDeliveries = deliveriesToDisplay.filter((delivery) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      delivery.trackingNumber.toLowerCase().includes(searchLower) ||
      delivery.recipient.name.toLowerCase().includes(searchLower) ||
      delivery.recipient.address.toLowerCase().includes(searchLower)
    );
  });

  const DeliveryCard = ({ delivery, isAvailable }: { delivery: Shipment; isAvailable: boolean }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {delivery.trackingNumber}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(delivery.createdAt)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(delivery.status)}`}>
          {getStatusIcon(delivery.status)} {delivery.status}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pickup From</p>
          <p className="font-semibold text-gray-900">{delivery.sender.name}</p>
          <p className="text-sm text-gray-600">{delivery.sender.address}</p>
          <p className="text-sm text-gray-600"> {delivery.sender.phoneNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Deliver To</p>
          <p className="font-semibold text-gray-900">{delivery.recipient.name}</p>
          <p className="text-sm text-gray-600">{delivery.recipient.address}</p>
          <p className="text-sm text-gray-600"> {delivery.recipient.phoneNumber}</p>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="bg-gray-100 p-2 rounded">
          <p className="text-gray-500">Weight</p>
          <p className="font-semibold">{delivery.weight || 'N/A'} kg</p>
        </div>
        <div className="bg-gray-100 p-2 rounded">
          <p className="text-gray-500">Type</p>
          <p className="font-semibold">{delivery.deliveryType || 'STANDARD'}</p>
        </div>
        <div className="bg-gray-100 p-2 rounded">
          <p className="text-gray-500">Price</p>
          <p className="font-semibold">৳ {delivery.price}</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-2">
        <Link
          href={`/rider/deliveries/${delivery._id}`}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition text-center"
        >
          {isAvailable ? 'View & Accept' : ' View Details'}
        </Link>
        {isAvailable && (
          <button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            onClick={() => {
              setAvailable(available.filter(d => d._id !== delivery._id));
            }}
          >
            ✕ Skip
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2"> My Deliveries</h1>
          <p className="text-gray-600">
            View available parcels to accept or manage your current deliveries
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'available'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
             Available Orders ({available.length})
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'assigned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Deliveries ({assigned.length})
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'assigned' && (
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PICKED_UP"> Picked Up</option>
                  <option value="IN_TRANSIT"> In Transit</option>
                  <option value="OUT_FOR_DELIVERY"> Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="FAILED"> Failed</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchDeliveries}
                  className="w-full px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
                >
                   Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deliveries List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">Loading {activeTab === 'available' ? 'available parcels' : 'deliveries'}...</p>
            </div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'available' ? '' : ''}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'available' ? 'No Available Orders' : 'No Active Deliveries'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'available' 
                ? 'Check back soon for new orders to accept'
                : 'You have completed all your current deliveries'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard 
                key={delivery._id} 
                delivery={delivery} 
                isAvailable={activeTab === 'available'}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
