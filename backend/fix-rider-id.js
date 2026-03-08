// Fix riderUserId mismatch for existing parcels
// Run this with: node fix-rider-id.js

const mongoose = require('mongoose');
require('dotenv').config();

async function fixRiderIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pathau-now');
    console.log(' Connected to MongoDB');

    // Get the Shipment and User models
    const Shipment = mongoose.model('Shipment', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find all assigned shipments
    const assignedShipments = await Shipment.find({ 
      status: 'ASSIGNED',
      riderUserId: { $exists: true, $ne: null }
    });

    console.log(`\n Found ${assignedShipments.length} assigned shipments\n`);

    for (const shipment of assignedShipments) {
      console.log(`Checking shipment ${shipment._id}...`);
      console.log(`  Current riderUserId: ${shipment.riderUserId}`);
      
      // Try to find the user with this _id
      const user = await User.findById(shipment.riderUserId);
      
      if (user) {
        console.log(`   User found: ${user.email} (${user.role})`);
        console.log(`  Shipment is correct, riderUserId matches user._id\n`);
      } else {
        console.log(`   No user found with _id: ${shipment.riderUserId}`);
        console.log(`  This shipment has an invalid riderUserId\n`);
        
        // You can manually fix it here if needed
        // Example: await Shipment.findByIdAndUpdate(shipment._id, { riderUserId: null, status: 'PENDING' });
      }
    }

    console.log(' Done checking all shipments');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
}

fixRiderIds();
