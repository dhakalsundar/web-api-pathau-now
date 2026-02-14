'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { riderService, shipmentService } from '@/app/lib/services';

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: string;
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
  price: number;
  weight?: number;
  parcelType?: string;
  deliveryType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  events?: Array<{
    status: string;
    message?: string;
    location?: string;
    timestamp: string;
  }>;
}

export default function DeliveryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (shipmentId) {
      fetchShipmentDetails();
    }
  }, [shipmentId]);

  const fetchShipmentDetails = async () => {
    try {
      console.log('📦 Fetching shipment details:', shipmentId);
      setLoading(true);

      const response = await riderService.getMyAssignedShipments({
        page: 1,
        limit: 1,
      });

      // Find the specific shipment
      const shipments = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      const foundShipment = shipments.find((s: any) => s._id === shipmentId);

      if (!foundShipment) {
        setError('Shipment not found or you do not have permission to view it');
        return;
      }

      setShipment(foundShipment);
      setSelectedStatus(foundShipment.status);
      setError('');
    } catch (err: any) {
      console.error('❌ Error fetching shipment:', err);
      setError(err.response?.data?.message || 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      setError('Please select a status');
      return;
    }

    try {
      setUpdating(true);
      setError('');

      console.log('🔄 Updating status to:', selectedStatus);

      await shipmentService.updateShipmentStatus(
        shipmentId,
        selectedStatus,
        statusMessage || undefined
      );

      setSuccess(`✅ Status updated to ${selectedStatus.replace('_', ' ')}`);

      // Refresh shipment data
      await fetchShipmentDetails();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-indigo-100 text-indigo-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return '🛑';
      default:
        return '❓';
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

  const getNextPossibleStatuses = (currentStatus: string) => {
    const statusFlow: Record<string, string[]> = {
      PENDING: ['PICKED_UP'],
      PICKED_UP: ['IN_TRANSIT', 'FAILED'],
      IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
      DELIVERED: [],
      FAILED: [],
      CANCELLED: [],
    };

    return statusFlow[currentStatus] || [];
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Loading delivery details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!shipment) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/rider/deliveries" className="text-green-600 hover:text-green-700 mb-4 inline-block">
            ← Back to Deliveries
          </Link>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <p className="text-red-700 font-semibold">{error || 'Shipment not found'}</p>
          </div>
        </div>
      </main>
    );
  }

  const nextStatuses = getNextPossibleStatuses(shipment.status);
  const isDeliveryComplete = ['DELIVERED', 'FAILED', 'CANCELLED'].includes(shipment.status);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/rider/deliveries" className="text-green-600 hover:text-green-700 mb-4 inline-block">
            ← Back to Deliveries
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📦 Delivery Details
              </h1>
              <p className="text-gray-600">
                Tracking: <span className="font-mono font-bold text-green-600">{shipment.trackingNumber}</span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(shipment.status)}`}>
              <span className="mr-2">{getStatusIcon(shipment.status)}</span>
              {shipment.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sender Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📤 Sender Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">NAME</p>
                  <p className="text-lg font-semibold text-gray-900">{shipment.sender.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">ADDRESS</p>
                  <p className="text-gray-700">{shipment.sender.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">PHONE</p>
                    <p className="text-gray-700">{shipment.sender.phoneNumber}</p>
                  </div>
                  {shipment.sender.email && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">EMAIL</p>
                      <p className="text-gray-700">{shipment.sender.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📥 Recipient Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">NAME</p>
                  <p className="text-lg font-semibold text-gray-900">{shipment.recipient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">ADDRESS</p>
                  <p className="text-gray-700">{shipment.recipient.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">PHONE</p>
                    <p className="text-gray-700">{shipment.recipient.phoneNumber}</p>
                  </div>
                  {shipment.recipient.email && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">EMAIL</p>
                      <p className="text-gray-700">{shipment.recipient.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Parcel Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Parcel Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {shipment.weight && (
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">WEIGHT</p>
                    <p className="text-lg font-semibold text-gray-900">{shipment.weight} kg</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">PRICE</p>
                  <p className="text-lg font-semibold text-gray-900">৳{shipment.price}</p>
                </div>
                {shipment.parcelType && (
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">TYPE</p>
                    <p className="text-lg font-semibold text-gray-900">{shipment.parcelType}</p>
                  </div>
                )}
                {shipment.deliveryType && (
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">DELIVERY</p>
                    <p className="text-lg font-semibold text-gray-900">{shipment.deliveryType}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">CREATED</p>
                  <p className="text-sm text-gray-700">{formatDate(shipment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">UPDATED</p>
                  <p className="text-sm text-gray-700">{formatDate(shipment.updatedAt)}</p>
                </div>
              </div>
              {shipment.notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-700 font-semibold mb-1">NOTES</p>
                  <p className="text-blue-900">{shipment.notes}</p>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            {shipment.events && shipment.events.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Status Timeline</h2>
                <div className="space-y-4">
                  {shipment.events.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{getStatusIcon(event.status)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{event.status.replace('_', ' ')}</p>
                        {event.message && (
                          <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                        )}
                        {event.location && (
                          <p className="text-sm text-gray-600">📍 {event.location}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Status Update */}
          {!isDeliveryComplete && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔄 Update Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Next Status
                  </label>
                  {nextStatuses.length > 0 ? (
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={shipment.status}>
                        {shipment.status} (Current)
                      </option>
                      {nextStatuses.map((status) => (
                        <option key={status} value={status}>
                          {getStatusIcon(status)} {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded text-gray-700 text-sm">
                      This delivery is complete. No further status updates possible.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="Add any notes about this status update..."
                    disabled={isDeliveryComplete}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || isDeliveryComplete || selectedStatus === shipment.status}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                    updating || isDeliveryComplete || selectedStatus === shipment.status
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {updating ? '⏳ Updating...' : '🔄 Update Status'}
                </button>
              </div>

              {/* Delivery Stats */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2">💡 Tip</p>
                <p className="text-xs text-green-800">
                  Update the status as you progress through the delivery process. This helps
                  the customer track their parcel in real-time.
                </p>
              </div>
            </div>
          )}

          {/* Delivery Complete Card */}
          {isDeliveryComplete && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {shipment.status === 'DELIVERED' ? '✅' : '❌'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {shipment.status === 'DELIVERED' ? 'Delivery Complete' : 'Delivery Not Completed'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {shipment.status === 'DELIVERED'
                    ? 'This parcel has been successfully delivered.'
                    : 'This delivery cannot be modified.'}
                </p>
                <Link
                  href="/rider/deliveries"
                  className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  Back to Deliveries
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
