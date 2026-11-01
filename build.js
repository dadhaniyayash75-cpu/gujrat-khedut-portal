import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚜 Building Gujarat Khedut Portal frontend...');

try {
  console.log('📦 Installing client dependencies...');
  execSync('npm --prefix client install --no-audit --no-fund', { stdio: 'inherit' });

  console.log('⚡ Running client production build (Vite)...');
  execSync('npm --prefix client run build', { stdio: 'inherit' });

  const clientDist = path.resolve('client', 'dist');
  const rootDist = path.resolve('dist');

  if (fs.existsSync(rootDist)) {
    fs.rmSync(rootDist, { recursive: true, force: true });
  }

  if (fs.existsSync(clientDist)) {
    console.log('📂 Copying client/dist to root dist for Vercel compatibility...');
    fs.cpSync(clientDist, rootDist, { recursive: true, force: true });
    console.log('✅ Build completed successfully! dist/index.html is ready.');
  } else {
    console.error('❌ client/dist directory was not found after build!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
