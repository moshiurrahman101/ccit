const mongoose = require('mongoose');
require('dotenv').config();

// Import models properly
const User = require('../models/User').default;
const Batch = require('../models/Batch').default;

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

// Student Schema (optimized)
const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true, unique: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  name: { type: String, required: true, maxlength: 50 },
  email: { type: String, required: true, maxlength: 100 },
  phone: { type: String, maxlength: 15 },
  enrollmentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['enrolled', 'active', 'completed', 'dropped', 'suspended'],
    default: 'enrolled' 
  },
  previousEducation: { type: String, maxlength: 100 },
  institution: { type: String, maxlength: 100 },
  graduationYear: { type: Number, min: 1950, max: new Date().getFullYear() + 5 },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'partial', 'due', 'overdue'],
    default: 'due' 
  },
  totalAmount: { type: Number, default: 0, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  dueAmount: { type: Number, default: 0, min: 0 },
  emergencyContact: {
    name: { type: String, maxlength: 50 },
    phone: { type: String, maxlength: 15 },
    relation: { type: String, maxlength: 20 }
  },
  documents: {
    nid: { type: String, maxlength: 50 },
    photo: { type: String, maxlength: 50 }
  },
  isOfflineStudent: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  notes: { type: String, maxlength: 500 }
}, {
  timestamps: true,
  versionKey: false
});

const Student = mongoose.model('Student', studentSchema);

async function migrateStudents() {
  try {
    await connectDB();
    
    console.log('Starting student migration...');
    
    // Find all users with student role and studentInfo
    const usersWithStudentInfo = await User.find({
      role: 'student',
      'studentInfo': { $exists: true, $ne: null }
    }).select('name email phone studentInfo');

    console.log(`Found ${usersWithStudentInfo.length} students to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of usersWithStudentInfo) {
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ userId: user._id });
        if (existingStudent) {
          console.log(`Student already exists for user ${user.email}, skipping...`);
          continue;
        }

        // Extract data from user.studentInfo
        const studentInfo = user.studentInfo || {};
        
        // Create student record with only essential data
        const student = new Student({
          userId: user._id,
          studentId: studentInfo.studentId || `MIGRATED_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          batchId: studentInfo.batchInfo?.batchId || null,
          name: user.name,
          email: user.email,
          phone: user.phone,
          enrollmentDate: studentInfo.enrollmentDate || new Date(),
          status: studentInfo.batchInfo?.status || 'enrolled',
          previousEducation: studentInfo.academicInfo?.previousEducation,
          institution: studentInfo.academicInfo?.institution,
          graduationYear: studentInfo.academicInfo?.graduationYear,
          paymentStatus: studentInfo.paymentInfo?.paymentStatus || 'due',
          totalAmount: studentInfo.paymentInfo?.totalAmount || 0,
          paidAmount: studentInfo.paymentInfo?.paidAmount || 0,
          dueAmount: studentInfo.paymentInfo?.dueAmount || 0,
          emergencyContact: studentInfo.emergencyContact ? {
            name: studentInfo.emergencyContact.name,
            phone: studentInfo.emergencyContact.phone,
            relation: studentInfo.emergencyContact.relation
          } : undefined,
          isOfflineStudent: studentInfo.isOfflineStudent || false,
          isVerified: studentInfo.isVerified || false,
          notes: studentInfo.notes
        });

        await student.save();
        migratedCount++;
        
        console.log(`Migrated student: ${user.name} (${user.email})`);

      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Successfully migrated: ${migratedCount} students`);
    console.log(`Errors: ${errorCount} students`);
    
    // Show storage optimization
    const studentCount = await Student.countDocuments();
    console.log(`Total students in new collection: ${studentCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
}

// Run migration
migrateStudents();
