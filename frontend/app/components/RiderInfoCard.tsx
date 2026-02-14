'use client';

/**
 * RiderInfoCard Component
 * Displays detailed rider information for assigned shipments
 */
interface RiderInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  rating?: number;
  totalDeliveries?: number;
  vehicleType?: string;
  vehicleNumber?: string;
  currentLocation?: string;
}

interface RiderInfoCardProps {
  rider: RiderInfo | null;
  shipmentStatus?: string;
}

export default function RiderInfoCard({ rider, shipmentStatus }: RiderInfoCardProps) {
  if (!rider) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Rider Information</h3>
        <p className="text-gray-500 text-center py-6">No rider assigned yet</p>
      </div>
    );
  }

  const statusColors: { [key: string]: string } = {
    AVAILABLE: 'bg-green-100 text-green-700 border-green-300',
    BUSY: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    OFFLINE: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  const statusEmojis: { [key: string]: string } = {
    AVAILABLE: '✅',
    BUSY: '🚗',
    OFFLINE: '⚠️',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span>🎯</span> Rider Information
        </h3>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Rider Card */}
        <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-3xl flex-shrink-0">
            {rider.avatar ? (
              <img
                src={rider.avatar}
                alt={rider.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>🚚</span>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{rider.name || 'Unknown Rider'}</h4>

            {/* Status Badge */}
            {rider.status && (
              <div className="inline-block">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    statusColors[rider.status] || statusColors.OFFLINE
                  }`}
                >
                  {statusEmojis[rider.status] || '?'} {rider.status}
                </span>
              </div>
            )}

            {/* Rating */}
            {rider.rating && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold text-gray-900">{rider.rating.toFixed(1)}</span>
                <span className="text-gray-600">rating</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
          <h5 className="font-bold text-gray-900">Contact Information</h5>

          {rider.phone && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">📞 Phone</span>
              <a
                href={`tel:${rider.phone}`}
                className="font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                {rider.phone}
              </a>
            </div>
          )}

          {rider.email && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">✉️ Email</span>
              <a
                href={`mailto:${rider.email}`}
                className="font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                {rider.email}
              </a>
            </div>
          )}
        </div>

        {/* Vehicle Information */}
        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
          <h5 className="font-bold text-gray-900">Vehicle Information</h5>

          {rider.vehicleType && (
            <div className="flex justify-between">
              <span className="text-gray-600">🚙 Vehicle Type</span>
              <span className="font-semibold text-gray-900">{rider.vehicleType}</span>
            </div>
          )}

          {rider.vehicleNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">🔢 Registration</span>
              <span className="font-semibold text-gray-900">{rider.vehicleNumber}</span>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className="space-y-4">
          <h5 className="font-bold text-gray-900">Performance Stats</h5>

          {rider.totalDeliveries && (
            <div className="flex justify-between">
              <span className="text-gray-600">📦 Total Deliveries</span>
              <span className="font-semibold text-gray-900">{rider.totalDeliveries}</span>
            </div>
          )}

          {rider.currentLocation && (
            <div className="flex justify-between">
              <span className="text-gray-600">📍 Current Location</span>
              <span className="font-semibold text-gray-900">{rider.currentLocation}</span>
            </div>
          )}
        </div>

        {/* Status Note */}
        {shipmentStatus === 'OUT_FOR_DELIVERY' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              📍 Your parcel is out for delivery! The rider will reach you soon. Contact the rider using the information above if needed.
            </p>
          </div>
        )}

        {shipmentStatus === 'DELIVERED' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              ✅ Your parcel has been delivered by this rider. Thank you for using our service!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
