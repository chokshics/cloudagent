const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database', 'admin_portal.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table with shopkeeper fields
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT,
          password TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          phone_number TEXT,
          country TEXT,
          role TEXT DEFAULT 'shopkeeper',
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

             // Create promotions table
       db.run(`
         CREATE TABLE IF NOT EXISTS promotions (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           title TEXT NOT NULL,
           description TEXT,
           discount_percentage INTEGER,
           discount_amount DECIMAL(10,2),
           image_url TEXT,
           start_date DATE,
           end_date DATE,
           is_active BOOLEAN DEFAULT 1,
           created_by INTEGER,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           FOREIGN KEY (created_by) REFERENCES users (id)
         )
       `);

      // Create mobile_numbers table
      db.run(`
        CREATE TABLE IF NOT EXISTS mobile_numbers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone_number TEXT NOT NULL,
          name TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create whatsapp_logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS whatsapp_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          promotion_id INTEGER,
          mobile_number TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          twilio_sid TEXT,
          error_message TEXT,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (promotion_id) REFERENCES promotions (id),
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create whatsapp_opt_ins table for consent management
      db.run(`
        CREATE TABLE IF NOT EXISTS whatsapp_opt_ins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone_number TEXT NOT NULL,
          name TEXT,
          consent_method TEXT NOT NULL, -- 'website', 'sms', 'email', 'in_store', 'phone'
          consent_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip_address TEXT,
          user_agent TEXT,
          consent_text TEXT, -- The exact text the user agreed to
          is_active BOOLEAN DEFAULT 1,
          opt_out_timestamp DATETIME,
          opt_out_reason TEXT,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id),
          UNIQUE(phone_number)
        )
      `);



      // Create subscription_plans table
      db.run(`
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price_inr DECIMAL(10,2) NOT NULL,
          whatsapp_send_limit INTEGER NOT NULL,
          mobile_number_limit INTEGER NOT NULL DEFAULT 10,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create user_subscriptions table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          plan_id INTEGER NOT NULL,
          whatsapp_sends_used INTEGER DEFAULT 0,
          mobile_numbers_used INTEGER DEFAULT 0,
          promotions_used INTEGER DEFAULT 0,
          start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          end_date DATETIME,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
        )
      `);

      // Create payments table
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          plan_id INTEGER NOT NULL,
          amount_inr DECIMAL(10,2) NOT NULL,
          upi_transaction_id TEXT,
          payment_status TEXT DEFAULT 'pending',
          payment_method TEXT DEFAULT 'upi',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
        )
      `);

      // Insert default subscription plans
      db.run(`
                 INSERT OR IGNORE INTO subscription_plans (id, name, description, price_inr, whatsapp_send_limit, mobile_number_limit) VALUES
         (1, 'Free', 'Basic plan with limited campaigns', 0.00, 1, 5),
         (2, 'Starter', 'Perfect for small businesses', 250.00, 2, 25),
         (3, 'Professional', 'For growing businesses', 750.00, 5, 100),
         (4, 'Enterprise', 'Unlimited campaigns for large businesses', 1500.00, 5, 250)
      `);

      // Create default admin user
      const defaultAdmin = {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      };

      // Check if admin user exists
      db.get('SELECT id FROM users WHERE username = ?', [defaultAdmin.username], (err, row) => {
        if (err) {
          console.error('Error checking admin user:', err);
          reject(err);
          return;
        }

        if (!row) {
          // Create default admin user
          bcrypt.hash(defaultAdmin.password, 10, (err, hash) => {
            if (err) {
              console.error('Error hashing password:', err);
              reject(err);
              return;
            }

            db.run(
              'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
              [defaultAdmin.username, defaultAdmin.email, hash, defaultAdmin.first_name, defaultAdmin.last_name, defaultAdmin.role],
              function(err) {
                if (err) {
                  console.error('Error creating admin user:', err);
                  reject(err);
                } else {
                  console.log('Admin user created successfully');
                  resolve();
                }
              }
            );
          });
        } else {
          console.log('Admin user already exists');
          resolve();
        }
      });
    });
  });
};

// Get database instance
const getDatabase = () => {
  return db;
};

module.exports = {
  initDatabase,
  getDatabase
}; 