const sqlite3 = require('sqlite3').verbose();

async function fixSubscriptionExpiration() {
  console.log('🔧 Fixing subscription expiration dates...');
  
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
    
    // First, let's check current subscription status
    console.log('\n📊 Current subscription status:');
    
    const checkQuery = `
      SELECT 
        u.email,
        us.id as subscription_id,
        us.is_active,
        us.created_at,
        us.expires_at,
        sp.name as plan_name
      FROM users u
      LEFT JOIN user_subscriptions us ON u.id = us.user_id
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.id IS NOT NULL
      ORDER BY u.id
    `;
    
    db.all(checkQuery, (err, results) => {
      if (err) {
        console.log('❌ Error checking subscriptions:', err.message);
        return;
      }
      
      console.log(`Found ${results.length} subscriptions`);
      
      results.forEach(row => {
        const now = new Date();
        const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
        const isExpired = expiresAt && expiresAt < now;
        
        console.log(`\n👤 ${row.email}:`);
        console.log(`  Plan: ${row.plan_name}`);
        console.log(`  Expires: ${row.expires_at || 'No expiration'}`);
        console.log(`  Expired: ${isExpired ? 'Yes' : 'No'}`);
      });
      
      // Now fix the expiration dates
      console.log('\n🔧 Fixing expiration dates...');
      
      // Calculate new expiration date (30 days from now)
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 30);
      const newExpirationString = newExpirationDate.toISOString().replace('T', ' ').replace('Z', '');
      
      console.log(`📅 New expiration date: ${newExpirationString}`);
      
      // Update all subscriptions to expire in 30 days
      const updateQuery = `
        UPDATE user_subscriptions 
        SET expires_at = ?, is_active = 1
        WHERE id IS NOT NULL
      `;
      
      db.run(updateQuery, [newExpirationString], function(err) {
        if (err) {
          console.log('❌ Error updating expiration dates:', err.message);
          return;
        }
        
        console.log(`✅ Updated ${this.changes} subscriptions`);
        
        // Verify the changes
        console.log('\n📊 Updated subscription status:');
        
        db.all(checkQuery, (err2, updatedResults) => {
          if (err2) {
            console.log('❌ Error checking updated subscriptions:', err2.message);
            return;
          }
          
          updatedResults.forEach(row => {
            const now = new Date();
            const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
            const isExpired = expiresAt && expiresAt < now;
            
            console.log(`\n👤 ${row.email}:`);
            console.log(`  Plan: ${row.plan_name}`);
            console.log(`  Expires: ${row.expires_at}`);
            console.log(`  Expired: ${isExpired ? 'Yes' : 'No'}`);
            console.log(`  Active: ${row.is_active === 1 ? 'Yes' : 'No'}`);
          });
          
          console.log('\n✅ All subscriptions have been updated with new expiration dates!');
          console.log('💡 The "Subscription Expired" error should now be resolved.');
          
          db.close();
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixSubscriptionExpiration(); 