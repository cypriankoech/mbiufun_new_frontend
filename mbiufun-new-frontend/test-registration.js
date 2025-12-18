// Simple Node.js script to test registration API
const https = require('https');
const http = require('http');

// Test data
const testUser = {
  user: {
    first_name: 'Test',
    last_name: 'User',
    email: `test${Date.now()}@example.com`, // Unique email
    password: 'testpassword123',
    confirm: 'testpassword123',
    location: 'Kenya',
    tribe: 5  // Default tribe
  }
};

const API_URL = 'https://am.mbiufun.com/api/v1/user/register/';

function testRegistration() {
  console.log('🧪 Testing Registration API...');
  console.log('📤 Sending request to:', API_URL);
  console.log('📝 Test data:', JSON.stringify(testUser, null, 2));

  const postData = JSON.stringify(testUser);

  const url = new URL(API_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📡 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Response received:');
        console.log(JSON.stringify(response, null, 2));

        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('🎉 SUCCESS: Registration API is working!');
        } else {
          console.log('⚠️  WARNING: Unexpected status code');
        }
      } catch (e) {
        console.log('📄 Raw response:', data);
        console.log('❌ ERROR: Could not parse JSON response');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ REQUEST ERROR:', e.message);
  });

  req.write(postData);
  req.end();
}

// Test with duplicate email to check error handling
function testDuplicateEmail() {
  console.log('\n🔄 Testing duplicate email error...');

  const duplicateUser = {
    user: {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com', // This might already exist
      password: 'testpassword123',
      confirm: 'testpassword123',
      location: 'Kenya',
      tribe: 5  // Default tribe
    }
  };

  const postData = JSON.stringify(duplicateUser);

  const url = new URL(API_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Error response received:');
        console.log(JSON.stringify(response, null, 2));

        if (res.statusCode === 400 || res.statusCode === 422) {
          console.log('🎉 SUCCESS: Error handling is working!');
        }
      } catch (e) {
        console.log('📄 Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ REQUEST ERROR:', e.message);
  });

  req.write(postData);
  req.end();
}

// Run tests
console.log('🚀 Starting Registration API Tests\n');
testRegistration();

// Wait 2 seconds then test error handling
setTimeout(() => {
  testDuplicateEmail();
}, 2000);
