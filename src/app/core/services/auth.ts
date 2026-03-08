import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  getIdTokenResult,
} from 'firebase/auth';
import { firebaseAuth, hasFirebaseConfig } from '../firebase/firebase';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  readonly user = signal(firebaseAuth?.currentUser ?? null);
  readonly loading = signal(true);
  readonly isAdmin = signal(false);
  readonly isAuthenticated = computed(() => Boolean(this.user()));
  readonly displayName = computed(() => {
    const currentUser = this.user();
    if (!currentUser) {
      return '';
    }

    // For the designated admin account (from environment), show a generic "Admin" label
    if (currentUser.email === environment.forum.adminEmail) {
      return 'Admin';
    }

    return currentUser.displayName || currentUser.email || 'User';
  });

  constructor() {
    if (!firebaseAuth) {
      this.loading.set(false);
      return;
    }

    onAuthStateChanged(firebaseAuth, (user) => {
      this.user.set(user);
      if (user) {
        getIdTokenResult(user)
          .then((result) => {
            const hasClaim = Boolean((result.claims as Record<string, unknown>)['admin']);
            const byEmail = user.email === environment.forum.adminEmail;
            this.isAdmin.set(hasClaim || byEmail);
          })
          .catch(() => this.isAdmin.set(user.email === environment.forum.adminEmail));
      } else {
        this.isAdmin.set(false);
      }

      this.loading.set(false);
    });
  }

  async signUp(email: string, password: string): Promise<void> {
    this.ensureConfigured();
    const credentials = await createUserWithEmailAndPassword(firebaseAuth!, email, password);

    if (!credentials.user.displayName && email.includes('@')) {
      const provisionalName = email.split('@')[0];
      await updateProfile(credentials.user, { displayName: provisionalName });
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    this.ensureConfigured();
    await signInWithEmailAndPassword(firebaseAuth!, email, password);
  }

  async signInWithGoogle(): Promise<void> {
    this.ensureConfigured();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(firebaseAuth!, provider);
  }

  async signOut(): Promise<void> {
    this.ensureConfigured();
    await signOut(firebaseAuth!);
  }

  private ensureConfigured(): void {
    if (!hasFirebaseConfig || !firebaseAuth) {
      throw new Error('Firebase is not configured. Update your .env values.');
    }
  }
}
