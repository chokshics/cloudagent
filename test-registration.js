const axios = require('axios');

const BASE_URL = 'http://65.0.75.100:5000'; // AWS server URL

async function testRegistration() {
  console.log('🔧 Testing user registration...');
  
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    phoneNumber: '+919876543210',
    username: 'testuser',
    password: 'test123456'
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('📝 Response:', response.data);
  } catch (error) {
    console.log('❌ Registration failed!');
    console.log('📝 Error details:');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || error.response.data.error}`);
    } else if (error.request) {
      console.log('   No response received. Server might be down.');
      console.log('   Make sure the server is running on port 5000');
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

async function testLogin() {
  console.log('\n🔧 Testing admin login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    console.log('📝 Response:', {
      message: response.data.message,
      token: response.data.token ? 'Token received' : 'No token',
      user: {
        id: response.data.user.id,
        username: response.data.user.username,
        role: response.data.user.role,
        email: response.data.user.email
      }
    });
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('📝 Error details:');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || error.response.data.error}`);
    } else if (error.request) {
      console.log('   No response received. Server might be down.');
      console.log('   Make sure the server is running on port 5000');
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Test both registration and login
async function runTests() {
  await testRegistration();
  await testLogin();
}

runTests(); 