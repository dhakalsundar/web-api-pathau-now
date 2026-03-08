import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 5000;
export const MONGO_URL: string =process.env.MONGO_URI || 'mongodb+srv://newUser:12345@cluster0.uqqcfed.mongodb.net/pathau-now-db?appName=Cluster0';

export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default';

export const FRONTEND_URL: string =
    process.env.FRONTEND_URL || 'http://localhost:3000';

// Email configuration
export const EMAIL_HOST: string = process.env.EMAIL_HOST || 'smtp.gmail.com';
export const EMAIL_PORT: number = parseInt(process.env.EMAIL_PORT || '587');
export const EMAIL_USER: string = process.env.EMAIL_USER || '';
export const EMAIL_PASSWORD: string = process.env.EMAIL_PASSWORD || '';
export const EMAIL_FROM: string = process.env.EMAIL_FROM || 'noreply@pathaunow.com';

// OTP configuration
export const OTP_EXPIRY_MINUTES: number = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
export const OTP_LENGTH: number = 6;