# PathauNow Frontend - Complete Setup Guide

## 📱 Project Overview

Professional Next.js frontend for PathauNow courier tracking platform with modern UI, responsive design, and complete integration with the backend API.

**Tech Stack:**
- Next.js 16.1.1 with App Router
- React 19.2.3 with Hooks
- TypeScript 5.x for type safety
- Tailwind CSS 4 for styling
- Axios for API calls
- Zod for validation
- React Hook Form for forms

---

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── (auth)/              # Authenticated user routes
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   └── schema.ts        # Auth validation schemas
│   │
│   ├── (public)/            # Public pages
│   │   ├── about/           # About us page
│   │   ├── contact/         # Contact page
│   │   ├── privacy/         # Privacy policy
│   │   ├── terms/           # Terms of service
│   │   └── page.tsx         # Public home
│   │
│   ├── admin/               # Admin dashboard
│   │   ├── dashboard/       # Analytics dashboard
│   │   ├── shipments/       # Shipment management
│   │   ├── riders/          # Rider management
│   │   ├── users/           # User management
│   │   └── analytics/       # Analytics page
│   │
│   ├── booking/             # Parcel booking page
│   ├── track/               # Public tracking page
│   ├── user/                # User profile pages
│   │
│   ├── components/          # Reusable components
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── Sidebar.tsx      # Admin sidebar
│   │   ├── StatCard.tsx     # Dashboard stats
│   │   ├── Timeline.tsx     # Tracking timeline
│   │   └── DataTable.tsx    # Data tables
│   │
│   ├── lib/                 # Utilities and services
│   │   ├── api.ts           # Axios configuration
│   │   ├── services.ts      # API service functions
│   │   └── ...
│   │
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
│
├── public/                  # Static assets
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.cjs      # Tailwind config
└── next.config.ts           # Next.js config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ 
- npm or yarn package manager
- Backend API running on `http://localhost:5000`

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment variables:**

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for production:
```bash
npm run build
npm start
```

---

## 🎨 Key Pages & Features

### Public Pages
- **Home Page** (`/`)
  - Hero section with features
  - Quick tracking input
  - Call-to-action buttons
  - Trust badges (50K+ deliveries, 98% success rate)

- **Track Page** (`/track/[trackingNumber]`)
  - Real-time shipment tracking
  - Timeline with events
  - Sender/recipient details
  - Payment status

- **Booking Page** (`/booking`)
  - Parcel booking form
  - Auto price calculator
  - Weight and delivery type selection
  - Instant booking confirmation

### Authentication
- **Login** (`/login`)
  - Email & password authentication
  - Demo credentials display
  - Redirect to admin dashboard for admins
  
- **Register** (`/register`)
  - User account creation
  - Password validation
  - Phone and address fields
  - Profile setup

### Admin Dashboard
- **Dashboard** (`/admin/dashboard`)
  - Real-time statistics (total parcels, deliveries, revenue)
  - Recent shipments table
  - Active riders count
  - Quick action cards

- **Shipments** (`/admin/shipments`)
  - List all shipments with filters
  - Search by tracking number or sender name
  - Filter by status
  - View, edit, and delete shipments

- **Riders** (`/admin/riders`)
  - Manage delivery partners
  - View rider statistics (deliveries, rating, status)
  - Search and filter riders
  - Update rider status and location

- **Users** (`/admin/users`)
  - Manage customer and staff accounts
  - Filter by role (CUSTOMER, STAFF, ADMIN)
  - Search users by name/email
  - View user details

---

## 🔌 API Integration

All API calls are handled through `/app/lib/services.ts`:

```typescript
// Examples
import { shipmentService, authService, adminService, riderService } from '@/app/lib/services';

// Track shipment
const result = await shipmentService.trackShipment('PN12ABC34');

// Create shipment
const shipment = await shipmentService.createShipment({
  sender: { name, phone, address },
  recipient: { name, phone, address },
  weight, price, deliveryType
});

// Get admin dashboard stats
const stats = await adminService.getDashboardStats();

// Search riders
const riders = await riderService.searchRiders('John');
```

### Authentication
- JWT tokens stored in localStorage
- Auto-attach token to all authenticated requests
- Redirect to login on 401 errors
- Demo credentials: `admin@example.com` / `Admin123!`

---

## 🎯 Component Library

### Reusable Components

**Navbar** (`/components/Navbar.tsx`)
- Responsive navigation
- User authentication status
- Mobile menu
- Logo branding

**Sidebar** (`/components/Sidebar.tsx`)
- Collapsible admin sidebar
- Navigation items with icons
- User profile section
- Logout button

**StatCard** (`/components/StatCard.tsx`)
- Dashboard statistics display
- Color variants (amber, blue, green, red, purple)
- Trend indicators
- Icon support

**Timeline** (`/components/Timeline.tsx`)
- Shipment progress visualization
- Event history display
- Status emojis and colors
- Location information

**DataTable** (`/components/DataTable.tsx`)
- Responsive data display
- Action buttons
- Loading states
- Empty state messages

---

## 🎨 Styling

### Tailwind CSS Configuration
```javascript
// tailwind.config.cjs
{
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: { /* Custom amber palette */ },
      }
    }
  }
}
```

### Color Scheme
- **Primary**: Amber (#F59E0B) - Used for CTAs, highlights
- **Success**: Green (#10B981) - Delivery success
- **Warning**: Orange (#F97316) - In progress
- **Error**: Red (#EF4444) - Failed deliveries
- **Info**: Blue (#3B82F6) - Information

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🔐 Security Features

1. **JWT Authentication**
   - 30-day token expiry
   - Secure token storage
   - Auto-logout on token expiry

2. **Password Security**
   - Minimum 6 characters
   - Confirmation matching
   - Backend bcrypt hashing

3. **Input Validation**
   - Client-side Zod validation
   - Server-side validation
   - Sanitized outputs

4. **CORS Handling**
   - Backend CORS configuration
   - Cross-domain API calls

---

## 📱 Mobile Responsive Design

All pages are fully responsive:
- Mobile-first design approach
- Touch-friendly buttons and inputs
- Responsive grid layouts
- Collapsible navigation
- Mobile-optimized images

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.pathaunow.com/api
NODE_ENV=production
```

---

## 🐛 Testing

### Run Tests
```bash
npm test
```

### Key Test Areas
- Authentication flow
- Shipment tracking
- Form submissions
- Admin dashboard stats
- API integration

---

## 📚 API Endpoints Used

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile
- `PUT /auth/password` - Change password

### Shipments
- `POST /shipments` - Create shipment
- `GET /shipments` - List user shipments
- `GET /track/:trackingNumber` - Public tracking
- `GET /shipments/:id` - Get shipment details
- `PUT /shipments/:id` - Update shipment

### Admin
- `GET /admin/analytics/dashboard` - Dashboard stats
- `GET /admin/shipments` - All shipments
- `GET /admin/riders` - All riders
- `GET /admin/users` - All users
- `GET /admin/analytics/revenue/date-range` - Revenue reports

---

## 🤝 Contributing

1. Create a feature branch
2. Follow component patterns in `/app/components`
3. Use TypeScript for all new files
4. Test responsive design on mobile
5. Submit pull request

---

## 📝 File Structure Reference

### Page Components
- Use `'use client'` for interactive components
- Import layout components for consistency
- Handle loading and error states
- Implement responsive grids

### API Service Functions
```typescript
// Pattern
export const service = {
  methodName: async (params) => {
    const response = await api.method(`/path`, data);
    return response.data;
  }
};
```

### Component Patterns
```typescript
// Pattern
interface Props {
  data: Type;
  onAction: () => void;
}

export default function Component({ data, onAction }: Props) {
  // Implementation
}
```

---

## 🎓 Next Steps

1. **Customize Branding**: Update colors, fonts, logos
2. **Add Email Notifications**: Send tracking updates
3. **Payment Integration**: Add Stripe/bKash payment gateway
4. **SMS Notifications**: Integrate Twilio for SMS updates
5. **Maps Integration**: Add Google Maps for tracking visualization
6. **Analytics**: Implement Mixpanel or Google Analytics
7. **Performance**: Add image optimization and code splitting

---

## 📞 Support

For issues or questions:
- Check existing documentation
- Review backend API documentation
- Check component prop types
- Test with demo data

---

## 📄 License

All rights reserved © 2024 PathauNow
