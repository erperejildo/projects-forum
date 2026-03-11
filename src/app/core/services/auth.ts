import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onIdTokenChanged,
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

    if (this.isAdmin()) {
      return 'Admin';
    }

    return currentUser.displayName || currentUser.email || 'User';
  });

  constructor() {
    if (!firebaseAuth) {
      this.loading.set(false);
      return;
    }

    onIdTokenChanged(firebaseAuth, (user) => {
      this.user.set(user);
      if (user) {
        getIdTokenResult(user)
          .then((result) => {
            const claims = result.claims as Record<string, unknown>;
            const hasClaim = claims['admin'] === true;
            const email = typeof claims['email'] === 'string' ? claims['email'] : user.email;
            const emailVerified =
              typeof claims['email_verified'] === 'boolean'
                ? claims['email_verified']
                : user.emailVerified;

            this.isAdmin.set(
              hasClaim || (email === environment.forum.adminEmail && emailVerified === true),
            );
          })
          .catch(() =>
            this.isAdmin.set(
              user.email === environment.forum.adminEmail && user.emailVerified === true,
            ),
          );
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
