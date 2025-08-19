const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';

console.log('🗄️  Resetting Illumin8CMS Database...');

try {
  // Find the D1 database file
  let dbFile = null;
  
  if (fs.existsSync(dbPath)) {
    const files = fs.readdirSync(dbPath);
    dbFile = files.find(f => f.endsWith('.sqlite'));
    if (dbFile) {
      dbFile = path.join(dbPath, dbFile);
    }
  }
  
  if (!dbFile || !fs.existsSync(dbFile)) {
    console.log('❌ No database found. Please start the CMS first to create the database.');
    console.log('   Run: node start.js');
    process.exit(1);
  }
  
  console.log(`📁 Found database: ${dbFile}`);
  
  // Open database and reset users table
  const db = new Database(dbFile);
  
  // Delete all admin users
  const result = db.prepare("DELETE FROM users WHERE role = 'admin'").run();
  console.log(`🧹 Removed ${result.changes} admin user(s)`);
  
  // Reset all sessions
  try {
    const sessionResult = db.prepare("DELETE FROM sessions").run();
    console.log(`🧹 Removed ${sessionResult.changes} session(s)`);
  } catch (e) {
    // Sessions table might not exist yet
    console.log('ℹ️  No sessions table found (this is normal)');
  }
  
  db.close();
  
  console.log('✅ Database reset complete!');
  console.log('🚀 Now you can visit http://localhost:5173 and go through the setup wizard');
  console.log('');
  console.log('📝 Suggested test credentials:');
  console.log('   Username: admin');
  console.log('   Password: AdminTest123!');
  console.log('   Email: admin@example.com (optional)');
  
} catch (error) {
  console.error('❌ Error resetting database:', error.message);
  console.log('');
  console.log('🔧 If the database is locked, stop the CMS (Ctrl+C) and try again.');
  process.exit(1);
} 