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

// Debug API query
async function debugAPIQuery() {
  try {
    await connectDB();

    console.log('🔍 Debugging API query...\n');

    // Test the exact query from the API
    const query = {
      isActive: true,
      status: { $in: ['published', 'upcoming', 'ongoing'] }
    };

    console.log('📋 Query:', JSON.stringify(query, null, 2));

    // Get batches without population first
    const batchesRaw = await mongoose.connection.db.collection('batches').find(query).toArray();
    console.log(`\n📊 Raw batches found: ${batchesRaw.length}`);
    
    batchesRaw.forEach((batch, index) => {
      console.log(`${index + 1}. ${batch.name} (${batch.batchCode || 'No code'})`);
      console.log(`   Status: ${batch.status}`);
      console.log(`   Active: ${batch.isActive}`);
      console.log(`   Course ID: ${batch.courseId || 'None'}`);
      console.log(`   Created: ${batch.createdAt}`);
      console.log(`   Updated: ${batch.updatedAt}`);
      console.log('   ---');
    });

    // Check if there are any batches with different status
    const allBatches = await mongoose.connection.db.collection('batches').find({}).toArray();
    console.log(`\n📊 All batches in database: ${allBatches.length}`);
    
    allBatches.forEach((batch, index) => {
      console.log(`${index + 1}. ${batch.name} (${batch.batchCode || 'No code'})`);
      console.log(`   Status: ${batch.status}`);
      console.log(`   Active: ${batch.isActive}`);
      console.log(`   Course ID: ${batch.courseId || 'None'}`);
      console.log(`   Created: ${batch.createdAt}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Error debugging API query:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugAPIQuery();
