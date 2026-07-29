import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');
const indexHtmlPath = path.join(__dirname, '../Preview Page/index.html');
const appJsPath = path.join(__dirname, '../Preview Page/app.js');

try {
    // 1. Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const version = packageJson.version; // e.g. "2.0.0"
    
    console.log(`Updating Preview Page to version ${version}...`);

    // 2. Update index.html version badge
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    // Match <span class="badge-mono" style="...">V2.0.0</span>
    const versionBadgeRegex = /(<span class="badge-mono"[^>]*>V)[\d.]+(<\/span>)/i;
    indexHtml = indexHtml.replace(versionBadgeRegex, `$1${version}$2`);
    fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
    console.log('Updated index.html successfully.');

    // 3. Update app.js download links and texts
    let appJs = fs.readFileSync(appJsPath, 'utf8');
    // Replace vX.Y.Z in github download links
    appJs = appJs.replace(/\/releases\/download\/v[\d.]+\//g, `/releases/download/v${version}/`);
    // Replace version numbers in file names like E.O.M-Setup-2.0.0.exe and E.O.M-2.0.0.dmg
    appJs = appJs.replace(/E\.O\.M-Setup-[\d.]+\.exe/g, `E.O.M-Setup-${version}.exe`);
    appJs = appJs.replace(/E\.O\.M-[\d.]+\.dmg/g, `E.O.M-${version}.dmg`);
    appJs = appJs.replace(/Download E\.O\.M\.ipa \(V[\d.]+\)/gi, `Download E.O.M.ipa (V${version})`);
    appJs = appJs.replace(/Download E\.O\.M\.apk \(V[\d.]+\)/gi, `Download E.O.M.apk (V${version})`);
    appJs = appJs.replace(/Download E\.O\.M Setup [\d.]+\.exe/gi, `Download E.O.M Setup ${version}.exe`);
    appJs = appJs.replace(/Download E\.O\.M-[\d.]+\.dmg/gi, `Download E.O.M-${version}.dmg`);
    
    fs.writeFileSync(appJsPath, appJs, 'utf8');
    console.log('Updated app.js successfully.');

} catch (err) {
    console.error('Error updating version number:', err);
    process.exit(1);
}
