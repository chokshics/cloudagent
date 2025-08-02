const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database', 'admin_portal.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Updating Starter plan pricing to ₹250...\n');

// Update subscription plans table
db.run(`
  UPDATE subscription_plans 
  SET price_inr = 250.00 
  WHERE id = 2 AND name = 'Starter'
`, function(err) {
  if (err) {
    console.error('Error updating subscription plans:', err);
  } else {
    console.log(`✅ Updated ${this.changes} subscription plan records`);
  }

  // Check current subscription plans
  db.all('SELECT id, name, price_inr, whatsapp_send_limit, mobile_number_limit FROM subscription_plans', (err, plans) => {
    if (err) {
      console.error('Error fetching subscription plans:', err);
    } else {
      console.log('\n📋 Updated Subscription Plans:');
      console.table(plans);
    }

    // Check if there are any existing payments for Starter plan that need updating
    db.all('SELECT id, plan_id, amount_inr, payment_status FROM payments WHERE plan_id = 2', (err, payments) => {
      if (err) {
        console.error('Error fetching payments:', err);
      } else {
        console.log('\n💰 Existing Starter Plan Payments:');
        if (payments.length > 0) {
          console.table(payments);
          console.log('\n⚠️  Note: Existing payment records still show the old amount. New payments will use the updated pricing.');
        } else {
          console.log('No existing payments for Starter plan found.');
        }
      }

      console.log('\n✅ Starter plan pricing updated successfully!');
      console.log('📱 QR code will now show qrcode-250.jpeg for Starter plan');
      db.close();
    });
  });
}); 