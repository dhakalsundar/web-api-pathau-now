# Shipment Booking & Toast Examples

Quick copy-paste examples for common scenarios.

## Example 1: Basic Booking Page

**File:** `app/booking/page.tsx`

```tsx
'use client';

import Navbar from '@/app/components/Navbar';
import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Book Your Shipment</h1>
        <p className="text-gray-600 mb-8">Fast, reliable delivery service</p>
        <ShipmentBookingForm />
      </div>
    </main>
  );
}
```

**Result:** Simple, clean booking page ✅

---

## Example 2: With Custom Callback

```tsx
'use client';

import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';
import { useToast } from '@/app/context/ToastContext';

export default function BookingPage() {
  const { addToast } = useToast();

  const handleSuccess = (trackingNumber: string) => {
    // Send tracking info to user's email
    console.log('Shipment booked:', trackingNumber);
    
    // Could integrate email service here
    // sendTrackingEmail(userEmail, trackingNumber);
    
    // Could track analytics
    // analytics.track('shipment_booked', { trackingNumber });
  };

  return (
    <ShipmentBookingForm
      onSuccess={handleSuccess}
      redirectToTracking={true}
    />
  );
}
```

**Result:** Hooks into booking success, can perform additional actions ✅

---

## Example 3: Dashboard with Quick Booking

```tsx
'use client';

import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';
import { useAuth } from '@/app/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.firstName}!</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Quick Booking Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📦 Quick Booking</h2>
          <ShipmentBookingForm redirectToTracking={false} />
        </div>

        {/* Other Dashboard Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Shipments</h2>
          <p className="text-gray-600">Your shipments appear here...</p>
        </div>
      </div>
    </div>
  );
}
```

**Result:** Embedded form in dashboard without full page redirect ✅

---

## Example 4: Using Toast Notifications

**File:** `app/components/MyComponent.tsx`

```tsx
'use client';

import { useToast } from '@/app/context/ToastContext';
import { useState } from 'react';

export default function MyComponent() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToast('✅ Action completed successfully!', 'success');
    } catch (error) {
      addToast('❌ Something went wrong', 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      {loading ? 'Processing...' : 'Click Me'}
    </button>
  );
}
```

**Result:** Component with toast notifications ✅

---

## Example 5: All Toast Types

```tsx
'use client';

import { useToast } from '@/app/context/ToastContext';

export default function ToastExamples() {
  const { addToast } = useToast();

  return (
    <div className="flex gap-4">
      <button
        onClick={() => addToast('Operation successful!', 'success')}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Success Toast
      </button>

      <button
        onClick={() => addToast('An error occurred', 'error', 4000)}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Error Toast
      </button>

      <button
        onClick={() => addToast('Important information', 'info')}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Info Toast
      </button>

      <button
        onClick={() => addToast('Please be careful', 'warning')}
        className="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        Warning Toast
      </button>

      <button
        onClick={() => addToast('This message stays open', 'info', 0)}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Hold Open
      </button>
    </div>
  );
}
```

**Result:** Demonstrates all toast types and durations ✅

---

## Example 6: Form with Validation Toasts

```tsx
'use client';

import { useToast } from '@/app/context/ToastContext';
import { useState } from 'react';

export default function RegistrationForm() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email.includes('@')) {
      addToast('Invalid email address', 'error');
      return;
    }

    if (formData.password.length < 8) {
      addToast('Password must be at least 8 characters', 'warning');
      return;
    }

    addToast('Registration successful!', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        className="w-full px-4 py-2 border rounded"
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        className="w-full px-4 py-2 border rounded"
      />
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded"
      >
        Register
      </button>
    </form>
  );
}
```

**Result:** Form with inline validation feedback ✅

---

## Example 7: Admin Panel Quick Booking

**File:** `app/admin/quick-book/page.tsx`

```tsx
'use client';

import { withAdminProtection } from '@/app/hoc/withRoleProtection';
import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';
import { useToast } from '@/app/context/ToastContext';

function QuickBookPage() {
  const { addToast } = useToast();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">⚡ Quick Booking</h1>
        <p className="text-gray-600 mt-2">Fast shipment booking for customers</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <p className="text-blue-800">ℹ️ Use this tool to quickly book shipments and track them in real-time.</p>
      </div>

      <ShipmentBookingForm />
    </div>
  );
}

export default withAdminProtection(QuickBookPage);
```

**Result:** Admin-only quick booking page ✅

---

## Example 8: Multi-Step Booking Process

```tsx
'use client';

import ShipmentBookingForm from '@/app/components/ShipmentBookingForm';
import { useToast } from '@/app/context/ToastContext';
import { useState } from 'react';

export default function MultiStepBooking() {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState(null);

  const handleSuccess = (trackingNumber: string) => {
    setBookingData({ trackingNumber });
    setStep(3);
    addToast('Booking complete! Redirecting to tracking...', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        <div className={`flex-1 text-center pb-2 ${step >= 1 ? 'border-b-4 border-amber-500 font-bold' : 'border-b-2 border-gray-300'}`}>
          Step 1: Details
        </div>
        <div className={`flex-1 text-center pb-2 ${step >= 2 ? 'border-b-4 border-amber-500 font-bold' : 'border-b-2 border-gray-300'}`}>
          Step 2: Confirm
        </div>
        <div className={`flex-1 text-center pb-2 ${step >= 3 ? 'border-b-4 border-amber-500 font-bold' : 'border-b-2 border-gray-300'}`}>
          Step 3: Done
        </div>
      </div>

      {/* Form */}
      {step === 1 && (
        <ShipmentBookingForm
          onSuccess={handleSuccess}
          redirectToTracking={false}
        />
      )}

      {/* Success */}
      {step === 3 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-8 text-center">
          <p className="text-3xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Booking Complete!</h2>
          <p className="text-green-600">Tracking Number: {bookingData?.trackingNumber}</p>
        </div>
      )}
    </div>
  );
}
```

**Result:** Multi-step booking experience ✅

---

## Example 9: Conditional Toast Messages

```tsx
'use client';

import { useToast } from '@/app/context/ToastContext';
import { useState } from 'react';

export default function SmartNotifications() {
  const { addToast } = useToast();
  const [status, setStatus] = useState('idle');

  const performAction = async () => {
    setStatus('loading');
    addToast('Processing your request...', 'info');

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Random success/failure
          Math.random() > 0.3 ? resolve(null) : reject(new Error('API Error'));
        }, 2000);
      });

      setStatus('success');
      addToast('✅ Request processed successfully!', 'success', 3000);
    } catch (error) {
      setStatus('error');
      addToast('❌ Request failed. Please try again.', 'error', 5000);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={performAction}
        disabled={status === 'loading'}
        className={`px-6 py-3 text-white rounded-lg font-bold ${
          status === 'idle' ? 'bg-blue-500 hover:bg-blue-600' :
          status === 'loading' ? 'bg-gray-400 cursor-not-allowed' :
          status === 'success' ? 'bg-green-500' :
          'bg-red-500'
        }`}
      >
        {status === 'idle' ? 'Start' : 
         status === 'loading' ? 'Processing...' :
         status === 'success' ? 'Done!' :
         'Failed'}
      </button>
    </div>
  );
}
```

**Result:** Smart status-based toasts ✅

---

## Example 10: Toast with Long Messages

```tsx
'use client';

import { useToast } from '@/app/context/ToastContext';

export default function LongMessageExample() {
  const { addToast } = useToast();

  return (
    <button
      onClick={() => addToast(
        'This is a longer message that explains more details about what happened with the operation. It will wrap nicely in the toast container.',
        'info',
        5000
      )}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Show Long Toast
    </button>
  );
}
```

**Result:** Multi-line toast messages ✅

---

## Copy-Paste Checklist

- [x] `<ShipmentBookingForm />` in booking pages
- [x] `useToast()` in action buttons
- [x] `'use client'` directive in client components
- [x] Toast messages for all async operations
- [x] Form redirects to tracking page automatically
- [x] Custom durations for different toast types
- [x] Error handling with user-friendly messages

---

## Integration Checklist

Before deploying:

- [ ] Test form submission with real API
- [ ] Verify tracking redirect works
- [ ] Check toast notifications appear
- [ ] Test error scenarios
- [ ] Verify form validation messages
- [ ] Check mobile responsiveness
- [ ] Test page load performance
- [ ] Verify accessibility (keyboard navigation, screen readers)
