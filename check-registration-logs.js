const { exec } = require('child_process');

async function checkRegistrationLogs() {
  console.log('🔍 Checking server logs for registration and subscription creation...');
  
  // Check PM2 logs
  exec('pm2 logs admin-portal --lines 50', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Error checking PM2 logs:', error.message);
      return;
    }
    
    console.log('📊 Recent PM2 logs:');
    console.log(stdout);
    
    // Check for specific registration and subscription creation messages
    const lines = stdout.split('\n');
    let hasRegistration = false;
    let hasSubscriptionCreation = false;
    
    lines.forEach(line => {
      if (line.includes('Created user with ID:')) {
        hasRegistration = true;
        console.log('✅ Found user creation log:', line);
      }
      if (line.includes('Created subscription ID:')) {
        hasSubscriptionCreation = true;
        console.log('✅ Found subscription creation log:', line);
      }
      if (line.includes('Setting expiration date to:')) {
        console.log('✅ Found expiration date setting log:', line);
      }
      if (line.includes('Error creating subscription')) {
        console.log('❌ Found subscription creation error:', line);
      }
    });
    
    console.log('\n📋 Summary:');
    console.log(`  User registration logs found: ${hasRegistration ? 'Yes' : 'No'}`);
    console.log(`  Subscription creation logs found: ${hasSubscriptionCreation ? 'Yes' : 'No'}`);
    
    if (!hasRegistration) {
      console.log('⚠️ No user registration logs found - registration might not be working');
    }
    
    if (!hasSubscriptionCreation) {
      console.log('⚠️ No subscription creation logs found - subscription creation might be failing');
    }
    
    if (hasRegistration && !hasSubscriptionCreation) {
      console.log('💡 User registration is working but subscription creation is failing');
      console.log('💡 This suggests the createDefaultSubscriptionForUser function is not being called or is failing');
    }
  });
}

// Run the check
checkRegistrationLogs(); 