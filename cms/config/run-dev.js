const { execSync } = require('child_process');
const path = require('path');

// Get the absolute path to the dist directory
const distPath = path.resolve(__dirname, 'frontend', 'dist');

console.log(`Starting server with dist path: ${distPath}`);

try {
  // Run wrangler with the correct paths and options
  execSync(`wrangler pages dev "${distPath}" --compatibility-date=2023-07-06 --d1=DB --r2=R2`, {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error running wrangler:', error.message);
} 