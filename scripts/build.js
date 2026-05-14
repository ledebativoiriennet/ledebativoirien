const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '../.next');
const tempDir = path.join(__dirname, '../.next-temp');
const oldDir = path.join(__dirname, '../.next-old');

console.log('Building to temporary directory to avoid 503 downtime...');
const result = spawnSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, BUILD_DIR: '.next-temp' },
  shell: true
});

if (result.status !== 0) {
  console.error('Next.js build failed');
  process.exit(1);
}

console.log('Build successful. Swapping directories for zero-downtime deployment...');

try {
  // 1. Remove old backup if it exists
  if (fs.existsSync(oldDir)) {
    fs.rmSync(oldDir, { recursive: true, force: true });
  }

  // 2. Move current .next to .next-old
  if (fs.existsSync(nextDir)) {
    fs.renameSync(nextDir, oldDir);
  }

  // 3. Move new build to .next
  fs.renameSync(tempDir, nextDir);

  // 4. Do NOT clean up oldDir immediately. Next.js might still be reading from it until it fully restarts.
  // We will clean it up at the start of the next build (see step 1).
  console.log('Deployment swap complete!');
} catch (err) {
  console.error('Error during directory swap:', err);
  // Fallback: If swap failed, try to restore
  if (!fs.existsSync(nextDir) && fs.existsSync(oldDir)) {
    console.log('Attempting to restore old build...');
    fs.renameSync(oldDir, nextDir);
  }
  process.exit(1);
}
