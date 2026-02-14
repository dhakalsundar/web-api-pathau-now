# Vertical Timeline - Tracking Page Integration Example

This file shows exactly how to integrate the new VerticalTimeline component into your existing tracking page.

---

## Current Implementation

Your tracking page currently looks like this:

```tsx
// Current: app/track/[trackingNumber]/page.tsx
export default function TrackPage() {
  // ... existing code ...
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* ... header, details, etc ... */}
      
      {/* Old Timeline Component */}
      <section>
        <Timeline events={shipment.events} currentStatus={shipment.status} />
      </section>
      
      {/* ... rider info, notes, etc ... */}
    </main>
  );
}
```

---

## Updated Implementation with VerticalTimeline

### Option 1: Replace Timeline Component

```tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import VerticalTimeline from '@/app/components/VerticalTimeline'; // ✨ NEW
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

  // Status colors and emojis (existing code)
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
    return statusMap[status] || status;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {loading && <LoadingSkeleton />}

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
            {/* Header Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{shipment.trackingNumber}</h1>
                    <p className="text-amber-50 mt-2">Track your shipment in real-time</p>
                  </div>
                  <div className={`text-5xl px-6 py-4 rounded-lg ${statusColors[shipment.status]}`}>
                    {statusEmojis[shipment.status]}
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white border-opacity-20 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-amber-50">Current Status</p>
                    <p className="text-xl font-bold">{getStatusDisplay(shipment.status)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-50">Last Updated</p>
                    <p className="text-xl font-bold">
                      {new Date(shipment.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sender & Recipient Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Sender Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  👤 Sender
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{shipment.sender.name}</p>
                  </div>
                  {shipment.sender.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{shipment.sender.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-900">{shipment.sender.address}</p>
                  </div>
                </div>
              </div>

              {/* Recipient Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🎯 Recipient
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{shipment.recipient.name}</p>
                  </div>
                  {shipment.recipient.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{shipment.recipient.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-900">{shipment.recipient.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Parcel Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📦 Parcel
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Weight: <span className="font-semibold text-gray-900">{shipment.weight} kg</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: <span className="font-semibold text-gray-900">৳{shipment.price}</span>
                  </p>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💳 Payment
                </h3>
                <div className={`px-3 py-2 rounded-full inline-block font-semibold ${
                  shipment.paymentStatus === 'PAID'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {shipment.paymentStatus === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                </div>
              </div>

              {/* Booking Date */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📅 Booking
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Date: <span className="font-semibold text-gray-900">
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Time: <span className="font-semibold text-gray-900">
                      {new Date(shipment.createdAt).toLocaleTimeString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* ✨ NEW: Vertical Timeline Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">📍 Tracking History</h2>
              
              {shipment.events && shipment.events.length > 0 ? (
                <VerticalTimeline
                  steps={shipment.events.map((event: any, index: number) => ({
                    id: `event-${index}`,
                    status: event.status,
                    title: event.status.replace(/_/g, ' '),
                    description: event.message,
                    timestamp: event.timestamp,
                    location: event.location,
                    completed: index < shipment.events.length - 1,
                    current: index === shipment.events.length - 1,
                  }))}
                  orientation="center"
                  showConnector={true}
                  animated={true}
                />
              ) : (
                <p className="text-gray-600">No tracking events yet</p>
              )}
            </div>

            {/* Rider & Additional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Rider Card */}
              {shipment.rider || shipment.riderId ? (
                <RiderInfoCard
                  rider={shipment.rider}
                  shipmentStatus={shipment.status}
                />
              ) : (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                  <p className="text-yellow-800 font-semibold">
                    no rider assigned yet. please wait while we find the best rider for you.
                  </p>
                </div>
              )}

              {/* Additional Info / Notes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Additional Info</h3>
                {shipment.notes ? (
                  <p className="text-gray-700">{shipment.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No additional notes</p>
                )}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Status Information</p>
                  <p className="text-sm text-gray-900">
                    {shipment.status === 'DELIVERED'
                      ? 'Your shipment has been successfully delivered!'
                      : shipment.status === 'IN_TRANSIT'
                      ? 'Your shipment is on the way. Sit back and relax!'
                      : shipment.status === 'OUT_FOR_DELIVERY'
                      ? 'Your shipment is out for delivery today!'
                      : 'Your shipment is being processed. Thank you for your patience!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

---

## Key Changes

### 1. New Import
```tsx
import VerticalTimeline from '@/app/components/VerticalTimeline'; // ✨ NEW
```

### 2. Replace Timeline Section
```tsx
// BEFORE: Using old Timeline component
<section>
  <Timeline events={shipment.events} currentStatus={shipment.status} />
</section>

// AFTER: Using new VerticalTimeline component
<div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
  <h2 className="text-2xl font-bold text-gray-900 mb-8">📍 Tracking History</h2>
  
  {shipment.events && shipment.events.length > 0 ? (
    <VerticalTimeline
      steps={shipment.events.map((event: any, index: number) => ({
        id: `event-${index}`,
        status: event.status,
        title: event.status.replace(/_/g, ' '),
        description: event.message,
        timestamp: event.timestamp,
        location: event.location,
        completed: index < shipment.events.length - 1,
        current: index === shipment.events.length - 1,
      }))}
      orientation="center"
      showConnector={true}
      animated={true}
    />
  ) : (
    <p className="text-gray-600">No tracking events yet</p>
  )}
</div>
```

---

## Data Transformation

The component automatically transforms your API events:

```tsx
// Your API event data
{
  status: "IN_TRANSIT",
  message: "Package is on the way",
  timestamp: "2026-02-14T14:30:00Z",
  location: "Dhaka → Chittagong"
}

// Transforms to TimelineStep
{
  id: "event-2",
  status: "IN_TRANSIT",
  title: "IN TRANSIT",
  description: "Package is on the way",
  timestamp: "2026-02-14T14:30:00Z",
  location: "Dhaka → Chittagong",
  completed: false,
  current: true  // Last event is current
}
```

---

## Styling Options

### Default (Recommended)
```tsx
<VerticalTimeline
  steps={steps}
  orientation="center"
/>
```
Best for tracking with detailed information.

### Compact (Left Layout)
```tsx
<VerticalTimeline
  steps={steps}
  orientation="left"
/>
```
Better for narrow layouts.

### Alternative (Right Layout)
```tsx
<VerticalTimeline
  steps={steps}
  orientation="right"
/>
```
Mirror of left layout.

### Minimal (No Connector)
```tsx
<VerticalTimeline
  steps={steps}
  showConnector={false}
/>
```
Cleaner, more minimal look.

---

## What You Get

✅ **Visual Improvements**
- Larger, clearer timeline display
- Current step highlighted with pulse animation
- Better visual hierarchy

✅ **User Experience**
- Smooth animations
- Professional appearance
- Clear status progression
- Easy to understand flow

✅ **Responsive**
- Looks great on mobile
- Works on all screen sizes
- Touch-friendly

✅ **Maintainable**
- Type-safe TypeScript
- Well-documented code
- Easy to customize
- No dependencies

---

## Testing the Integration

1. **Import the component**
   ```tsx
   import VerticalTimeline from '@/app/components/VerticalTimeline';
   ```

2. **Visit a tracking page**
   ```
   http://localhost:3000/track/PTH-20260214-ABCD
   ```

3. **See it in action**
   - Timeline displays vertically
   - Current step pulses with animation
   - All events show with timestamps
   - Responsive on all screen sizes

---

## Optional Customizations

### Change Orientation
```tsx
// Try different orientations
orientation="center"    // Alternating
orientation="left"      // Compact
orientation="right"     // Mirror
```

### Disable Animations
```tsx
animated={false}        // Better performance
```

### Hide Connector
```tsx
showConnector={false}   // Minimal look
```

---

## That's It!

The VerticalTimeline component is ready to use in your tracking page. Just add it where your old Timeline component was.

**Total Time to Integrate:** < 5 minutes

---

## Need Help?

Check the documentation:
- 📚 [VERTICAL_TIMELINE_DOCUMENTATION.md](../VERTICAL_TIMELINE_DOCUMENTATION.md) — Full guide
- ⚡ [VERTICAL_TIMELINE_QUICK_GUIDE.md](../VERTICAL_TIMELINE_QUICK_GUIDE.md) — Quick reference
- 🎨 [timeline-demo page](../timeline-demo) — Live examples

---

**Status:** ✅ Ready to integrate and use!

Happy tracking! 🚀
