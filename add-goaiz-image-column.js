const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database', 'admin_portal.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding goaiz_image_url column to promotions table...');

// Check if column exists
db.all("PRAGMA table_info(promotions)", (err, columns) => {
  if (err) {
    console.error('Error checking table info:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  
  if (columnNames.includes('goaiz_image_url')) {
    console.log('✅ goaiz_image_url column already exists');
    db.close();
    return;
  }

  // Add goaiz_image_url column
  console.log('Adding goaiz_image_url column...');
  db.run('ALTER TABLE promotions ADD COLUMN goaiz_image_url TEXT', (err) => {
    if (err) {
      console.error('❌ Error adding goaiz_image_url column:', err);
    } else {
      console.log('✅ Successfully added goaiz_image_url column to promotions table');
    }
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('✅ Database update completed successfully!');
      }
    });
  });
});
