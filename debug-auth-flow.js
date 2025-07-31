const axios = require('axios');
const jwt = require('jsonwebtoken');

async function debugAuthFlow() {
  const baseURL = 'https://www.goaiz.com';
  
  try {
    console.log('🔍 Debugging authentication flow...');
    
    // Step 1: Login to get authentication token
    console.log('\n📝 Step 1: Login to get authentication token...');
    
    const loginData = {
      username: 'admin', // Try username instead of email
      password: 'admin123'
    };
    
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, loginData);
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');
    console.log('📊 Login response:', loginResponse.data);
    
    // Decode the JWT token to see its contents
    const decodedToken = jwt.decode(token);
    console.log('🔑 Decoded JWT token:', decodedToken);
    
    // Set authorization header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Step 2: Test the profile endpoint to see what user ID is returned
    console.log('\n👤 Step 2: Testing profile endpoint...');
    
    try {
      const profileResponse = await axios.get(`${baseURL}/api/auth/profile`);
      console.log('✅ Profile response:', profileResponse.data);
    } catch (profileError) {
      console.log('❌ Profile request failed:', profileError.response?.data);
    }
    
    // Step 3: Test a simple endpoint that uses req.user.userId
    console.log('\n🧪 Step 3: Testing subscription status...');
    
    try {
      const subscriptionResponse = await axios.get(`${baseURL}/api/subscriptions/status`);
      console.log('✅ Subscription status response:', subscriptionResponse.data);
    } catch (subscriptionError) {
      console.log('❌ Subscription status failed:', subscriptionError.response?.data);
    }
    
    // Step 4: Test the exact WhatsApp send endpoint
    console.log('\n📱 Step 4: Testing WhatsApp send endpoint...');
    
    const testData = {
      to: ['+1234567890'], // Test number
      message: 'Test message from debug script'
    };
    
    try {
      const sendResponse = await axios.post(`${baseURL}/api/whatsapp/send`, testData);
      console.log('✅ WhatsApp send test successful:', sendResponse.data);
    } catch (sendError) {
      console.log('❌ WhatsApp send test failed:');
      console.log('Status:', sendError.response?.status);
      console.log('Error:', sendError.response?.data?.error);
      console.log('Details:', sendError.response?.data?.details);
      
      if (sendError.response?.data?.error === 'Subscription not found. Please contact support.') {
        console.log('\n🔍 This confirms the subscription issue is still present');
        console.log('💡 The JWT token contains userId:', decodedToken.userId);
        console.log('💡 But the API call is failing to find the subscription');
      }
    }
    
  } catch (loginError) {
    console.log('❌ Login failed:', loginError.response?.status, loginError.response?.data);
    
    // Try with email instead of username
    console.log('\n🔄 Trying with email instead of username...');
    
    try {
      const loginDataEmail = {
        email: 'admin@example.com',
        password: 'admin123'
      };
      
      const loginResponseEmail = await axios.post(`${baseURL}/api/auth/login`, loginDataEmail);
      const tokenEmail = loginResponseEmail.data.token;
      console.log('✅ Login with email successful, token obtained');
      console.log('📊 Login response:', loginResponseEmail.data);
      
      const decodedTokenEmail = jwt.decode(tokenEmail);
      console.log('🔑 Decoded JWT token:', decodedTokenEmail);
      
    } catch (emailLoginError) {
      console.log('❌ Login with email also failed:', emailLoginError.response?.data);
    }
  }
}

// Run the debug
debugAuthFlow(); 