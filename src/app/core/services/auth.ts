import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AuthError,
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  useDeviceLanguage,
} from 'firebase/auth';

import { Firebase } from './firebase';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly firebase = inject(Firebase);

  readonly currentUser = signal<User | null>(null);
  readonly authReady = signal(false);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userLabel = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return '';
    }

    return user.displayName || user.email || 'User';
  });

  constructor() {
    setPersistence(this.firebase.auth, browserLocalPersistence).catch(() => undefined);
    useDeviceLanguage(this.firebase.auth);

    onAuthStateChanged(this.firebase.auth, (user) => {
      this.currentUser.set(user);
      this.authReady.set(true);
    });
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.firebase.auth, provider);
  }

  async signInWithEmailPassword(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.firebase.auth, email.trim(), password);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async registerWithEmailPassword(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.firebase.auth, email.trim(), password);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.firebase.auth);
  }

  private normalizeError(error: unknown): Error {
    const authError = error as Partial<AuthError>;
    const code = authError.code ?? 'auth/unknown';

    const messageMap: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'The email address format is invalid.',
      'auth/invalid-credential': 'Invalid credentials, please verify your email and password.',
      'auth/missing-password': 'Please enter a password.',
      'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completing authentication.',
      'auth/popup-blocked':
        'Your browser blocked the sign-in popup. Please allow popups and retry.',
      'auth/too-many-requests': 'Too many requests. Try again in a few minutes.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account exists for this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    };

    const fallbackMessage =
      typeof authError.message === 'string' ? authError.message : 'Authentication error.';

    return new Error(messageMap[code] ?? fallbackMessage);
  }
}
