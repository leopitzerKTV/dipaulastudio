import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rmRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        rmRecursive(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(dir);
  }
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function buildSPA() {
  const outputDir = path.join(__dirname, '.output/public');
  const distDir = path.join(__dirname, 'dist');

  try {
    // Remove dist directory if it exists
    rmRecursive(distDir);
    fs.mkdirSync(distDir, { recursive: true });

    // Copy .output/public to dist
    copyRecursive(outputDir, distDir);

    // Find the main index-*.js file
    const assetsDir = path.join(distDir, 'assets');
    const files = fs.readdirSync(assetsDir);
    const indexFile = files.find(f => f.match(/^index-[a-zA-Z0-9-]+\.js$/));

    if (!indexFile) {
      throw new Error('Could not find index-*.js file in dist/assets/');
    }

    // Create index.html for SPA routing
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DiPaula Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${indexFile}"></script>
  </body>
</html>`;

    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

    console.log('✓ SPA build created successfully in dist/');
    console.log(`✓ Using entry point: ${indexFile}`);
    console.log('Ready for FTP deployment!');
  } catch (error) {
    console.error('Error building SPA:', error);
    process.exit(1);
  }
}

buildSPA();
