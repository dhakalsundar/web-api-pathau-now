# Rider Dashboard - Testing Guide

## Quick Start: Test Rider Dashboard End-to-End

### Prerequisites
- ✅ Backend running on `http://localhost:5000`
- ✅ Frontend running on `http://localhost:3000`
- ✅ MongoDB running and connected
- ✅ Test data created (riders and shipments assigned to riders)

---

## Step 1: Create Test Rider User

### Using Admin Panel or Direct API Call

```bash
POST http://localhost:5000/api/admin/users
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Test Rider",
  "email": "rider@test.com",
  "password": "123456",
  "phoneNumber": "+880 1234567890",
  "role": "RIDER",
  "vehicleType": "Motorcycle",
  "vehicleNumber": "DHA-1234"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "rider_id_123",
    "name": "Test Rider",
    "email": "rider@test.com",
    "role": "RIDER",
    "status": "AVAILABLE"
  }
}
```

---

## Step 2: Login as Rider

### Frontend Test

1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `rider@test.com`
   - Password: `123456`
3. Click "Login"
4. Verify redirect to `/rider/dashboard` ✅

### API Test

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "rider@test.com",
  "password": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { ... rider data ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Save the token for next requests.

---

## Step 3: Test Rider Dashboard

### Expected Features

✅ **Rider Profile Card**
- Shows: Name, Phone, Email, Vehicle, Status
- Edit profile link works

✅ **Statistics Grid**
- Total Deliveries: 0 (initially)
- Rating: 0.0/5 (initially)
- Assigned Parcels: Number of shipments assigned
- Current Status: AVAILABLE/BUSY/OFFLINE

✅ **Quick Actions**
- "View All Deliveries" link → `/rider/deliveries`
- "View Performance" link → `/rider/performance`

✅ **Recent Deliveries**
- Shows last 5 assigned deliveries
- Displays: Tracking ID, Status, Recipient, Price, Date
- Clicking opens `/rider/deliveries/{id}`

---

## Step 4: Assign Shipments to Rider

### Using Admin API

```bash
PUT http://localhost:5000/api/admin/shipments/{shipmentId}/assign-rider
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "riderId": "rider_id_123"
}
```

**Create multiple shipments with different statuses for testing:**

```bash
# Create and assign 5 shipments with various statuses
POST http://localhost:5000/api/shipments
Authorization: Bearer <USER_TOKEN>
...
# Then assign to rider using above endpoint
```

---

## Step 5: Test Rider Deliveries Page

### Navigation
1. Click "View All Deliveries" from dashboard
2. Should load `/rider/deliveries`

### Features to Test

✅ **List Display**
- [ ] All assigned shipments visible
- [ ] Each shows: Tracking ID, Status, Recipient, Delivery Type, Price
- [ ] Pagination works (if > 10 shipments)

✅ **Search Functionality**
- [ ] Type tracking ID → filters results
- [ ] Type recipient name → filters results
- [ ] Search is case-insensitive

✅ **Status Filter**
- [ ] Filter by PENDING → shows only PENDING
- [ ] Filter by IN_TRANSIT → shows only IN_TRANSIT
- [ ] Filter by DELIVERED → shows only DELIVERED
- [ ] etc.

✅ **Statistics Summary**
- [ ] Total Parcels count matches
- [ ] In Transit count accurate
- [ ] Delivered count accurate
- [ ] Failed/Cancelled count accurate

✅ **Refresh Button**
- [ ] Clicking refresh reloads data
- [ ] No loading spinner issue

---

## Step 6: Test Delivery Details & Status Update

### Open a Delivery
1. Click on any delivery from the list
2. Should navigate to `/rider/deliveries/{shipmentId}`

### Features to Test

✅ **Sender Information Card**
- [ ] Name, Phone, Address display correctly
- [ ] 📍 Pickup location shown

✅ **Recipient Information Card**
- [ ] Name, Phone, Address display correctly
- [ ] 🏠 Delivery location shown

✅ **Parcel Details**
- [ ] Weight & measurement shown
- [ ] Price displayed
- [ ] Description/Type shown
- [ ] Delivery method shown

✅ **Status Timeline**
- [ ] All previous status events visible
- [ ] Events show: Status, Timestamp, Location
- [ ] Timeline displays in correct order

✅ **Status Update Panel**
- [ ] **PENDING shipment**: Can only update to "PICKED_UP"
  ```
  Status → PICKED_UP (button available)
  ```
  
- [ ] **After updating to PICKED_UP**: Can only update to "IN_TRANSIT"
  ```
  Status → IN_TRANSIT (button available)
  ```
  
- [ ] **After updating to IN_TRANSIT**: Can only update to "OUT_FOR_DELIVERY"
  ```
  Status → OUT_FOR_DELIVERY (button available)
  ```
  
- [ ] **After updating to OUT_FOR_DELIVERY**: Can only update to "DELIVERED"
  ```
  Status → DELIVERED or FAILED (buttons available)
  ```
  
- [ ] **After DELIVERED/FAILED/CANCELLED**: No update buttons available
  ```
  Show message: "Delivery Complete - This shipment has already been delivered/failed/cancelled"
  ```

✅ **Optional Message Field**
- [ ] Can add notes during status update
- [ ] Message saved with status event

### Update Status Flow Test

**Scenario: Complete Full Delivery Workflow**

```
1. Start: Shipment Status = PENDING
   ✅ Click "Mark as Picked Up" → Select PICKED_UP
   
2. After first update: Status = PICKED_UP
   ✅ Click "Mark as In Transit" → Select IN_TRANSIT
   
3. After second update: Status = IN_TRANSIT
   ✅ Click "Out for Delivery" → Select OUT_FOR_DELIVERY
   
4. After third update: Status = OUT_FOR_DELIVERY
   ✅ Click "Mark as Delivered" → Select DELIVERED
   
5. Final state: Status = DELIVERED
   ✅ No more update buttons available
   ✅ Verify rider's total delivery count incremented
```

---

## Step 7: Test Rider Profile Page

### Navigation
1. Click profile icon or "My Profile" in sidebar
2. Should load `/rider/profile`

### Features to Test

✅ **Profile Overview Card**
- [ ] Shows name, phone, email
- [ ] Shows total deliveries
- [ ] Shows rating
- [ ] Shows current status

✅ **Basic Info Tab**
- [ ] Can edit name
- [ ] Can edit email
- [ ] Can edit phone number
- [ ] Changes saved successfully

✅ **Vehicle Tab**
- [ ] Can select vehicle type (from dropdown)
- [ ] Can edit vehicle number
- [ ] Changes display immediately after save

✅ **Status Tab**
- [ ] Can toggle between AVAILABLE/BUSY/OFFLINE
- [ ] Status updates immediately
- [ ] Status persists on page refresh

✅ **Location Tab**
- [ ] Can enter latitude
- [ ] Can enter longitude
- [ ] Can enter address (optional)
- [ ] Location saved successfully

---

## Step 8: Test Rider Performance Page

### Navigation
1. Click "My Performance" from sidebar
2. Should load `/rider/performance`

### Features to Test

✅ **Main Statistics**
- [ ] Total Deliveries: Shows correct count
- [ ] Rating: Shows correct rating (e.g., 4.5/5)
- [ ] On-Time Rate: Shows percentage
- [ ] Avg Deliveries/Day: Shows calculated average

✅ **Performance Breakdown**
- [ ] Failed deliveries bar graph displays
- [ ] Average deliveries/day bar graph displays
- [ ] Customer satisfaction percentage displays
- [ ] Total distance (if available) displays

✅ **Performance Level**
- [ ] Shows performance tier (Excellent/Very Good/Good/etc.)
- [ ] Shows corresponding icon
- [ ] Color coded appropriately

✅ **Achievements Section**
- [ ] Shows unlocked achievements (if any)
- [ ] Requirements for next achievement clear

✅ **Monthly Comparison**
- [ ] This month stats show correctly
- [ ] Goals progress bars display

---

## Step 9: Test Authentication & Authorization

### Non-Authenticated Access

```
1. Logout or open incognito window
2. Try to access http://localhost:3000/rider/dashboard
   ✅ Should redirect to /login
   
3. Try to access http://localhost:3000/rider/profile
   ✅ Should redirect to /login
   
4. Try to access http://localhost:3000/rider/performance
   ✅ Should redirect to /login
```

### Wrong Role Access

```
1. Login as ADMIN user
2. Try to access http://localhost:3000/rider/dashboard
   ✅ Should redirect to /admin/dashboard
   
1. Login as CUSTOMER user
2. Try to access http://localhost:3000/rider/dashboard
   ✅ Should redirect to /user/dashboard
```

### API Authorization

```bash
# Try to access rider endpoint without token
GET http://localhost:5000/api/riders/me
❌ Expected: 401 Unauthorized

# Try to access with invalid token
GET http://localhost:5000/api/riders/me
Authorization: Bearer invalid_token
❌ Expected: 401 Unauthorized or 403 Forbidden

# Try to access another rider's shipment
GET http://localhost:5000/api/riders/me/shipments/OTHER_RIDER_SHIPMENT_ID
Authorization: Bearer <RIDER_TOKEN>
❌ Expected: 403 Permission Denied
```

---

## Step 10: Test API Endpoints Directly

### Use Postman or cURL

```bash
# 1. Get current rider profile
GET http://localhost:5000/api/riders/me
Authorization: Bearer <RIDER_TOKEN>
✅ Response: { success: true, data: { rider data } }

# 2. Get assigned shipments
GET http://localhost:5000/api/riders/me/shipments?page=1&limit=10&status=PENDING
Authorization: Bearer <RIDER_TOKEN>
✅ Response: { success: true, data: [ shipments ] }

# 3. Get specific shipment
GET http://localhost:5000/api/riders/me/shipments/{shipmentId}
Authorization: Bearer <RIDER_TOKEN>
✅ Response: { success: true, data: { shipment data with full details } }

# 4. Update shipment status
PUT http://localhost:5000/api/riders/me/shipments/{shipmentId}/status
Authorization: Bearer <RIDER_TOKEN>
Content-Type: application/json

{
  "status": "PICKED_UP",
  "message": "Picked up from warehouse"
}
✅ Response: { success: true, message: "Status updated" }

# 5. Update rider location
PUT http://localhost:5000/api/riders/me/location
Authorization: Bearer <RIDER_TOKEN>
Content-Type: application/json

{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "address": "Dhaka, Bangladesh"
}
✅ Response: { success: true, message: "Location updated" }

# 6. Update rider status
PUT http://localhost:5000/api/riders/me/status
Authorization: Bearer <RIDER_TOKEN>
Content-Type: application/json

{
  "status": "BUSY"
}
✅ Response: { success: true, message: "Status updated" }

# 7. Get rider stats
GET http://localhost:5000/api/riders/me/stats
Authorization: Bearer <RIDER_TOKEN>
✅ Response: { success: true, data: { stats } }
```

---

## Common Issues & Solutions

### Issue: "Dashboard shows no data"
**Solution:**
- Verify rider is logged in (check localStorage)
- Verify JWT token is valid (not expired)
- Check browser console for API errors
- Verify shipments are assigned to rider (check DB: shipment.riderId = rider._id)
- Check backend logs for errors

### Issue: "Status update fails"
**Solution:**
- Verify next status is valid for current status
- Check API response in Network tab
- Verify rider owns the shipment (ownership check)
- Verify JWT token not expired
- Check backend validation logic

### Issue: "Cannot access rider pages"
**Solution:**
- Verify user role is "RIDER"
- Check localStorage for user data
- Check browser console for auth errors
- Clear browser cache and cookies
- Login again

### Issue: "Sidebar not showing"
**Solution:**
- Verify layout.tsx is in place
- Check role verification in layout
- Clear cache and hard refresh (Ctrl+Shift+R)

### Issue: "API calls failing"
**Solution:**
- Verify backend is running (http://localhost:5000)
- Check CORS configuration
- Verify JWT token format in Authorization header
- Check backend logs for errors
- Verify all ports match (3000 for frontend, 5000 for backend)

---

## Test Checklist

Print this checklist and mark tests as completed:

### Frontend Tests
- [ ] Login as rider works
- [ ] Dashboard loads all stats
- [ ] Recent deliveries display
- [ ] Can navigate to deliveries
- [ ] Can filter by status
- [ ] Can search by tracking ID/name
- [ ] Can open delivery details
- [ ] Status update form works
- [ ] Status flow validation works
- [ ] Can update to PICKED_UP
- [ ] Can update to IN_TRANSIT
- [ ] Can update to OUT_FOR_DELIVERY
- [ ] Can update to DELIVERED
- [ ] Delivery count increments after delivery
- [ ] Can access profile page
- [ ] Can update profile info
- [ ] Can update vehicle info
- [ ] Can update status
- [ ] Can update location
- [ ] Can access performance page
- [ ] Performance stats display
- [ ] Achievements show correctly
- [ ] Non-authenticated users redirected to login
- [ ] Wrong role users redirected to correct dashboard

### Backend Tests
- [ ] GET /riders/me returns correct rider
- [ ] GET /riders/me/shipments returns assigned shipments
- [ ] GET /riders/me/shipments/{id} returns shipment with ownership check
- [ ] PUT /riders/me/shipments/{id}/status updates status
- [ ] PUT /riders/me/location updates location
- [ ] PUT /riders/me/status updates rider status
- [ ] GET /riders/me/stats returns correct stats
- [ ] Non-riders cannot access endpoints (401/403)
- [ ] Riders cannot access other riders' shipments (403)
- [ ] Invalid status transitions rejected
- [ ] All error messages formatted correctly

### Security Tests
- [ ] Unauthenticated access denied
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected
- [ ] Cross-role access denied
- [ ] Ownership verification works
- [ ] SQL injection not possible
- [ ] XSS protection in place

---

## Success Criteria

✅ **All tests pass** when:
1. Rider can log in securely
2. Dashboard displays all widgets and real data
3. Can view assigned deliveries
4. Can update delivery statuses with validation
5. Can manage profile settings
6. Can view performance metrics
7. Only riders can access rider pages
8. Riders can't see other riders' data
9. Backend properly validates and authenticates
10. UI is responsive and user-friendly

---

## Performance Baseline

Expected response times:
- Dashboard load: < 2 seconds
- Deliveries list: < 1 second
- Status update: < 1 second
- Performance page load: < 2 seconds
- Profile page load: < 1 second

---

## Deployment Verification

Before deploying to production:
1. [ ] All tests pass
2. [ ] No console errors
3. [ ] No network errors
4. [ ] Performance acceptable
5. [ ] Security audit completed
6. [ ] Database indexed properly
7. [ ] Error logging configured
8. [ ] Rate limiting configured
9. [ ] CORS properly configured
10. [ ] Environment variables set correctly

---

## Support & Debugging

### Enable Debug Logging

**Frontend:** Already has console.log statements marked with ❌/✅

**Backend:** Check logs in `backend/logs/` directory

### Postman Collection

Import the file: `backend/postman_auth_collection.json`

Includes all rider endpoints with example requests and responses.

---

## Next Steps After Testing

1. ✅ Fix any issues found during testing
2. ✅ Optimize performance if needed
3. ✅ Add more test data
4. ✅ Document any workarounds
5. ✅ Deploy to staging
6. ✅ Deploy to production
