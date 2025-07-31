const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function fixProductionSubscription() {
  console.log('🔧 Fixing subscription issue on production...');
  
  // Database path for production
  const dbPath = '/home/ec2-user/admin-portal/server/database/admin_portal.db';
  console.log('📁 Database path:', dbPath);
  
  const db = new sqlite3.Database(dbPath);
  
  try {
    // Check if database file exists
    const fs = require('fs');
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database file not found at:', dbPath);
      console.log('💡 Please check the database path');
      return;
    }
    
    console.log('✅ Database file found');
    
    // Step 1: Check subscription plans table structure
    console.log('\n📋 Step 1: Checking subscription plans table structure...');
    
    db.get("PRAGMA table_info(subscription_plans)", (err, result) => {
      if (err) {
        console.log('❌ Error checking subscription_plans table:', err.message);
        console.log('💡 Creating subscription_plans table...');
        createSubscriptionPlansTable(db);
        return;
      }
      
      console.log('✅ subscription_plans table exists');
      
      // Check what columns exist
      db.all("PRAGMA table_info(subscription_plans)", (err, columns) => {
        if (err) {
          console.log('❌ Error getting table info:', err.message);
          return;
        }
        
        console.log('📊 Table columns:', columns.map(col => col.name));
        
        // Check if we have the required columns
        const hasPrice = columns.some(col => col.name === 'price');
        const hasWhatsappLimit = columns.some(col => col.name === 'whatsapp_send_limit');
        
        if (!hasPrice || !hasWhatsappLimit) {
          console.log('⚠️ Table structure is different. Adding missing columns...');
          addMissingColumns(db, columns);
        } else {
          console.log('✅ Table structure is correct');
          checkUserSubscriptions(db);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function addMissingColumns(db, existingColumns) {
  const requiredColumns = [
    { name: 'price', type: 'REAL', defaultValue: '0.0' },
    { name: 'duration_days', type: 'INTEGER', defaultValue: '30' },
    { name: 'whatsapp_send_limit', type: 'INTEGER', defaultValue: '100' },
    { name: 'mobile_number_limit', type: 'INTEGER', defaultValue: '500' },
    { name: 'promotion_limit', type: 'INTEGER', defaultValue: '10' }
  ];
  
  const existingColumnNames = existingColumns.map(col => col.name);
  
  requiredColumns.forEach(column => {
    if (!existingColumnNames.includes(column.name)) {
      const addColumnSQL = `ALTER TABLE subscription_plans ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.defaultValue}`;
      
      db.run(addColumnSQL, (err) => {
        if (err) {
          console.log(`❌ Error adding column ${column.name}:`, err.message);
        } else {
          console.log(`✅ Added column: ${column.name}`);
        }
      });
    }
  });
  
  // Wait a bit then check user subscriptions
  setTimeout(() => checkUserSubscriptions(db), 2000);
}

function createSubscriptionPlansTable(db) {
  const createTable = `
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL DEFAULT 0.0,
      duration_days INTEGER NOT NULL DEFAULT 30,
      whatsapp_send_limit INTEGER NOT NULL DEFAULT 100,
      mobile_number_limit INTEGER NOT NULL DEFAULT 500,
      promotion_limit INTEGER NOT NULL DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.run(createTable, (err) => {
    if (err) {
      console.log('❌ Error creating subscription_plans table:', err.message);
    } else {
      console.log('✅ Created subscription_plans table');
      createDefaultPlans(db);
    }
  });
}

function createDefaultPlans(db) {
  const defaultPlans = [
    {
      name: 'Basic Plan',
      description: 'Basic features for small businesses',
      price: 29.99,
      duration_days: 30,
      whatsapp_send_limit: 100,
      mobile_number_limit: 500,
      promotion_limit: 10
    },
    {
      name: 'Professional Plan',
      description: 'Professional features for growing businesses',
      price: 59.99,
      duration_days: 30,
      whatsapp_send_limit: 500,
      mobile_number_limit: 2000,
      promotion_limit: 50
    },
    {
      name: 'Enterprise Plan',
      description: 'Enterprise features for large businesses',
      price: 99.99,
      duration_days: 30,
      whatsapp_send_limit: 2000,
      mobile_number_limit: 10000,
      promotion_limit: 200
    }
  ];
  
  const insertPlan = `
    INSERT INTO subscription_plans (name, description, price, duration_days, whatsapp_send_limit, mobile_number_limit, promotion_limit, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  
  defaultPlans.forEach((plan, index) => {
    db.run(insertPlan, [
      plan.name,
      plan.description,
      plan.price,
      plan.duration_days,
      plan.whatsapp_send_limit,
      plan.mobile_number_limit,
      plan.promotion_limit
    ], function(err) {
      if (err) {
        console.log(`❌ Error creating plan ${plan.name}:`, err.message);
      } else {
        console.log(`✅ Created plan: ${plan.name} (ID: ${this.lastID})`);
        
        // If this is the last plan, check user subscriptions
        if (index === defaultPlans.length - 1) {
          setTimeout(() => checkUserSubscriptions(db), 1000);
        }
      }
    });
  });
}

function checkUserSubscriptions(db) {
  console.log('\n📊 Step 2: Checking user subscriptions...');
  
  // Get all users
  db.all("SELECT id, email, role FROM users", (err, users) => {
    if (err) {
      console.log('❌ Error getting users:', err.message);
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    users.forEach(user => {
      console.log(`- User: ${user.email} (Role: ${user.role})`);
      
      // Check if user has active subscription
      const subscriptionQuery = `
        SELECT us.*, sp.name as plan_name
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = ? AND us.is_active = 1
        ORDER BY us.created_at DESC
        LIMIT 1
      `;
      
      db.get(subscriptionQuery, [user.id], (err, subscription) => {
        if (err) {
          console.log(`❌ Error checking subscription for ${user.email}:`, err.message);
          return;
        }
        
        if (!subscription) {
          console.log(`❌ No active subscription for ${user.email}`);
          createDefaultSubscription(db, user);
        } else {
          console.log(`✅ Active subscription for ${user.email}: ${subscription.plan_name}`);
        }
      });
    });
  });
}

function createDefaultSubscription(db, user) {
  console.log(`🔧 Creating default subscription for ${user.email}...`);
  
  // Get the first available plan (Basic Plan) - use a safer query
  const getPlanQuery = `
    SELECT id FROM subscription_plans 
    WHERE name LIKE '%Basic%' OR name LIKE '%Free%' OR name LIKE '%Standard%'
    ORDER BY id ASC LIMIT 1
  `;
  
  db.get(getPlanQuery, (err, plan) => {
    if (err) {
      console.log(`❌ Error getting default plan:`, err.message);
      return;
    }
    
    if (!plan) {
      // Try to get any plan
      db.get("SELECT id FROM subscription_plans ORDER BY id ASC LIMIT 1", (err, anyPlan) => {
        if (err || !anyPlan) {
          console.log('❌ No subscription plans available');
          return;
        }
        createSubscriptionForUser(db, user, anyPlan.id);
      });
    } else {
      createSubscriptionForUser(db, user, plan.id);
    }
  });
}

function createSubscriptionForUser(db, user, planId) {
  // Create user_subscriptions table if it doesn't exist
  const createSubscriptionsTable = `
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      whatsapp_sends_used INTEGER DEFAULT 0,
      mobile_numbers_used INTEGER DEFAULT 0,
      promotions_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
    )
  `;
  
  db.run(createSubscriptionsTable, (err) => {
    if (err) {
      console.log('❌ Error creating user_subscriptions table:', err.message);
      return;
    }
    
    console.log('✅ Created user_subscriptions table');
    
    // Create subscription
    const insertSubscription = `
      INSERT INTO user_subscriptions (
        user_id, plan_id, is_active, whatsapp_sends_used, 
        mobile_numbers_used, promotions_used, created_at, expires_at
      ) VALUES (?, ?, 1, 0, 0, 0, datetime('now'), datetime('now', '+30 days'))
    `;
    
    db.run(insertSubscription, [user.id, planId], function(err) {
      if (err) {
        console.log(`❌ Error creating subscription for ${user.email}:`, err.message);
      } else {
        console.log(`✅ Created default subscription for ${user.email} (ID: ${this.lastID})`);
      }
    });
  });
}

// Run the fix
fixProductionSubscription(); 