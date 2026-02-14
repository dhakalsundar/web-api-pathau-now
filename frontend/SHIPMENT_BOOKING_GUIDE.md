# Shipment Booking Form & Toast Notifications

## Overview

This system provides:
1. **ShipmentBookingForm Component** — Reusable form for booking shipments
2. **Toast Notification System** — Non-intrusive alerts for success/error/info messages
3. **Auto-calculated Pricing** — Automatic price calculation based on weight

## Files Created

- [app/components/ShipmentBookingForm.tsx](app/components/ShipmentBookingForm.tsx) — Form component
- [app/context/ToastContext.tsx](app/context/ToastContext.tsx) — Toast context & provider
- [app/components/ToastContainer.tsx](app/components/ToastContainer.tsx) — Toast display component
- [app/booking/page.tsx](app/booking/page.tsx) — Updated booking page (simplified)
- [app/layout.tsx](app/layout.tsx) — Updated with ToastProvider

## Quick Start

### 1. Using the Booking Form in a Page

```tsx
'use client';

import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';

export default function BookingPage() {
  return (
    <div>
      <h1>Book a Shipment</h1>
      <ShipmentBookingForm />
    </div>
  );
}
```

### 2. Using Toast Notifications

```tsx
'use client';

import { useToast } from '@/app/context/ToastContext';

export default function MyComponent() {
  const { addToast } = useToast();

  const handleAction = () => {
    try {
      // Do something
      addToast('Action completed!', 'success');
    } catch (error) {
      addToast('Something went wrong', 'error');
    }
  };

  return (
    <button onClick={handleAction}>Do Action</button>
  );
}
```

## ShipmentBookingForm Props

```tsx
interface ShipmentBookingFormProps {
  onSuccess?: (trackingNumber: string) => void;
  redirectToTracking?: boolean;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSuccess` | `(trackingNumber: string) => void` | `undefined` | Callback when shipment is booked |
| `redirectToTracking` | `boolean` | `true` | Auto redirect to tracking page |

## Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Sender Name | text | ✅ | Full name of sender |
| Pickup Address | textarea | ✅ | Detailed pickup location |
| Receiver Name | text | ✅ | Full name of recipient |
| Delivery Address | textarea | ✅ | Detailed delivery location |
| Weight (kg) | number | ✅ | Package weight (0.1+ kg) |
| Price (৳) | number | ✅ | Delivery price |

## Form Behavior

### Auto-Price Calculation
When you enter a weight, the form automatically calculates the price:
```
Calculated Price = Base (৳50) + Weight (kg) × ৳10
```

### Example
- Weight: 2kg
- Calculated Price: ৳50 + (2 × ৳10) = **৳70**

### Custom Price
You can override the calculated price by entering a different value.

## Toast Notifications

### Usage

```tsx
const { addToast } = useToast();

// Success toast (auto-closes after 3 seconds)
addToast('Shipment booked successfully!', 'success');

// Error toast (stays longer - 4 seconds)
addToast('Failed to book shipment', 'error', 4000);

// Info toast
addToast('Please note: Delivery takes 2-3 days', 'info');

// Warning toast
addToast('Weight exceeds limit', 'warning', 5000);

// No auto-close
addToast('Important message', 'info', 0);
```

### Toast Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `success` | ✅ | Green | Successful operations |
| `error` | ❌ | Red | Errors/failures |
| `warning` | ⚠️ | Yellow | Warnings/cautions |
| `info` | ℹ️ | Blue | Information |

### Toast Duration

```tsx
// 3000ms (default)
addToast('Message', 'success');

// Custom duration (milliseconds)
addToast('Message', 'success', 5000);

// No auto-close (stays until user closes)
addToast('Message', 'info', 0);
```

## Complete Example

### Create a Shipment Booking Page

**File:** `app/shipment-booking/page.tsx`

```tsx
'use client';

import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';
import { useToast } from '@/app/context/ToastContext';
import Navbar from '@/app/components/Navbar';

export default function ShipmentBookingPage() {
  const { addToast } = useToast();

  const handleBookingSuccess = (trackingNumber: string) => {
    console.log('Shipment booked with tracking:', trackingNumber);
    // Additional logic if needed
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📦 Book Shipment</h1>
          <p className="text-gray-600 mt-2">Quick and easy shipment booking</p>
        </div>

        <ShipmentBookingForm
          onSuccess={handleBookingSuccess}
          redirectToTracking={true}
        />
      </div>
    </main>
  );
}
```

## Form Validation

The form validates all required fields:

```
✅ Sender Name — Required, non-empty
✅ Pickup Address — Required, non-empty
✅ Receiver Name — Required, non-empty
✅ Delivery Address — Required, non-empty
✅ Weight — Required, must be > 0
✅ Price — Required, must be > 0
```

### Error Handling

If validation fails, a toast notification appears:

```
❌ Please enter sender name
❌ Please enter valid weight
❌ Please enter valid price
```

## API Integration

The form makes a POST request to `/api/shipments`:

```tsx
POST /api/shipments
{
  "sender": {
    "name": "John Doe",
    "address": "Dhaka, Bangladesh"
  },
  "recipient": {
    "name": "Jane Smith",
    "address": "Chattogram, Bangladesh"
  },
  "weight": 2.5,
  "price": 75
}
```

Expected response:
```json
{
  "success": true,
  "data": {
    "trackingNumber": "PTH-20260214-ABCD"
  }
}
```

## Error Handling

### API Errors

If the API request fails:

```tsx
{
  "response": {
    "data": {
      "message": "Unsupported area",
      "error": "Delivery address not serviceable"
    }
  }
}
```

Error toast will show:
```
❌ Error: Unsupported area
```

### Network Errors

If network fails:
```
❌ Error: Network error
```

## Styling & Customization

### Form Container
```tsx
className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 max-w-2xl"
```

### Input Fields
```tsx
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
```

### Submit Button
```tsx
className="w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold text-lg rounded-lg"
```

### Toast Position
Toast notifications appear in **bottom-right corner** with fixed positioning (z-index: 50)

## Use Cases

### 1. Standalone Booking Page
```tsx
export default function Page() {
  return <ShipmentBookingForm />;
}
```

### 2. Embedded in Dashboard
```tsx
export default function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h2>Quick Booking</h2>
        <ShipmentBookingForm redirectToTracking={false} />
      </div>
      <div>Other content...</div>
    </div>
  );
}
```

### 3. With Custom Callback
```tsx
export default function Page() {
  const handleSuccess = (trackingNumber: string) => {
    // Send email notification
    sendNotification(trackingNumber);
    // Track analytics
    trackEvent('shipment_booked', { trackingNumber });
  };

  return (
    <ShipmentBookingForm
      onSuccess={handleSuccess}
      redirectToTracking={true}
    />
  );
}
```

## State Management

### Form State
The form uses React `useState` for:
- Form data (sender, receiver, weight, price)
- Loading state during submission
- Validation errors

### Toast State
Managed by `ToastContext`:
- Toast list
- Auto-remove on duration expiry
- Manual removal via close button

## Performance

- **No external dependencies** for form or toast (except axios for API)
- **Lightweight** animations (CSS transitions, not JavaScript animations)
- **Optimized re-renders** (form isolates state)
- **Async API calls** (doesn't block UI)

## Troubleshooting

### Toast not showing
```
✅ Check if ToastProvider is in root layout
✅ Check if ToastContainer is rendered
✅ Check browser console for errors
```

### Form not submitting
```
✅ Check if all required fields are filled
✅ Check if API endpoint is correct (/api/shipments)
✅ Check browser network tab for request/response
✅ Check API response includes trackingNumber
```

### Price not calculating
```
✅ Enter valid weight (e.g., 2 or 2.5)
✅ Price calculation formula: ৳50 + (weight × ৳10)
✅ Can be overridden manually
```

### Not redirecting to tracking
```
✅ Check if redirectToTracking prop is true (default)
✅ Check if tracking page exists at /track/[trackingNumber]
✅ Check if trackingNumber is returned from API
```

## API Requirements

Your `/api/shipments` endpoint should:

1. **Accept** POST request with shipment data
2. **Validate** all required fields
3. **Return** response with tracking number:
   ```json
   {
     "success": true,
     "data": {
       "trackingNumber": "PTH-20260214-XXXX"
     }
   }
   ```

4. **Handle errors** by returning proper HTTP status + error message:
   ```json
   {
     "success": false,
     "message": "Delivery area not serviceable"
   }
   ```

## Related Files

- [app/components/ShipmentBookingForm.tsx](app/components/ShipmentBookingForm.tsx) — Main form component
- [app/context/ToastContext.tsx](app/context/ToastContext.tsx) — Toast state management
- [app/components/ToastContainer.tsx](app/components/ToastContainer.tsx) — Toast display
- [app/booking/page.tsx](app/booking/page.tsx) — Example usage

## Next Steps

1. ✅ Use `<ShipmentBookingForm />` in booking page
2. ✅ Use `useToast()` in other components
3. ✅ Test form submission with API
4. ✅ Customize styling as needed
5. ✅ Add more toast notifications throughout app

---

**Quick Reference:**

```tsx
// In any 'use client' component:
import { useToast } from '@/app/context/ToastContext';

const { addToast } = useToast();
addToast('Success!', 'success');
```

```tsx
// In any page:
import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';

export default function Page() {
  return <ShipmentBookingForm />;
}
```
