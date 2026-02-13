import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDatabase } from "./database/mongodb";
import { PORT, FRONTEND_URL } from "./config";
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import trackRoutes from "./routes/track.route";
import adminShipmentRoutes from "./routes/admin.shipment.route";
import shipmentRoutes from "./routes/shipment.route";
import riderRoutes from "./routes/rider.route";
import adminAnalyticsRoutes from "./routes/admin.analytics.route";

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/admin/shipments', adminShipmentRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" });
});

async function startServer() {
  await connectDatabase();

  // Seed demo shipments for local dev if none exist
  try {
    const { ShipmentModel } = await import('./models/shipment.model');
    const count = await ShipmentModel.countDocuments();
    if (count === 0) {
      console.log('Seeding demo shipments...');
      await ShipmentModel.create([
        {
          trackingNumber: 'PNDEMO1',
          status: 'IN_TRANSIT',
          courier: 'Pathau Express',
          sender: { name: 'ACME Corp', address: 'Sender address', phoneNumber: '+1-555-0101' },
          recipient: { name: 'John Doe', address: 'Recipient address', phoneNumber: '+1-555-0201' },
          events: [
            { status: 'created', message: 'Shipment created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
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
            { status: 'created', message: 'Shipment created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) },
            { status: 'delivered', message: 'Package delivered', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) }
          ]
        }
      ]);
      console.log('Demo shipments created');
    }
  } catch (err) {
    console.log('Seed failed', err);
  }

  // Ensure there is at least one admin user for local development
  try {
    const { UserModel } = await import('./models/user.model');
    const bcrypt = await import('bcryptjs');
    const adminExists = await UserModel.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      console.log('Seeding admin user...');
      const hashed = await bcrypt.hash('Admin123!', 10);
      await UserModel.create({ email: 'admin@example.com', password: hashed, firstName: 'Admin', role: 'ADMIN' });
      console.log('Admin user created - email: admin@example.com password: Admin123!');
    }
  } catch (err) {
    console.log('Admin seed failed', err);
  }

  // Attach error handler middleware (last)
  import('./middleware/error.middleware').then(m => app.use(m.errorHandler));

  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
}

startServer();
