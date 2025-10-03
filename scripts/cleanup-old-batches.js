const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccit');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clean up old batches
async function cleanupOldBatches() {
  try {
    await connectDB();

    console.log('🧹 Cleaning up old batches...\n');

    // Get all batches
    const allBatches = await mongoose.connection.db.collection('batches').find({}).toArray();
    console.log(`📊 Total batches in database: ${allBatches.length}`);

    // Find batches without courseId
    const batchesWithoutCourse = allBatches.filter(batch => !batch.courseId);
    console.log(`❌ Batches without courseId: ${batchesWithoutCourse.length}`);

    if (batchesWithoutCourse.length > 0) {
      console.log('\n📋 Batches without courseId:');
      batchesWithoutCourse.forEach((batch, index) => {
        console.log(`${index + 1}. ${batch.name} (${batch.batchCode || 'No code'})`);
        console.log(`   Status: ${batch.status}`);
        console.log(`   Created: ${batch.createdAt}`);
      });

      // Delete batches without courseId
      const deleteResult = await mongoose.connection.db.collection('batches').deleteMany({
        courseId: { $exists: false }
      });

      console.log(`\n🗑️ Deleted ${deleteResult.deletedCount} batches without courseId`);
    }

    // Get remaining batches
    const remainingBatches = await mongoose.connection.db.collection('batches').find({}).toArray();
    console.log(`\n✅ Remaining batches: ${remainingBatches.length}`);

    remainingBatches.forEach((batch, index) => {
      console.log(`${index + 1}. ${batch.name} (${batch.batchCode || 'No code'})`);
      console.log(`   Status: ${batch.status}`);
      console.log(`   Course ID: ${batch.courseId || 'None'}`);
      console.log(`   Active: ${batch.isActive}`);
    });

  } catch (error) {
    console.error('Error cleaning up batches:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupOldBatches();
