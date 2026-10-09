import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const previewSrcDir = path.join(__dirname, '../Preview Page');
const distPreviewDir = path.join(__dirname, '../dist/preview');
const rootApiDir = path.join(__dirname, '../api');

try {
  console.log('📦 Preparing Preview Page in dist/preview for Vercel...');

  // 1. Ensure dist/preview exists
  if (!fs.existsSync(distPreviewDir)) {
    fs.mkdirSync(distPreviewDir, { recursive: true });
  }

  // 2. Copy all files from Preview Page to dist/preview (except .vercel folder)
  const files = fs.readdirSync(previewSrcDir);
  for (const file of files) {
    if (file === '.vercel' || file === '.git' || file === 'node_modules') continue;
    const srcPath = path.join(previewSrcDir, file);
    const destPath = path.join(distPreviewDir, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // 3. Ensure root api/validate.js exists for Vercel Serverless
  if (!fs.existsSync(rootApiDir)) {
    fs.mkdirSync(rootApiDir, { recursive: true });
  }
  const apiSrc = path.join(previewSrcDir, 'api/validate.js');
  const apiDest = path.join(rootApiDir, 'validate.js');
  if (fs.existsSync(apiSrc)) {
    fs.copyFileSync(apiSrc, apiDest);
  }

  console.log('✅ Preview Page successfully prepared in dist/preview and root api/!');
} catch (err) {
  console.error('Error preparing Preview Page:', err);
  process.exit(1);
}
