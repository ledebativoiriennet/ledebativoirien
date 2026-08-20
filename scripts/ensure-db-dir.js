const fs = require('fs');
const path = require('path');

// Extract the path from DATABASE_URL
// e.g. "file:/home/u420448722/domains/ledebativoirien.net/database/dev.db"
const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.startsWith('file:')) {
  let dbPath = dbUrl.replace('file:', '');
  
  // Remove query parameters if any (e.g. ?busy_timeout=10000)
  dbPath = dbPath.split('?')[0];

  // If it's an absolute path
  if (path.isAbsolute(dbPath)) {
    const dir = path.dirname(dbPath);
    
    try {
      if (!fs.existsSync(dir)) {
        console.log(`[Pre-build] Creating database directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[Pre-build] Directory created successfully.`);
      } else {
        console.log(`[Pre-build] Database directory already exists: ${dir}`);
      }
    } catch (error) {
      console.error(`[Pre-build] Failed to create database directory: ${error.message}`);
    }
  }
}
