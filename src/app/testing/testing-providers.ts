import { provideHttpClient } from '@angular/common/http';
import { signal, computed } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { of } from 'rxjs';

export const provideUiTesting = () => [
  provideRouter([]),
  {
    provide: ActivatedRoute,
    useValue: {
      paramMap: of(convertToParamMap({})),
      queryParamMap: of(convertToParamMap({})),
      snapshot: {
        paramMap: convertToParamMap({}),
        queryParamMap: convertToParamMap({}),
      },
    },
  },
  provideHttpClient(),
  provideTranslateService({
    loader: provideTranslateLoader(TranslateNoOpLoader),
    fallbackLang: 'en',
    lang: 'en',
  }),
];

export const createAuthMock = () => {
  const user = signal<unknown>(null);
  return {
    user,
    isAuthenticated: computed(() => !!user()),
    isAdmin: signal(false),
    displayName: signal('Guest'),
    signIn: async () => undefined,
    signUp: async () => undefined,
    signInWithGoogle: async () => undefined,
    signOut: async () => undefined,
  };
};

export const createForumMock = () => ({
  projects: signal([
    { id: 'core-platform', name: 'Core Platform' },
    { id: 'payments-api', name: 'Payments API' },
  ]),
  usingFallbackProjects: signal(false),
  defaultProject: signal('core-platform'),
  watchPosts: () => of<unknown[]>([]),
  watchPost: () => of<unknown>(null),
  watchReplies: () => of<unknown[]>([]),
  watchLiked: () => of<boolean>(false),
  watchSubscribed: () => of<boolean>(false),
  toggleLike: async () => undefined,
  toggleSubscription: async () => undefined,
  addReply: async () => undefined,
  updatePost: async () => undefined,
  softDeletePost: async () => undefined,
  updateReply: async () => undefined,
  softDeleteReply: async () => undefined,
  createPost: async () => 'test-post-id',
});
