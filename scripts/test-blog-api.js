const http = require('http');

function testBlogAPI() {
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
        console.log('\n📊 Blog API Response:');
        console.log('Number of blogs:', jsonData.blogs?.length || 0);
        
        if (jsonData.blogs && jsonData.blogs.length > 0) {
          console.log('\n📝 First blog:');
          const blog = jsonData.blogs[0];
          console.log('  Title:', blog.title);
          console.log('  Slug:', blog.slug);
          console.log('  Status:', blog.status);
          console.log('  Category:', blog.category);
          console.log('  Tags:', blog.tags);
          console.log('  Created:', blog.createdAt);
        } else {
          console.log('❌ No blogs found');
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

testBlogAPI();
