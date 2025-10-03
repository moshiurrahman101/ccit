const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkBatchSlugs = async () => {
  try {
    await connectDB();
    
    // Get all batches
    const batches = await mongoose.connection.db.collection('batches').find({}).toArray();
    console.log(`\n📊 Total batches found: ${batches.length}`);
    
    if (batches.length > 0) {
      console.log('\n🔍 Batch details:');
      batches.forEach((batch, index) => {
        console.log(`\n${index + 1}. Batch ID: ${batch._id}`);
        console.log(`   Name: ${batch.name}`);
        console.log(`   Status: ${batch.status}`);
        console.log(`   IsActive: ${batch.isActive}`);
        console.log(`   Marketing:`, batch.marketing || 'No marketing field');
        console.log(`   CourseId: ${batch.courseId}`);
      });
    }
    
    // Check if any batches have marketing.slug
    const batchesWithSlug = await mongoose.connection.db.collection('batches').find({
      'marketing.slug': { $exists: true }
    }).toArray();
    
    console.log(`\n📝 Batches with marketing.slug: ${batchesWithSlug.length}`);
    
    if (batchesWithSlug.length > 0) {
      batchesWithSlug.forEach((batch, index) => {
        console.log(`${index + 1}. ${batch.name} - Slug: ${batch.marketing.slug}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

checkBatchSlugs();
