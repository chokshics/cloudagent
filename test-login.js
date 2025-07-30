const axios = require('axios');

const BASE_URL = 'http://localhost:5000'; // Change this to your server URL if different

async function testLogin() {
  console.log('🔧 Testing admin login...');
  
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

// Test the login
testLogin(); 