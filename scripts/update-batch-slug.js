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

const updateBatchSlug = async () => {
  try {
    await connectDB();
    
    // Get the existing batch
    const batch = await mongoose.connection.db.collection('batches').findOne({});
    
    if (!batch) {
      console.log('❌ No batch found');
      return;
    }
    
    console.log('📝 Found batch:', batch.name);
    
    // Get the course for this batch
    const course = await mongoose.connection.db.collection('courses').findOne({ _id: batch.courseId });
    
    if (!course) {
      console.log('❌ Course not found for batch');
      return;
    }
    
    console.log('📚 Found course:', course.title);
    
    // Generate slug
    const courseSlug = course.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    const batchSlug = batch.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    const slug = `${courseSlug}-${batchSlug}`;
    console.log('🔗 Generated slug:', slug);
    
    // Update the batch with marketing field
    const result = await mongoose.connection.db.collection('batches').updateOne(
      { _id: batch._id },
      {
        $set: {
          marketing: {
            slug: slug,
            metaDescription: `Learn ${course.title} with ${batch.name}. Professional training with hands-on projects and job placement support.`,
            tags: ['programming', 'web-development', 'mern-stack', 'javascript', 'react', 'nodejs', 'mongodb']
          }
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated batch with marketing slug');
      console.log('🔗 Slug:', slug);
      console.log('🌐 URL: http://localhost:3001/batches/' + slug);
    } else {
      console.log('❌ Failed to update batch');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

updateBatchSlug();
