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

// Check blog slugs
async function checkBlogSlugs() {
  try {
    await connectDB();

    console.log('🔍 Checking blog slugs...\n');

    // Get all blogs
    const blogs = await mongoose.connection.db.collection('blogs').find({}).toArray();
    console.log(`📊 Total blogs: ${blogs.length}`);

    blogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title}`);
      console.log(`   Slug: "${blog.slug}"`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Created: ${blog.createdAt}`);
      console.log('   ---');
    });

    // Check for blogs with invalid slugs
    const invalidSlugs = blogs.filter(blog => !blog.slug || blog.slug === '-' || blog.slug === '');
    console.log(`\n❌ Blogs with invalid slugs: ${invalidSlugs.length}`);

    if (invalidSlugs.length > 0) {
      console.log('\n🔧 Fixing invalid slugs...');
      
      for (const blog of invalidSlugs) {
        // Generate proper slug
        const newSlug = blog.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
          .trim();

        console.log(`   "${blog.title}" -> "${newSlug}"`);

        // Check if slug already exists
        const existingBlog = await mongoose.connection.db.collection('blogs').findOne({
          slug: newSlug,
          _id: { $ne: blog._id }
        });

        let finalSlug = newSlug;
        if (existingBlog) {
          // Add number suffix
          let counter = 1;
          while (await mongoose.connection.db.collection('blogs').findOne({
            slug: `${newSlug}-${counter}`,
            _id: { $ne: blog._id }
          })) {
            counter++;
          }
          finalSlug = `${newSlug}-${counter}`;
        }

        // Update the blog
        await mongoose.connection.db.collection('blogs').updateOne(
          { _id: blog._id },
          { $set: { slug: finalSlug } }
        );

        console.log(`   ✅ Updated to: "${finalSlug}"`);
      }
    }

    // Verify the fixes
    console.log('\n✅ Verification:');
    const updatedBlogs = await mongoose.connection.db.collection('blogs').find({}).toArray();
    updatedBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} -> "${blog.slug}"`);
    });

  } catch (error) {
    console.error('Error checking blog slugs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkBlogSlugs();
