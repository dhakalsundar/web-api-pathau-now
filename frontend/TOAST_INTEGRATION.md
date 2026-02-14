# React Hot Toast Integration Guide

## Overview
Global toast notifications are now integrated using `react-hot-toast`. All API calls automatically show success and error notifications. The Toaster component is configured globally in the root layout.

## Usage

### Automatic API Notifications (No Code Changes Needed!)
All POST, PUT, DELETE, and PATCH API calls automatically show success/error toasts:

```typescript
// Automatic success toast if status 200-299
const response = await shipmentService.updateShipmentStatus(id, status);

// Automatic error toast on failure
```

### Manual Toast Usage
You can also manually trigger toasts anywhere in your components:

```typescript
import { notificationToast } from '@/lib/toast';

// Success
notificationToast.success('Shipment updated successfully');

// Error
notificationToast.error('Failed to update shipment');

// Warning
notificationToast.warning('Please check your input');

// Info
notificationToast.info('This is an informational message');

// Loading
const toastId = notificationToast.loading('Processing...');
// Then later:
notificationToast.dismiss(toastId);

// Dismiss all
notificationToast.dismissAll();
```

## Configuration

### Toast Position
Currently configured to appear at **bottom-right**. To change:
- Edit [app/layout.tsx](app/layout.tsx) line with `<Toaster position="bottom-right" />`
- Available positions: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`

### Toast Styling
- Success: Green (#10b981)
- Error: Red (#ef4444)
- Warning: Amber (#f59e0b)
- Info/Loading: Blue (#3b82f6)
- Duration: 3000ms (3 seconds)

All styles are defined in [lib/toast.ts](lib/toast.ts)

## Integration Details

### Files Modified/Created:

1. **[lib/toast.ts](lib/toast.ts)** - NEW
   - Global toast utility using react-hot-toast
   - Provides consistent styling across the app
   - Exports `notificationToast` object with methods

2. **[app/layout.tsx](app/layout.tsx)** - UPDATED
   - Added `<Toaster />` component from react-hot-toast
   - Removed custom ToastProvider and ToastContainer
   - Simpler, cleaner setup

3. **[lib/api/axios.ts](lib/api/axios.ts)** - UPDATED
   - Enhanced response interceptor
   - SUCCESS: Shows toast for successful mutations (POST, PUT, DELETE, PATCH)
   - ERROR: Shows toast with error message for failed requests
   - Preserves token refresh logic

### API Integration
All HTTP requests using `axiosInstance` automatically show notifications:
- ✅ Successfully updated shipment → "✅ Action completed successfully"
- ❌ Failed request → "❌ [Error message from server]"

## Examples

### In Admin Shipments Table
When you update shipment status via the dropdown, a success/error toast appears automatically.

### In Rider Dashboard
When marking shipments as PICKED/IN_TRANSIT/DELIVERED, toasts appear automatically.

### Manual Example in a Component
```typescript
'use client';

import { notificationToast } from '@/lib/toast';
import { shipmentService } from '@/lib/services';

export function MyComponent() {
  const handleAction = async () => {
    try {
      await shipmentService.updateShipmentStatus(id, 'DELIVERED');
      // ✅ Success toast shows automatically
    } catch (error) {
      // ❌ Error toast shows automatically
    }
  };

  return <button onClick={handleAction}>Update</button>;
}
```

## Notes
- Toast notifications are non-blocking and appear in a fixed position
- Users can dismiss toasts by clicking the X button
- Loading states work well for async operations
- The system is client-side only (no server-side toast logic needed)
