const sqlite3 = require('sqlite3').verbose();

async function testSubscriptionQuery() {
  console.log('🔍 Testing the exact subscription query from WhatsApp route...');
  
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
    
    // Step 1: Check all users and their subscriptions
    console.log('\n📊 Step 1: Checking all users and their subscriptions...');
    
    const userQuery = `
      SELECT 
        u.id as user_id,
        u.username,
        u.email,
        us.id as subscription_id,
        us.is_active,
        us.created_at as sub_created,
        us.expires_at,
        sp.name as plan_name,
        sp.whatsapp_send_limit
      FROM users u
      LEFT JOIN user_subscriptions us ON u.id = us.user_id
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      ORDER BY u.id
    `;
    
    db.all(userQuery, (err, users) => {
      if (err) {
        console.log('❌ Error checking users:', err.message);
        return;
      }
      
      console.log(`Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`\n👤 User ID: ${user.user_id}, Username: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Subscription ID: ${user.subscription_id || 'None'}`);
        console.log(`  Active: ${user.is_active === 1 ? 'Yes' : 'No'}`);
        console.log(`  Plan: ${user.plan_name || 'None'}`);
        console.log(`  WhatsApp Limit: ${user.whatsapp_send_limit || 'None'}`);
        console.log(`  Expires: ${user.expires_at || 'None'}`);
      });
      
      // Step 2: Test the exact WhatsApp query for each user
      console.log('\n🧪 Step 2: Testing exact WhatsApp query for each user...');
      
      users.forEach(user => {
        if (user.user_id) {
          console.log(`\n🔍 Testing user ID: ${user.user_id} (${user.username})`);
          
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
          
          db.get(whatsappQuery, [user.user_id], (err, result) => {
            if (err) {
              console.log(`  ❌ Query failed: ${err.message}`);
            } else if (!result) {
              console.log(`  ❌ No subscription found - This user will get "Subscription not found" error`);
              
              // Let's check what's wrong
              db.all("SELECT * FROM user_subscriptions WHERE user_id = ?", [user.user_id], (err, subs) => {
                if (err) {
                  console.log(`    ❌ Error checking subscriptions: ${err.message}`);
                } else {
                  console.log(`    📊 Found ${subs.length} subscription records for this user:`);
                  subs.forEach(sub => {
                    console.log(`      - ID: ${sub.id}, Active: ${sub.is_active}, Plan ID: ${sub.plan_id}`);
                  });
                  
                  if (subs.length === 0) {
                    console.log(`    💡 No subscription records exist for this user`);
                  } else {
                    subs.forEach(sub => {
                      if (sub.is_active !== 1) {
                        console.log(`    💡 Subscription exists but is inactive (is_active = ${sub.is_active})`);
                      }
                      
                      // Check if plan exists
                      db.get("SELECT id, name FROM subscription_plans WHERE id = ?", [sub.plan_id], (err, plan) => {
                        if (err) {
                          console.log(`    ❌ Error checking plan: ${err.message}`);
                        } else if (!plan) {
                          console.log(`    💡 Plan ID ${sub.plan_id} doesn't exist in subscription_plans table`);
                        } else {
                          console.log(`    ✅ Plan exists: ${plan.name}`);
                        }
                      });
                    });
                  }
                }
              });
            } else {
              console.log(`  ✅ Subscription found: WhatsApp sends used: ${result.whatsapp_sends_used}, Limit: ${result.whatsapp_send_limit}`);
            }
          });
        }
      });
      
      // Wait a bit then close
      setTimeout(() => {
        console.log('\n📋 Summary:');
        console.log('✅ Users with working subscriptions will not get the error');
        console.log('❌ Users without subscriptions or with inactive subscriptions will get the error');
        db.close();
      }, 3000);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testSubscriptionQuery(); 