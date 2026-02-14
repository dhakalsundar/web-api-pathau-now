# Skeleton Loader Components Guide

## Overview
A comprehensive system of reusable skeleton loader components using Tailwind CSS animations. These provide smooth loading experiences across all data-fetching pages in the application.

## Features
- ✅ 10+ pre-built skeleton variants
- ✅ Customizable width, height, and border radius
- ✅ Smooth pulse animation via Tailwind animate-pulse
- ✅ Consistent styling across the app
- ✅ Zero dependencies (Tailwind CSS only)

## Available Components

### Base Components

#### 1. **SkeletonLoader** (Base Component)
Generic skeleton loader for any element.

```tsx
import { SkeletonLoader } from '@/app/components/Skeletons/SkeletonLoader';

// Default
<SkeletonLoader />

// Custom dimensions
<SkeletonLoader height="h-8" width="w-32" rounded="rounded-lg" />
```

**Props:**
- `width`: Tailwind width class (default: `w-full`)
- `height`: Tailwind height class (default: `h-4`)
- `rounded`: Tailwind border radius (default: `rounded`)

---

### Specialized Components

#### 2. **TableRowSkeleton**
Skeleton for table rows with multiple columns.

```tsx
import { TableRowSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

// Shows loading for 5 columns
<TableRowSkeleton columnCount={5} />
```

**Usage:**
```tsx
<div className="divide-y">
  {Array(5).fill(0).map((_, i) => (
    <TableRowSkeleton key={i} columnCount={7} />
  ))}
</div>
```

---

#### 3. **CardSkeleton**
Skeleton for card-based layouts.

```tsx
import { CardSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

<CardSkeleton />
```

---

#### 4. **ProfileCardSkeleton**
Skeleton for user/rider profile cards (with avatar).

```tsx
import { ProfileCardSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

<ProfileCardSkeleton />
```

**Usage:** Rider dashboard profile card, user detail cards.

---

#### 5. **ListItemSkeleton**
Skeleton for list items with count control.

```tsx
import { ListItemSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

// Shows 3 loading items
<ListItemSkeleton count={3} />
```

---

#### 6. **ExpandableRowSkeleton**
Skeleton for expandable table rows (summary + expanded details).

```tsx
import { ExpandableRowSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

<div className="space-y-4">
  {Array(10).fill(0).map((_, i) => (
    <ExpandableRowSkeleton key={i} columnCount={7} />
  ))}
</div>
```

**Usage:** Riders table, shipments table, rider dashboard.

---

#### 7. **PaginationSkeleton**
Skeleton for pagination controls.

```tsx
import { PaginationSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

<PaginationSkeleton />
```

---

#### 8. **DashboardStatsSkeleton**
Skeleton for stat cards grid.

```tsx
import { DashboardStatsSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

// Shows 4 stat card skeletons
<DashboardStatsSkeleton count={4} />
```

---

#### 9. **TimelineSkeleton**
Skeleton for timeline/tracking views.

```tsx
import { TimelineSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

// Shows 5 timeline events
<TimelineSkeleton count={5} />
```

**Usage:** Shipment tracking page, delivery timeline.

---

#### 10. **FormInputSkeleton**
Skeleton for a single form input with label.

```tsx
import { FormInputSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

<FormInputSkeleton />
```

---

#### 11. **FormCompleteSkeleton**
Skeleton for complete form with multiple fields and buttons.

```tsx
import { FormCompleteSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

// Shows 4 input fields + 2 buttons
<FormCompleteSkeleton fieldCount={4} />
```

**Usage:** Create/edit user forms, create shipment forms.

---

## Current Usage in App

### Pages With Skeleton Loaders

#### 1. **Admin Riders Page** (`/admin/riders`)
```tsx
{loading ? (
  <div className="space-y-4">
    {Array(5).fill(0).map((_, i) => (
      <ExpandableRowSkeleton key={i} columnCount={6} />
    ))}
  </div>
) : (
  // Riders content
)}
```

#### 2. **Admin Shipments Page** (`/admin/shipments`)
```tsx
{loading ? (
  <div className="space-y-4 mb-8">
    {Array(pageSize).fill(0).map((_, i) => (
      <ExpandableRowSkeleton key={i} columnCount={7} />
    ))}
  </div>
) : (
  // Shipments content
)}
```

#### 3. **Rider Dashboard** (`/rider/dashboard`)
```tsx
if (loading) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header>...</header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Card Skeleton */}
        <ProfileCardSkeleton />

        {/* Shipments List Skeleton */}
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <ExpandableRowSkeleton key={i} columnCount={5} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

#### 4. **Admin Users Page** (`/admin/users`)
```tsx
<DataTable
  columns={columns}
  data={formattedUsers}
  isLoading={loading}  {/* Automatically shows 5 rows of TableRowSkeleton */}
  emptyMessage="No users found"
/>
```

#### 5. **Shipment Tracking Page** (`/track/[trackingNumber]`)
```tsx
<LoadingSkeleton />
```
Shows header skeleton + timeline skeleton + info cards skeleton.

---

## Animation Details

### Tailwind Classes Used
- `animate-pulse` - Smooth fade in/out animation
- `bg-gradient-to-r` - Gradient background for visual appeal
- `from-gray-200 via-gray-100 to-gray-200` - Gradient colors

### Custom CSS (in globals.css)
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Implementation Patterns

### Pattern 1: Simple Conditional Loading
```tsx
import { ExpandableRowSkeleton } from '@/app/components/Skeletons/SkeletonLoader';

{loading ? (
  <div className="space-y-4">
    {Array(5).fill(0).map((_, i) => (
      <ExpandableRowSkeleton key={i} columnCount={7} />
    ))}
  </div>
) : (
  <div>Your content here</div>
)}
```

### Pattern 2: Full Page Loading
```tsx
if (loading) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header>{/* Header content */}</header>
      <main>
        <ProfileCardSkeleton />
        <div className="space-y-4">
          {/* Multiple row skeletons */}
        </div>
      </main>
    </div>
  );
}

return <div>{/* Actual content */}</div>;
```

### Pattern 3: DataTable Integration
```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={loading}
  emptyMessage="No data found"
/>
```

---

## Best Practices

### ✅ Do's
- Use `ExpandableRowSkeleton` for table/list loading
- Show the same number of skeleton rows as actual data
- Match skeleton layout to actual content layout
- Use appropriate `columnCount` props
- Place skeletons in the same location as actual content

### ❌ Don'ts
- Don't mix different skeleton types unnecessarily
- Don't show skeletons longer than 3-5 seconds
- Don't use skeletons for errors (use error messages instead)
- Don't nest skeletons deeply

---

## Customization

### Adding a New Skeleton Component
```tsx
// In SkeletonLoader.tsx
export function CustomSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <SkeletonLoader height="h-6" rounded="rounded" width="w-1/3" />
      {/* Add more skeleton elements */}
    </div>
  );
}
```

---

## File Locations
- **Component:** `app/components/Skeletons/SkeletonLoader.tsx`
- **Animations:** `app/globals.css` (keyframes added)
- **Legacy Component:** `app/components/LoadingSkeleton.tsx` (now uses SkeletonLoader)
- **DataTable Integration:** `app/components/DataTable.tsx`

---

## Summary

| Component | Use Case | Example |
|-----------|----------|---------|
| `SkeletonLoader` | Generic placeholder | Any element |
| `TableRowSkeleton` | Table row loading | DataTable, lists |
| `CardSkeleton` | Card content | Card layouts |
| `ProfileCardSkeleton` | User/rider profiles | Rider profile card |
| `ListItemSkeleton` | List item loading | Simple lists |
| `ExpandableRowSkeleton` | Expandable tables | Riders, shipments tabs |
| `PaginationSkeleton` | Pagination controls | Paginated lists |
| `DashboardStatsSkeleton` | Stat cards | Dashboard stats |
| `TimelineSkeleton` | Timeline/events | Tracking pages |
| `FormInputSkeleton` | Form field | Forms |
| `FormCompleteSkeleton` | Complete form | Create/edit forms |

**Total Pages Enhanced: 5+ pages with skeleton loaders** ✅
