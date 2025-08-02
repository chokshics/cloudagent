const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database', 'admin_portal.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Updating all subscription plans with new pricing and limits...\n');

// Update subscription plans table
db.run(`
  UPDATE subscription_plans 
  SET price_inr = 750.00, whatsapp_send_limit = 5, mobile_number_limit = 100
  WHERE id = 3 AND name = 'Professional'
`, function(err) {
  if (err) {
    console.error('Error updating Professional plan:', err);
  } else {
    console.log(`✅ Updated ${this.changes} Professional plan records`);
  }

  // Update Enterprise plan
  db.run(`
    UPDATE subscription_plans 
    SET price_inr = 1500.00, whatsapp_send_limit = 5, mobile_number_limit = 1000
    WHERE id = 4 AND name = 'Enterprise'
  `, function(err) {
    if (err) {
      console.error('Error updating Enterprise plan:', err);
    } else {
      console.log(`✅ Updated ${this.changes} Enterprise plan records`);
    }

    // Check current subscription plans
    db.all('SELECT id, name, price_inr, whatsapp_send_limit, mobile_number_limit FROM subscription_plans', (err, plans) => {
      if (err) {
        console.error('Error fetching subscription plans:', err);
      } else {
        console.log('\n📋 Updated Subscription Plans:');
        console.table(plans);
      }

      // Check if there are any existing payments for these plans
      db.all('SELECT id, plan_id, amount_inr, payment_status FROM payments WHERE plan_id IN (3, 4)', (err, payments) => {
        if (err) {
          console.error('Error fetching payments:', err);
        } else {
          console.log('\n💰 Existing Professional/Enterprise Plan Payments:');
          if (payments.length > 0) {
            console.table(payments);
            console.log('\n⚠️  Note: Existing payment records still show the old amounts. New payments will use the updated pricing.');
          } else {
            console.log('No existing payments for Professional/Enterprise plans found.');
          }
        }

        console.log('\n✅ All subscription plans updated successfully!');
        console.log('📱 QR codes updated:');
        console.log('   - Starter: qrcode-750.jpeg');
        console.log('   - Professional: qrcode-750.jpeg');
        console.log('   - Enterprise: qrcode-1500.jpeg');
        console.log('\n📊 New Limits:');
        console.log('   - Professional: 5 campaigns/month, 100 recipients/campaign');
        console.log('   - Enterprise: 5 campaigns/month, 1000 recipients/campaign');
        db.close();
      });
    });
  });
}); 