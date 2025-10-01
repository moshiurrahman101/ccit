const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

async function cleanupDatabase() {
  try {
    await connectDB();
    
    console.log('Starting database cleanup...');
    
    const User = mongoose.model('User');
    const Student = mongoose.model('Student');
    
    // 1. Remove heavy studentInfo from User collection
    console.log('Cleaning up User collection...');
    
    const result = await User.updateMany(
      { role: 'student', 'studentInfo': { $exists: true } },
      { 
        $unset: { 
          'studentInfo.dateOfBirth': 1,
          'studentInfo.gender': 1,
          'studentInfo.nid': 1,
          'studentInfo.bloodGroup': 1,
          'studentInfo.address': 1,
          'studentInfo.guardianInfo': 1,
          'studentInfo.academicInfo': 1,
          'studentInfo.socialInfo': 1,
          'studentInfo.paymentInfo': 1,
          'studentInfo.batchInfo': 1,
          'studentInfo.profilePicture': 1,
          'studentInfo.documents': 1,
          'studentInfo.notes': 1
        }
      }
    );
    
    console.log(`Cleaned up ${result.modifiedCount} user records`);
    
    // 2. Remove old indexes that are no longer needed
    console.log('Optimizing indexes...');
    
    try {
      // Drop unused indexes
      await User.collection.dropIndex('studentInfo.studentId_1');
      await User.collection.dropIndex('studentInfo.batchInfo.batchId_1');
      console.log('Dropped unused indexes');
    } catch (error) {
      console.log('Some indexes may not exist:', error.message);
    }
    
    // 3. Show storage statistics
    console.log('\nDatabase Statistics:');
    
    const userCount = await User.countDocuments();
    const studentCount = await Student.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Students: ${studentCount}`);
    
    // Get collection stats
    const userStats = await User.collection.stats();
    const studentStats = await Student.collection.stats();
    
    console.log(`\nStorage Usage:`);
    console.log(`User collection: ${(userStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Student collection: ${(studentStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total: ${((userStats.size + studentStats.size) / 1024 / 1024).toFixed(2)} MB`);
    
    // 4. Create optimized indexes for Student collection
    console.log('\nCreating optimized indexes...');
    
    await Student.collection.createIndex({ studentId: 1 });
    await Student.collection.createIndex({ batchId: 1, status: 1 });
    await Student.collection.createIndex({ paymentStatus: 1 });
    await Student.collection.createIndex({ enrollmentDate: -1 });
    await Student.collection.createIndex({ name: 'text', email: 'text' });
    await Student.collection.createIndex({ batchId: 1, paymentStatus: 1 });
    await Student.collection.createIndex({ status: 1, isVerified: 1 });
    
    console.log('Optimized indexes created');
    
    console.log('\nCleanup completed successfully!');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
}

// Run cleanup
cleanupDatabase();
