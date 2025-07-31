const sqlite3 = require('sqlite3').verbose();

async function debugSubscriptionCreation() {
  console.log('🔍 Debugging subscription creation process...');
  
  // Database path for production
  const dbPath = '/home/ec2-user/admin-portal/server/database/admin_portal.db';
  console.log('📁 Database path:', dbPath);
  
  const db = new sqlite3.Database(dbPath);
  
  try {
    // Check if database file exists
    const fs = require('fs');
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database file not found at:', dbPath);
      return;
    }
    
    console.log('✅ Database file found');
    
    // Step 1: Check if subscription plans exist
    console.log('\n📋 Step 1: Checking subscription plans...');
    
    db.all("SELECT * FROM subscription_plans", (err, plans) => {
      if (err) {
        console.log('❌ Error getting subscription plans:', err.message);
        return;
      }
      
      console.log(`Found ${plans.length} subscription plans:`);
      plans.forEach(plan => {
        console.log(`  - ID: ${plan.id}, Name: ${plan.name}, WhatsApp Limit: ${plan.whatsapp_send_limit}`);
      });
      
      if (plans.length === 0) {
        console.log('❌ No subscription plans available!');
        return;
      }
      
      // Step 2: Check user_subscriptions table structure
      console.log('\n📊 Step 2: Checking user_subscriptions table structure...');
      
      db.all("PRAGMA table_info(user_subscriptions)", (err, columns) => {
        if (err) {
          console.log('❌ Error checking table structure:', err.message);
          return;
        }
        
        console.log('📋 user_subscriptions columns:', columns.map(col => col.name));
        
        // Step 3: Test the subscription creation function
        console.log('\n🧪 Step 3: Testing subscription creation...');
        
        const testUserId = 999; // Use a test user ID
        
        // Simulate the exact subscription creation process
        console.log(`🔧 Creating subscription for test user ID: ${testUserId}`);
        
        // Get the first available plan
        const planId = plans[0].id;
        console.log(`📋 Using plan ID: ${planId} (${plans[0].name})`);
        
        // Calculate expiration date (30 days from now)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        const expirationString = expirationDate.toISOString().replace('T', ' ').replace('Z', '');
        
        console.log(`📅 Setting expiration date to: ${expirationString}`);
        
        // Create the subscription with proper expiration date
        const insertSubscription = `
          INSERT INTO user_subscriptions (
            user_id, plan_id, is_active, whatsapp_sends_used, 
            mobile_numbers_used, promotions_used, created_at, expires_at
          ) VALUES (?, ?, 1, 0, 0, 0, datetime('now'), ?)
        `;
        
        console.log('📝 SQL Query:', insertSubscription);
        console.log('📝 Parameters:', [testUserId, planId, expirationString]);
        
        db.run(insertSubscription, [testUserId, planId, expirationString], function(err) {
          if (err) {
            console.log('❌ Error creating subscription:', err.message);
            return;
          }
          
          console.log(`✅ Created subscription with ID: ${this.lastID}`);
          
          // Step 4: Test the exact WhatsApp query
          console.log('\n🧪 Step 4: Testing exact WhatsApp route query...');
          
          const whatsappQuery = `
            SELECT 
              us.whatsapp_sends_used,
              sp.whatsapp_send_limit
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE us.user_id = ? AND us.is_active = 1
            ORDER BY us.created_at DESC
            LIMIT 1
          `;
          
          console.log('📝 WhatsApp Query:', whatsappQuery);
          console.log('📝 Testing with user ID:', testUserId);
          
          db.get(whatsappQuery, [testUserId], (err, result) => {
            if (err) {
              console.log('❌ WhatsApp query failed:', err.message);
            } else if (!result) {
              console.log('❌ WhatsApp query returned no results');
              
              // Let's check what's in the database
              console.log('\n🔍 Checking what\'s in the database...');
              
              db.all("SELECT * FROM user_subscriptions WHERE user_id = ?", [testUserId], (err, subs) => {
                if (err) {
                  console.log('❌ Error checking subscriptions:', err.message);
                } else {
                  console.log(`Found ${subs.length} subscriptions for test user:`);
                  subs.forEach(sub => {
                    console.log(`  - ID: ${sub.id}, Plan ID: ${sub.plan_id}, Active: ${sub.is_active}, Expires: ${sub.expires_at}`);
                  });
                }
                
                db.close();
              });
            } else {
              console.log('✅ WhatsApp query successful:');
              console.log('📊 Result:', result);
              console.log('\n🎉 Subscription creation is working correctly!');
              
              db.close();
            }
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the debug
debugSubscriptionCreation(); 