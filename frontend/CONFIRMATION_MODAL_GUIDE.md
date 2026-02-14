# Confirmation Modal Component Guide

## Overview
A reusable, accessible confirmation modal component built with Tailwind CSS. Designed for delete confirmations, destructive actions, and user confirmations throughout the application.

## Features
- ✅ Fully reusable with customizable text, icons, and colors
- ✅ Tailwind CSS styling (no external UI libraries)
- ✅ Loading states with animated spinner
- ✅ Keyboard support (Escape to close)
- ✅ Backdrop click to close
- ✅ Accessible with ARIA attributes
- ✅ Smooth animations and transitions
- ✅ Dangerous action styling (red buttons for destructive actions)
- ✅ Prevents body scroll when open

## Installation

The component is located at:
```
frontend/app/components/ConfirmationModal.tsx
```

## Basic Usage

### Import
```tsx
import { ConfirmationModal } from '@/app/components/ConfirmationModal';
```

### Minimal Example
```tsx
import { useState } from 'react';
import { ConfirmationModal } from '@/app/components/ConfirmationModal';

export function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Delete Item
      </button>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        onConfirm={() => {
          // Handle delete
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
```

## Props

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;                    // Controls modal visibility
  title: string;                      // Modal title
  message: string;                    // Modal message/description
  confirmText?: string;               // Confirm button text (default: "Confirm")
  cancelText?: string;                // Cancel button text (default: "Cancel")
  isDangerous?: boolean;              // Red styling for destructive actions (default: false)
  isLoading?: boolean;                // Show loading state (default: false)
  onConfirm: () => void | Promise<void>;  // Confirm button callback
  onCancel: () => void;               // Cancel button callback
  icon?: React.ReactNode;             // Optional icon/emoji
}
```

## Examples

### Delete Confirmation with Icon
```tsx
<ConfirmationModal
  isOpen={showConfirm}
  title="Delete User"
  message="Are you sure you want to delete this user? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  isDangerous={true}
  icon="⚠️"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

### With Loading State
```tsx
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  try {
    setIsDeleting(true);
    await deleteAPI();
    setShowConfirm(false);
  } catch (error) {
    alert('Delete failed');
  } finally {
    setIsDeleting(false);
  }
};

<ConfirmationModal
  isOpen={showConfirm}
  title="Delete"
  message="Confirm deletion?"
  isLoading={isDeleting}
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

### Safe Action (Non-Destructive)
```tsx
<ConfirmationModal
  isOpen={showConfirm}
  title="Send Message"
  message="Send this message to all users?"
  confirmText="Send"
  cancelText="Don't Send"
  isDangerous={false}
  icon="✉️"
  onConfirm={handleSend}
  onCancel={() => setShowConfirm(false)}
/>
```

## Current Usage in App

### Admin Users Page
**Location:** `/admin/users`

Shows delete confirmation with:
- User email in the message
- Red danger styling
- Warning icon
- Automatic user list refresh after delete

```tsx
<ConfirmationModal
  isOpen={showDeleteConfirm}
  title="Delete User"
  message={`Are you sure you want to delete the user "${selectedUserEmail}"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  isDangerous={true}
  isLoading={deleteLoading}
  icon="⚠️"
  onConfirm={handleDeleteUser}
  onCancel={() => setShowDeleteConfirm(false)}
/>
```

## Styling

### Colors
- **Normal Action:** Blue buttons (bg-blue-600)
- **Dangerous Action:** Red buttons (bg-red-600) when `isDangerous={true}`
- **Hover:** Darker shades (blue-700, red-700)
- **Disabled:** Lighter shades with reduced opacity

### Animation
- Modal opens with scale/opacity transition
- Backdrop fades in
- Spinner animates on loading state
- All transitions take 200ms

### Accessibility
- ✅ ARIA modal attributes
- ✅ Keyboard support (Escape to close)
- ✅ Backdrop click support
- ✅ Color + icons (not color alone for status)
- ✅ Clear button labels
- ✅ Semantic HTML

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Escape | Close modal (calls onCancel) |
| Tab | Navigate between buttons |
| Enter | Activate focused button |

## Best Practices

### ✅ Do's
- Use `isDangerous={true}` for destructive actions (delete, remove, etc.)
- Provide a meaningful icon that matches the action type
- Show specific details (names, emails) in the message
- Disable buttons during loading
- Include context about consequences

### ❌ Don'ts
- Don't use for every confirmation (reserve for important actions)
- Don't use multiple modals at once
- Don't change titles/messages while loading
- Don't forget to set `isOpen={false}` after action completes
- Don't use icons for colors alone (always use with text)

## Implementation Pattern

```tsx
'use client';

import { useState } from 'react';
import { ConfirmationModal } from '@/app/components/ConfirmationModal';

export function YourComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openConfirmation = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    
    try {
      setIsLoading(true);
      // Perform action
      await deleteAPI(selectedId);
      setShowConfirm(false);
      // Refresh data
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => openConfirmation('item-id')}>Delete</button>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Delete Item"
        message="Are you sure?"
        isDangerous={true}
        isLoading={isLoading}
        icon="⚠️"
        onConfirm={handleConfirm}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedId(null);
        }}
      />
    </>
  );
}
```

## Common Icon Suggestions

| Icon | Use Case |
|------|----------|
| ⚠️ | Delete, remove, dangerous actions |
| ❌ | Cancellation, rejection |
| ✅ | Confirmation, important approval |
| ❓ | Questions, clarification |
| 📋 | Confirmation of changes |
| 🚀 | Actions, launches |

## File Locations
- **Component:** `app/components/ConfirmationModal.tsx`
- **Usage Example:** `app/admin/users/page.tsx`

## Integration with DataTable

The DataTable component can use ConfirmationModal for dangerous actions:

```tsx
{
  label: 'Delete',
  onClick: (row) => openDeleteConfirm(row.id, row.email),
  color: 'red',
}
```

Then render the modal outside the table:

```tsx
<ConfirmationModal
  isOpen={showDeleteConfirm}
  // ... props
/>
```

---

## Summary

| Feature | Status |
|---------|--------|
| Reusable | ✅ |
| Tailwind Styled | ✅ |
| Keyboard Accessible | ✅ |
| Loading States | ✅ |
| Dangerous Actions | ✅ |
| Currently Used | ✅ (Admin Users) |
| Type Safe | ✅ (TypeScript) |
| Zero Dependencies | ✅ (Tailwind only) |

**Status:** Production-ready and integrated into Admin Users page for delete confirmations.
