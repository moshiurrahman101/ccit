const fetch = require('node-fetch');

async function testBatchAPI() {
  try {
    console.log('🧪 Testing Batch API Response...\n');

    const response = await fetch('http://localhost:3000/api/public/batches?limit=5');
    const data = await response.json();

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    if (response.ok) {
      console.log('✅ API Response successful');
      console.log('📋 Number of batches:', data.batches?.length || 0);
      console.log('📋 Pagination:', data.pagination);
      
      if (data.batches && data.batches.length > 0) {
        console.log('\n📦 First batch details:');
        const firstBatch = data.batches[0];
        console.log('   Name:', firstBatch.name);
        console.log('   Batch Code:', firstBatch.batchCode);
        console.log('   Status:', firstBatch.status);
        console.log('   Course ID:', firstBatch.courseId?._id || 'Not populated');
        console.log('   Course Title:', firstBatch.courseId?.title || 'Not populated');
        console.log('   Mentor ID:', firstBatch.mentorId?._id || 'Not populated');
        console.log('   Mentor Name:', firstBatch.mentorId?.name || 'Not populated');
        console.log('   Regular Price:', firstBatch.regularPrice);
        console.log('   Discount Price:', firstBatch.discountPrice);
      } else {
        console.log('❌ No batches in response');
      }
    } else {
      console.log('❌ API Error:', data.error);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testBatchAPI();
