import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
import { MONGO_URL } from '../config';
import { logger } from '../utils/logger';

export async function connectDatabase(){
    try {
        const uri = String(MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI);
        await mongoose.connect(uri);
        logger.info("✅ Connected to MongoDB");
        return;
    } catch (error: any) {
        logger.error("❌ Database Error:", error.message || error);
        try {
            logger.info("🔄 Attempting to start in-memory MongoDB for development...");
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            logger.info("✅ Connected to in-memory MongoDB");
            return;
        } catch (memErr) {
            logger.error("❌ In-memory MongoDB failed:", memErr);
            process.exit(1);
        }
    }
}