import { computed, effect, inject, Injectable, OnDestroy, signal } from '@angular/core';
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp,
  Unsubscribe,
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { CreatePostInput, ForumPost, PostFiltersState, PostOrder } from '../models/forum-post';
import { ForumProject } from '../models/forum-project';
import { PostReply } from '../models/post-reply';
import { Auth } from './auth';
import { Firebase } from './firebase';

@Injectable({
  providedIn: 'root',
})
export class Forum implements OnDestroy {
  private readonly firebase = inject(Firebase);
  private readonly auth = inject(Auth);

  private projectsUnsubscribe?: Unsubscribe;
  private postsUnsubscribe?: Unsubscribe;

  readonly projects = signal<ForumProject[]>([]);
  readonly posts = signal<ForumPost[]>([]);
  readonly votedPostIds = signal<Record<string, boolean>>({});
  readonly loadingProjects = signal(true);
  readonly loadingPosts = signal(true);

  readonly topTags = computed(() => {
    const tagUsage = new Map<string, number>();

    for (const post of this.posts()) {
      for (const tag of post.tags) {
        tagUsage.set(tag, (tagUsage.get(tag) ?? 0) + 1);
      }
    }

    return [...tagUsage.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  });

  constructor() {
    this.startProjectsStream();
    this.startPostsStream();

    effect((onCleanup) => {
      const currentUser = this.auth.currentUser();
      this.votedPostIds.set({});

      if (!currentUser) {
        return;
      }

      const votesQuery = query(
        collectionGroup(this.firebase.db, 'votes'),
        where('uid', '==', currentUser.uid),
      );

      const unsubscribe = onSnapshot(votesQuery, (snapshot) => {
        const nextMap: Record<string, boolean> = {};

        snapshot.forEach((voteDoc) => {
          const postReference = voteDoc.ref.parent.parent;

          if (postReference) {
            nextMap[postReference.id] = true;
          }
        });

        this.votedPostIds.set(nextMap);
      });

      onCleanup(() => unsubscribe());
    });
  }

  ngOnDestroy(): void {
    this.projectsUnsubscribe?.();
    this.postsUnsubscribe?.();
  }

  async getPostById(postId: string): Promise<ForumPost | null> {
    const localPost = this.posts().find((post) => post.id === postId);

    if (localPost) {
      return localPost;
    }

    const snapshot = await getDoc(doc(this.firebase.db, 'posts', postId));

    if (!snapshot.exists()) {
      return null;
    }

    return this.mapPostDocument(snapshot);
  }

  async createPost(input: CreatePostInput): Promise<string> {
    const user = this.requireUser();
    const normalizedTags = [
      ...new Set(input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
    ].slice(0, 5);

    const postReference = await addDoc(collection(this.firebase.db, 'posts'), {
      title: input.title.trim(),
      message: input.message.trim(),
      type: input.type,
      projectId: input.projectId,
      projectName: input.projectName,
      tags: normalizedTags,
      authorUid: user.uid,
      authorDisplayName: user.displayName || user.email || 'Anonymous user',
      authorEmail: user.email || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likesCount: 0,
      repliesCount: 0,
      subscribersCount: 0,
    });

    await this.setSubscription(postReference.id, true);

    return postReference.id;
  }

  async toggleVote(postId: string): Promise<boolean> {
    const user = this.requireUser();
    const postReference = doc(this.firebase.db, 'posts', postId);
    const voteReference = doc(this.firebase.db, `posts/${postId}/votes/${user.uid}`);
    let isLiked = false;

    await runTransaction(this.firebase.db, async (transaction) => {
      const [postSnapshot, voteSnapshot] = await Promise.all([
        transaction.get(postReference),
        transaction.get(voteReference),
      ]);

      if (!postSnapshot.exists()) {
        throw new Error('Post not found.');
      }

      const currentLikes = Number(postSnapshot.data()['likesCount'] ?? 0);

      if (voteSnapshot.exists()) {
        transaction.delete(voteReference);
        transaction.update(postReference, {
          likesCount: Math.max(currentLikes - 1, 0),
          updatedAt: serverTimestamp(),
        });
        isLiked = false;
      } else {
        transaction.set(voteReference, {
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
        transaction.update(postReference, {
          likesCount: currentLikes + 1,
          updatedAt: serverTimestamp(),
        });
        isLiked = true;
      }
    });

    this.votedPostIds.update((state) => {
      if (isLiked) {
        return { ...state, [postId]: true };
      }

      const nextState = { ...state };
      delete nextState[postId];
      return nextState;
    });

    return isLiked;
  }

  async toggleSubscription(postId: string): Promise<boolean> {
    return this.setSubscription(postId, null);
  }

  async addReply(postId: string, message: string): Promise<void> {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const user = this.requireUser();

    await addDoc(collection(this.firebase.db, `posts/${postId}/replies`), {
      message: trimmedMessage,
      authorUid: user.uid,
      authorDisplayName: user.displayName || user.email || 'Anonymous user',
      authorEmail: user.email || '',
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(this.firebase.db, 'posts', postId), {
      repliesCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  }

  listenToReplies(postId: string, callback: (replies: PostReply[]) => void): Unsubscribe {
    const repliesQuery = query(
      collection(this.firebase.db, `posts/${postId}/replies`),
      orderBy('createdAt', 'asc'),
    );

    return onSnapshot(repliesQuery, (snapshot) => {
      callback(snapshot.docs.map((replyDoc) => this.mapReplyDocument(replyDoc)));
    });
  }

  listenToSubscriptionStatus(
    postId: string,
    userId: string,
    callback: (isSubscribed: boolean) => void,
  ): Unsubscribe {
    const subscriptionReference = doc(this.firebase.db, `posts/${postId}/subscriptions/${userId}`);
    return onSnapshot(subscriptionReference, (snapshot) => callback(snapshot.exists()));
  }

  applyFilters(posts: ForumPost[], filters: PostFiltersState, order: PostOrder): ForumPost[] {
    const normalizedSearch = filters.search.trim().toLowerCase();

    const filteredPosts = posts.filter((post) => {
      if (filters.projectId && post.projectId !== filters.projectId) {
        return false;
      }

      if (filters.selectedTag && !post.tags.includes(filters.selectedTag)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.message.toLowerCase().includes(normalizedSearch) ||
        post.tags.join(' ').toLowerCase().includes(normalizedSearch)
      );
    });

    const sortedPosts = [...filteredPosts];

    if (order === 'likes') {
      sortedPosts.sort(
        (a, b) => b.likesCount - a.likesCount || b.createdAt.getTime() - a.createdAt.getTime(),
      );
      return sortedPosts;
    }

    if (order === 'popularity') {
      sortedPosts.sort((a, b) => this.popularityScore(b) - this.popularityScore(a));
      return sortedPosts;
    }

    sortedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return sortedPosts;
  }

  private popularityScore(post: ForumPost): number {
    return post.likesCount * 2 + post.repliesCount * 3 + post.subscribersCount;
  }

  private startProjectsStream(): void {
    if (this.projectsUnsubscribe) {
      return;
    }

    const projectsQuery = query(collection(this.firebase.db, 'projects'), orderBy('name'));

    this.projectsUnsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const mappedProjects = snapshot.docs.map((projectDoc) => {
          const data = projectDoc.data();

          return {
            id: projectDoc.id,
            name: String(data['name'] ?? projectDoc.id),
          } as ForumProject;
        });

        this.projects.set(mappedProjects);
        this.loadingProjects.set(false);
      },
      () => {
        this.loadingProjects.set(false);
      },
    );
  }

  private startPostsStream(): void {
    if (this.postsUnsubscribe) {
      return;
    }

    const postsQuery = query(collection(this.firebase.db, 'posts'), orderBy('createdAt', 'desc'));

    this.postsUnsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        this.posts.set(snapshot.docs.map((postDoc) => this.mapPostDocument(postDoc)));
        this.loadingPosts.set(false);
      },
      () => {
        this.loadingPosts.set(false);
      },
    );
  }

  private mapPostDocument(
    snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
  ): ForumPost {
    const data = snapshot.data() ?? {};

    return {
      id: snapshot.id,
      title: String(data['title'] ?? ''),
      message: String(data['message'] ?? ''),
      type: data['type'] === 'issue' ? 'issue' : 'question',
      projectId: String(data['projectId'] ?? ''),
      projectName: String(data['projectName'] ?? ''),
      tags: Array.isArray(data['tags']) ? data['tags'].map((tag) => String(tag).toLowerCase()) : [],
      authorUid: String(data['authorUid'] ?? ''),
      authorDisplayName: String(data['authorDisplayName'] ?? 'Anonymous user'),
      authorEmail: String(data['authorEmail'] ?? ''),
      createdAt: this.asDate(data['createdAt']),
      updatedAt: this.asDate(data['updatedAt']),
      likesCount: Number(data['likesCount'] ?? 0),
      repliesCount: Number(data['repliesCount'] ?? 0),
      subscribersCount: Number(data['subscribersCount'] ?? 0),
    };
  }

  private mapReplyDocument(snapshot: QueryDocumentSnapshot<DocumentData>): PostReply {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      message: String(data['message'] ?? ''),
      authorUid: String(data['authorUid'] ?? ''),
      authorDisplayName: String(data['authorDisplayName'] ?? 'Anonymous user'),
      authorEmail: String(data['authorEmail'] ?? ''),
      createdAt: this.asDate(data['createdAt']),
    };
  }

  private asDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }

    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (value && typeof value === 'object' && 'seconds' in value) {
      const timestamp = value as { seconds: number; nanoseconds?: number };
      return new Date(timestamp.seconds * 1000);
    }

    return new Date();
  }

  private async setSubscription(postId: string, forceSubscribe: boolean | null): Promise<boolean> {
    const user = this.requireUser();
    const postReference = doc(this.firebase.db, 'posts', postId);
    const subscriptionReference = doc(
      this.firebase.db,
      `posts/${postId}/subscriptions/${user.uid}`,
    );
    let isSubscribed = false;

    await runTransaction(this.firebase.db, async (transaction) => {
      const [postSnapshot, subscriptionSnapshot] = await Promise.all([
        transaction.get(postReference),
        transaction.get(subscriptionReference),
      ]);

      if (!postSnapshot.exists()) {
        throw new Error('Post not found.');
      }

      const shouldSubscribe =
        forceSubscribe === null ? !subscriptionSnapshot.exists() : forceSubscribe;
      const currentSubscribers = Number(postSnapshot.data()['subscribersCount'] ?? 0);

      if (shouldSubscribe && !subscriptionSnapshot.exists()) {
        transaction.set(subscriptionReference, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email || 'Anonymous user',
          createdAt: serverTimestamp(),
        });
        transaction.update(postReference, {
          subscribersCount: currentSubscribers + 1,
          updatedAt: serverTimestamp(),
        });
        isSubscribed = true;
        return;
      }

      if (!shouldSubscribe && subscriptionSnapshot.exists()) {
        transaction.delete(subscriptionReference);
        transaction.update(postReference, {
          subscribersCount: Math.max(currentSubscribers - 1, 0),
          updatedAt: serverTimestamp(),
        });
        isSubscribed = false;
        return;
      }

      isSubscribed = subscriptionSnapshot.exists();
    });

    return isSubscribed;
  }

  private requireUser() {
    const user = this.auth.currentUser();

    if (!user) {
      throw new Error('Authentication required.');
    }

    return user;
  }
}
