import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const envPath = path.join(root, '.env');
const envExamplePath = path.join(root, '.env.example');
const targetPath = path.join(root, 'public', 'env.js');

const sourcePath = fs.existsSync(envPath) ? envPath : envExamplePath;

if (!fs.existsSync(sourcePath)) {
  throw new Error(
    'Missing .env and .env.example. Create one of them before running env generation.',
  );
}

const parseEnv = (content) => {
  const parsed = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex < 1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['\"]|['\"]$/g, '');

    parsed[key] = value;
  }

  return parsed;
};

const requiredKeys = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID',
];

const envFileContent = fs.readFileSync(sourcePath, 'utf8');
const values = parseEnv(envFileContent);

const payload = {};

for (const key of requiredKeys) {
  payload[key] = values[key] ?? '';
}

const fileContents = `window.__appEnv = ${JSON.stringify(payload, null, 2)};\n`;
fs.writeFileSync(targetPath, fileContents, 'utf8');

console.log(`[forum-app] Generated public/env.js from ${path.basename(sourcePath)}`);
