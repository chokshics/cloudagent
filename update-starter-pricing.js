const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'server', 'database', 'admin_portal.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to database successfully');
});

console.log('Updating Free and Starter plan limits...');

// Update Free plan (id = 1) to 1 campaign/month and 5 recipients/campaign
db.run(
  'UPDATE subscription_plans SET whatsapp_send_limit = ?, mobile_number_limit = ? WHERE id = ?',
  [1, 5, 1],
  function(err) {
    if (err) {
      console.error('Error updating Free plan:', err);
    } else {
      console.log(`Free plan updated successfully. Rows affected: ${this.changes}`);
    }
  }
);

// Update Starter plan (id = 2) to 2 campaigns/month and 25 recipients/campaign
db.run(
  'UPDATE subscription_plans SET whatsapp_send_limit = ?, mobile_number_limit = ? WHERE id = ?',
  [2, 25, 2],
  function(err) {
    if (err) {
      console.error('Error updating Starter plan:', err);
    } else {
      console.log(`Starter plan updated successfully. Rows affected: ${this.changes}`);
      
      // Verify the updates
      db.all('SELECT * FROM subscription_plans WHERE id IN (1, 2)', (err, rows) => {
        if (err) {
          console.error('Error verifying updates:', err);
        } else {
          console.log('Updated plan details:');
          rows.forEach(row => {
            console.log(`${row.name}: ${row.whatsapp_send_limit} campaigns/month, ${row.mobile_number_limit} recipients/campaign`);
          });
        }
        db.close();
      });
    }
  }
); 