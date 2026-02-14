import { z } from 'zod';

// Helper: Convert empty strings to undefined for optional fields
const emptyStringToUndefined = z.literal('').transform(() => undefined);

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Support both 'name' (from frontend) and 'firstName' (legacy)
  name: z.string().min(2, 'Name is required').optional(),
  firstName: z.string().min(2, 'First name is required').optional(),
  lastName: z.string().optional(),
  // Support both 'phone' (from frontend) and 'phoneNumber' (legacy)
  phone: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN', 'RIDER']).optional(),
  // Rider-specific fields - handle empty strings
  vehicleType: z.union([z.enum(['BIKE', 'CAR', 'VAN']), emptyStringToUndefined]).optional(),
  vehicleNumber: z.string().optional(),
}).refine(
  (data) => data.name || data.firstName,
  { message: 'Either name or firstName is required' }
);

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Shipment Schemas
export const createShipmentSchema = z.object({
  sender: z.object({
    name: z.string().min(2, 'Sender name is required'),
    address: z.string().min(5, 'Sender address is required'),
    phoneNumber: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email().optional(),
  }),
  recipient: z.object({
    name: z.string().min(2, 'Recipient name is required'),
    address: z.string().min(5, 'Recipient address is required'),
    phoneNumber: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email().optional(),
  }),
  weight: z.number().positive('Weight must be positive').optional(),
  price: z.number().positive('Price must be positive').optional(),
  deliveryType: z.enum(['STANDARD', 'EXPRESS', 'SAME_DAY']).optional(),
  parcelType: z.enum(['DOCUMENT', 'PARCEL', 'FOOD', 'FRAGILE', 'HEAVY', 'OTHER']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'COD']).optional(),
  notes: z.string().optional(),
});

export const updateShipmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED']),
  message: z.string().optional(),
  location: z.string().optional(),
});

export const assignRiderSchema = z.object({
  riderId: z.string().min(1, 'Rider ID is required'),
});

export const searchShipmentSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Rider Schemas
export const createRiderSchema = z.object({
  name: z.string().min(2, 'Rider name is required'),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  vehicleType: z.enum(['BIKE', 'CAR', 'VAN']).optional(),
  vehicleNumber: z.string().optional(),
  status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']).optional(),
});

export const updateRiderSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10).optional(),
  vehicleType: z.enum(['BIKE', 'CAR', 'VAN']).optional(),
  vehicleNumber: z.string().optional(),
  status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']).optional(),
  isActive: z.boolean().optional(),
});

export const updateRiderLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
});

// User Schemas
export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Query Schemas
export const paginationSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});
