import z from "zod";
import { UserSchema } from "../types/user.type";
export const CreateUserDTO = UserSchema.pick(
    {
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        phoneNumber: true
    }
).extend( 
    {
        confirmPassword: z.string().min(6)
    }
).refine( 
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
)
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

// Forgot Password DTOs
export const ForgotPasswordDTO = z.object({
    email: z.string().email("Invalid email address")
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const VerifyOtpDTO = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers")
});
export type VerifyOtpDTO = z.infer<typeof VerifyOtpDTO>;

export const ResetPasswordDTO = z.object({
    email: z.string().email("Invalid email address"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
);
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;