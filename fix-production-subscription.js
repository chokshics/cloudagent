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
    
    // Step 1: Check subscription plans
    console.log('\n📋 Step 1: Checking subscription plans...');
    
    db.get("SELECT COUNT(*) as count FROM subscription_plans", (err, result) => {
      if (err) {
        console.log('❌ Error checking subscription_plans:', err.message);
        console.log('💡 Creating subscription_plans table...');
        createSubscriptionPlansTable(db);
        return;
      }
      
      console.log(`Found ${result.count} subscription plans`);
      
      if (result.count === 0) {
        console.log('⚠️ No subscription plans found. Creating default plans...');
        createDefaultPlans(db);
      } else {
        console.log('✅ Subscription plans exist');
        checkUserSubscriptions(db);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function createSubscriptionPlansTable(db) {
  const createTable = `
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_days INTEGER NOT NULL,
      whatsapp_send_limit INTEGER NOT NULL,
      mobile_number_limit INTEGER NOT NULL,
      promotion_limit INTEGER NOT NULL,
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
  
  // Get the first available plan (Basic Plan)
  db.get("SELECT id FROM subscription_plans ORDER BY price ASC LIMIT 1", (err, plan) => {
    if (err) {
      console.log(`❌ Error getting default plan:`, err.message);
      return;
    }
    
    if (!plan) {
      console.log('❌ No subscription plans available');
      return;
    }
    
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
      
      db.run(insertSubscription, [user.id, plan.id], function(err) {
        if (err) {
          console.log(`❌ Error creating subscription for ${user.email}:`, err.message);
        } else {
          console.log(`✅ Created default subscription for ${user.email} (ID: ${this.lastID})`);
        }
      });
    });
  });
}

// Run the fix
fixProductionSubscription(); 