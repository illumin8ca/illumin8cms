const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Look for the D1 database in wrangler's local dev environment
const possibleDbPaths = [
  '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/illumin8cms.sqlite',
  '.wrangler/state/d1/DB.sqlite3',
  '.wrangler/state/d1/illumin8cms.sqlite',
  '.wrangler/state/v3/d1/illumin8cms.sqlite',
  // Also check in cms directory
  'cms/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/illumin8cms.sqlite',
  'cms/.wrangler/state/d1/DB.sqlite3',
  'cms/.wrangler/state/d1/illumin8cms.sqlite',
  'cms/.wrangler/state/v3/d1/illumin8cms.sqlite'
];

function findDatabase() {
  for (const dbPath of possibleDbPaths) {
    if (fs.existsSync(dbPath)) {
      console.log(`🔍 Found database at: ${dbPath}`);
      return dbPath;
    }
  }
  return null;
}

function addTotpColumn() {
  console.log('🔧 Adding 2FA support to Illumin8CMS Database...');
  
  const dbPath = findDatabase();
  
  if (!dbPath) {
    console.log('❌ No database found. Please start the CMS first to create the database.');
    console.log('   Run: node start.js');
    console.log('   Then access http://localhost:5174 to trigger database creation.');
    return;
  }

  try {
    const db = new Database(dbPath);
    
    // Check if totp_secret column already exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const totpColumnExists = tableInfo.some(column => column.name === 'totp_secret');
    
    if (totpColumnExists) {
      console.log('✅ totp_secret column already exists in users table.');
      db.close();
      return;
    }

    // Add the totp_secret column
    console.log('📝 Adding totp_secret column to users table...');
    db.exec('ALTER TABLE users ADD COLUMN totp_secret TEXT DEFAULT NULL');
    
    console.log('✅ Successfully added 2FA support to the database!');
    console.log('   Users can now enable two-factor authentication.');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error adding 2FA column:', error.message);
    process.exit(1);
  }
}

// Run the migration
addTotpColumn(); 