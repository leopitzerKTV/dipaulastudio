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

    // Create .htaccess for SPA routing fallback (Apache)
    const htaccess = `RewriteEngine On
RewriteBase /

# Disable directory listing
Options -Indexes

# Set default document
DirectoryIndex index.html

# Don't rewrite requests to existing files or directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Don't rewrite requests that already have a query string
RewriteCond %{QUERY_STRING} !^$

# Rewrite everything else to index.html
RewriteRule ^ index.html [QSA,L]

# Also handle cases without query string
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Serve 404.html for missing files
ErrorDocument 404 /404.html

# Prevent caching of HTML files
<FilesMatch "\\.html$">
  Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
  Header set Pragma "no-cache"
  Header set Expires "0"
</FilesMatch>

# Cache busting for assets
<FilesMatch "\\.(js|css|png|jpg|jpeg|gif|svg|ico)$">
  Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>`;
    fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess);

    // Create htaccess (visible name for FTP compatibility)
    fs.writeFileSync(path.join(distDir, 'htaccess'), htaccess);

    // Create web.config for IIS support
    const webConfig = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA-Routing" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>`;
    fs.writeFileSync(path.join(distDir, 'web.config'), webConfig);

    // Create 404.html for SPA routing fallback (if .htaccess doesn't work)
    const notFoundHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DiPaula Studio</title>
  <script>
    // Redirect 404s to index.html for SPA routing
    var path = window.location.pathname;
    if (path !== '/' && !path.match(/\\.(js|css|json|png|jpg|jpeg|gif|svg|ico)$/i)) {
      window.location.replace('/');
    }
  </script>
</head>
<body>
  <script>
    // Fallback if JavaScript redirect doesn't work
    document.write('<meta http-equiv="refresh" content="0; url=/" />');
  </script>
  <p>Redirecionando...</p>
</body>
</html>`;
    fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml);

    // Create index.php as universal fallback for SPA routing
    const indexPhp = `<?php
  // SPA routing fallback - serve index.html for all non-file/non-directory requests
  $request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
  $file_path = __DIR__ . $request_path;

  // Check if it's a real file or directory
  if (is_file($file_path) || is_dir($file_path)) {
    // Let the server handle it normally
    return false;
  }

  // Don't redirect static assets
  if (preg_match('/\\.(js|css|json|png|jpg|jpeg|gif|svg|ico)$/i', $request_path)) {
    header('HTTP/1.0 404 Not Found');
    echo '404 Not Found';
    exit;
  }

  // Serve index.html for all other requests (SPA routing)
  include __DIR__ . '/index.html';
?>`;
    fs.writeFileSync(path.join(distDir, 'index.php'), indexPhp);

    console.log('✓ SPA build created successfully in dist/');
    console.log(`✓ Using entry point: ${indexFile}`);
    console.log('✓ Created .htaccess for Apache SPA routing');
    console.log('✓ Created .htaccess.txt as backup (for FTP compatibility)');
    console.log('✓ Created web.config for IIS SPA routing');
    console.log('✓ Created 404.html as fallback SPA routing');
    console.log('✓ Created index.php as universal SPA router');
    console.log('Ready for FTP deployment!');
  } catch (error) {
    console.error('Error building SPA:', error);
    process.exit(1);
  }
}

buildSPA();
