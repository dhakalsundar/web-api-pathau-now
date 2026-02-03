'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import Timeline from '@/app/components/Timeline';
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
    PENDING: 'bg-gray-100 text-gray-700 border-gray-300',
    PICKED_UP: 'bg-blue-100 text-blue-700 border-blue-300',
    IN_TRANSIT: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700 border-orange-300',
    DELIVERED: 'bg-green-100 text-green-700 border-green-300',
    FAILED: 'bg-red-100 text-red-700 border-red-300',
    CANCELLED: 'bg-purple-100 text-purple-700 border-purple-300'
  };

  const statusEmojis: { [key: string]: string } = {
    PENDING: '📦',
    PICKED_UP: '🎯',
    IN_TRANSIT: '🚚',
    OUT_FOR_DELIVERY: '🚲',
    DELIVERED: '✅',
    FAILED: '❌',
    CANCELLED: '🛑'
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">⏳ Loading tracking information...</p>
          </div>
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-80">Tracking Number</p>
                    <h1 className="text-3xl font-bold">{shipment.trackingNumber}</h1>
                  </div>
                  <div className={`px-6 py-3 rounded-lg border-2 font-bold ${statusColors[shipment.status] || statusColors.PENDING}`}>
                    {statusEmojis[shipment.status]} {shipment.status?.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Shipment Details Grid */}
              <div className="p-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Sender</p>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">{shipment.sender?.name}</p>
                    <p className="text-sm text-gray-600">{shipment.sender?.phone}</p>
                    <p className="text-sm text-gray-600">{shipment.sender?.address}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Recipient</p>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">{shipment.recipient?.name}</p>
                    <p className="text-sm text-gray-600">{shipment.recipient?.phone}</p>
                    <p className="text-sm text-gray-600">{shipment.recipient?.address}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Parcel Details</p>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-gray-600">Weight:</span> <span className="font-bold">{shipment.weight} kg</span></p>
                    <p className="text-sm"><span className="text-gray-600">Type:</span> <span className="font-bold">{shipment.deliveryType}</span></p>
                    <p className="text-sm"><span className="text-gray-600">Price:</span> <span className="font-bold text-green-600">৳{shipment.price}</span></p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Payment Status</p>
                  <div className="space-y-1">
                    <p className={`font-bold px-3 py-1 rounded text-center ${shipment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {shipment.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
              <Timeline events={shipment.events || []} currentStatus={shipment.status} />
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Courier Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Courier</span>
                    <span className="font-semibold text-gray-900">{shipment.courier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booked On</span>
                    <span className="font-semibold text-gray-900">{new Date(shipment.createdAt).toLocaleDateString()}</span>
                  </div>
                  {shipment.riderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned Rider</span>
                      <span className="font-semibold text-gray-900">Rider ID: {shipment.riderId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Notes</h3>
                <p className="text-gray-600">
                  {shipment.notes || 'No additional notes for this shipment.'}
                </p>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center">
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
          <p>&copy; 2024 PathauNow. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
