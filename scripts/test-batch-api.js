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

// Test the batch API logic
async function testBatchAPI() {
  try {
    await connectDB();

    console.log('🧪 Testing Batch API Logic...\n');

    // Mock the API query
    const query = {
      isActive: true,
      status: { $in: ['published', 'upcoming', 'ongoing'] }
    };

    console.log('📋 Query:', JSON.stringify(query, null, 2));

    // Get batches with course and mentor information
    const batches = await mongoose.connection.db.collection('batches').find(query).toArray();
    console.log(`\n📊 Found ${batches.length} batches matching query`);

    if (batches.length > 0) {
      console.log('\n📋 Batches found:');
      batches.forEach((batch, index) => {
        console.log(`${index + 1}. ${batch.name} (${batch.batchCode})`);
        console.log(`   Status: ${batch.status}`);
        console.log(`   Active: ${batch.isActive}`);
        console.log(`   Course ID: ${batch.courseId}`);
        console.log(`   Mentor ID: ${batch.mentorId}`);
        console.log('   ---');
      });

      // Test population
      console.log('\n🔗 Testing population...');
      for (const batch of batches) {
        console.log(`\n📦 Batch: ${batch.name}`);
        
        // Get course data
        const course = await mongoose.connection.db.collection('courses').findOne({
          _id: batch.courseId
        });
        
        if (course) {
          console.log(`   ✅ Course found: ${course.title}`);
          console.log(`   📸 Cover photo: ${course.coverPhoto || 'None'}`);
          console.log(`   💰 Course price: ${course.regularPrice}`);
        } else {
          console.log(`   ❌ Course not found for ID: ${batch.courseId}`);
        }

        // Get mentor data
        const mentor = await mongoose.connection.db.collection('mentors').findOne({
          _id: batch.mentorId
        });
        
        if (mentor) {
          console.log(`   ✅ Mentor found: ${mentor.name}`);
        } else {
          console.log(`   ❌ Mentor not found for ID: ${batch.mentorId}`);
        }
      }
    } else {
      console.log('❌ No batches found matching the query');
    }

  } catch (error) {
    console.error('Error testing batch API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testBatchAPI();
