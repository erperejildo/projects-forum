import { Routes } from '@angular/router';
import { authRequiredGuard } from './core/guards/auth-required-guard';
import { CreatePostPage } from './features/forum/pages/create-post-page/create-post-page';
import { HomePage } from './features/forum/pages/home-page/home-page';
import { PostDetailPage } from './features/forum/pages/post-detail-page/post-detail-page';

export const routes: Routes = [
    {
        path: '',
        component: HomePage,
    },
    {
        path: 'post/:id',
        component: PostDetailPage,
    },
    {
        path: 'create',
        component: CreatePostPage,
        canActivate: [authRequiredGuard],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
