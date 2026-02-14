# Rider Registration Validation Debugging Guide

## What Was Added

### 1. Frontend Logging (rider/page.tsx)
- **Before sending**: Logs the complete payload with all fields
- **After error**: Logs detailed validation error messages from backend
- **Shows field-by-field errors**: Displays which field failed and why

### 2. Backend Validation Logging (validate.middleware.ts)
- **Request body**: Logs entire request body received
- **Validation pass/fail**: Confirms validation succeeded or failed
- **Field errors**: Shows each field that failed, the message, and error code

### 3. Auth Controller Logging (auth.controller.ts)
- **Request received**: Logs that register endpoint was called
- **Field extraction**: Logs all extracted fields with their values
- **User creation**: Logs when user is created with role
- **Rider profile**: Logs rider profile creation with vehicle info

## How to Debug

### Step 1: Open Browser DevTools
1. Open the Rider Registration page: `http://localhost:3000/register/rider`
2. Press **F12** to open DevTools
3. Go to **Console** tab

### Step 2: Fill & Submit Form
Fill in the form with test data:
```
Name: John Rider
Email: johnrider@example.com
Phone: 1234567890
Vehicle Type: BIKE
Vehicle Number: DHA-1234
Password: password123
Confirm: password123
```

### Step 3: Check Frontend Logs
In browser console, you should see:
```
📤 [RIDER REGISTER] Sending payload: {
  name: "John Rider",
  email: "johnrider@example.com",
  password: "***",
  phone: "1234567890",
  role: "RIDER",
  vehicleType: "BIKE",
  vehicleNumber: "DHA-1234"
}
```

### Step 4: Check Backend Logs
In backend terminal, you should see:
```
📝 [VALIDATE] Request body: {
  "name": "John Rider",
  "email": "johnrider@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "RIDER",
  "vehicleType": "BIKE",
  "vehicleNumber": "DHA-1234"
}

✅ [VALIDATE] Validation passed

📥 [AUTH] Register endpoint called
📋 [AUTH] Extracted fields:
   name: John Rider
   email: johnrider@example.com
   phone: 1234567890
   role: RIDER
   vehicleType: BIKE
   vehicleNumber: DHA-1234

👤 [AUTH] Creating user: name=John Rider, email=johnrider@example.com, role=RIDER, phone=1234567890
✅ [AUTH] User created: <user_id>
🏍️  [AUTH] Creating rider profile for user <user_id>
   vehicleType: BIKE, vehicleNumber: DHA-1234
✅ [AUTH] Rider profile created
```

## If Validation Fails

### Look for ❌ [VALIDATE] Validation failed:
Example error output:
```
❌ [VALIDATE] Validation failed:
   Field: phone | Message: String must contain at least 10 character(s) | Code: too_small
   Field: email | Message: Invalid email | Code: invalid_string
```

### Common Validation Errors:

| Error | Cause | Fix |
|-------|-------|-----|
| `email: Invalid email` | Email format incorrect | Use valid email format: user@example.com |
| `phone: String must contain at least 10 character(s)` | Phone too short | Enter at least 10 digits |
| `password: String must contain at least 6 character(s)` | Password too short | Use 6+ characters |
| `vehicleType: Invalid enum value` | Not BIKE/CAR/VAN | Select correct vehicle type |

### Frontend Error Display

The form will show the detailed error:
```
Validation Error: phone: String must contain at least 10 character(s) | 
email: Invalid email
```

## Field Mapping Reference

**What Frontend Sends → What Backend Receives:**

| Frontend Field | Backend Field | Type | Required | Valid Values |
|-------|-------|---|---|---|
| name | name | string | ✅ | Min 2 chars |
| email | email | string | ✅ | Valid email format |
| password | password | string | ✅ | Min 6 chars |
| phoneNumber | phone | string | ✅ | Min 10 digits |
| vehicleType | vehicleType | enum | ❌ | BIKE, CAR, VAN |
| vehicleNumber | vehicleNumber | string | ❌ | Any string |
| — | role | enum | ⏭️ (auto) | RIDER (set by frontend) |

## Complete Flow Expected

```
1. Frontend Form Validation (client-side)
   ↓ (send payload)
2. Backend Route Validation (zod schema)
   ↓ (pass validation) 
3. Auth Controller
   ├─ Create User
   ├─ Create Rider Profile
   └─ Return tokens
4. Frontend Success
   ↓ (redirect)
5. Login Page
```

## Testing Checklist

- [ ] Phone is 10+ digits
- [ ] Email contains @
- [ ] Password is 6+ characters  
- [ ] Password and confirm match
- [ ] Name is 2+ characters
- [ ] Vehicle Type is selected (BIKE/CAR/VAN)
- [ ] Check browser console for send payload logs
- [ ] Check backend terminal for validation logs
- [ ] See success message and redirect to login

## If Still Failing

1. **Take screenshot of the error message**
2. **Copy from browser console** (DevTools → Console tab)
3. **Copy from backend terminal** the error logs
4. Share all three for detailed debugging

## Example of Successful Flow Log

**Frontend Console:**
```
📤 [RIDER REGISTER] Sending payload: {name: "John Rider", email: "john@test.com", ...}
✅ [RIDER REGISTER] Success: {success: true, data: {...}, token: "..."}
```

**Backend Terminal:**
```
📝 [VALIDATE] Request body: {name: "John Rider", ...}
✅ [VALIDATE] Validation passed
📥 [AUTH] Register endpoint called
✅ [AUTH] User created: 65abc123...
✅ [AUTH] Rider profile created
```

**Frontend Display:**
```
✅ Rider account created successfully! Redirecting to login...
```

## Advanced Debugging

If payload logs don't appear, check:
1. Backend is running: `npm run dev` in backend folder
2. Frontend is running: `npm run dev` in frontend folder  
3. API URL configured correctly: Check `NEXT_PUBLIC_API_URL`
4. Network tab in DevTools shows the request going to `POST /api/auth/register`

---

**Ready to test? Run both frontend and backend, then try registering!**
