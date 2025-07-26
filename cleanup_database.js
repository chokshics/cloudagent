const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'server', 'database', 'admin_portal.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning up database - removing SMS-related tables and columns...');

// Function to clean up database
function cleanupDatabase() {
  console.log('📊 Starting database cleanup...');
  
  db.serialize(() => {
    // Drop sms_logs table if it exists
    db.run("DROP TABLE IF EXISTS sms_logs", (err) => {
      if (err) {
        console.error('❌ Error dropping sms_logs table:', err);
      } else {
        console.log('✅ Dropped sms_logs table');
      }
    });

    // Remove sms_send_limit column from subscription_plans table
    db.run("PRAGMA table_info(subscription_plans)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking subscription_plans table:', err);
        return;
      }
      
      const hasSmsSendLimit = columns.some(col => col.name === 'sms_send_limit');
      if (hasSmsSendLimit) {
        // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
        console.log('🔄 Recreating subscription_plans table without sms_send_limit...');
        
        db.run(`
          CREATE TABLE subscription_plans_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price_inr DECIMAL(10,2) NOT NULL,
            whatsapp_send_limit INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error creating new subscription_plans table:', err);
            return;
          }
          
          // Copy data from old table to new table
          db.run(`
            INSERT INTO subscription_plans_new (id, name, description, price_inr, whatsapp_send_limit, is_active, created_at)
            SELECT id, name, description, price_inr, whatsapp_send_limit, is_active, created_at
            FROM subscription_plans
          `, (err) => {
            if (err) {
              console.error('❌ Error copying data to new subscription_plans table:', err);
              return;
            }
            
            // Drop old table and rename new table
            db.run("DROP TABLE subscription_plans", (err) => {
              if (err) {
                console.error('❌ Error dropping old subscription_plans table:', err);
                return;
              }
              
              db.run("ALTER TABLE subscription_plans_new RENAME TO subscription_plans", (err) => {
                if (err) {
                  console.error('❌ Error renaming subscription_plans table:', err);
                } else {
                  console.log('✅ Successfully removed sms_send_limit from subscription_plans table');
                }
              });
            });
          });
        });
      } else {
        console.log('✅ sms_send_limit column not found in subscription_plans table');
      }
    });

    // Remove sms_sends_used column from user_subscriptions table
    db.run("PRAGMA table_info(user_subscriptions)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking user_subscriptions table:', err);
        return;
      }
      
      const hasSmsSendsUsed = columns.some(col => col.name === 'sms_sends_used');
      if (hasSmsSendsUsed) {
        console.log('🔄 Recreating user_subscriptions table without sms_sends_used...');
        
        db.run(`
          CREATE TABLE user_subscriptions_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            whatsapp_sends_used INTEGER DEFAULT 0,
            start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_date DATETIME,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error creating new user_subscriptions table:', err);
            return;
          }
          
          // Copy data from old table to new table
          db.run(`
            INSERT INTO user_subscriptions_new (id, user_id, plan_id, whatsapp_sends_used, start_date, end_date, is_active, created_at)
            SELECT id, user_id, plan_id, whatsapp_sends_used, start_date, end_date, is_active, created_at
            FROM user_subscriptions
          `, (err) => {
            if (err) {
              console.error('❌ Error copying data to new user_subscriptions table:', err);
              return;
            }
            
            // Drop old table and rename new table
            db.run("DROP TABLE user_subscriptions", (err) => {
              if (err) {
                console.error('❌ Error dropping old user_subscriptions table:', err);
                return;
              }
              
              db.run("ALTER TABLE user_subscriptions_new RENAME TO user_subscriptions", (err) => {
                if (err) {
                  console.error('❌ Error renaming user_subscriptions table:', err);
                } else {
                  console.log('✅ Successfully removed sms_sends_used from user_subscriptions table');
                }
              });
            });
          });
        });
      } else {
        console.log('✅ sms_sends_used column not found in user_subscriptions table');
      }
    });

    // Update subscription plans to remove SMS references
    db.run(`
      UPDATE subscription_plans 
      SET description = REPLACE(description, 'SMS', 'WhatsApp')
      WHERE description LIKE '%SMS%'
    `, (err) => {
      if (err) {
        console.error('❌ Error updating subscription plan descriptions:', err);
      } else {
        console.log('✅ Updated subscription plan descriptions');
      }
    });
  });

  // Close database connection after cleanup
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err);
      } else {
        console.log('✅ Database cleanup completed successfully!');
        console.log('🗑️ Removed all SMS-related tables and columns');
        console.log('📱 Database now only supports WhatsApp campaigns');
      }
    });
  }, 2000); // Wait 2 seconds for all operations to complete
}

// Run the cleanup
cleanupDatabase(); 