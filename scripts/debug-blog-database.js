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

// Debug blog database
async function debugBlogDatabase() {
  try {
    await connectDB();

    console.log('🔍 Debugging blog database...\n');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));

    // Check blogs collection
    const blogs = await mongoose.connection.db.collection('blogs').find({}).toArray();
    console.log(`\n📊 Blogs in 'blogs' collection: ${blogs.length}`);

    // Check if there are any other collections with blog data
    for (const collection of collections) {
      if (collection.name.includes('blog') || collection.name.includes('Blog') || collection.name.includes('post') || collection.name.includes('Post')) {
        console.log(`\n📊 Checking collection: ${collection.name}`);
        const docs = await mongoose.connection.db.collection(collection.name).find({}).toArray();
        console.log(`   Documents: ${docs.length}`);
        
        if (docs.length > 0) {
          docs.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.title || doc.name || 'No title'} (${doc.slug || 'No slug'})`);
            console.log(`      Status: ${doc.status || 'No status'}`);
            console.log(`      Created: ${doc.createdAt || 'No date'}`);
          });
        }
      }
    }

    // Check if there are any documents with blog-like structure
    console.log('\n🔍 Searching for blog-like documents...');
    for (const collection of collections) {
      const sampleDocs = await mongoose.connection.db.collection(collection.name).find({}).limit(3).toArray();
      if (sampleDocs.length > 0) {
        const firstDoc = sampleDocs[0];
        if (firstDoc.title && (firstDoc.content || firstDoc.excerpt)) {
          console.log(`\n📝 Found blog-like documents in collection: ${collection.name}`);
          console.log(`   Sample document:`, {
            title: firstDoc.title,
            slug: firstDoc.slug,
            status: firstDoc.status,
            category: firstDoc.category
          });
        }
      }
    }

  } catch (error) {
    console.error('Error debugging blog database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugBlogDatabase();
