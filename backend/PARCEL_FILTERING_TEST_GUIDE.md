# Parcel Filtering & Security - Testing Guide

## Quick Test Instructions

### Prerequisites
- Backend running on `http://localhost:5000`
- At least 2 test users created

## Test Workflow

### 1. Create Test Users

**User 1 (Customer A)**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer-a@test.com",
    "password": "Test123!",
    "firstName": "Customer",
    "lastName": "A",
    "phoneNumber": "+1-555-0001"
  }'
```

Response will include:
```json
{
  "data": {
    "user": { "id": "user-a-id", "email": "customer-a@test.com", "role": "CUSTOMER" },
    "tokens": { "accessToken": "token-a" }
  }
}
```

**User 2 (Customer B)**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer-b@test.com",
    "password": "Test123!",
    "firstName": "Customer",
    "lastName": "B",
    "phoneNumber": "+1-555-0002"
  }'
```

Save the `accessToken` from both responses.

### 2. Create Parcel as Customer A

```bash
curl -X POST http://localhost:5000/api/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token-a}" \
  -d '{
    "sender": {
      "name": "Sender A",
      "address": "123 A Street",
      "phoneNumber": "+1-555-1001"
    },
    "recipient": {
      "name": "Recipient A",
      "address": "456 A Avenue",
      "phoneNumber": "+1-555-2001"
    },
    "weight": 5,
    "price": 100,
    "deliveryType": "STANDARD",
    "parcelType": "PARCEL",
    "notes": "Test parcel from Customer A"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": {
    "_id": "parcel-a-id",
    "trackingNumber": "PTH-20260214-XXXX",
    "customerId": "user-a-id",
    "status": "PENDING"
  }
}
```

Save `parcel-a-id`.

### 3. Create Parcel as Customer B

```bash
curl -X POST http://localhost:5000/api/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token-b}" \
  -d '{
    "sender": {
      "name": "Sender B",
      "address": "789 B Street",
      "phoneNumber": "+1-555-1002"
    },
    "recipient": {
      "name": "Recipient B",
      "address": "012 B Avenue",
      "phoneNumber": "+1-555-2002"
    },
    "weight": 3,
    "price": 75,
    "deliveryType": "EXPRESS",
    "parcelType": "DOCUMENT",
    "notes": "Test parcel from Customer B"
  }'
```

Save `parcel-b-id`.

### 4. Test Case 1: Customer A Views Own Parcels

**Expected**: See only parcel-a-id

```bash
curl -X GET "http://localhost:5000/api/shipments?page=1&limit=10" \
  -H "Authorization: Bearer {token-a}"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "results": [
      {
        "_id": "parcel-a-id",
        "trackingNumber": "PTH-20260214-XXXX",
        "customerId": "user-a-id",
        "status": "PENDING"
      }
    ]
  }
}
```

✅ **Pass**: Customer A sees only 1 parcel (their own)
❌ **Fail**: Customer A sees other parcels or 0 parcels

### 5. Test Case 2: Customer B Views Own Parcels

**Expected**: See only parcel-b-id

```bash
curl -X GET "http://localhost:5000/api/shipments?page=1&limit=10" \
  -H "Authorization: Bearer {token-b}"
```

**Expected**: `results` array contains only parcel-b-id

✅ **Pass**: Customer B sees only 1 parcel (their own)

### 6. Test Case 3: Customer A Cannot Access Customer B's Parcel

**Expected**: 403 Forbidden

```bash
curl -X GET "http://localhost:5000/api/shipments/{parcel-b-id}" \
  -H "Authorization: Bearer {token-a}"
```

**Expected Response**:
```json
{
  "success": false,
  "message": "You do not have permission to view this shipment"
}
```

✅ **Pass**: Returns 403 Forbidden
❌ **Fail**: Returns parcel-b-id details or 200 OK

### 7. Test Case 4: Customer B Cannot Delete Customer A's Parcel

**Expected**: 403 Forbidden

```bash
curl -X DELETE "http://localhost:5000/api/shipments/{parcel-a-id}" \
  -H "Authorization: Bearer {token-b}"
```

**Expected Response**:
```json
{
  "success": false,
  "message": "You do not have permission to delete this shipment"
}
```

✅ **Pass**: Returns 403 Forbidden

### 8. Test Case 5: Admin Sees All Parcels

First, login as admin (if exists, use provided credentials):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

Save the admin token.

```bash
curl -X GET "http://localhost:5000/api/shipments?page=1&limit=10" \
  -H "Authorization: Bearer {admin-token}"
```

**Expected**: Results includes both parcel-a-id and parcel-b-id

✅ **Pass**: Admin sees 2 parcels
❌ **Fail**: Admin sees fewer than 2 parcels

### 9. Test Case 6: Admin Filters by Specific Customer

```bash
curl -X GET "http://localhost:5000/api/shipments?page=1&limit=10&customerId={user-a-id}" \
  -H "Authorization: Bearer {admin-token}"
```

**Expected**: Results contains only parcel-a-id

✅ **Pass**: Admin sees only Customer A's parcel when filtering

### 10. Test Case 7: Unauthenticated Access Denied

```bash
curl -X GET "http://localhost:5000/api/shipments"
```

**Expected Response**:
```json
{
  "statusCode": 401,
  "message": "No token provided"
}
```

✅ **Pass**: Returns 401 Unauthorized

---

## Quick Validation Checklist

- [ ] Customer A creates parcel → parcel has customerId = user-a-id
- [ ] Customer A lists parcels → sees only their own
- [ ] Customer B lists parcels → sees only their own
- [ ] Customer A tries to view Customer B's parcel → 403 Forbidden
- [ ] Customer A tries to delete Customer B's parcel → 403 Forbidden
- [ ] Admin lists parcels → sees all
- [ ] Admin filters by customerId → sees only that customer's parcels
- [ ] Unauthenticated request → 401 Unauthorized
- [ ] Invalid tracking number → 404 Not Found
- [ ] Valid token but accessing others' data → 403 Forbidden

## Test Results Template

```markdown
## Test Execution Results - [DATE]

### Environment
- Backend URL: http://localhost:5000
- Database: [In-Memory / MongoDB]
- Test Date: [DATE]

### Test Results
1. Customer A Creates Parcel: [PASS/FAIL]
2. Customer B Creates Parcel: [PASS/FAIL]
3. Customer A Views Own: [PASS/FAIL]
4. Customer B Views Own: [PASS/FAIL]
5. Customer A Access Denied: [PASS/FAIL]
6. Customer B Delete Denied: [PASS/FAIL]
7. Admin Sees All: [PASS/FAIL]
8. Admin Filters: [PASS/FAIL]
9. Unauthenticated Denied: [PASS/FAIL]

### Issues Found
(List any failures here)

### Recommendations
(Any improvements needed)
```

## Debugging Tips

### Check JWT Contents
Decode your JWT at https://jwt.io/ to verify:
- `id`: User's MongoDB ID
- `email`: User's email
- `role`: Should be "CUSTOMER" or "ADMIN"

### Check MongoDB
```javascript
// In MongoDB shell
use pathau_now_dev

// See all shipments
db.shipments.find()

// See shipments for specific user
db.shipments.find({ customerId: ObjectId("user-a-id") })

// See shipments without customerId (security concern!)
db.shipments.find({ customerId: null })
```

### Check Server Logs
Look for:
- JWT decode errors
- Filtering logic execution
- Access denied messages

### Common Issues

**Issue**: Users see no parcels
- Check: Shipments exist in DB with correct customerId
- Check: JWT id matches customerId in shipment
- Check: `isAdmin` flag is correctly evaluating

**Issue**: Users see all parcels instead of just theirs
- Check: Role value in JWT (might not match "ADMIN"/"CUSTOMER")
- Check: Role comparison logic in controller

**Issue**: 403 Forbidden on own parcel
- Check: Shipment's customerId matches JWT id
- Check: No string/ObjectId type mismatch
