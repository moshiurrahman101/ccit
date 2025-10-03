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

// Course schema
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 500 },
  coverPhoto: { type: String },
  courseType: { type: String, enum: ['online', 'offline', 'both'], required: true },
  regularPrice: { type: Number, required: true },
  discountPrice: { type: Number },
  discountPercentage: { type: Number },
  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }],
  modules: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    order: { type: Number, required: true }
  }],
  whatYouWillLearn: [{ type: String }],
  requirements: [{ type: String }],
  features: [{ type: String }],
  duration: { type: Number, required: true },
  durationUnit: { type: String, enum: ['days', 'weeks', 'months', 'years'], required: true },
  maxStudents: { type: Number, default: 30 },
  marketing: {
    slug: { type: String, required: true },
    metaDescription: { type: String },
    tags: [{ type: String }]
  },
  category: { type: String, required: true },
  level: { type: String, required: true },
  language: { type: String, required: true },
  courseCode: { type: String, required: true },
  courseShortcut: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });

// Batch schema
const BatchSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  batchCode: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  description: { type: String },
  courseType: { type: String, enum: ['online', 'offline'], required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  additionalMentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxStudents: { type: Number, required: true },
  currentStudents: { type: Number, default: 0 },
  regularPrice: { type: Number, min: 0 },
  discountPrice: { type: Number, min: 0 },
  discountPercentage: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ['draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled'], default: 'draft' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });

// Mentor schema
const MentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  designation: { type: String, required: true },
  experience: { type: Number, required: true },
  expertise: [{ type: String }],
  bio: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
const Mentor = mongoose.models.Mentor || mongoose.model('Mentor', MentorSchema);

// Create sample data
async function createSampleData() {
  try {
    await connectDB();

    console.log('🚀 Creating sample data...\n');

    // Create a mentor first
    console.log('👨‍🏫 Creating mentor...');
    const mentor = new Mentor({
      name: 'মোঃ ইকবাল হোসেন',
      email: 'ikbal@example.com',
      designation: 'Senior Graphic Designer',
      experience: 5,
      expertise: ['Adobe Illustrator', 'Photoshop', 'Graphic Design'],
      bio: 'তিনি একজন অভিজ্ঞ গ্রাফিক ডিজাইনার এবং ট্রেইনার',
      rating: 4.8,
      createdBy: 'admin'
    });

    await mentor.save();
    console.log(`✅ Mentor created: ${mentor.name}`);

    // Create a course
    console.log('\n📚 Creating course...');
    const course = new Course({
      title: 'Graphics Design with Illustrator',
      description: 'এটি একটি সম্পূর্ণ গ্রাফিক ডিজাইন কোর্স যেখানে আপনি Adobe Illustrator ব্যবহার করে প্রফেশনাল গ্রাফিক ডিজাইন শিখবেন।',
      shortDescription: 'Adobe Illustrator দিয়ে প্রফেশনাল গ্রাফিক ডিজাইন শিখুন',
      courseType: 'both',
      regularPrice: 50000,
      discountPrice: 40000,
      discountPercentage: 20,
      mentors: [mentor._id],
      modules: [
        {
          title: 'Introduction to Illustrator',
          description: 'Adobe Illustrator এর বেসিক পরিচিতি',
          duration: 2,
          order: 1
        },
        {
          title: 'Basic Tools and Techniques',
          description: 'মূল টুলস এবং কৌশল শেখা',
          duration: 4,
          order: 2
        },
        {
          title: 'Advanced Design Projects',
          description: 'এডভান্সড ডিজাইন প্রজেক্ট',
          duration: 6,
          order: 3
        }
      ],
      whatYouWillLearn: [
        'Adobe Illustrator এর সম্পূর্ণ ব্যবহার',
        'প্রফেশনাল লোগো ডিজাইন',
        'ব্র্যান্ডিং এবং মার্কেটিং ম্যাটেরিয়াল',
        'প্রিন্ট ডিজাইন এবং ডিজিটাল আর্ট'
      ],
      requirements: [
        'বেসিক কম্পিউটার জ্ঞান',
        'Adobe Illustrator সফটওয়্যার',
        'সৃজনশীল চিন্তাভাবনা'
      ],
      features: [
        'লাইভ ক্লাস',
        'রেকর্ডেড ভিডিও',
        'প্রজেক্ট বেসড লার্নিং',
        'সার্টিফিকেট'
      ],
      duration: 3,
      durationUnit: 'months',
      maxStudents: 30,
      marketing: {
        slug: 'graphics-design-with-illustrator',
        metaDescription: 'Adobe Illustrator দিয়ে প্রফেশনাল গ্রাফিক ডিজাইন শিখুন',
        tags: ['graphics', 'illustrator', 'design', 'adobe']
      },
      category: 'design',
      level: 'beginner',
      language: 'bengali',
      courseCode: 'GDI',
      courseShortcut: 'Graphics Design with Illustrator',
      status: 'published',
      isActive: true,
      createdBy: 'admin'
    });

    await course.save();
    console.log(`✅ Course created: ${course.title}`);

    // Create a batch
    console.log('\n🎯 Creating batch...');
    const batch = new Batch({
      courseId: course._id,
      batchCode: 'GDI2501',
      name: 'Graphics Design with Illustrator Batch-01',
      description: 'এটি Graphics Design with Illustrator কোর্সের প্রথম ব্যাচ',
      courseType: 'online',
      mentorId: mentor._id,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-05-01'),
      maxStudents: 25,
      currentStudents: 0,
      regularPrice: 60000, // Batch-specific pricing
      discountPrice: 45000,
      discountPercentage: 25,
      status: 'published',
      isActive: true,
      createdBy: 'admin'
    });

    await batch.save();
    console.log(`✅ Batch created: ${batch.name}`);

    // Create another batch
    console.log('\n🎯 Creating second batch...');
    const batch2 = new Batch({
      courseId: course._id,
      batchCode: 'GDI2502',
      name: 'Graphics Design with Illustrator Batch-02',
      description: 'এটি Graphics Design with Illustrator কোর্সের দ্বিতীয় ব্যাচ',
      courseType: 'online',
      mentorId: mentor._id,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-06-01'),
      maxStudents: 30,
      currentStudents: 5,
      regularPrice: 55000, // Different batch pricing
      discountPrice: 40000,
      discountPercentage: 27,
      status: 'upcoming',
      isActive: true,
      createdBy: 'admin'
    });

    await batch2.save();
    console.log(`✅ Second batch created: ${batch2.name}`);

    // Create another course and batch
    console.log('\n📚 Creating second course...');
    const course2 = new Course({
      title: 'MERN Stack Development',
      description: 'এটি একটি সম্পূর্ণ MERN Stack Development কোর্স যেখানে আপনি MongoDB, Express.js, React, এবং Node.js ব্যবহার করে ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন তৈরি শিখবেন।',
      shortDescription: 'MongoDB, Express.js, React, Node.js দিয়ে ফুল-স্ট্যাক ডেভেলপমেন্ট শিখুন',
      courseType: 'both',
      regularPrice: 80000,
      discountPrice: 60000,
      discountPercentage: 25,
      mentors: [mentor._id],
      modules: [
        {
          title: 'JavaScript Fundamentals',
          description: 'জাভাস্ক্রিপ্টের বেসিক কনসেপ্ট',
          duration: 3,
          order: 1
        },
        {
          title: 'React Development',
          description: 'React দিয়ে ফ্রন্টএন্ড ডেভেলপমেন্ট',
          duration: 5,
          order: 2
        },
        {
          title: 'Node.js and Express',
          description: 'ব্যাকএন্ড ডেভেলপমেন্ট',
          duration: 4,
          order: 3
        },
        {
          title: 'MongoDB Database',
          description: 'ডেটাবেস ডিজাইন এবং ম্যানেজমেন্ট',
          duration: 3,
          order: 4
        }
      ],
      whatYouWillLearn: [
        'MERN Stack এর সম্পূর্ণ ব্যবহার',
        'ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন তৈরি',
        'ডেটাবেস ডিজাইন এবং API ডেভেলপমেন্ট',
        'ডেপ্লয়মেন্ট এবং হোস্টিং'
      ],
      requirements: [
        'বেসিক প্রোগ্রামিং জ্ঞান',
        'HTML, CSS জ্ঞান',
        'কম্পিউটার এবং ইন্টারনেট'
      ],
      features: [
        'প্রজেক্ট বেসড লার্নিং',
        'লাইভ কোডিং সেশন',
        'গিট এবং গিটহাব ব্যবহার',
        'জব প্লেসমেন্ট সাপোর্ট'
      ],
      duration: 4,
      durationUnit: 'months',
      maxStudents: 20,
      marketing: {
        slug: 'mern-stack-development',
        metaDescription: 'MongoDB, Express.js, React, Node.js দিয়ে ফুল-স্ট্যাক ডেভেলপমেন্ট শিখুন',
        tags: ['mern', 'javascript', 'react', 'nodejs', 'mongodb']
      },
      category: 'web-development',
      level: 'intermediate',
      language: 'bengali',
      courseCode: 'MSD',
      courseShortcut: 'MERN Stack Development',
      status: 'published',
      isActive: true,
      createdBy: 'admin'
    });

    await course2.save();
    console.log(`✅ Second course created: ${course2.title}`);

    // Create batch for second course
    console.log('\n🎯 Creating batch for second course...');
    const batch3 = new Batch({
      courseId: course2._id,
      batchCode: 'MSD2501',
      name: 'MERN Stack Development Batch-01',
      description: 'এটি MERN Stack Development কোর্সের প্রথম ব্যাচ',
      courseType: 'online',
      mentorId: mentor._id,
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-06-15'),
      maxStudents: 20,
      currentStudents: 3,
      regularPrice: 85000, // Batch-specific pricing
      discountPrice: 65000,
      discountPercentage: 24,
      status: 'published',
      isActive: true,
      createdBy: 'admin'
    });

    await batch3.save();
    console.log(`✅ Third batch created: ${batch3.name}`);

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`• 1 Mentor: ${mentor.name}`);
    console.log(`• 2 Courses: ${course.title}, ${course2.title}`);
    console.log(`• 3 Batches: ${batch.name}, ${batch2.name}, ${batch3.name}`);

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createSampleData();
