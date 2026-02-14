'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  events?: Array<{
    status: string;
    message?: string;
    location?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function TrackParcelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('id')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSearched(true);

      // Search for shipment by tracking number
      const response = await shipmentService.getShipmentById(trackingId);
      setShipment(response.data);
    } catch (err: any) {
      console.error('Failed to track parcel:', err);
      setError(
        err.response?.data?.message || 'Parcel not found. Please check the tracking ID.'
      );
      setShipment(null);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'PICKED_UP':
        return '📦';
      case 'IN_TRANSIT':
        return '🚚';
      case 'OUT_FOR_DELIVERY':
        return '🏃';
      case 'DELIVERED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'CANCELLED':
        return '❌';
      default:
        return '❓';
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 Track Parcel</h1>
        <p className="text-gray-600">Enter your tracking ID to view the status and history</p>
      </div>

      {/* Search Form */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter tracking ID (e.g., TRK-20260214-001)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold disabled:bg-gray-400"
          >
            {loading ? '⏳ Tracking...' : '🔍 Track'}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      {shipment ? (
        <div className="space-y-8">
          {/* Parcel Header Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow p-8 border border-amber-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left - Parcel Info */}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">TRACKING ID</p>
                <p className="text-2xl font-bold text-amber-900 font-mono mb-6">{shipment.trackingNumber}</p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">STATUS</p>
                    <span
                      className={`inline-block mt-1 px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                        shipment.status
                      )}`}
                    >
                      {getStatusIcon(shipment.status)} {shipment.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">PARCEL TYPE</p>
                    <p className="text-lg mt-1">
                      {getParcelTypeIcon(shipment.parcelType)} {shipment.parcelType || 'PARCEL'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">DELIVERY TYPE</p>
                    <p className="text-gray-900 font-semibold mt-1">{shipment.deliveryType || 'STANDARD'}</p>
                  </div>
                </div>
              </div>

              {/* Right - Price & Date */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">PRICE</p>
                  <p className="text-4xl font-bold text-amber-900 mb-6">৳{shipment.price}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">BOOKED ON</p>
                    <p className="text-gray-900 font-semibold mt-1">{formatDate(shipment.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">WEIGHT</p>
                    <p className="text-gray-900 font-semibold mt-1">{shipment.weight || 'N/A'} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📤 From (Sender)</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-gray-900 font-semibold">{shipment.sender.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900">{shipment.sender.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-semibold">{shipment.sender.phoneNumber}</p>
                </div>
                {shipment.sender.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{shipment.sender.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* To */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📥 To (Recipient)</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-gray-900 font-semibold">{shipment.recipient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900">{shipment.recipient.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-semibold">{shipment.recipient.phoneNumber}</p>
                </div>
                {shipment.recipient.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{shipment.recipient.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">📍 Journey Timeline</h3>

            {shipment.events && shipment.events.length > 0 ? (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-8 bottom-0 w-1 bg-gray-200"></div>

                {/* Timeline Events */}
                <div className="space-y-6">
                  {shipment.events.map((event: any, index: number) => (
                    <div key={index} className="flex gap-6 relative">
                      {/* Timeline Dot */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full text-2xl relative z-10">
                          {getStatusIcon(event.status)}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 pt-2">
                        <p className="font-bold text-gray-900">{event.status?.replace(/_/g, ' ')}</p>
                        {event.message && (
                          <p className="text-gray-600 text-sm mt-1">{event.message}</p>
                        )}
                        {event.location && (
                          <p className="text-gray-600 text-sm mt-1">📍 {event.location}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">{formatDate(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No tracking history available yet</p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex gap-4">
            <Link
              href="/user/parcels"
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold text-center"
            >
              📋 View All Parcels
            </Link>
            <button
              onClick={() => {
                setShipment(null);
                setTrackingId('');
                setError('');
                setSearched(false);
              }}
              className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
            >
              🔍 Track Another
            </button>
          </div>
        </div>
      ) : searched && !loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-xl text-gray-600 mb-2">No parcel found</p>
          <p className="text-gray-500 mb-6">Please check your tracking ID and try again</p>
          <Link
            href="/user/parcels"
            className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
          >
            📋 View My Parcels
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-lg text-gray-600">Enter a tracking ID above to get started</p>
        </div>
      )}
    </div>
  );
}
