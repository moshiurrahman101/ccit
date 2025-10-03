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

// Check batches without courseId
async function checkBatchesWithoutCourse() {
  try {
    await connectDB();

    console.log('🔍 Checking batches without courseId...\n');

    // Find batches without courseId
    const batchesWithoutCourse = await mongoose.connection.db.collection('batches').find({
      courseId: { $exists: false }
    }).toArray();

    console.log(`📊 Batches without courseId: ${batchesWithoutCourse.length}`);
    
    if (batchesWithoutCourse.length > 0) {
      batchesWithoutCourse.forEach((batch, index) => {
        console.log(`${index + 1}. ${batch.name} (${batch.batchCode || 'No code'})`);
        console.log(`   Status: ${batch.status}`);
        console.log(`   Active: ${batch.isActive}`);
        console.log(`   Created: ${batch.createdAt}`);
        console.log(`   Updated: ${batch.updatedAt}`);
        console.log('   ---');
      });

      // Delete these old batches
      const deleteResult = await mongoose.connection.db.collection('batches').deleteMany({
        courseId: { $exists: false }
      });

      console.log(`\n🗑️ Deleted ${deleteResult.deletedCount} old batches without courseId`);
    }

    // Check remaining batches
    const remainingBatches = await mongoose.connection.db.collection('batches').find({}).toArray();
    console.log(`\n✅ Remaining batches: ${remainingBatches.length}`);

    remainingBatches.forEach((batch, index) => {
      console.log(`${index + 1}. ${batch.name} (${batch.batchCode || 'No code'})`);
      console.log(`   Status: ${batch.status}`);
      console.log(`   Course ID: ${batch.courseId || 'None'}`);
      console.log(`   Active: ${batch.isActive}`);
    });

  } catch (error) {
    console.error('Error checking batches:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkBatchesWithoutCourse();
