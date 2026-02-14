# Confirmation Modal - Integration Examples

## Quick Reference

Copy this pattern to add delete confirmations to any page:

---

## Example 1: Delete with Service Method

### State Setup
```tsx
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [deleteLoading, setDeleteLoading] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
const [selectedName, setSelectedName] = useState('');
```

### Handler Function
```tsx
const handleDelete = async () => {
  if (!selectedId) return;

  try {
    setDeleteLoading(true);
    await deleteService.delete(selectedId);
    
    // Refresh data or remove from list
    setItems(items.filter(item => item._id !== selectedId));
    
    setShowDeleteConfirm(false);
    setSelectedId(null);
    setSelectedName('');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to delete');
  } finally {
    setDeleteLoading(false);
  }
};
```

### Open Confirmation
```tsx
const openDeleteConfirm = (id: string, name: string) => {
  setSelectedId(id);
  setSelectedName(name);
  setShowDeleteConfirm(true);
};
```

### Trigger from Button/Action
```tsx
<button onClick={() => openDeleteConfirm(item._id, item.name)}>
  Delete
</button>
```

### Modal Component
```tsx
<ConfirmationModal
  isOpen={showDeleteConfirm}
  title="Delete Item"
  message={`Are you sure you want to delete "${selectedName}"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  isDangerous={true}
  isLoading={deleteLoading}
  icon="⚠️"
  onConfirm={handleDelete}
  onCancel={() => {
    setShowDeleteConfirm(false);
    setSelectedId(null);
    setSelectedName('');
  }}
/>
```

---

## Example 2: Delete from DataTable Actions

### Setup Modal State
```tsx
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [deleteLoading, setDeleteLoading] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
const [selectedEmail, setSelectedEmail] = useState('');
```

### Import Modal
```tsx
import { ConfirmationModal } from '@/app/components/ConfirmationModal';
```

### Delete Handler
```tsx
const handleDeleteUser = async () => {
  if (!selectedId) return;

  try {
    setDeleteLoading(true);
    await adminService.deleteUser(selectedId);
    
    setUsers(users.filter(u => u._id !== selectedId));
    setShowDeleteConfirm(false);
    setSelectedId(null);
    setSelectedEmail('');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to delete user');
  } finally {
    setDeleteLoading(false);
  }
};
```

### DataTable Actions
```tsx
<DataTable
  columns={columns}
  data={formattedData}
  isLoading={loading}
  actions={[
    {
      label: 'Edit',
      onClick: (row) => handleEdit(row.id),
      color: 'amber',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        setSelectedId(row.id);
        setSelectedEmail(row.email);
        setShowDeleteConfirm(true);
      },
      color: 'red',
    },
  ]}
/>
```

### Modal Component
```tsx
<ConfirmationModal
  isOpen={showDeleteConfirm}
  title="Delete User"
  message={`Are you sure you want to delete the user "${selectedEmail}"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  isDangerous={true}
  isLoading={deleteLoading}
  icon="⚠️"
  onConfirm={handleDeleteUser}
  onCancel={() => {
    setShowDeleteConfirm(false);
    setSelectedId(null);
    setSelectedEmail('');
  }}
/>
```

---

## Example 3: Non-Destructive Confirmation

### Use Case: Important Actions (Not Deletion)
```tsx
<ConfirmationModal
  isOpen={showConfirm}
  title="Send Bulk Email"
  message="Send this email to 250 users? This cannot be undone."
  confirmText="Send"
  cancelText="Draft"
  isDangerous={false}  // Not red, blue button
  isLoading={isSending}
  icon="✉️"
  onConfirm={handleSendEmail}
  onCancel={() => setShowConfirm(false)}
/>
```

---

## Example 4: With Custom Icons

```tsx
// Warning for delete
icon="⚠️"

// Confirmation for important action
icon="❓"

// Success-related confirmation
icon="✅"

// Cancellation
icon="❌"

// Generic confirmation
icon="📋"

// Action/launch
icon="🚀"

// Custom emoji for domain-specific actions
icon="🚴"  // For rider actions
icon="📦"  // For shipment actions
```

---

## Common Patterns

### Pattern A: Delete from List
```tsx
const [items, setItems] = useState<Item[]>([]);

const handleDelete = async () => {
  await deleteService.delete(selectedId);
  setItems(items.filter(i => i._id !== selectedId));
  setShowDeleteConfirm(false);
};
```

### Pattern B: Delete from Table
```tsx
// Same as Pattern A - works with DataTable actions
```

### Pattern C: Delete with Refresh
```tsx
const handleDelete = async () => {
  await deleteService.delete(selectedId);
  // Instead of filtering, just refetch
  const response = await service.getAll();
  setItems(response.data);
  setShowDeleteConfirm(false);
};
```

### Pattern D: Delete with Navigation
```tsx
const handleDelete = async () => {
  await deleteService.delete(selectedId);
  // Navigate away after delete
  router.push('/items');
};
```

---

## Error Handling

### Display Error in Modal
```tsx
const [error, setError] = useState('');

const handleDelete = async () => {
  try {
    setError('');
    setDeleteLoading(true);
    await deleteService.delete(selectedId);
    setShowDeleteConfirm(false);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Delete failed');
  } finally {
    setDeleteLoading(false);
  }
};

// Then in JSX:
{error && <div className="alert-error">{error}</div>}

<ConfirmationModal {...props} />
```

### Error Outside Modal
```tsx
<div className="mb-4">
  {error && <Alert type="error" message={error} />}
</div>

<ConfirmationModal {...props} />
```

---

## Keyboard Support

Users can:
- Press **Escape** to close the modal (calls onCancel)
- Press **Tab** to navigate between Confirm/Cancel buttons
- Press **Enter** to activate the focused button
- Click outside (backdrop) to close

No extra code needed - built into component!

---

## TypeScript Types

```tsx
import { ConfirmationModal } from '@/app/components/ConfirmationModal';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  icon?: React.ReactNode;
}
```

---

## Full Page Example

See [Admin Users Page](app/admin/users/page.tsx) for complete working example with:
- Delete state management
- Service method integration
- Error handling
- Data refresh after delete
- Loading states
- Modal integration

---

## Migration Guide (from window.confirm)

### Before
```tsx
{
  label: 'Delete',
  onClick: (row) => {
    if (window.confirm('Delete this item?')) {
      handleDelete(row.id);
    }
  },
}
```

### After
```tsx
{
  label: 'Delete',
  onClick: (row) => openDeleteConfirm(row.id, row.name),
}

// Plus modal in JSX
<ConfirmationModal {...props} />
```

**Benefits:**
- Better UX (styled modal instead of browser alert)
- More context (can show item details)
- Better mobile experience
- Accessibility features
- Loading states

---

## Testing Tips

### Manual Testing
1. Click delete button
2. Press Escape - should close
3. Click backdrop - should close
4. Click Cancel - should close
5. Click Delete - should show spinner, then complete
6. Verify data refreshes after delete

### Cypress E2E
```tsx
cy.contains('Delete').click();
cy.contains('Are you sure').should('be.visible');
cy.contains('Delete').click();
cy.contains('Something').should('not.exist'); // Item deleted
```

---

Summary: Use this guide to add professional delete confirmations throughout the app! 🎉
