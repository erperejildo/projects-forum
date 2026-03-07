import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  QueryConstraint,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  writeBatch,
  where,
} from 'firebase/firestore';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { firestoreDb } from '../firebase/firebase';
import { Auth } from './auth';
import {
  ForumPost,
  ForumProject,
  ForumReply,
  PostFilters,
  PostOrder,
  PostType,
} from '../models/forum-models';

@Injectable({
  providedIn: 'root',
})
export class Forum {
  readonly projects = signal<ForumProject[]>([]);
  readonly projectsLoading = signal(false);
  readonly usingFallbackProjects = signal(false);
  readonly defaultProject = computed(() => {
    const desired = this.slugify(environment.forum.defaultProject);
    const match = this.projects().find((project) => project.id === desired);

    return match?.id ?? this.projects()[0]?.id ?? '';
  });

  private readonly db = firestoreDb;
  private readonly auth = inject(Auth);

  constructor() {
    this.watchProjects();
  }

  watchPosts(filters: Pick<PostFilters, 'projectId' | 'order'>): Observable<ForumPost[]> {
    if (!this.db) {
      return of([]);
    }

    const orderField = this.resolveOrderField(filters.order);
    const postsCollection = collection(this.db, 'posts');
    const constraints: QueryConstraint[] = [orderBy(orderField, 'desc')];

    if (orderField !== 'createdAt') {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    if (filters.projectId) {
      constraints.push(where('projectId', '==', filters.projectId));
    }

    const postsQuery = query(postsCollection, ...constraints);

    return new Observable<ForumPost[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        postsQuery,
        (snapshot) => {
          const posts = snapshot.docs
            .map((entry) => this.mapPost(entry.id, entry.data()))
            .filter((post) => !post.deleted);
          subscriber.next(posts);
        },
        (error) => subscriber.error(error),
      );

      return () => unsubscribe();
    });
  }

  watchPost(postId: string): Observable<ForumPost | null> {
    const db = this.db;
    if (!db || !postId) {
      return of(null);
    }

    return new Observable<ForumPost | null>((subscriber) => {
      const postRef = doc(db, 'posts', postId);
      const unsubscribe = onSnapshot(
        postRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            subscriber.next(null);
            return;
          }

          const post = this.mapPost(snapshot.id, snapshot.data());
          subscriber.next(post.deleted ? null : post);
        },
        (error) => subscriber.error(error),
      );

      return () => unsubscribe();
    });
  }

  watchReplies(postId: string): Observable<ForumReply[]> {
    const db = this.db;
    if (!db || !postId) {
      return of([]);
    }

    const repliesQuery = query(
      collection(db, `posts/${postId}/replies`),
      orderBy('createdAt', 'asc'),
    );

    return new Observable<ForumReply[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        repliesQuery,
        (snapshot) => {
          const replies = snapshot.docs
            .map((entry) => this.mapReply(entry.id, entry.data()))
            .filter((reply) => !reply.deleted);
          subscriber.next(replies);
        },
        (error) => subscriber.error(error),
      );

      return () => unsubscribe();
    });
  }

  watchLiked(postId: string, userId: string): Observable<boolean> {
    const db = this.db;
    if (!db || !postId || !userId) {
      return of(false);
    }

    return new Observable<boolean>((subscriber) => {
      const likeRef = doc(db, `posts/${postId}/likes/${userId}`);
      const unsubscribe = onSnapshot(
        likeRef,
        (snapshot) => subscriber.next(snapshot.exists()),
        (error) => subscriber.error(error),
      );

      return () => unsubscribe();
    });
  }

  watchSubscribed(postId: string, userId: string): Observable<boolean> {
    const db = this.db;
    if (!db || !postId || !userId) {
      return of(false);
    }

    return new Observable<boolean>((subscriber) => {
      const subscriptionRef = doc(db, `posts/${postId}/subscriptions/${userId}`);
      const unsubscribe = onSnapshot(
        subscriptionRef,
        (snapshot) => subscriber.next(snapshot.exists()),
        (error) => subscriber.error(error),
      );

      return () => unsubscribe();
    });
  }

  async createPost(input: {
    message: string;
    projectId: string;
    tags: string[];
    type: PostType;
    user: User;
  }): Promise<string> {
    const db = this.requireDb();
    const postRef = doc(collection(db, 'posts'));
    const subscriptionRef = doc(db, `posts/${postRef.id}/subscriptions/${input.user.uid}`);

    await runTransaction(db, async (transaction) => {
      transaction.set(postRef, {
        authorId: input.user.uid,
        authorDisplayName: this.auth.isAdmin()
          ? 'Admin'
          : input.user.displayName || input.user.email || 'User',
        projectId: input.projectId,
        type: input.type,
        message: input.message,
        tags: input.tags,
        likesCount: 0,
        replyCount: 0,
        deleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      transaction.set(subscriptionRef, {
        uid: input.user.uid,
        email: input.user.email || '',
        createdAt: serverTimestamp(),
      });
    });

    return postRef.id;
  }

  async toggleLike(postId: string, userId: string): Promise<void> {
    const db = this.requireDb();
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, `posts/${postId}/likes/${userId}`);

    await runTransaction(db, async (transaction) => {
      const [postSnapshot, likeSnapshot] = await Promise.all([
        transaction.get(postRef),
        transaction.get(likeRef),
      ]);

      if (!postSnapshot.exists()) {
        throw new Error('Post not found.');
      }

      if (postSnapshot.data()['deleted'] === true) {
        throw new Error('Post not found.');
      }

      if (likeSnapshot.exists()) {
        transaction.delete(likeRef);
        transaction.update(postRef, {
          likesCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.set(likeRef, {
          uid: userId,
          createdAt: serverTimestamp(),
        });

        transaction.update(postRef, {
          likesCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      }
    });
  }

  async toggleSubscription(postId: string, user: User): Promise<void> {
    const db = this.requireDb();
    const postSnapshot = await getDoc(doc(db, 'posts', postId));
    if (!postSnapshot.exists() || Boolean(postSnapshot.data()['deleted'])) {
      throw new Error('Post not found.');
    }

    const subscriptionRef = doc(db, `posts/${postId}/subscriptions/${user.uid}`);
    const snapshot = await getDoc(subscriptionRef);

    if (snapshot.exists()) {
      await runTransaction(db, async (transaction) => {
        transaction.delete(subscriptionRef);
      });
      return;
    }

    await runTransaction(db, async (transaction) => {
      transaction.set(subscriptionRef, {
        uid: user.uid,
        email: user.email || '',
        createdAt: serverTimestamp(),
      });
    });
  }

  async addReply(postId: string, message: string, user: User): Promise<void> {
    const db = this.requireDb();
    const replyRef = doc(collection(db, `posts/${postId}/replies`));
    const postRef = doc(db, 'posts', postId);

    await runTransaction(db, async (transaction) => {
      const postSnapshot = await transaction.get(postRef);
      if (!postSnapshot.exists()) {
        throw new Error('Post not found.');
      }

      if (postSnapshot.data()['deleted'] === true) {
        throw new Error('Post not found.');
      }

      transaction.set(replyRef, {
        authorId: user.uid,
        authorDisplayName: this.auth.isAdmin()
          ? 'Admin'
          : user.displayName || user.email || 'User',
        message,
        deleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      transaction.update(postRef, {
        replyCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    });

    try {
      await this.enqueueReplyEmails(postId, message, user);
    } catch {
      // Email queueing is optional and should never block forum interactions.
    }
  }

  async updatePost(postId: string, message: string, user: User): Promise<void> {
    const db = this.requireDb();
    const postRef = doc(db, 'posts', postId);
    const normalized = message.trim();
    if (!normalized) {
      throw new Error('Message is required.');
    }

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(postRef);
      if (!snapshot.exists()) {
        throw new Error('Post not found.');
      }

      const payload = snapshot.data();
      if (payload['deleted'] === true) {
        throw new Error('Post not found.');
      }

      if (String(payload['authorId'] || '') !== user.uid) {
        throw new Error('You can only edit your own posts.');
      }

      transaction.update(postRef, {
        message: normalized,
        updatedAt: serverTimestamp(),
      });
    });
  }

  async softDeletePost(postId: string, user: User, isAdmin: boolean): Promise<void> {
    const db = this.requireDb();
    const postRef = doc(db, 'posts', postId);

    const postSnapshot = await getDoc(postRef);
    if (!postSnapshot.exists()) {
      throw new Error('Post not found.');
    }

    const postPayload = postSnapshot.data();
    const authorId = String(postPayload['authorId'] || '');
    const alreadyDeleted = Boolean(postPayload['deleted']);

    if (alreadyDeleted) {
      return;
    }

    if (!isAdmin && authorId !== user.uid) {
      throw new Error('You can only delete your own posts.');
    }

    const repliesSnapshot = await getDocs(collection(db, `posts/${postId}/replies`));
    let visibleReplies = 0;
    const batch = writeBatch(db);

    for (const replyDoc of repliesSnapshot.docs) {
      const replyDeleted = Boolean(replyDoc.data()['deleted']);
      if (!replyDeleted) {
        visibleReplies += 1;
      }

      batch.update(replyDoc.ref, {
        deleted: true,
        message: '',
        updatedAt: serverTimestamp(),
      });
    }

    batch.update(postRef, {
      deleted: true,
      message: '',
      replyCount: Math.max(Number(postPayload['replyCount'] || 0) - visibleReplies, 0),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  }

  async updateReply(postId: string, replyId: string, message: string, user: User): Promise<void> {
    const db = this.requireDb();
    const postRef = doc(db, 'posts', postId);
    const replyRef = doc(db, `posts/${postId}/replies/${replyId}`);
    const normalized = message.trim();
    if (!normalized) {
      throw new Error('Message is required.');
    }

    await runTransaction(db, async (transaction) => {
      const [postSnapshot, replySnapshot] = await Promise.all([
        transaction.get(postRef),
        transaction.get(replyRef),
      ]);

      if (!postSnapshot.exists() || Boolean(postSnapshot.data()['deleted'])) {
        throw new Error('Post not found.');
      }

      if (!replySnapshot.exists()) {
        throw new Error('Reply not found.');
      }

      const payload = replySnapshot.data();
      if (payload['deleted'] === true) {
        throw new Error('Reply not found.');
      }

      if (String(payload['authorId'] || '') !== user.uid) {
        throw new Error('You can only edit your own replies.');
      }

      transaction.update(replyRef, {
        message: normalized,
        updatedAt: serverTimestamp(),
      });

      transaction.update(postRef, {
        updatedAt: serverTimestamp(),
      });
    });
  }

  async softDeleteReply(postId: string, replyId: string, user: User, isAdmin: boolean): Promise<void> {
    const db = this.requireDb();
    const postRef = doc(db, 'posts', postId);
    const replyRef = doc(db, `posts/${postId}/replies/${replyId}`);

    await runTransaction(db, async (transaction) => {
      const [postSnapshot, replySnapshot] = await Promise.all([
        transaction.get(postRef),
        transaction.get(replyRef),
      ]);

      if (!postSnapshot.exists() || Boolean(postSnapshot.data()['deleted'])) {
        throw new Error('Post not found.');
      }

      if (!replySnapshot.exists()) {
        throw new Error('Reply not found.');
      }

      const payload = replySnapshot.data();
      const authorId = String(payload['authorId'] || '');
      const alreadyDeleted = Boolean(payload['deleted']);

      if (alreadyDeleted) {
        return;
      }

      if (!isAdmin && authorId !== user.uid) {
        throw new Error('You can only delete your own replies.');
      }

      transaction.update(replyRef, {
        deleted: true,
        message: '',
        updatedAt: serverTimestamp(),
      });

      transaction.update(postRef, {
        replyCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    });
  }

  private watchProjects(): void {
    if (!this.db) {
      this.projects.set(this.fallbackProjects());
      this.usingFallbackProjects.set(true);
      return;
    }

    this.projectsLoading.set(true);

    onSnapshot(
      query(collection(this.db, 'projects'), orderBy('name', 'asc')),
      (snapshot) => {
        if (snapshot.empty) {
          this.projects.set(this.fallbackProjects());
          this.usingFallbackProjects.set(true);
        } else {
          this.projects.set(
            snapshot.docs.map((entry) => ({
              id: entry.id,
              name: String(entry.data()['name'] || entry.id),
            })),
          );
          this.usingFallbackProjects.set(false);
        }

        this.projectsLoading.set(false);
      },
      () => {
        this.projects.set(this.fallbackProjects());
        this.usingFallbackProjects.set(true);
        this.projectsLoading.set(false);
      },
    );
  }

  private fallbackProjects(): ForumProject[] {
    const names = environment.forum.projects;

    return names.map((name) => ({
      id: this.slugify(name),
      name,
    }));
  }

  private resolveOrderField(order: PostOrder): 'createdAt' | 'likesCount' {
    if (order === 'date') {
      return 'createdAt';
    }

    return 'likesCount';
  }

  private mapPost(id: string, payload: Record<string, unknown>): ForumPost {
    return {
      id,
      authorId: String(payload['authorId'] || ''),
      authorDisplayName: String(payload['authorDisplayName'] || 'User'),
      projectId: String(payload['projectId'] || ''),
      type: payload['type'] === 'issue' ? 'issue' : 'question',
      message: String(payload['message'] || ''),
      tags: Array.isArray(payload['tags']) ? payload['tags'].map(String) : [],
      likesCount: Number(payload['likesCount'] || 0),
      replyCount: Number(payload['replyCount'] || 0),
      deleted: payload['deleted'] === true,
      createdAt: this.toDate(payload['createdAt']),
      updatedAt: this.toDate(payload['updatedAt']),
    };
  }

  private mapReply(id: string, payload: Record<string, unknown>): ForumReply {
    return {
      id,
      authorId: String(payload['authorId'] || ''),
      authorDisplayName: String(payload['authorDisplayName'] || 'User'),
      message: String(payload['message'] || ''),
      deleted: payload['deleted'] === true,
      createdAt: this.toDate(payload['createdAt']),
      updatedAt: this.toDate(payload['updatedAt']),
    };
  }

  private toDate(value: unknown): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (value instanceof Date) {
      return value;
    }

    return new Date();
  }

  private requireDb(): Firestore {
    if (!this.db) {
      throw new Error('Firebase is not configured. Update your .env values.');
    }

    return this.db;
  }

  private async enqueueReplyEmails(postId: string, replyText: string, actor: User): Promise<void> {
    if (!this.db || !environment.forum.mailCollection) {
      return;
    }

    const [postSnapshot, subscriptionsSnapshot] = await Promise.all([
      getDoc(doc(this.db, 'posts', postId)),
      getDocs(collection(this.db, `posts/${postId}/subscriptions`)),
    ]);

    if (!postSnapshot.exists()) {
      return;
    }

    const post = this.mapPost(postSnapshot.id, postSnapshot.data());
    const senderName = this.auth.isAdmin()
      ? 'Admin'
      : actor.displayName || actor.email || 'Someone';

    const recipients = subscriptionsSnapshot.docs
      .map((entry) => entry.data())
      .filter((entry) => String(entry['uid'] || '') !== actor.uid)
      .map((entry) => String(entry['email'] || '').trim())
      .filter(Boolean);

    if (!recipients.length) {
      return;
    }

    await Promise.all(
      recipients.map((emailAddress) =>
        addDoc(collection(this.db!, environment.forum.mailCollection), {
          to: [emailAddress],
          message: {
            subject: `[Forum] New reply on ${post.projectId}`,
            text: `${senderName} replied to a subscribed post:\n\n${replyText}`,
            html: `<p><strong>${senderName}</strong> replied to a subscribed post.</p><p>${replyText}</p>`,
          },
        }),
      ),
    );
  }

  private slugify(raw: string): string {
    return raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
