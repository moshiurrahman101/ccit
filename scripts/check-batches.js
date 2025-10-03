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

// Check batches in database
async function checkBatches() {
  try {
    await connectDB();

    // Get all batches
    const allBatches = await mongoose.connection.db.collection('batches').find({}).toArray();
    console.log(`\n📊 Total batches in database: ${allBatches.length}`);

    if (allBatches.length > 0) {
      console.log('\n📋 All batches:');
      allBatches.forEach((batch, index) => {
        console.log(`${index + 1}. ${batch.name || 'No name'} (${batch.batchCode || 'No code'})`);
        console.log(`   Status: ${batch.status || 'No status'}`);
        console.log(`   Active: ${batch.isActive || false}`);
        console.log(`   Course ID: ${batch.courseId || 'No course'}`);
        console.log('   ---');
      });
    }

    // Check published batches
    const publishedBatches = await mongoose.connection.db.collection('batches').find({
      isActive: true,
      status: { $in: ['published', 'upcoming', 'ongoing'] }
    }).toArray();

    console.log(`\n✅ Published/Active batches: ${publishedBatches.length}`);

    if (publishedBatches.length > 0) {
      console.log('\n📋 Published batches:');
      publishedBatches.forEach((batch, index) => {
        console.log(`${index + 1}. ${batch.name || 'No name'} (${batch.batchCode || 'No code'})`);
        console.log(`   Status: ${batch.status || 'No status'}`);
        console.log(`   Course ID: ${batch.courseId || 'No course'}`);
        console.log('   ---');
      });
    }

    // Check courses
    const courses = await mongoose.connection.db.collection('courses').find({}).toArray();
    console.log(`\n📚 Total courses in database: ${courses.length}`);

    if (courses.length > 0) {
      console.log('\n📋 All courses:');
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title || 'No title'} (${course.courseCode || 'No code'})`);
        console.log(`   Status: ${course.status || 'No status'}`);
        console.log(`   Active: ${course.isActive || false}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('Error checking batches:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkBatches();
