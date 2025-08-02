const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'server/database/admin_portal.db');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the database.');
});

// Migration function
const migrateDatabase = () => {
  console.log('Starting database migration...');

  // Check if mobile_numbers_used column exists
  db.get("PRAGMA table_info(user_subscriptions)", (err, rows) => {
    if (err) {
      console.error('Error checking table schema:', err);
      return;
    }

    db.all("PRAGMA table_info(user_subscriptions)", (err, columns) => {
      if (err) {
        console.error('Error getting table info:', err);
        return;
      }

      const columnNames = columns.map(col => col.name);
      console.log('Current columns:', columnNames);

      // Add mobile_numbers_used column if it doesn't exist
      if (!columnNames.includes('mobile_numbers_used')) {
        console.log('Adding mobile_numbers_used column...');
        db.run('ALTER TABLE user_subscriptions ADD COLUMN mobile_numbers_used INTEGER DEFAULT 0', (err) => {
          if (err) {
            console.error('Error adding mobile_numbers_used column:', err);
          } else {
            console.log('✅ Added mobile_numbers_used column');
          }
        });
      } else {
        console.log('mobile_numbers_used column already exists');
      }

      // Add promotions_used column if it doesn't exist
      if (!columnNames.includes('promotions_used')) {
        console.log('Adding promotions_used column...');
        db.run('ALTER TABLE user_subscriptions ADD COLUMN promotions_used INTEGER DEFAULT 0', (err) => {
          if (err) {
            console.error('Error adding promotions_used column:', err);
          } else {
            console.log('✅ Added promotions_used column');
          }
        });
      } else {
        console.log('promotions_used column already exists');
      }

      // Update existing records to have default values
      console.log('Updating existing records...');
      db.run('UPDATE user_subscriptions SET mobile_numbers_used = 0 WHERE mobile_numbers_used IS NULL', (err) => {
        if (err) {
          console.error('Error updating mobile_numbers_used:', err);
        } else {
          console.log('✅ Updated mobile_numbers_used for existing records');
        }
      });

      db.run('UPDATE user_subscriptions SET promotions_used = 0 WHERE promotions_used IS NULL', (err) => {
        if (err) {
          console.error('Error updating promotions_used:', err);
        } else {
          console.log('✅ Updated promotions_used for existing records');
        }
      });

      // Close database connection
      setTimeout(() => {
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('✅ Database migration completed successfully!');
          }
        });
      }, 1000);
    });
  });
};

// Run migration
migrateDatabase(); 