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

// Update batch status
async function updateBatchStatus() {
  try {
    await connectDB();

    // Update the MERN batch status to published
    const result = await mongoose.connection.db.collection('batches').updateOne(
      { _id: new mongoose.Types.ObjectId('68df5fccd59c7fadfb88661a') },
      { $set: { status: 'published' } }
    );

    console.log('✅ Batch status updated:', result);

    // Check the updated batch
    const batch = await mongoose.connection.db.collection('batches').findOne(
      { _id: new mongoose.Types.ObjectId('68df5fccd59c7fadfb88661a') }
    );

    console.log('📋 Updated batch:', {
      name: batch.name,
      status: batch.status,
      batchCode: batch.batchCode
    });

  } catch (error) {
    console.error('Error updating batch status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateBatchStatus();
