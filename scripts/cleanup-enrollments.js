// Simple script to clean up enrollment data
// Run this with: node scripts/cleanup-enrollments.js

const mongoose = require('mongoose');

// Import models
const Invoice = require('../models/Invoice');
const Batch = require('../models/Batch');

async function cleanupEnrollments() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get counts before cleanup
    const invoiceCount = await Invoice.countDocuments();
    const batchCount = await Batch.countDocuments();
    console.log(`📊 Found ${invoiceCount} invoices and ${batchCount} batches`);

    // Delete all invoices
    console.log('🗑️  Deleting all invoices...');
    const deletedInvoices = await Invoice.deleteMany({});
    console.log(`✅ Deleted ${deletedInvoices.deletedCount} invoices`);

    // Reset all batch student counts
    console.log('🔄 Resetting batch student counts...');
    const resetBatches = await Batch.updateMany(
      {},
      { $set: { currentStudents: 0 } }
    );
    console.log(`✅ Reset student count for ${resetBatches.modifiedCount} batches`);

    console.log('🎉 Cleanup completed successfully!');
    console.log('📝 Summary:');
    console.log(`   - Deleted ${deletedInvoices.deletedCount} invoices`);
    console.log(`   - Reset ${resetBatches.modifiedCount} batches`);
    console.log('');
    console.log('🚀 You can now enroll in courses fresh!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run cleanup
cleanupEnrollments();
