import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 5000;
export const MONGO_URL: string = process.env.MONGO_URI || 'mongodb://localhost:27017/default_db';

export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default';

export const FRONTEND_URL: string =
    process.env.FRONTEND_URL || 'http://localhost:3000';