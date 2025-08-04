const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database', 'admin_portal.db');

console.log('🔧 Adding country column to users table...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  
  console.log('✅ Connected to SQLite database');
  
  // Check if country column already exists
  db.get("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
      console.error('❌ Error checking table structure:', err);
      return;
    }
    
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error('❌ Error getting table info:', err);
        return;
      }
      
      const hasCountryColumn = columns.some(col => col.name === 'country');
      
      if (hasCountryColumn) {
        console.log('✅ Country column already exists');
        db.close();
        return;
      }
      
      // Add country column
      db.run("ALTER TABLE users ADD COLUMN country TEXT", (err) => {
        if (err) {
          console.error('❌ Error adding country column:', err);
        } else {
          console.log('✅ Successfully added country column to users table');
        }
        db.close();
      });
    });
  });
}); 