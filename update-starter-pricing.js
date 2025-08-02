const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'server', 'database', 'cloudagent.db');
const db = new sqlite3.Database(dbPath);

console.log('Updating Enterprise plan mobile number limit from 1000 to 250...');

// Update the Enterprise plan (id = 4) mobile number limit
db.run(
  'UPDATE subscription_plans SET mobile_number_limit = ? WHERE id = ?',
  [250, 4],
  function(err) {
    if (err) {
      console.error('Error updating Enterprise plan:', err);
    } else {
      console.log(`Enterprise plan updated successfully. Rows affected: ${this.changes}`);
      
      // Verify the update
      db.get('SELECT * FROM subscription_plans WHERE id = 4', (err, row) => {
        if (err) {
          console.error('Error verifying update:', err);
        } else {
          console.log('Updated Enterprise plan details:', row);
        }
        db.close();
      });
    }
  }
); 