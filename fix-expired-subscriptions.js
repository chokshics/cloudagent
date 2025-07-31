const sqlite3 = require('sqlite3').verbose();

async function fixExpiredSubscriptions() {
  console.log('🔧 Fixing expired subscriptions for newly registered users...');
  
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
    
    // Check all subscriptions and their expiration dates
    console.log('\n📊 Checking all subscriptions...');
    
    const checkQuery = `
      SELECT 
        us.id as subscription_id,
        us.user_id,
        us.is_active,
        us.created_at,
        us.expires_at,
        sp.name as plan_name,
        u.username,
        u.email
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      JOIN users u ON us.user_id = u.id
      ORDER BY us.created_at DESC
    `;
    
    db.all(checkQuery, (err, subscriptions) => {
      if (err) {
        console.log('❌ Error checking subscriptions:', err.message);
        return;
      }
      
      console.log(`Found ${subscriptions.length} subscriptions`);
      
      const now = new Date();
      let expiredCount = 0;
      let fixedCount = 0;
      
      subscriptions.forEach(sub => {
        const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
        const isExpired = expiresAt && expiresAt < now;
        
        console.log(`\n👤 ${sub.username} (${sub.email}):`);
        console.log(`  Plan: ${sub.plan_name}`);
        console.log(`  Expires: ${sub.expires_at || 'No expiration'}`);
        console.log(`  Expired: ${isExpired ? 'Yes' : 'No'}`);
        console.log(`  Active: ${sub.is_active === 1 ? 'Yes' : 'No'}`);
        
        if (isExpired) {
          expiredCount++;
          console.log(`  ⚠️ This subscription has expired!`);
          
          // Fix the expiration date
          const newExpirationDate = new Date();
          newExpirationDate.setDate(newExpirationDate.getDate() + 30);
          const newExpirationString = newExpirationDate.toISOString().replace('T', ' ').replace('Z', '');
          
          const updateQuery = `
            UPDATE user_subscriptions 
            SET expires_at = ?, is_active = 1
            WHERE id = ?
          `;
          
          db.run(updateQuery, [newExpirationString, sub.subscription_id], function(err) {
            if (err) {
              console.log(`  ❌ Error fixing subscription:`, err.message);
            } else {
              fixedCount++;
              console.log(`  ✅ Fixed subscription - new expiration: ${newExpirationString}`);
            }
          });
        }
      });
      
      // Wait a bit then show summary
      setTimeout(() => {
        console.log(`\n📊 Summary:`);
        console.log(`  Total subscriptions: ${subscriptions.length}`);
        console.log(`  Expired subscriptions: ${expiredCount}`);
        console.log(`  Fixed subscriptions: ${fixedCount}`);
        
        if (expiredCount > 0) {
          console.log(`\n🎉 Fixed ${fixedCount} expired subscriptions!`);
          console.log('💡 Newly registered users should now have working subscriptions.');
        } else {
          console.log(`\n✅ No expired subscriptions found!`);
        }
        
        db.close();
      }, 2000);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixExpiredSubscriptions(); 