import { initializeApp } from 'firebase/app';
import {
    initializeAppCheck,
    ReCaptchaEnterpriseProvider,
    type AppCheck,
} from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

const firebaseConfig = {
    apiKey: environment.firebase.apiKey,
    authDomain: environment.firebase.authDomain,
    projectId: environment.firebase.projectId,
    storageBucket: environment.firebase.storageBucket,
    messagingSenderId: environment.firebase.messagingSenderId,
    appId: environment.firebase.appId,
    measurementId: environment.firebase.measurementId,
};

export const hasFirebaseConfig = environment.hasRealFirebaseConfig;

export const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const firebaseAppCheck = initializeForumAppCheck(firebaseApp);
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestoreDb = firebaseApp ? getFirestore(firebaseApp) : null;

function initializeForumAppCheck(app: typeof firebaseApp): AppCheck | null {
    if (!app || !environment.firebase.appCheckSiteKey || typeof window === 'undefined') {
        return null;
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
        (self as typeof globalThis & { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean })
            .FIREBASE_APPCHECK_DEBUG_TOKEN = environment.firebase.appCheckDebugToken || true;
    }

    try {
        return initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(environment.firebase.appCheckSiteKey),
            isTokenAutoRefreshEnabled: true,
        });
    } catch (error) {
        console.warn('Firebase App Check could not be initialized.', error);
        return null;
    }
}
