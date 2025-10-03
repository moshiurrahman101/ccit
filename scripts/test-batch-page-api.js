const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/batches?limit=5',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n📊 API Response:');
        console.log('Number of batches:', jsonData.batches?.length || 0);
        
        if (jsonData.batches && jsonData.batches.length > 0) {
          console.log('\n📦 First batch:');
          const batch = jsonData.batches[0];
          console.log('  Name:', batch.name);
          console.log('  Batch Code:', batch.batchCode);
          console.log('  Status:', batch.status);
          console.log('  Course ID:', batch.courseId?._id || 'Not populated');
          console.log('  Course Title:', batch.courseId?.title || 'Not populated');
          console.log('  Mentor ID:', batch.mentorId?._id || 'Not populated');
          console.log('  Mentor Name:', batch.mentorId?.name || 'Not populated');
          console.log('  Regular Price:', batch.regularPrice);
          console.log('  Discount Price:', batch.discountPrice);
        } else {
          console.log('❌ No batches found');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
}

testAPI();
