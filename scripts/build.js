const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');
const distPublicDir = path.join(distDir, 'public');

// empaquetado del proyecto en dist
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// copia de archivos de codigo
for (const file of fs.readdirSync(srcDir)) {
  fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
}

// copia de interfaz web
if (fs.existsSync(publicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
  for (const file of fs.readdirSync(publicDir)) {
    fs.copyFileSync(path.join(publicDir, file), path.join(distPublicDir, file));
  }
}

// copia de dependencias del proyecto
fs.copyFileSync(
  path.join(__dirname, '..', 'package.json'),
  path.join(distDir, 'package.json')
);

console.log('Build completado exitosamente en dist/');
