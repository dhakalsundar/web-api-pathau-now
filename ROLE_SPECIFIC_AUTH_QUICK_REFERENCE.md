# Role-Specific Auth - Quick Reference

## Login URLs

| URL | Purpose | Redirect To |
|-----|---------|-------------|
| `/login` | Main entry | `/login/choose` |
| `/login/choose` | Select role | Role-specific page |
| `/login/admin` | Admin login | `/admin/dashboard` |
| `/login/rider` | Rider login | `/rider/dashboard` |
| `/login/customer` | Customer login | `/user/dashboard` |

## Registration URLs

| URL | Purpose | Redirect To |
|-----|---------|-------------|
| `/register` | Main entry | `/register/choose` |
| `/register/choose` | Select role | Role-specific page |
| `/register/rider` | Rider signup | `/login/rider` |
| `/register/customer` | Customer signup | `/login/customer` |

## Quick Links

### For Users
- 🔐 **Login**: `http://localhost:3000/login`
  - Choose your role type
  - Enter credentials
  - Access dashboard

- 📝 **Register**: `http://localhost:3000/register`
  - Choose your role (Rider or Customer)
  - Fill signup form
  - Create account

### For Admins
- 🏢 **Admin Login**: `http://localhost:3000/login/admin`
- ⚙️ **Admin Dashboard**: `http://localhost:3000/admin/dashboard`

### For Riders
- 🏍️ **Rider Login**: `http://localhost:3000/login/rider`
- 📝 **Rider Register**: `http://localhost:3000/register/rider`
- 📊 **Rider Dashboard**: `http://localhost:3000/rider/dashboard`

### For Customers
- 👤 **Customer Login**: `http://localhost:3000/login/customer`
- 📝 **Customer Register**: `http://localhost:3000/register/customer`
- 📦 **Customer Dashboard**: `http://localhost:3000/user/dashboard`

## Test Credentials

### Admin
```
Email: admin@example.com
Password: Admin123!
Role: ADMIN
```

### Test Rider (after registration)
```
Email: rider@test.com
Password: 123456
Phone: +880 1234567890
Vehicle: Motorcycle (DHA-1234)
Role: RIDER
```

### Test Customer (after registration)
```
Email: customer@test.com
Password: 123456
Phone: +880 9876543210
Role: CUSTOMER
```

## Color Coding

🔵 **Admin** - Blue theme
- Login: `/login/admin`
- Dashboard: `/admin/dashboard`

🟢 **Rider** - Green theme
- Login: `/login/rider`
- Register: `/register/rider`
- Dashboard: `/rider/dashboard`

🟠 **Customer** - Amber/Orange theme
- Login: `/login/customer`
- Register: `/register/customer`
- Dashboard: `/user/dashboard`

## Page Features

### Login Pages (All Roles)
✅ Email field  
✅ Password field  
✅ Error messages  
✅ Back to role chooser link  
✅ Role-specific styling  
✅ Loading state  
✅ Help text  

### Registration Pages (Rider & Customer)
✅ Name field  
✅ Email field  
✅ Phone field  
✅ Address field (Customer only)  
✅ Vehicle fields (Rider only)  
✅ Password fields  
✅ Form validation  
✅ Error messages  
✅ Success message  

## Field Requirements

### Admin Login
- Email (required)
- Password (required)

### Rider Login
- Email (required)
- Password (required)

### Customer Login
- Email (required)
- Password (required)

### Rider Registration
- Name (required)
- Email (required)
- Phone (required)
- Vehicle Type (optional)
- Vehicle Number (optional)
- Password (required, min 6)
- Confirm Password (required)

### Customer Registration
- Name (required)
- Email (required)
- Phone (required)
- Address (optional)
- Password (required, min 6)
- Confirm Password (required)

## Validation Rules

### Email
- ✅ Must be valid email format
- ✅ Must be unique (not already registered)

### Password
- ✅ Minimum 6 characters
- ✅ Must match confirm password field
- ✅ Case-sensitive
- ✅ No spaces at start/end

### Phone
- ✅ Should be valid phone format
- ✅ Country code recommended (e.g., +880)

### Vehicle Type (Rider)
- 🏍️ Motorcycle
- 🚴 Bicycle
- 🚗 Car
- 🚐 Van
- 🚚 Truck

## Post-Login Behavior

### Admin Login
```
/login/admin
  ↓ (submit valid admin email/password)
/admin/dashboard
```

### Rider Login
```
/login/rider
  ↓ (submit valid rider email/password)
/rider/dashboard
```

### Customer Login
```
/login/customer
  ↓ (submit valid customer email/password)
/user/dashboard (customer dashboard)
```

## Post-Registration Behavior

### Rider Registration
```
/register/rider
  ↓ (fill form and submit)
Success message displayed
  ↓ (auto-redirect after 2 seconds)
/login/rider
```

### Customer Registration
```
/register/customer
  ↓ (fill form and submit)
Success message displayed
  ↓ (auto-redirect after 2 seconds)
/login/customer
```

## Error Handling

### Common Errors & Solutions

**"Invalid email or password"**
- Check email is correct
- Check password is correct
- Check CAPS LOCK

**"This account is not a [role] account"**
- You're logged in to wrong role portal
- Use correct login page for your role

**"Email already exists"**
- That email is already registered
- Try different email or reset password

**"Passwords do not match"**
- Password fields must be identical
- Check for typos

**"Password must be at least 6 characters"**
- Password too short
- Enter at least 6 characters

**"This field is required"**
- Leave no fields empty
- All marked fields must be filled

## File Structure

```
frontend/app/(auth)/
├── login/
│   ├── page.tsx              ← Redirects to /login/choose
│   ├── choose/
│   │   └── page.tsx          ← Role selector
│   ├── admin/
│   │   └── page.tsx          ← Admin login
│   ├── rider/
│   │   └── page.tsx          ← Rider login
│   └── customer/
│       └── page.tsx          ← Customer login
├── register/
│   ├── page.tsx              ← Redirects to /register/choose
│   ├── choose/
│   │   └── page.tsx          ← Role selector
│   ├── rider/
│   │   └── page.tsx          ← Rider signup
│   └── customer/
│       └── page.tsx          ← Customer signup
├── schema.ts                 ← Zod schemas
└── layout.tsx                ← Auth layout
```

## Development Tips

### Testing Role-Specific Pages
1. Visit `/login/choose` to see role selector
2. Click any role to go to that role's login
3. Try entering wrong credentials to test error
4. Visit role-specific URLs directly

### Testing Registration
1. Visit `/register/choose`
2. Select Rider or Customer
3. Fill out form with test data
4. Submit and verify success message
5. Try logging in with new account

### Manual Testing
```bash
# Test Admin Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

# Test Rider Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rider@test.com","password":"123456"}'

# Test Customer Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"123456"}'
```

## Browser Navigation

### Chrome DevTools
1. **F12** → Open DevTools
2. **Network** tab → See API calls
3. **Console** tab → See errors
4. **Application** tab → Check localStorage for token

### Testing Flow
1. Open `/login/choose`
2. Check Network tab while clicking role
3. Verify redirects to correct login page
4. Enter credentials and check API call
5. Verify token saved in localStorage
6. Verify redirect to dashboard

---

**Status**: ✅ Ready to Use  
**Last Updated**: Feb 14, 2026  
**Version**: 1.0
