import { Injectable } from '@angular/core';
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { RuntimeEnv } from '../models/runtime-env';

@Injectable({
  providedIn: 'root',
})
export class Firebase {
  readonly config: FirebaseOptions = this.readRuntimeConfig();
  readonly app: FirebaseApp = getApps().length ? getApp() : initializeApp(this.config);
  readonly auth: Auth = getAuth(this.app);
  readonly db: Firestore = getFirestore(this.app);

  private readRuntimeConfig(): FirebaseOptions {
    const env = window.__appEnv ?? {};
    const missing: (keyof RuntimeEnv)[] = [];

    const getValue = (key: keyof RuntimeEnv, required: boolean): string | undefined => {
      const rawValue = typeof env[key] === 'string' ? env[key] : '';
      const value = rawValue.trim();

      if (!value && required) {
        missing.push(key);
        return `MISSING_${key}`;
      }

      return value || undefined;
    };

    const firebaseOptions: FirebaseOptions = {
      apiKey: getValue('FIREBASE_API_KEY', true) as string,
      authDomain: getValue('FIREBASE_AUTH_DOMAIN', true) as string,
      projectId: getValue('FIREBASE_PROJECT_ID', true) as string,
      storageBucket: getValue('FIREBASE_STORAGE_BUCKET', true) as string,
      messagingSenderId: getValue('FIREBASE_MESSAGING_SENDER_ID', true) as string,
      appId: getValue('FIREBASE_APP_ID', true) as string,
      measurementId: getValue('FIREBASE_MEASUREMENT_ID', false),
    };

    if (missing.length > 0) {
      console.warn(
        `[forum-app] Missing runtime env values: ${missing.join(', ')}. ` +
          'Update .env or .env.example and regenerate public/env.js.',
      );
    }

    return firebaseOptions;
  }
}
