import { UserModel } from '../models/user.model';

/**
 * Seed sample riders for development and testing
 */
export async function seedRiders() {
  try {
    // Check if riders already exist
    const existingRiders = await UserModel.countDocuments({ role: 'RIDER' });
    
    if (existingRiders > 0) {
      console.log(` ${existingRiders} rider(s) already exist`);
      // Update existing riders to AVAILABLE status
      await UserModel.updateMany({ role: 'RIDER' }, { riderStatus: 'AVAILABLE' });
      console.log(` Updated all riders to AVAILABLE status`);
      return;
    }

    const sampleRiders = [
      {
        firstName: 'Raj',
        lastName: 'Kumar',
        email: 'raj.kumar@pathao.com',
        password: 'hashedPassword123', // In real scenario, hash the password
        phoneNumber: '+9779841234567',
        vehicleType: 'BIKE' as const,
        vehicleNumber: 'KTM-2024-001',
        riderStatus: 'AVAILABLE' as const,
        role: 'RIDER' as const,
        isActive: true,
        totalDeliveries: 45,
        rating: 4.8,
      },
      {
        firstName: 'Priya',
        lastName: 'Singh',
        email: 'priya.singh@pathao.com',
        password: 'hashedPassword123',
        phoneNumber: '+9779851234567',
        vehicleType: 'BIKE' as const,
        vehicleNumber: 'HERO-2024-002',
        riderStatus: 'AVAILABLE' as const,
        role: 'RIDER' as const,
        isActive: true,
        totalDeliveries: 32,
        rating: 4.6,
      },
      {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit.patel@pathao.com',
        password: 'hashedPassword123',
        phoneNumber: '+9779861234567',
        vehicleType: 'CAR' as const,
        vehicleNumber: 'NPL-CAR-003',
        riderStatus: 'AVAILABLE' as const,
        role: 'RIDER' as const,
        isActive: true,
        totalDeliveries: 67,
        rating: 4.9,
      },
      {
        firstName: 'Neha',
        lastName: 'Sharma',
        email: 'neha.sharma@pathao.com',
        password: 'hashedPassword123',
        phoneNumber: '+9779871234567',
        vehicleType: 'BIKE' as const,
        vehicleNumber: 'VROOM-2024-004',
        riderStatus: 'AVAILABLE' as const,
        role: 'RIDER' as const,
        isActive: true,
        totalDeliveries: 28,
        rating: 4.5,
      },
      {
        firstName: 'Vikram',
        lastName: 'Reddy',
        email: 'vikram.reddy@pathao.com',
        password: 'hashedPassword123',
        phoneNumber: '+9779881234567',
        vehicleType: 'VAN' as const,
        vehicleNumber: 'VAN-EXPRESS-005',
        riderStatus: 'AVAILABLE' as const,
        role: 'RIDER' as const,
        isActive: true,
        totalDeliveries: 89,
        rating: 4.7,
      },
    ];

    const createdRiders = await UserModel.insertMany(sampleRiders);
    console.log(` Seeded ${createdRiders.length} sample riders`);
    
    return createdRiders;
  } catch (error) {
    console.error(' Error seeding riders:', error);
    throw error;
  }
}
