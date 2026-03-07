import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';
import { format } from 'prettier';

config();

const envFilePath = resolve(process.cwd(), 'src/environments/environment.ts');

const getValue = (key, fallback = '') => {
    const value = process.env[key];
    return typeof value === 'string' ? value.trim() || fallback : fallback;
};

const parseProjectList = () => {
    const raw = getValue('FORUM_PROJECTS', 'Core Platform,Payments API,Public Website,Mobile App');
    return raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const firebase = {
    apiKey: getValue('FORUM_FIREBASE_API_KEY', 'TEMP_REPLACE_ME'),
    authDomain: getValue('FORUM_FIREBASE_AUTH_DOMAIN', 'TEMP_REPLACE_ME.firebaseapp.com'),
    projectId: getValue('FORUM_FIREBASE_PROJECT_ID', 'TEMP_REPLACE_ME'),
    storageBucket: getValue('FORUM_FIREBASE_STORAGE_BUCKET', 'TEMP_REPLACE_ME.firebasestorage.app'),
    messagingSenderId: getValue('FORUM_FIREBASE_MESSAGING_SENDER_ID', 'TEMP_REPLACE_ME'),
    appId: getValue('FORUM_FIREBASE_APP_ID', 'TEMP_REPLACE_ME'),
    measurementId: getValue('FORUM_FIREBASE_MEASUREMENT_ID', ''),
};

const forum = {
    defaultProject: getValue('FORUM_DEFAULT_PROJECT', 'Core Platform'),
    projects: parseProjectList(),
    adminEmail: getValue('FORUM_ADMIN_EMAIL', 'admin@example.com'),
    mailCollection: getValue('FORUM_MAIL_COLLECTION', 'mail'),
};

const hasRealFirebaseConfig =
    firebase.apiKey !== 'TEMP_REPLACE_ME' &&
    firebase.authDomain !== 'TEMP_REPLACE_ME.firebaseapp.com' &&
    firebase.projectId !== 'TEMP_REPLACE_ME' &&
    firebase.appId !== 'TEMP_REPLACE_ME';

const rawContent = `// -----------------------------------------------------------------------------
// THIS FILE IS AUTO‑GENERATED from your .env variables by scripts/generate-environment.mjs
// Do NOT edit manually; run \`npm run prepare:env\` (or \`npm start\`) to regenerate.
// If you prefer not to keep this file in source control, add it to .gitignore and
// make sure the preparer script runs before building or testing.
// -----------------------------------------------------------------------------
export const environment = {
  production: false,
  firebase: ${JSON.stringify(firebase, null, 2)},
  forum: ${JSON.stringify(forum, null, 2)},
  hasRealFirebaseConfig: ${hasRealFirebaseConfig},
} as const;
`;

const content = await format(rawContent, {
    parser: 'typescript',
    singleQuote: true,
    printWidth: 100,
});

mkdirSync(dirname(envFilePath), { recursive: true });
writeFileSync(envFilePath, content, 'utf-8');

console.log(`Environment file generated at ${envFilePath}`);
