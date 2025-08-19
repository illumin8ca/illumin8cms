const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'illumin8-salt').digest('hex');
}

function setupAdmin() {
  console.log('🔧 Setting up Illumin8CMS Admin User...');
  
  let dbPath = findDatabase();
  
  if (!dbPath) {
    // Create a new database file in a known location
    const dbDir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'illumin8cms.sqlite');
    console.log(`📁 Creating new database at: ${dbPath}`);
  }

  try {
    const db = new Database(dbPath);
    
    // Create the users table
    console.log('📝 Creating users table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        totp_secret TEXT DEFAULT NULL
      );
    `);

    // Check if admin user already exists
    const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin@illumin8.ca');
    
    if (existingAdmin) {
      console.log('✅ Admin user admin@illumin8.ca already exists!');
    } else {
      // Insert admin user
      const passwordHash = hashPassword('admin123');
      
      console.log('👤 Creating admin user: admin@illumin8.ca');
      db.prepare(`
        INSERT INTO users (username, email, password_hash, role) 
        VALUES (?, ?, ?, ?)
      `).run('admin@illumin8.ca', 'admin@illumin8.ca', passwordHash, 'admin');
      
      console.log('✅ Admin user created successfully!');
    }
    
    // Create other essential tables
    console.log('📝 Creating additional tables...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        excerpt TEXT,
        featured_image TEXT,
        status TEXT DEFAULT 'draft',
        author_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        category TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS media_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        r2_key TEXT NOT NULL,
        alt_text TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    db.close();
    
    console.log('');
    console.log('🎉 Illumin8CMS Database Setup Complete!');
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('   Username: admin@illumin8.ca');
    console.log('   Password: admin123');
    console.log('');
    console.log('💡 2FA is bypassed for admin@illumin8.ca as requested');
    console.log('');
    console.log('🚀 Start the CMS with: node start.js');
    console.log('📱 Then visit: http://localhost:5174');
    console.log('');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupAdmin(); 