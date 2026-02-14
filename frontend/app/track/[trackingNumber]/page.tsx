'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import Timeline from '@/app/components/Timeline';
import LoadingSkeleton from '@/app/components/LoadingSkeleton';
import RiderInfoCard from '@/app/components/RiderInfoCard';
import { shipmentService } from '@/app/lib/services';
import Link from 'next/link';

export default function TrackPage() {
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        const response = await shipmentService.trackShipment(trackingNumber);
        setShipment(response.data);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Shipment not found');
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchShipment();
    }
  }, [trackingNumber]);

  const statusColors: { [key: string]: string } = {
    CREATED: 'bg-gray-100 text-gray-700 border-gray-300',
    ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-300',
    PICKED: 'bg-blue-100 text-blue-700 border-blue-300',
    IN_TRANSIT: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700 border-orange-300',
    DELIVERED: 'bg-green-100 text-green-700 border-green-300',
    FAILED: 'bg-red-100 text-red-700 border-red-300',
    CANCELLED: 'bg-purple-100 text-purple-700 border-purple-300'
  };

  const statusEmojis: { [key: string]: string } = {
    CREATED: '📦',
    ASSIGNED: '🎯',
    PICKED: '✅',
    IN_TRANSIT: '🚚',
    OUT_FOR_DELIVERY: '🚲',
    DELIVERED: '✅',
    FAILED: '❌',
    CANCELLED: '🛑'
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      CREATED: 'Pending',
      ASSIGNED: 'Assigned',
      PICKED: 'Picked Up',
      IN_TRANSIT: 'In Transit',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      FAILED: 'Failed',
      CANCELLED: 'Cancelled'
    };
    return statusMap[status] || status.replace('_', ' ');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {loading && (
          <LoadingSkeleton />
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-8 text-center my-8">
            <p className="text-2xl text-red-600 font-bold mb-2">❌ Shipment Not Found</p>
            <p className="text-red-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        )}

        {!loading && shipment && !error && (
          <div className="space-y-8">
            {/* Shipment Header Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm opacity-80">Tracking Number</p>
                    <h1 className="text-3xl font-bold">{shipment.trackingNumber}</h1>
                  </div>
                  <div className={`px-6 py-3 rounded-lg border-2 font-bold text-center ${statusColors[shipment.status] || statusColors.CREATED}`}>
                    {statusEmojis[shipment.status]} {getStatusDisplay(shipment.status)}
                  </div>
                </div>
              </div>

              {/* Shipment Details Grid */}
              <div className="p-8">
                {/* Row 1: Sender & Recipient */}
                <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2">
                      <span>👤</span> Sender
                    </p>
                    <div className="space-y-1 bg-gray-50 p-4 rounded-lg">
                      <p className="font-bold text-gray-900">{shipment.sender?.name || 'N/A'}</p>
                      {shipment.sender?.phone && (
                        <p className="text-sm text-gray-600">📞 {shipment.sender.phone}</p>
                      )}
                      <p className="text-sm text-gray-600">📍 {shipment.sender?.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2">
                      <span>🎯</span> Recipient
                    </p>
                    <div className="space-y-1 bg-gray-50 p-4 rounded-lg">
                      <p className="font-bold text-gray-900">{shipment.recipient?.name || 'N/A'}</p>
                      {shipment.recipient?.phone && (
                        <p className="text-sm text-gray-600">📞 {shipment.recipient.phone}</p>
                      )}
                      <p className="text-sm text-gray-600">📍 {shipment.recipient?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Parcel & Payment Details */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2">
                      <span>📦</span> Parcel Details
                    </p>
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                      {shipment.weight && (
                        <p className="text-sm">
                          <span className="text-gray-600">Weight:</span> <span className="font-bold">{shipment.weight} kg</span>
                        </p>
                      )}
                      {shipment.price && (
                        <p className="text-sm">
                          <span className="text-gray-600">Price:</span> <span className="font-bold text-green-600">৳{shipment.price}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2">
                      <span>💳</span> Payment Status
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p
                        className={`font-bold px-3 py-1 rounded text-center ${
                          shipment.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {shipment.paymentStatus || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2">
                      <span>📅</span> Booking Date
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-bold text-gray-900">
                        {new Date(shipment.createdAt).toLocaleDateString()} <br />
                        <span className="text-sm text-gray-600">{new Date(shipment.createdAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Component */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
              <Timeline events={shipment.events || []} currentStatus={shipment.status} />
            </div>

            {/* Additional Info Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Rider Information */}
              {shipment.rider || shipment.riderId ? (
                <RiderInfoCard rider={shipment.rider} shipmentStatus={shipment.status} />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🎯</span> Rider Information
                  </h3>
                  <p className="text-gray-500 text-center py-6">No rider assigned yet</p>
                </div>
              )}

              {/* Additional Notes */}
              <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📝</span> Additional Notes
                </h3>
                <p className="text-gray-600">
                  {shipment.notes || 'No additional notes for this shipment.'}
                </p>

                {/* Status Updates Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Status Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-semibold text-gray-900">
                        {shipment.updatedAt
                          ? new Date(shipment.updatedAt).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Status</span>
                      <span className="font-semibold text-gray-900">{getStatusDisplay(shipment.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center pb-8">
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                ← Track Another Parcel
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-sm">
          <p>&copy; 2024 Path auNow. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
