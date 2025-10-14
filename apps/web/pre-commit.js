// pre-commit.js
const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Run the sitemap generation script
  console.log('📦 Generating sitemap...');
  execSync('node experiments/scripts/gen-posts-sitemap-xml.js', { stdio: 'inherit' });

  // Add the generated sitemap to Git staging
  console.log('📦 Adding sitemap to Git staging...');
  execSync('git add public/sitemap.xml', { stdio: 'inherit' });

  // Run the build command
  console.log('🏗 Building project...');
  execSync('bun run build', { stdio: 'inherit' });

  // Run lint
  console.log('🧹 Running linter...');
  execSync('bun lint', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Pre-commit hook failed:', error);
  process.exit(1);
}