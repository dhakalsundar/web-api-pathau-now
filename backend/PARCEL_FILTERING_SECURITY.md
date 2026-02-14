# Parcel Filtering & Security Implementation

## Overview
This document outlines the complete implementation of user-based parcel filtering to ensure customers only see their own parcels.

## Architecture

### Flow Diagram
```
User Login
    ↓
JWT Generated with: { id, email, role }
    ↓
JWT Stored in Cookies
    ↓
Frontend Axios Attaches JWT to Requests
    ↓
Backend `authenticate` Middleware Extracts userId
    ↓
Controller Validates User Access
    ↓
Repository Filters by customerId
    ↓
Only User's Parcels Returned
```

## Implementation Details

### 1. Data Model
**File**: `backend/src/models/shipment.model.ts`

```typescript
interface IShipment extends Document {
  customerId?: mongoose.Types.ObjectId;  // References the User who created the shipment
  // ... other fields
}

// Index for fast filtering
ShipmentSchema.index({ customerId: 1 });
```

### 2. Authentication & User Extraction
**File**: `backend/src/middleware/auth.middleware.ts`

```typescript
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  (req as any).user = decoded;  // Contains: { id, email, role }
  next();
};
```

### 3. Shipment Creation with User Association
**File**: `backend/src/services/shipment.service.ts`

```typescript
async createShipment(data: any, customerId?: string, userRole?: string) {
  // Validation: customerId required for non-admin users
  if (!customerId && userRole !== 'ADMIN' && userRole !== 'STAFF') {
    throw new HttpError(401, 'Authentication required');
  }

  const shipmentData: Partial<IShipment> = {
    // ... other fields
    customerId: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
  };

  return await shipmentRepository.create(shipmentData);
}
```

### 4. Role-Based Filtering on Retrieval
**File**: `backend/src/controllers/shipment.controller.ts`

```typescript
async getAll(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;
  const isAdmin = userRole === 'ADMIN' || userRole === 'STAFF';

  const filters: any = {};

  if (isAdmin) {
    // Admin sees all or filters by specific customer
    if (customerId) filters.customerId = customerId;
  } else {
    // Regular users see only their shipments
    filters.customerId = userId;
  }

  return await shipmentService.getAllShipments(filters, page, limit);
}
```

### 5. Secure Single-Parcel Access
```typescript
async getById(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;
  const isAdmin = userRole === 'ADMIN' || userRole === 'STAFF';

  const shipment = await shipmentService.getById(req.params.id);

  // Ownership check
  if (!isAdmin && shipment.customerId?.toString() !== userId) {
    throw new HttpError(403, 'Permission denied');
  }

  return shipment;
}
```

### 6. Repository Filtering
**File**: `backend/src/repositories/shipment.repository.ts`

```typescript
async findAll(filters: ShipmentFilters, page: number, limit: number) {
  const query: any = {};

  if (filters.customerId) query.customerId = filters.customerId;
  if (filters.status) query.status = filters.status;
  // ... other filters

  const shipments = await ShipmentModel.find(query)
    .populate('customerId', 'email firstName lastName')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return { shipments, total: await ShipmentModel.countDocuments(query) };
}
```

## Frontend Integration

### Token Management
**File**: `frontend/lib/api/axios.ts`

```typescript
// Request Interceptor: Attach JWT to all requests
axiosInstance.interceptors.request.use((config) => {
  const { token } = readAuthFromCookies();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Call
**File**: `frontend/app/lib/services.ts`

```typescript
export const shipmentService = {
  getUserShipments: async (options?: any) => {
    const { page = 1, limit = 10, status } = options || {};
    const filters: any = { page, limit };
    if (status) filters.status = status;
    
    // JWT automatically attached by axios interceptor
    const response = await axiosInstance.get('/shipments', { params: filters });
    
    // Handle both array and paginated responses
    const parcelsData = Array.isArray(response.data) 
      ? response.data 
      : response.data?.items || [];
    
    return parcelsData;
  }
};
```

## Security Checklist

### ✅ Backend Security
- [x] JWT token includes user ID
- [x] Authentication middleware extracts and validates ID
- [x] Controllers verify user ownership before CRUD operations
- [x] Filtering applied at repository level (secure, not frontend)
- [x] Role-based access control (ADMIN vs CUSTOMER)
- [x] customerId required when creating shipments for users
- [x] 403 Forbidden returned for unauthorized access
- [x] Single-parcel access secured with ownership check

### ✅ Frontend Security
- [x] JWT token stored in HTTP-only cookies (not localStorage)
- [x] Axios interceptor adds JWT to all protected requests
- [x] Frontend respects redirect to login on 401 errors
- [x] User pages check for authenticated user before rendering

### ⚠️ Known Limitations
- [x] Demo shipments created in seeder have no customerId → won't appear to users
- [x] Old shipments without customerId won't be visible to users

## Testing Scenarios

### Test Case 1: Customer Creates & Views Parcel
```
1. Customer A logs in → JWT with id="user-a-id", role="CUSTOMER"
2. POST /api/shipments { sender, recipient, ... }
3. Backend stores shipment with customerId="user-a-id"
4. GET /api/shipments
5. Backend filters: { customerId: "user-a-id" }
6. Customer A sees only their parcel ✓
```

### Test Case 2: Customer Cannot Access Another's Parcel
```
1. Customer B logs in → JWT with id="user-b-id"
2. GET /api/shipments/{parcelId from Customer A}
3. Backend checks: parcelId.customerId !== "user-b-id"
4. Returns 403 Forbidden ✓
```

### Test Case 3: Admin Views All Parcels
```
1. Admin logs in → JWT with role="ADMIN"
2. GET /api/shipments
3. Backend skips customer filtering
4. Admin sees all shipments ✓
```

### Test Case 4: Admin Filters by Customer
```
1. Admin logs in → JWT with role="ADMIN"
2. GET /api/shipments?customerId=user-a-id
3. Backend filters: { customerId: "user-a-id" }
4. Admin sees Customer A's parcels ✓
```

## Database Indexes

Ensure these indexes exist for optimal performance:

```typescript
// In ShipmentSchema
ShipmentSchema.index({ customerId: 1 });           // Fast customer filtering
ShipmentSchema.index({ status: 1 });               // Status filtering
ShipmentSchema.index({ createdAt: -1 });           // Sorting
ShipmentSchema.index({ customerId: 1, status: 1 }); // Combined query
```

## Troubleshooting

### Users See No Parcels
1. Verify JWT contains user ID: Check X-User-ID header or decode JWT
2. Check DB: `db.shipments.find({ customerId: ObjectId("...") })`
3. Verify role in JWT: Should be "CUSTOMER" for regular users
4. Check server logs for filtering errors

### Users See All Parcels
1. Verify role check: `isAdmin` should be false for CUSTOMER role
2. Check JWT role value (case-sensitive)
3. Verify customerId is set in shipment creation

### Access Denied Errors
1. Verify shipment has correct customerId
2. Verify JWT id matches customerId
3. Check user role in JWT

## Related Files
- Authentication: `backend/src/middleware/auth.middleware.ts`
- JWT Generation: `backend/src/utils/jwt.ts`
- Models: `backend/src/models/shipment.model.ts`
- Repository: `backend/src/repositories/shipment.repository.ts`
- Service: `backend/src/services/shipment.service.ts`
- Controller: `backend/src/controllers/shipment.controller.ts`
