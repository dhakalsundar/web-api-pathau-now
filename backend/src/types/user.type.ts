import z from "zod";

export const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    phoneNumber: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().optional(),
    role: z.enum(["CUSTOMER", "STAFF", "ADMIN", "RIDER"]).default("CUSTOMER"),
    isActive: z.boolean().optional(),
    refreshToken: z.string().optional().nullable(),
    refreshTokenExpiresAt: z.date().optional().nullable(),
});

export type UserType = z.infer<typeof UserSchema>;