import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { UserModel } from '../models/user.model';
import { MONGO_URL } from '../config';

/**
 * Seeds the database with a default admin user
 * Run this script with: npx ts-node src/seeders/admin.seeder.ts
 */

async function seedAdmin() {
  try {
    console.log('🚀 Starting admin seeder...\n');
    
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      console.log('📡 Connecting to MongoDB...');
      await mongoose.connect(MONGO_URL as string);
      console.log('✅ Connected to MongoDB\n');
    }

    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin123!';

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: ' + adminEmail);
      console.log('');
      console.log('To reset the admin password, delete the user from MongoDB and run this seeder again.\n');
    } else {
      // Hash password
      const hashedPassword = await bcryptjs.hash(adminPassword, 10);

      // Create admin user
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

      console.log('✅ Admin user created successfully!\n');
      console.log('📧 Email: ' + adminEmail);
      console.log('🔑 Password: ' + adminPassword);
      console.log('👤 Name: Admin User');
      console.log('🔐 Role: ADMIN\n');
      console.log('Use these credentials to login to the admin dashboard.\n');
    }

    console.log('✨ Seeder completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seeder
seedAdmin();
