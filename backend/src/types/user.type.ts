import z from "zod";

// Nepal phone number validation: 10 digits starting with 98 or 97
const nepaliPhoneNumber = z.string()
  .regex(/^(\+977)?9[78]\d{8}$/, "Invalid Nepal phone number. Must be 10 digits starting with 98 or 97")
  .optional();

export const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    phoneNumber: nepaliPhoneNumber,
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().optional(),
    role: z.enum(["CUSTOMER", "STAFF", "ADMIN", "RIDER"]).default("CUSTOMER"),
    isActive: z.boolean().optional(),
    refreshToken: z.string().optional().nullable(),
    refreshTokenExpiresAt: z.date().optional().nullable(),
    // Rider-specific fields
    vehicleType: z.enum(['BIKE', 'CAR', 'VAN']).optional(),
    vehicleNumber: z.string().optional(),
    riderStatus: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']).optional(),
    currentLocation: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        address: z.string().optional(),
    }).optional(),
    assignedParcels: z.array(z.string()).optional(),
    totalDeliveries: z.number().optional(),
    rating: z.number().optional(),
    // Password reset OTP fields
    resetPassword: z.object({
        otpHash: z.string().optional().nullable(),
        expiresAt: z.date().optional().nullable(),
        verified: z.boolean().optional(),
    }).optional(),
});

export type UserType = z.infer<typeof UserSchema>;