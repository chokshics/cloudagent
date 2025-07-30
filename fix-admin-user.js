const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database', 'admin_portal.db');

console.log('🔧 Checking and fixing admin user...');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Check if admin user exists
db.get('SELECT id, username, email, role FROM users WHERE username = ?', ['admin'], async (err, row) => {
  if (err) {
    console.error('❌ Error checking admin user:', err);
    process.exit(1);
  }

  if (!row) {
    console.log('⚠️ Admin user not found. Creating...');
    
    // Create default admin user
    const defaultAdmin = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin'
    };

    try {
      const hash = await bcrypt.hash(defaultAdmin.password, 10);
      
      db.run(
        'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
        [defaultAdmin.username, defaultAdmin.email, hash, defaultAdmin.first_name, defaultAdmin.last_name, defaultAdmin.role],
        function(err) {
          if (err) {
            console.error('❌ Error creating admin user:', err);
            process.exit(1);
          } else {
            console.log('✅ Admin user created successfully');
            console.log('📝 Login credentials:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            process.exit(0);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error hashing password:', error);
      process.exit(1);
    }
  } else {
    console.log('✅ Admin user already exists');
    console.log('📝 Current admin user details:');
    console.log(`   Username: ${row.username}`);
    console.log(`   Email: ${row.email}`);
    console.log(`   Role: ${row.role}`);
    console.log('🔑 Login credentials: admin / admin123');
    process.exit(0);
  }
}); 