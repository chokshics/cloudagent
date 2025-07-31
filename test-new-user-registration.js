const axios = require('axios');

async function testNewUserRegistration() {
  const baseURL = 'https://www.goaiz.com';
  
  try {
    console.log('🧪 Testing new user registration with automatic subscription...');
    
    // Generate a unique username and email
    const timestamp = Date.now();
    const testUsername = `testuser${timestamp}`;
    const testEmail = `testuser${timestamp}@example.com`;
    
    console.log(`📝 Registering new user: ${testUsername}`);
    
    const registrationData = {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      phoneNumber: '+1234567890',
      username: testUsername,
      password: 'testpass123',
      role: 'shopkeeper'
    };
    
    // Step 1: Register new user
    console.log('\n📝 Step 1: Registering new user...');
    
    const registerResponse = await axios.post(`${baseURL}/api/auth/register`, registrationData);
    console.log('✅ Registration successful:');
    console.log('📊 Response:', registerResponse.data);
    
    const newUserId = registerResponse.data.userId;
    console.log(`👤 New user ID: ${newUserId}`);
    
    // Step 2: Login with the new user
    console.log('\n🔐 Step 2: Logging in with new user...');
    
    const loginData = {
      username: testUsername,
      password: 'testpass123'
    };
    
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, loginData);
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');
    
    // Decode the JWT token to see the user ID
    const jwt = require('jsonwebtoken');
    const decodedToken = jwt.decode(token);
    console.log('🔑 Decoded JWT token:', decodedToken);
    
    // Set authorization header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Step 3: Test WhatsApp send to verify subscription works
    console.log('\n📱 Step 3: Testing WhatsApp send with new user...');
    
    const testData = {
      to: ['+14155552671'], // Twilio test number
      message: 'Test message from newly registered user - subscription should work! 🎉'
    };
    
    try {
      const sendResponse = await axios.post(`${baseURL}/api/whatsapp/send`, testData);
      console.log('✅ WhatsApp send test successful:');
      console.log('📊 Response:', JSON.stringify(sendResponse.data, null, 2));
      
      if (sendResponse.data.success) {
        console.log('\n🎉 SUCCESS! New user registration with automatic subscription is working!');
        console.log('✅ New users will automatically get subscriptions');
        console.log('✅ No more "Subscription not found" errors for new users');
      }
      
    } catch (sendError) {
      console.log('❌ WhatsApp send test failed:');
      console.log('Status:', sendError.response?.status);
      console.log('Error:', sendError.response?.data?.error);
      console.log('Details:', sendError.response?.data?.details);
      
      if (sendError.response?.data?.error === 'Subscription not found. Please contact support.') {
        console.log('\n❌ Automatic subscription creation is not working');
        console.log('💡 New users will still face subscription issues');
      } else {
        console.log('\n💡 This might be a Twilio configuration issue, not a subscription issue');
        console.log('💡 The subscription creation might be working');
      }
    }
    
  } catch (registerError) {
    console.log('❌ Registration failed:', registerError.response?.status, registerError.response?.data);
    
    if (registerError.response?.data?.message === 'Username already exists') {
      console.log('💡 Username already exists, trying with different username...');
      
      // Try with a different username
      const timestamp2 = Date.now() + 1;
      const testUsername2 = `testuser${timestamp2}`;
      const testEmail2 = `testuser${timestamp2}@example.com`;
      
      const registrationData2 = {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail2,
        phoneNumber: '+1234567890',
        username: testUsername2,
        password: 'testpass123',
        role: 'shopkeeper'
      };
      
      try {
        const registerResponse2 = await axios.post(`${baseURL}/api/auth/register`, registrationData2);
        console.log('✅ Registration successful with different username:');
        console.log('📊 Response:', registerResponse2.data);
      } catch (registerError2) {
        console.log('❌ Second registration attempt also failed:', registerError2.response?.data);
      }
    }
  }
}

// Run the test
testNewUserRegistration(); 