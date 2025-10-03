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

// Find all batches
async function findAllBatches() {
  try {
    await connectDB();

    console.log('🔍 Finding all batches...\n');

    // Get all batches from all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));

    // Check batches collection
    const batches = await mongoose.connection.db.collection('batches').find({}).toArray();
    console.log(`\n📊 Batches in 'batches' collection: ${batches.length}`);
    
    batches.forEach((batch, index) => {
      console.log(`${index + 1}. ${batch.name} (${batch.batchCode || 'No code'})`);
      console.log(`   Status: ${batch.status}`);
      console.log(`   Active: ${batch.isActive}`);
      console.log(`   Course ID: ${batch.courseId || 'None'}`);
      console.log(`   Created: ${batch.createdAt}`);
      console.log(`   Updated: ${batch.updatedAt}`);
      console.log('   ---');
    });

    // Check if there are any other collections with batch data
    for (const collection of collections) {
      if (collection.name.includes('batch') || collection.name.includes('Batch')) {
        console.log(`\n📊 Checking collection: ${collection.name}`);
        const docs = await mongoose.connection.db.collection(collection.name).find({}).toArray();
        console.log(`   Documents: ${docs.length}`);
        
        if (docs.length > 0) {
          docs.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.name || doc.title || 'No name'} (${doc.batchCode || 'No code'})`);
            console.log(`      Status: ${doc.status || 'No status'}`);
            console.log(`      Active: ${doc.isActive || 'No active field'}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('Error finding batches:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

findAllBatches();
