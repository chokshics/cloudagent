const sqlite3 = require('sqlite3').verbose();

async function debugSubscriptionIssue() {
  console.log('🔍 Debugging subscription issue...');
  
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
    
    // Test the exact query that's failing in the WhatsApp route
    console.log('\n🔍 Testing the exact subscription query from WhatsApp route...');
    
    const testUserId = 1; // admin@example.com
    
    const subscriptionQuery = `
      SELECT 
        us.whatsapp_sends_used,
        sp.whatsapp_send_limit
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? AND us.is_active = 1
      ORDER BY us.created_at DESC
      LIMIT 1
    `;
    
    console.log('📋 Query:', subscriptionQuery);
    console.log('👤 Testing for user ID:', testUserId);
    
    db.get(subscriptionQuery, [testUserId], (err, subscription) => {
      if (err) {
        console.log('❌ Query failed:', err.message);
        return;
      }
      
      if (!subscription) {
        console.log('❌ No subscription found with the exact query');
        
        // Let's debug why no subscription is found
        console.log('\n🔍 Debugging why no subscription found...');
        
        // Check if user exists
        db.get("SELECT id, email FROM users WHERE id = ?", [testUserId], (err, user) => {
          if (err) {
            console.log('❌ Error checking user:', err.message);
            return;
          }
          
          if (!user) {
            console.log('❌ User not found');
            return;
          }
          
          console.log(`✅ User found: ${user.email}`);
          
          // Check user_subscriptions table structure
          db.all("PRAGMA table_info(user_subscriptions)", (err, columns) => {
            if (err) {
              console.log('❌ Error checking table structure:', err.message);
              return;
            }
            
            console.log('📊 user_subscriptions columns:', columns.map(col => col.name));
            
            // Check all subscriptions for this user
            db.all("SELECT * FROM user_subscriptions WHERE user_id = ?", [testUserId], (err, subscriptions) => {
              if (err) {
                console.log('❌ Error checking subscriptions:', err.message);
                return;
              }
              
              console.log(`📋 Found ${subscriptions.length} subscriptions for user ${testUserId}:`);
              subscriptions.forEach(sub => {
                console.log(`  - ID: ${sub.id}, Active: ${sub.is_active}, Plan ID: ${sub.plan_id}`);
              });
              
              // Check subscription plans
              db.all("SELECT * FROM subscription_plans", (err, plans) => {
                if (err) {
                  console.log('❌ Error checking plans:', err.message);
                  return;
                }
                
                console.log(`📋 Found ${plans.length} subscription plans:`);
                plans.forEach(plan => {
                  console.log(`  - ID: ${plan.id}, Name: ${plan.name}, WhatsApp Limit: ${plan.whatsapp_send_limit}`);
                });
                
                // Now let's fix any issues
                console.log('\n🔧 Fixing subscription issues...');
                fixSubscriptionIssues(db, testUserId, subscriptions, plans);
              });
            });
          });
        });
      } else {
        console.log('✅ Subscription found with the exact query!');
        console.log('📊 Subscription data:', subscription);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function fixSubscriptionIssues(db, userId, subscriptions, plans) {
  if (subscriptions.length === 0) {
    console.log('❌ No subscriptions found for user. Creating one...');
    
    // Get the first available plan
    if (plans.length === 0) {
      console.log('❌ No subscription plans available');
      return;
    }
    
    const planId = plans[0].id;
    console.log(`🔧 Creating subscription with plan ID: ${planId}`);
    
    const createSubscription = `
      INSERT INTO user_subscriptions (
        user_id, plan_id, is_active, whatsapp_sends_used, 
        mobile_numbers_used, promotions_used, created_at, expires_at
      ) VALUES (?, ?, 1, 0, 0, 0, datetime('now'), datetime('now', '+30 days'))
    `;
    
    db.run(createSubscription, [userId, planId], function(err) {
      if (err) {
        console.log('❌ Error creating subscription:', err.message);
      } else {
        console.log(`✅ Created subscription with ID: ${this.lastID}`);
        testSubscriptionQuery(db, userId);
      }
    });
  } else {
    // Check if any subscription is active
    const activeSubscription = subscriptions.find(sub => sub.is_active === 1);
    
    if (!activeSubscription) {
      console.log('⚠️ No active subscription found. Activating the most recent one...');
      
      const latestSubscription = subscriptions[subscriptions.length - 1];
      const updateQuery = `
        UPDATE user_subscriptions 
        SET is_active = 1, expires_at = datetime('now', '+30 days')
        WHERE id = ?
      `;
      
      db.run(updateQuery, [latestSubscription.id], function(err) {
        if (err) {
          console.log('❌ Error activating subscription:', err.message);
        } else {
          console.log(`✅ Activated subscription ID: ${latestSubscription.id}`);
          testSubscriptionQuery(db, userId);
        }
      });
    } else {
      console.log('✅ Found active subscription, but query still fails. Checking for other issues...');
      
      // Check if the subscription has a valid plan
      const subscription = activeSubscription;
      const plan = plans.find(p => p.id === subscription.plan_id);
      
      if (!plan) {
        console.log('❌ Subscription plan not found. This is the issue!');
        console.log(`💡 Subscription plan_id: ${subscription.plan_id}, Available plans: ${plans.map(p => p.id).join(', ')}`);
        
        // Fix by updating to a valid plan
        const validPlanId = plans[0].id;
        const fixQuery = `UPDATE user_subscriptions SET plan_id = ? WHERE id = ?`;
        
        db.run(fixQuery, [validPlanId, subscription.id], function(err) {
          if (err) {
            console.log('❌ Error fixing plan_id:', err.message);
          } else {
            console.log(`✅ Fixed subscription plan_id to: ${validPlanId}`);
            testSubscriptionQuery(db, userId);
          }
        });
      } else {
        console.log('✅ Plan found, but query still fails. Let\'s test the exact query again...');
        testSubscriptionQuery(db, userId);
      }
    }
  }
}

function testSubscriptionQuery(db, userId) {
  console.log('\n🧪 Testing the subscription query again...');
  
  const subscriptionQuery = `
    SELECT 
      us.whatsapp_sends_used,
      sp.whatsapp_send_limit
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = ? AND us.is_active = 1
    ORDER BY us.created_at DESC
    LIMIT 1
  `;
  
  db.get(subscriptionQuery, [userId], (err, subscription) => {
    if (err) {
      console.log('❌ Query still fails:', err.message);
    } else if (!subscription) {
      console.log('❌ Still no subscription found');
    } else {
      console.log('✅ SUCCESS! Subscription query now works:');
      console.log('📊 Subscription data:', subscription);
      console.log('\n🎉 The "Subscription not found" error should now be resolved!');
    }
    
    db.close();
  });
}

// Run the debug
debugSubscriptionIssue(); 