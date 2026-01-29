/**
 * RENDER DEPLOYMENT FIX
 * Render often defaults to running 'node app.js' if a specific start command isn't found 
 * or if the configuration defaults are applied.
 * 
 * This file acts as a bridge to the actual compiled TypeScript server in 'dist/server.js'.
 */

const fs = require('fs');
const path = require('path');

// Path to the compiled server file
const distServer = path.join(__dirname, 'dist', 'server.js');

if (fs.existsSync(distServer)) {
  console.log('🚀 [Bridge] Starting server from dist/server.js...');
  require(distServer);
} else {
  console.error('❌ [Bridge] Error: dist/server.js not found.');
  console.error('   Make sure "npm run build" ran successfully before starting.');
  console.error('   Current directory contents:', fs.readdirSync(__dirname));
  if (fs.existsSync(path.join(__dirname, 'src'))) {
      console.error('   src/ folder exists. TypeScript build (tsc) likely failed or did not run.');
  }
  process.exit(1);
}
