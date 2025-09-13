const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'server', 'database', 'admin_portal.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Function to reset WhatsApp campaign count for a specific user
function resetWhatsAppCount(userId) {
  return new Promise((resolve, reject) => {
    // First, check if user exists
    db.get('SELECT id, username FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!user) {
        reject(new Error(`User with ID ${userId} not found`));
        return;
      }
      
      console.log(`👤 Found user: ${user.username} (ID: ${user.id})`);
      
      // Get current subscription info
      db.get(`
        SELECT us.*, sp.plan_name 
        FROM user_subscriptions us 
        JOIN subscription_plans sp ON us.plan_id = sp.id 
        WHERE us.user_id = ? 
        ORDER BY us.created_at DESC 
        LIMIT 1
      `, [userId], (err, subscription) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!subscription) {
          reject(new Error(`No subscription found for user ${userId}`));
          return;
        }
        
        console.log(`📊 Current subscription: ${subscription.plan_name}`);
        console.log(`📈 Current WhatsApp sends used: ${subscription.whatsapp_sends_used}`);
        
        // Reset the count to 0
        db.run(
          'UPDATE user_subscriptions SET whatsapp_sends_used = 0 WHERE user_id = ? AND id = ?',
          [userId, subscription.id],
          function(err) {
            if (err) {
              reject(err);
              return;
            }
            
            console.log(`✅ WhatsApp campaign count reset to 0 for user ${user.username}`);
            console.log(`📊 Rows affected: ${this.changes}`);
            resolve();
          }
        );
      });
    });
  });
}

// Function to list all users with their current counts
function listUsersWithCounts() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        u.id,
        u.username,
        u.email,
        sp.plan_name,
        us.whatsapp_sends_used,
        sp.whatsapp_send_limit
      FROM users u
      LEFT JOIN user_subscriptions us ON u.id = us.user_id
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.id = (
        SELECT id FROM user_subscriptions 
        WHERE user_id = u.id 
        ORDER BY created_at DESC 
        LIMIT 1
      )
      ORDER BY u.id
    `, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n📋 Current WhatsApp Campaign Counts:');
      console.log('ID | Username | Email | Plan | Used | Limit');
      console.log('---|----------|-------|------|------|------');
      
      rows.forEach(row => {
        console.log(`${row.id} | ${row.username} | ${row.email} | ${row.plan_name || 'N/A'} | ${row.whatsapp_sends_used || 0} | ${row.whatsapp_send_limit || 'N/A'}`);
      });
      
      resolve(rows);
    });
  });
}

// Function to reset count for all users
function resetAllUsers() {
  return new Promise((resolve, reject) => {
    db.run('UPDATE user_subscriptions SET whatsapp_sends_used = 0', function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`✅ Reset WhatsApp campaign count for all users`);
      console.log(`📊 Rows affected: ${this.changes}`);
      resolve();
    });
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  try {
    if (args.length === 0) {
      console.log('🔧 WhatsApp Campaign Count Reset Tool\n');
      console.log('Usage:');
      console.log('  node reset-whatsapp-count.js list                    # List all users with counts');
      console.log('  node reset-whatsapp-count.js reset <user_id>        # Reset count for specific user');
      console.log('  node reset-whatsapp-count.js reset-all              # Reset count for all users');
      console.log('');
      
      // Show current counts
      await listUsersWithCounts();
      
    } else if (args[0] === 'list') {
      await listUsersWithCounts();
      
    } else if (args[0] === 'reset' && args[1]) {
      const userId = parseInt(args[1]);
      if (isNaN(userId)) {
        console.error('❌ Invalid user ID. Please provide a number.');
        process.exit(1);
      }
      
      await resetWhatsAppCount(userId);
      
    } else if (args[0] === 'reset-all') {
      console.log('⚠️  This will reset WhatsApp campaign counts for ALL users.');
      console.log('Are you sure? (This action cannot be undone)');
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await resetAllUsers();
      
    } else {
      console.error('❌ Invalid command. Use "list", "reset <user_id>", or "reset-all"');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { resetWhatsAppCount, listUsersWithCounts, resetAllUsers };
