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

// Debug batch API
async function debugBatchAPI() {
  try {
    await connectDB();

    console.log('🔍 Debugging Batch API...\n');

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
      console.log('   ---');
    });

    // Now test with population using Mongoose
    const Batch = mongoose.model('Batch', new mongoose.Schema({}, { strict: false }));
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    const Mentor = mongoose.model('Mentor', new mongoose.Schema({}, { strict: false }));

    const batches = await Batch.find(query)
      .populate('courseId', 'title description shortDescription coverPhoto courseCode courseShortcut category level language duration durationUnit whatYouWillLearn requirements features marketing')
      .populate('mentorId', 'name email avatar designation experience expertise')
      .populate('additionalMentors', 'name email avatar designation experience expertise')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`\n📊 Populated batches found: ${batches.length}`);
    
    batches.forEach((batch, index) => {
      console.log(`${index + 1}. ${batch.name} (${batch.batchCode || 'No code'})`);
      console.log(`   Status: ${batch.status}`);
      console.log(`   Course ID: ${batch.courseId?._id || 'None'}`);
      console.log(`   Course Title: ${batch.courseId?.title || 'None'}`);
      console.log(`   Mentor ID: ${batch.mentorId?._id || 'None'}`);
      console.log(`   Mentor Name: ${batch.mentorId?.name || 'None'}`);
      console.log(`   Regular Price: ${batch.regularPrice || 'None'}`);
      console.log(`   Discount Price: ${batch.discountPrice || 'None'}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Error debugging batch API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugBatchAPI();
