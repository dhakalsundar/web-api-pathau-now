import express, { Application, Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { connectDatabase } from "./database/mongodb";
import { PORT, FRONTEND_URL } from "./config";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/requestLogger.middleware";
import { responseFormatter } from "./middleware/responseFormatter.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { socketAuthMiddleware, setupSocketEventHandlers } from "./middleware/socket.auth.middleware";
import { socketEventManager } from "./services/socket.event.manager";
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import adminFixRoutes from "./routes/admin.fix.route";
import trackRoutes from "./routes/track.route";
import adminShipmentRoutes from "./routes/admin.shipment.route";
import shipmentRoutes from "./routes/shipment.route";
import riderRoutes from "./routes/rider.route";
import riderSelfRoutes from "./routes/rider.self.route";
import adminAnalyticsRoutes from "./routes/admin.analytics.route";
import notificationRoutes from "./routes/notification.route";
import { seedRiders } from "./seeders/rider.seeder";

const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if ((FRONTEND_URL && origin.startsWith(FRONTEND_URL)) || origin.startsWith('http://localhost:3000')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  transports: ['websocket', 'polling'],
});

// Initialize Socket Event Manager with IO instance
socketEventManager.initialize(io);

// Apply Socket.IO authentication middleware
io.use(socketAuthMiddleware);

// Handle new socket connections
io.on('connection', (socket) => {
  logger.info(`🔌 [SocketIO] New connection - ID: ${socket.id}, Total: ${socketEventManager.getActiveConnectionsCount()}`);
  
  // Setup event handlers and room joins
  setupSocketEventHandlers(socket);
});

// Log Socket.IO ready
io.on('error', (error) => {
  logger.error(' [SocketIO] Error:', error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if ((FRONTEND_URL && origin.startsWith(FRONTEND_URL)) || origin.startsWith('http://localhost:3000')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

// Serve static files from uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));
logger.info(` Static files directory: ${uploadsDir}`);

// Add request logger and response formatter middleware
app.use(requestLogger);
app.use(responseFormatter);

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/fix", adminFixRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/parcels', shipmentRoutes);
app.use('/api/admin/parcels', adminShipmentRoutes);
app.use('/api/riders/me', riderSelfRoutes);  // Rider self-service routes (must come first - more specific)
app.use('/api/riders', riderRoutes);         // Admin rider management routes
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/notifications', notificationRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" });
});

// Debug endpoint to check current user info from token
app.get("/debug/me", (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'default');
    return res.status(200).json({ user: decoded });
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid token", message: err.message });
  }
});

// 404 handler for unmatched routes
app.use((req: Request, res: Response, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  (error as any).statusCode = 404;
  (error as any).name = 'NotFoundError';
  next(error);
});

// Error handling middleware (must be last)
app.use(errorHandler);

async function startServer() {
  try {
    logger.info(' Starting server...');
    await connectDatabase();
    logger.info(' Database connected');
  } catch (error) {
    logger.error(' Failed to connect database:', error);
    process.exit(1);
  }

  // Seed riders for local dev
  try {
    logger.info('  Seeding riders...');
    await seedRiders();
  } catch (err) {
    logger.error(' Rider seed failed:', err);
  }

  // Seed demo parcels for local dev if none exist
  try {
    const { ShipmentModel } = await import('./models/shipment.model');
    const count = await ShipmentModel.countDocuments();
    if (count === 0) {
      logger.info(' Seeding demo parcels...');
      await ShipmentModel.create([
        {
          trackingNumber: 'PNDEMO1',
          status: 'IN_TRANSIT',
          courier: 'Pathau Express',
          sender: { name: 'ACME Corp', address: 'Sender address', phoneNumber: '+1-555-0101' },
          recipient: { name: 'John Doe', address: 'Recipient address', phoneNumber: '+1-555-0201' },
          events: [
            { status: 'created', message: 'Parcel created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
            { status: 'in_transit', message: 'Left origin facility', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) }
          ]
        },
        {
          trackingNumber: 'PNDEMO2',
          status: 'DELIVERED',
          courier: 'Pathau Express',
          sender: { name: 'Shop', address: 'Shop address', phoneNumber: '+1-555-0102' },
          recipient: { name: 'Jane Roe', address: 'Recipient address', phoneNumber: '+1-555-0202' },
          events: [
            { status: 'created', message: 'Parcel created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) },
            { status: 'delivered', message: 'Parcel delivered', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) }
          ]
        }
      ]);
      logger.info(' Demo parcels created');
    }
  } catch (err) {
    logger.error(' Demo parcel seed failed', err);
  }

  // Ensure there is at least one admin user for local development
  try {
    const { UserModel } = await import('./models/user.model');
    const bcrypt = await import('bcryptjs');
    
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin123!';
    
    const adminExists = await UserModel.findOne({ email: adminEmail });
    
    if (!adminExists) {
      logger.info(' Seeding admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = await UserModel.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+1-555-0001',
        address: 'Admin Office',
        role: 'ADMIN',
        isActive: true,
      });
      
      logger.info(' Admin user created successfully!');
      logger.info(` Email: ${adminEmail}`);
      logger.info(` Password: ${adminPassword}`);
      logger.info(' Name: Admin User');
    } else {
      logger.info(` Admin user already exists - ${adminEmail}`);
    }
  } catch (err) {
    logger.error(' Admin seed failed:', err);
  }

  server.listen(PORT, () => {
    logger.info(` Server running at http://localhost:${PORT}`);
    logger.info(` WebSocket (Socket.IO) initialized and ready for real-time connections`);
  });

  // Handle server errors
  server.on('error', (error: any) => {
    logger.error(' Server error:', error);
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error(' Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(' Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// Export for use in other modules
export { io, socketEventManager };

startServer();
