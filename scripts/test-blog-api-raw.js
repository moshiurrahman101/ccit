const http = require('http');

function testBlogAPIRaw() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/blogs?admin=true&limit=5',
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
        console.log('\n📊 Full Blog API Response:');
        console.log(JSON.stringify(jsonData, null, 2));
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

testBlogAPIRaw();
