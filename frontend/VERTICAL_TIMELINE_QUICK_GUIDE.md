# Vertical Timeline - Quick Integration Guide

## 🚀 Quick Start

### 1. Import the Component

```tsx
import VerticalTimeline from '@/app/components/VerticalTimeline';
```

### 2. Prepare Your Data

```tsx
const timelineSteps = [
  {
    id: 'created',
    status: 'CREATED',
    title: 'Order Created',
    description: 'Shipment has been created',
    timestamp: shipment.createdAt,
    location: 'Dhaka',
    completed: true,
  },
  {
    id: 'current',
    status: 'IN_TRANSIT',
    title: 'In Transit',
    current: true,
    timestamp: new Date().toISOString(),
    location: 'Dhaka → Chittagong',
  },
];
```

### 3. Render the Component

```tsx
<VerticalTimeline 
  steps={timelineSteps}
  currentStatusId="current"
  orientation="center"
/>
```

---

## 📱 In Your Tracking Page

### Current Implementation

The tracking page already has a `Timeline` component. Replace or supplement with `VerticalTimeline`:

```tsx
// Before (existing Timeline)
<Timeline events={shipment.events} currentStatus={shipment.status} />

// After (new VerticalTimeline)
<VerticalTimeline 
  steps={shipment.events.map((event, i) => ({
    id: `event${i}`,
    status: event.status,
    title: event.status.replace('_', ' '),
    description: event.message,
    timestamp: event.timestamp,
    location: event.location,
    completed: i < shipment.events.length - 1,
    current: i === shipment.events.length - 1,
  }))}
/>
```

### Complete Integration

```tsx
'use client';

import VerticalTimeline from '@/app/components/VerticalTimeline';

export default function TrackingPage() {
  // ... existing code ...

  return (
    <main>
      {/* ... existing sections ... */}
      
      {/* Shipment Timeline */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Tracking History</h2>
        
        <VerticalTimeline
          steps={shipment.events.map((event, index) => ({
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
      </section>
    </main>
  );
}
```

---

## 🎨 Layout Options

### Center Layout (Recommended for Tracking)
```tsx
<VerticalTimeline steps={steps} orientation="center" />
```
Perfect for detailed tracking information on desktop.

### Left Layout (Compact View)
```tsx
<VerticalTimeline steps={steps} orientation="left" />
```
Better for narrow containers or sidebars.

### Right Layout (Mirror)
```tsx
<VerticalTimeline steps={steps} orientation="right" />
```
Alternative to left layout.

---

## 💡 Tips & Tricks

### Auto-Highlight Current Status

```tsx
<VerticalTimeline
  steps={steps}
  currentStatusId={shipment.status}  // Auto-finds the current step
/>
```

### No Connector Line (Compact)

```tsx
<VerticalTimeline
  steps={steps}
  showConnector={false}  // Removes vertical line
/>
```

### Disable Animations (Performance)

```tsx
<VerticalTimeline
  steps={steps}
  animated={false}  // Faster rendering
/>
```

### Custom Icons

```tsx
const steps = [
  {
    id: 'start',
    status: 'CREATED',
    title: 'Started',
    icon: '🎬',  // Custom icon
  },
  // ... more steps
];
```

---

## 🔄 Data Transformation Examples

### From API Events

```tsx
const apiEvents = [
  { status: 'CREATED', message: 'Order created', timestamp: '...' },
  { status: 'PICKED', message: 'Picked up', timestamp: '...' },
];

const timelineSteps = apiEvents.map((event, i) => ({
  id: `event-${i}`,
  status: event.status,
  title: event.status.replace(/_/g, ' '),
  description: event.message,
  timestamp: event.timestamp,
  completed: i < apiEvents.length - 1,
  current: i === apiEvents.length - 1,
}));
```

### From Custom Steps

```tsx
const customSteps = steps.map((step, index) => ({
  id: step.id,
  status: step.statusCode,
  title: step.stepName,
  description: step.details,
  timestamp: step.time,
  location: step.place,
  completed: step.isCompleted,
  current: step.isCurrent,
  icon: step.customIcon,
}));
```

---

## 🎯 Common Patterns

### Pattern 1: Simple Event List

```tsx
<VerticalTimeline
  steps={events}
  orientation="left"
  showConnector={true}
/>
```

### Pattern 2: Process Flow

```tsx
<VerticalTimeline
  steps={processSteps}
  currentStatusId={currentStep}
  orientation="center"
/>
```

### Pattern 3: History View

```tsx
<VerticalTimeline
  steps={historicalEvents}
  showConnector={false}
  animated={false}
/>
```

---

## ✨ Features Checklist

✅ Vertical layout  
✅ Current status highlighting  
✅ Pulse animation on current  
✅ Completed status visual  
✅ Dynamic step rendering  
✅ 3 layout orientations  
✅ 8 status color types  
✅ Responsive design  
✅ Smooth animations  
✅ Tailwind styled  
✅ TypeScript types  
✅ No dependencies  

---

## 🎨 Styling Examples

### With Container

```tsx
<div className="max-w-4xl mx-auto p-6">
  <VerticalTimeline steps={steps} />
</div>
```

### With Background

```tsx
<div className="bg-gradient-to-b from-blue-50 to-white p-8">
  <VerticalTimeline steps={steps} />
</div>
```

### With Shadow

```tsx
<div className="bg-white rounded-lg shadow-lg p-6">
  <VerticalTimeline steps={steps} />
</div>
```

---

## 📊 Status Colors Reference

```
CREATED         ▪ Gray       (#F3F4F6)
ASSIGNED        ▪ Blue       (#DBEAFE)
PICKED          ▪ Blue       (#DBEAFE)
IN_TRANSIT      ▪ Yellow     (#FEF3C7)
OUT_FOR_DELIVERY▪ Orange     (#FEDBA8)
DELIVERED       ▪ Green      (#DCFCE7)
FAILED          ▪ Red        (#FEE2E2)
CANCELLED       ▪ Purple     (#F3E8FF)
```

---

## ⚡ Performance Tips

### For Large Timelines

```tsx
// Option 1: Virtualization
import { FixedSizeList } from 'react-window';

// Option 2: Pagination
const [page, setPage] = useState(0);
const itemsPerPage = 10;
const displaySteps = steps.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

<VerticalTimeline steps={displaySteps} />
```

### For Animations

```tsx
// Disable on mobile
const shouldAnimate = window.innerWidth > 768;

<VerticalTimeline steps={steps} animated={shouldAnimate} />
```

---

## 🧪 Testing

### Display Different Orientations

```tsx
// Try all 3
['center', 'left', 'right'].map(orientation => (
  <VerticalTimeline 
    key={orientation}
    steps={steps}
    orientation={orientation}
  />
))
```

### Toggle Features

```tsx
<button onClick={() => setShowConnector(!showConnector)}>
  Toggle Connector
</button>

<VerticalTimeline steps={steps} showConnector={showConnector} />
```

---

## 📚 Full Documentation

For complete documentation, see:
- [VERTICAL_TIMELINE_DOCUMENTATION.md](VERTICAL_TIMELINE_DOCUMENTATION.md)

For live examples, visit:
- `/timeline-demo` page in your app

---

## 🚀 You're Ready!

The VerticalTimeline component is production-ready and can be used immediately in your tracking page or anywhere else you need to display timelines.

**Next Steps:**
1. Import the component
2. Prepare your timeline data
3. Render with desired orientation
4. Customize as needed

Happy tracking! 🎉
