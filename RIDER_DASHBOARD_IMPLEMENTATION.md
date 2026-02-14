# Rider Dashboard Implementation Guide

## Overview
Complete Rider Dashboard system for parcel tracking platform. Enables riders to view assigned deliveries, update parcel statuses, manage their availability, and track performance metrics.

## Architecture

```
┌─────────────────┐
│  Rider Portal   │
│  (Frontend)     │
└────────┬────────┘
         │
    ┌────┴───────────────┐
    │ Layout + Sidebar    │
    │ Role Protection     │
    └────┬───────────────┘
         │
    ┌────┴─────────────────────────────┐
    │  Pages:                           │
    │  - Dashboard                      │
    │  - My Deliveries (List)           │
    │  - Delivery Details (Update)      │
    │  - Performance                    │
    │  - Profile                        │
    └────┬─────────────────────────────┘
         │
         │ API Calls (Authenticated)
         │
    ┌────┴──────────────────────────┐
    │  Backend Endpoints:            │
    │  GET /api/riders/me            │
    │  GET /api/riders/me/shipments  │
    │  PUT /api/riders/me/.../status │
    │  PUT /api/riders/me/location   │
    │  PUT /api/riders/me/status     │
    │  GET /api/riders/me/stats      │
    └────────────────────────────────┘
```

## Backend Implementation

### New Routes: `backend/src/routes/rider.self.route.ts`

**Endpoints for Riders**:

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/riders/me` | GET | Get current rider profile | RIDER role |
| `/riders/me/shipments` | GET | Get assigned shipments | RIDER role |
| `/riders/me/shipments/:id` | GET | Get specific shipment details | RIDER role |
| `/riders/me/shipments/:id/status` | PUT | Update shipment status | RIDER role |
| `/riders/me/location` | PUT | Update current location | RIDER role |
| `/riders/me/status` | PUT | Update availability status | RIDER role |
| `/riders/me/stats` | GET | Get rider performance stats | RIDER role |

**Query Parameters**:
```
GET /api/riders/me/shipments?page=1&limit=10&status=IN_TRANSIT
```

**Request Bodies**:
```json
// Update shipment status
{
  "status": "DELIVERED",
  "message": "Delivered successfully",
  "location": "Customer location"
}

// Update location
{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "address": "Dhaka, Bangladesh"
}

// Update rider status
{
  "status": "AVAILABLE" // AVAILABLE | BUSY | OFFLINE
}
```

### Security Features

1. **Role-based Access Control**: Only RIDER role can access `/me` endpoints
2. **Ownership Verification**: Rider can only see/update their own shipments
3. **Status Validation**: Only valid status transitions allowed
4. **Authentication Required**: All endpoints require valid JWT token

### Service Layer
**New Methods in `RiderService`**:
- `incrementDeliveries(riderId)` - Increment delivery count when marked DELIVERED

## Frontend Implementation

### Directory Structure
```
frontend/app/rider/
├── layout.tsx                  # Rider layout with sidebar
├── dashboard/
│   └── page.tsx               # Dashboard overview
├── deliveries/
│   ├── page.tsx               # List of assigned deliveries
│   └── [id]/
│       └── page.tsx           # Delivery details & status update
├── performance/
│   └── page.tsx               # Rider performance metrics
└── profile/
    └── page.tsx               # Rider profile & settings
```

### 1. Rider Layout (`frontend/app/rider/layout.tsx`)

**Features**:
- Persistent sidebar with navigation
- Role verification (must be RIDER)
- Auto-redirect for non-riders
- Client-side authentication check
- Green color accent (for riders)

**Sidebar Items**:
- 📊 Dashboard
- 🚚 My Deliveries
- 📈 My Performance
- 👤 Profile

### 2. Dashboard Page (`frontend/app/rider/dashboard/page.tsx`)

**Displays**:
- ✅ Rider profile card (name, phone, vehicle, status)
- 📊 4-stat grid:
  - Total Deliveries (lifetime)
  - Rating (star rating)
  - Assigned Parcels (pending)
  - Current Status (AVAILABLE/BUSY/OFFLINE)
- ⚡ Quick action buttons
- 📬 Recent 5 deliveries preview

**Data Loaded**:
- Current rider profile
- Rider statistics
- Recent deliveries

### 3. My Deliveries Page (`frontend/app/rider/deliveries/page.tsx`)

**Features**:
- 🔍 Search by tracking ID or recipient name
- 📋 Filter by status (PENDING, IN_TRANSIT, DELIVERED, etc.)
- 🔄 Refresh button
- 📦 Paginated list of deliveries
- 📊 Delivery summary stats

**List Shows**:
- Tracking ID (clickable)
- Status badge with icon
- Recipient name & phone
- Delivery type & weight
- Price and creation date

### 4. Delivery Details & Status Update (`frontend/app/rider/deliveries/[id]/page.tsx`)

**Sections**:
- **Sender Information**: Full contact details, address
- **Recipient Information**: Full contact details, address
- **Parcel Details**: Weight, price, type, delivery method
- **Status Timeline**: Historical events with timestamps
- **Status Update Panel** (right side):
  - Dropdown for next possible statuses
  - Optional message/notes
  - Update button
  - Smart status flow (only allows valid transitions)

**Status Flow**:
```
PENDING → PICKED_UP
        ↓
  IN_TRANSIT
        ↓
OUT_FOR_DELIVERY
        ↓
DELIVERED

(Any state can transition to FAILED)
```

**Auto-increment**:
- When rider marks delivery as DELIVERED, their total delivery count increments automatically

### 5. Performance Page (`frontend/app/rider/performance/page.tsx`)

**Shows**:
- 🎯 Total deliveries count
- ⭐ Rating score
- 📈 Delivery trend (chart)
- 🏆 Achievement badges
- 📊 Performance breakdown by status

### 6. Profile Page (`frontend/app/rider/profile/page.tsx`)

**Features**:
- Edit profile information
- Update vehicle details
- Change availability status
- Update current location
- View account details

## Frontend Services Update

### `riderService` Methods

```typescript
// Get current rider profile
getCurrentRider()

// Get assigned shipments (with filters)
getMyAssignedShipments({ page, limit, status })

// Get specific shipment
getMyShipmentDetails(shipmentId)

// Update shipment status
updateMyShipmentStatus(shipmentId, status, message?, location?)

// Update location
updateMyLocation(latitude, longitude, address?)

// Update availability status
updateMyStatus(status: 'AVAILABLE' | 'BUSY' | 'OFFLINE')

// Get performance stats
getMyStats()
```

## Security Checklist

- [x] JWT authentication required for all rider endpoints
- [x] Role verification (RIDER role only)
- [x] Ownership verification (rider can only see own shipments)
- [x] Status validation (only valid transitions allowed)
- [x] Layout-level protection (non-riders redirected)
- [x] Page-level protection (each page checks auth)
- [x] Token auto-refresh on 401 errors
- [x] Secure cookies for JWT storage

## Testing Checklist

### Backend Tests
- [ ] Create test rider user (role: RIDER)
- [ ] Assign test shipments to rider
- [ ] Test `/riders/me` endpoint
- [ ] Test `/riders/me/shipments` with filters
- [ ] Test status update flow (PENDING → PICKED_UP → IN_TRANSIT → DELIVERED)
- [ ] Test location update
- [ ] Test status availability update
- [ ] Test stats retrieval
- [ ] Verify non-riders cannot access endpoints
- [ ] Verify riders cannot access other riders' shipments

### Frontend Tests
- [ ] Login as rider
- [ ] Verify dashboard loads all stats
- [ ] Navigate to My Deliveries
- [ ] Filter by status
- [ ] Search by tracking ID
- [ ] Click delivery to view details
- [ ] Update shipment status
- [ ] Verify delivery count increments
- [ ] Test non-rider redirect
- [ ] Test logout flow

## Test Scenarios

### Test 1: Rider Views Dashboard

```bash
1. Login with RIDER user
2. GET /api/riders/me → Get rider profile
3. GET /api/riders/me/stats → Get performance stats
4. GET /api/riders/me/shipments?page=1&limit=5 → Get recent deliveries
5. Dashboard displays: Profile card, stats grid, recent deliveries
Expected: All data loads correctly ✓
```

### Test 2: Update Parcel Status

```bash
1. Navigate to /rider/deliveries
2. Click on a parcel (e.g., status: PENDING)
3. Select next status: PICKED_UP
4. Add message: "Parcel picked up from warehouse"
5. Click Update
6. Backend: 
   - Verify shipment.riderId matches user.id
   - Update shipment status
   - Add event to timeline
7. Frontend: Shows success message, refreshes data
8. User can now see status as PICKED_UP
9. Only valid next statuses available (IN_TRANSIT, etc.)
Expected: Status updates in real-time ✓
```

### Test 3: Role-based Access Control

```bash
1. Login as ADMIN
2. Try to access /rider/dashboard
3. Should redirect to /admin/dashboard ✓

1. Login as CUSTOMER
2. Try to access /rider/dashboard
3. Should redirect to /user/dashboard ✓

1. Logout (no token)
2. Try to access /rider/dashboard
3. Should redirect to /login ✓

1. Manually change JWT role in API request
2. Try to access /api/riders/me
3. Should return 403 Forbidden ✓
```

## Deployment Checklist

Before going to production:

- [ ] Backend routes registered in `index.ts`
- [ ] RIDER role added to user model
- [ ] All database indexes created
- [ ] Frontend environment variables set
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Empty state messages configured
- [ ] Console logs removed (or in dev only)
- [ ] API responses formatted consistently
- [ ] Unit tests written
- [ ] Integration tests passed
- [ ] Manual QA completed
- [ ] Performance profiled
- [ ] Security audit completed

## Future Enhancements

1. **Map Integration**: Show delivery route on map
2. **Route Optimization**: Suggest optimal delivery order
3. **Customer Communication**: In-app messaging to customers
4. **Photo Proof**: Upload photo evidence of delivery
5. **Rating System**: Customers can rate rider delivery
6. **Performance Dashboard**: Advanced analytics
7. **Notifications**: Real-time delivery notifications
8. **Multi-language**: Support multiple languages
9. **Offline Mode**: Work offline, sync when online
10. **Mobile App**: Native mobile application

## Troubleshooting

### Riders see "No Deliveries"
- Verify shipments assigned to rider (riderId field)
- Check `/api/riders/me/shipments` endpoint directly
- Verify JWT token includes correct user ID
- Check rider status (should not be issue)

### Status update fails
- Verify next status is valid (check status flow)
- Verify requesting rider owns the shipment
- Check network request in browser DevTools
- Verify JWT token not expired

### Dashboard shows no stats
- Check `/api/riders/me/stats` endpoint
- Verify rider profile exists
- Check MongoDB rider document

### Cannot access rider pages
- Verify user role is "RIDER"
- Verify localStorage has user data
- Check browser console for auth errors
- Verify JWT token in cookies

## Support

For issues or questions:
1. Check console logs (F12 → Console tab)
2. Check network requests (F12 → Network tab)
3. Verify API response in Network tab
4. Check backend logs
5. Review test guide below

## Resources

- [Admin Dashboard](../ADMIN_DASHBOARD_GUIDE.md)
- [User Dashboard](../USER_DASHBOARD_GUIDE.md)
- [Authentication & Authorization](../AUTH_IMPLEMENTATION_GUIDE.md)
- [API Documentation](../API_REFERENCE.md)
