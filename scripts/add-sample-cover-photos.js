const mongoose = require('mongoose');
require('dotenv').config();

// Sample cover photo URLs (you can replace these with actual image URLs)
const sampleCoverPhotos = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=200&fit=crop'
];

async function addSampleCoverPhotos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import the Batch model
    const Batch = require('../models/Batch').default;

    // Get all batches without cover photos
    const batches = await Batch.find({ 
      $or: [
        { coverPhoto: { $exists: false } },
        { coverPhoto: null },
        { coverPhoto: '' }
      ]
    });

    console.log(`Found ${batches.length} batches without cover photos`);

    // Add sample cover photos
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const randomPhoto = sampleCoverPhotos[Math.floor(Math.random() * sampleCoverPhotos.length)];
      
      batch.coverPhoto = randomPhoto;
      await batch.save();
      
      console.log(`Added cover photo to batch: ${batch.name}`);
    }

    console.log('Successfully added sample cover photos to all batches');
  } catch (error) {
    console.error('Error adding sample cover photos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleCoverPhotos();
