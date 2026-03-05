import { Routes } from '@angular/router';

import { authRequiredGuard } from './core/guards/auth-required-guard';
import { CreatePostPage } from './pages/create-post-page/create-post-page';
import { HomePage } from './pages/home-page/home-page';
import { PostDetailPage } from './pages/post-detail-page/post-detail-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'post/new',
    component: CreatePostPage,
    canActivate: [authRequiredGuard],
  },
  {
    path: 'post/:postId',
    component: PostDetailPage,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
