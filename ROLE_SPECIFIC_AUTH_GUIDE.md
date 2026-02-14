# Role-Specific Authentication System

## Overview

The PathauNow platform now features role-specific login and registration pages tailored for three user types:
- **Admins/Staff**: Manage operations and users
- **Riders**: Manage deliveries and earn money
- **Customers**: Book and track shipments

## Directory Structure

```
frontend/app/(auth)/
├── login/
│   ├── page.tsx              # Redirects to /login/choose
│   ├── choose/
│   │   └── page.tsx          # Role selection page
│   ├── admin/
│   │   └── page.tsx          # Admin login
│   ├── rider/
│   │   └── page.tsx          # Rider login
│   └── customer/
│       └── page.tsx          # Customer login
├── register/
│   ├── page.tsx              # Redirects to /register/choose
│   ├── choose/
│   │   └── page.tsx          # Role selection page
│   ├── rider/
│   │   └── page.tsx          # Rider registration
│   └── customer/
│       └── page.tsx          # Customer registration
└── layout.tsx
```

## User Flows

### Login Flow

```
/login
  ↓
/login/choose (Select role)
  ↓
- /login/admin       → Admin dashboard
- /login/rider       → Rider dashboard
- /login/customer    → Customer dashboard
```

### Registration Flow

```
/register
  ↓
/register/choose (Select role)
  ↓
- /register/rider    → Rider portal
- /register/customer → Customer portal
- /register/admin    → DISABLED (Admin-only accounts)
```

## Page Details

### 1. Login Role Chooser (`/login/choose`)

**Purpose**: User selects their role type

**Features**:
- 3 role cards (Admin, Rider, Customer)
- Visual cards with color coding
- Role descriptions
- Click-to-login buttons
- Link to registration chooser

**Colors**:
- Admin: Blue
- Rider: Green
- Customer: Amber

### 2. Admin Login (`/login/admin`)

**Purpose**: Authenticate admin/staff users

**Features**:
- Blue gradient theme
- Email and password fields
- Role verification (must be ADMIN or STAFF)
- Error handling for wrong role
- Back link to role chooser
- Help text about admin-only access

**Validation**:
- ✅ Email format
- ✅ Password not empty
- ✅ Role must be ADMIN or STAFF

### 3. Rider Login (`/login/rider`)

**Purpose**: Authenticate rider/delivery partner users

**Features**:
- Green gradient theme
- Email and password fields
- Role verification (must be RIDER)
- Error handling for wrong role
- Back link to role chooser
- Help text about new rider sign-up

**Validation**:
- ✅ Email format
- ✅ Password not empty
- ✅ Role must be RIDER

**Post-login**: Redirects to `/rider/dashboard`

### 4. Customer Login (`/login/customer`)

**Purpose**: Authenticate customer/user accounts

**Features**:
- Amber/orange gradient theme
- Email and password fields
- Role verification (must be CUSTOMER)
- Error handling for wrong role
- Back link to role chooser
- Link to customer registration
- Help text about account benefits

**Validation**:
- ✅ Email format
- ✅ Password not empty
- ✅ Role must be CUSTOMER

**Post-login**: Redirects to `/user/dashboard`

### 5. Registration Role Chooser (`/register/choose`)

**Purpose**: User selects role type for new account

**Features**:
- 2 enabled role cards (Rider, Customer)
- 1 disabled card (Admin - admin-only)
- Visual cards with color coding
- Role descriptions
- Click-to-register buttons
- Link to login chooser

**Disabled Accounts**:
- Admin accounts are created by management/system only
- Cannot be self-registered

### 6. Rider Registration (`/register/rider`)

**Purpose**: Create new rider account

**Fields**:
- Full Name (required)
- Email (required)
- Phone Number (required)
- Vehicle Type (optional - dropdown)
- Vehicle Number/Plate (optional)
- Password (required, min 6 chars)
- Confirm Password (required)

**Vehicle Types**:
- 🏍️ Motorcycle
- 🚴 Bicycle
- 🚗 Car
- 🚐 Van
- 🚚 Truck

**Validations**:
- ✅ Name not empty
- ✅ Valid email format
- ✅ Phone number not empty
- ✅ Password min 6 characters
- ✅ Passwords match
- ✅ Unique email

**Post-registration**: Redirects to `/login/rider`

**Data Saved**:
- Name
- Email
- Phone Number
- Vehicle Type
- Vehicle Number
- Role: RIDER
- Status: AVAILABLE (default)

### 7. Customer Registration (`/register/customer`)

**Purpose**: Create new customer account

**Fields**:
- Full Name (required)
- Email (required)
- Phone Number (required)
- Delivery Address (optional)
- Password (required, min 6 chars)
- Confirm Password (required)

**Validations**:
- ✅ Name not empty
- ✅ Valid email format
- ✅ Phone number not empty
- ✅ Password min 6 characters
- ✅ Passwords match
- ✅ Unique email

**Post-registration**: Redirects to `/login/customer`

**Data Saved**:
- Name
- Email
- Phone Number
- Address
- Role: CUSTOMER

## Color Scheme

| Role | Primary Color | Gradient | Text Color | Accent |
|------|---------------|----------|-----------|--------|
| Admin | Blue | from-blue-500 to-blue-600 | text-blue-600 | Blue 50 |
| Rider | Green | from-green-500 to-green-600 | text-green-600 | Green 50 |
| Customer | Amber | from-amber-500 to-amber-600 | text-amber-600 | Amber 50 |

## Key Features

### 1. Role Verification
- Each role-specific login page verifies the user's role
- If wrong role, shows error and doesn't redirect
- Prevents cross-role access

### 2. Prevented Actions
- Riders cannot login to admin portal
- Admins cannot login to rider portal
- Customers cannot access either

### 3. Self-Service Registration
- Riders can self-register
- Customers can self-register
- Admins must be created by system

### 4. Smart Redirects
- Login pages redirect to role-specific pages
- Old `/login` and `/register` URLs still work
- Automatic forward to chooser pages

## Code Examples

### Login Flow (Admin)
```typescript
// User visits /login
// Redirected to /login/choose
// Clicks "Admin" → goes to /login/admin
// Submits credentials
// Backend verifies role === 'ADMIN' || role === 'STAFF'
// ✅ Redirects to /admin/dashboard
// ❌ Or shows error if wrong role
```

### Registration Flow (Rider)
```typescript
// User visits /register
// Redirected to /register/choose
// Clicks "Rider" → goes to /register/rider
// Fills: name, email, phone, vehicle, password
// Submits form
// Backend creates user with role = 'RIDER'
// ✅ Shows success message
// ✅ Redirects to /login/rider
```

## Security Measures

- ✅ JWT token validation
- ✅ Role-based access control
- ✅ Email uniqueness check
- ✅ Password min length (6 chars)
- ✅ Role verification on login
- ✅ Cross-site request forgery (CSRF) protection
- ✅ Secure password storage (hashed)

## Testing Checklist

### Login Tests
- [ ] Admin login works
- [ ] Admin sees correct dashboard
- [ ] Rider login works
- [ ] Rider sees correct dashboard
- [ ] Customer login works
- [ ] Customer sees correct dashboard
- [ ] Wrong credentials show error
- [ ] Wrong role shows error
- [ ] Back links work
- [ ] Redirects work correctly

### Registration Tests
- [ ] Rider registration works
- [ ] Customer registration works
- [ ] Admin registration disabled
- [ ] Email uniqueness enforced
- [ ] Password validation works
- [ ] Form validation works
- [ ] Success message shows
- [ ] Redirect to login works
- [ ] Back links work

### Edge Cases
- [ ] Empty fields rejected
- [ ] Invalid email rejected
- [ ] Mismatched passwords rejected
- [ ] Short password rejected
- [ ] Duplicate email rejected
- [ ] XSS attempts blocked
- [ ] SQL injection attempts blocked

## Future Enhancements

1. **Social Login**: Google, Facebook, GitHub
2. **Email Verification**: Verify email before activation
3. **Phone Verification**: SMS confirmation
4. **Password Reset**: Forgot password flow
5. **Two-Factor Authentication**: 2FA for admin
6. **Profile Completion**: Force complete profile on first login
7. **Terms & Conditions**: Acceptance during registration
8. **Referral System**: Invite friends with code

## Troubleshooting

### Issue: Login redirects to wrong page
**Solution**: Check user role in database, verify correct role is set

### Issue: Registration says email exists
**Solution**: That email is already registered, use different email

### Issue: Password validation fails
**Solution**: Password must be at least 6 characters, match both fields

### Issue: Can't access role-specific pages
**Solution**: Make sure you're logged in with correct role

### Issue: Missing vehicle type dropdown
**Solution**: Check vehicles array in rider registration component

## Support

For authentication issues:
1. Check browser console for errors
2. Check network tab for API responses
3. Verify credentials are correct
4. Verify user role in database
5. Check backend logs for errors

---

**Ready to use!** Users can now login/register with their specific role. 🚀
