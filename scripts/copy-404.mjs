import { copyFileSync, existsSync, writeFileSync } from 'node:fs';

const p = 'dist/forum-app/browser';
if (existsSync(`${p}/index.html`)) {
  copyFileSync(`${p}/index.html`, `${p}/404.html`);
  // ensure .nojekyll for GitHub Pages (bypasses Jekyll processing)
  writeFileSync(`${p}/.nojekyll`, '');
  console.log('SPA fallback 404.html created (+ .nojekyll)');
} else {
  console.warn(`Skipping 404.html copy: ${p}/index.html not found`);
}
