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

// Fix batch course data
async function fixBatchCourseData() {
  try {
    await connectDB();

    console.log('🔧 Fixing batch course data...\n');

    // Get all batches
    const batches = await mongoose.connection.db.collection('batches').find({}).toArray();
    console.log(`📊 Found ${batches.length} batches`);

    // Get all courses
    const courses = await mongoose.connection.db.collection('courses').find({}).toArray();
    console.log(`📚 Found ${courses.length} courses`);

    // Map course codes to course IDs
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course.courseCode] = course._id;
    });

    console.log('\n📋 Course mapping:');
    Object.entries(courseMap).forEach(([code, id]) => {
      console.log(`  ${code} -> ${id}`);
    });

    // Update batches with course IDs
    for (const batch of batches) {
      console.log(`\n🔍 Processing batch: ${batch.name}`);
      console.log(`   Current courseId: ${batch.courseId || 'None'}`);
      
      // Try to determine course from batch name or other fields
      let courseId = null;
      
      if (batch.name.includes('Graphics Design') || batch.name.includes('Illustrator')) {
        courseId = courseMap['GDI'];
      } else if (batch.name.includes('MERN') || batch.name.includes('MERN Stack')) {
        courseId = courseMap['MSD'];
      }
      
      if (courseId) {
        console.log(`   ✅ Found course ID: ${courseId}`);
        
        // Update the batch
        const result = await mongoose.connection.db.collection('batches').updateOne(
          { _id: batch._id },
          { $set: { courseId: courseId } }
        );
        
        console.log(`   📝 Update result: ${result.modifiedCount} document(s) modified`);
      } else {
        console.log(`   ❌ Could not determine course for batch: ${batch.name}`);
      }
    }

    // Verify the updates
    console.log('\n✅ Verification:');
    const updatedBatches = await mongoose.connection.db.collection('batches').find({}).toArray();
    updatedBatches.forEach(batch => {
      console.log(`  ${batch.name}: courseId = ${batch.courseId || 'None'}`);
    });

  } catch (error) {
    console.error('Error fixing batch course data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixBatchCourseData();
