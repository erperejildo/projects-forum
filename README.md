# Apps Forum

`projects-forum` is a reusable, mobile-responsive forum platform built with Angular + Firebase.

It is designed for product/project communities where users can ask questions, report issues, and share feedback.

## Project Overview

A mobile-responsive Angular web forum where users can ask questions or report issues about multiple projects. The app
leverages Firebase Auth and Firestore to power core forum behavior and is structured to be reusable across teams.

### Core behavior

- Public users can browse and read posts.
- Authenticated users (Email/Password or Google via Firebase Auth) can create posts, vote/like, reply, and
  subscribe/unsubscribe to post updates.
- Firestore stores forum data (projects, posts, replies, tags, votes, subscriptions).
- Post creation includes: project, message, tags, and post type (`question` or `issue`).
- Home page includes filters (projects, popular tags, search) and ordering (date, popularity, likes).
- App supports i18n languages with runtime translation; browser language is detected by default and the
  user’s choice is persisted.
  - English (default)
  - Spanish
  - German
  - Italian
  - Portuguese
  - French

## What This Project Does

- Public users can browse and read all posts.
- Authenticated users (Email/Password or Google) can:
  - Create posts
  - Like/unlike posts
  - Reply to posts
  - Subscribe/unsubscribe to post updates
- Post creation supports:
  - Project selection
  - Post type (`question` or `issue`)
  - Message body
  - Tags
- Main feed supports:
  - Project filter
  - Popular tag filter
  - Free-text search
  - Sorting by date/popularity/likes
- Runtime i18n with persisted user language:
  - English (default)
  - Spanish
  - German
  - Italian
  - Portuguese
  - French

## Tech Stack

- Angular 21 (standalone components)
- TypeScript + SCSS
- Firebase Auth (Email/Password + Google)
- Cloud Firestore
- ngx-translate (runtime translations)
- ESLint + Prettier
- Vitest/Karma test runner through Angular CLI (`ng test`)
- GitHub Actions CI + GitHub Pages deployment

## Project Structure

- `src/app/core/`: firebase bootstrap, models, services, guards
- `src/app/features/`: feature pages/components (auth + forum)
- `src/app/layout/`: app shell/navigation
- `src/app/shared/`: reusable shared components
- `public/i18n/`: translation JSON files
- `scripts/generate-environment.mjs`: generates `src/environments/environment.ts` from `.env`
- `firestore.rules` + `firestore.indexes.json`: Firestore security/index config

## Environment Variables

Secrets/config live in `.env` (excluded from git). Start from `.env.example`.

A helper script (`npm run prepare:env`) reads these values and writes `src/environments/environment.ts`.
That generated file is simply a build artifact used by the Angular compiler; the only “secrets”
owned by your repo remain in `.env`. Firebase web SDK configuration values are intended to be
public‑facing, but if you’d rather keep `environment.ts` out of version control you can add it
to `.gitignore` and regenerate it as part of your build/test steps.

Required variables:

- `FORUM_FIREBASE_API_KEY`
- `FORUM_FIREBASE_AUTH_DOMAIN`
- `FORUM_FIREBASE_PROJECT_ID`
- `FORUM_FIREBASE_STORAGE_BUCKET`
- `FORUM_FIREBASE_MESSAGING_SENDER_ID`
- `FORUM_FIREBASE_APP_ID`
- `FORUM_FIREBASE_MEASUREMENT_ID`
- `FORUM_DEFAULT_PROJECT`
- `FORUM_PROJECTS` (comma-separated)
- `FORUM_ADMIN_EMAIL`
- `FORUM_MAIL_COLLECTION`

## GitHub Actions Environment Setup

To deploy to GitHub Pages with custom environment values:

1. Go to your repository → Settings → Secrets and variables → Actions.
2. Add each required environment variable as a **repository secret** (not just as an environment variable):
   - FORUM_FIREBASE_API_KEY
   - FORUM_FIREBASE_AUTH_DOMAIN
   - FORUM_FIREBASE_PROJECT_ID
   - FORUM_FIREBASE_STORAGE_BUCKET
   - FORUM_FIREBASE_MESSAGING_SENDER_ID
   - FORUM_FIREBASE_APP_ID
   - FORUM_FIREBASE_MEASUREMENT_ID
   - FORUM_DEFAULT_PROJECT
   - FORUM_PROJECTS
   - FORUM_ADMIN_EMAIL
   - FORUM_MAIL_COLLECTION
3. The GitHub Actions workflow will inject these secrets into the build steps.
4. The step `node scripts/generate-environment.mjs` will generate `src/environments/environment.ts` from these values.
5. The build will use your custom values for Firebase and project dropdowns.

**Note:** If you only set environment variables (not secrets), the workflow will not pick them up. Always use repository secrets for build-time values.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill your values.

3. Run the app:

```bash
npm start
```

4. Open `http://localhost:4200`.

## Firebase Setup Checklist

1. In Firebase Console, enable Authentication providers:

- Email/Password
- Google

2. Create Firestore database and deploy rules/indexes:

```bash
firebase deploy --only firestore
```

Admin moderation is allowed for users with either the `admin` custom claim or the verified email configured as `FORUM_ADMIN_EMAIL`.
If you change that admin email, keep [firestore.rules](./firestore.rules) in sync and redeploy Firestore rules.

3. (Recommended) Create `projects` collection in Firestore with docs like:

- `core-platform` -> `{ "name": "Core Platform" }`
- `payments-api` -> `{ "name": "Payments API" }`

If `projects` is empty, the app uses `FORUM_PROJECTS` from `.env` as fallback.

## Email Notifications For Subscriptions

Firebase does not send Firestore-triggered emails automatically out of the box.

This app is prepared to enqueue notification emails into `FORUM_MAIL_COLLECTION` (default: `mail`).
To send real emails, install Firebase Trigger Email extension (`firebase/firestore-send-email`) and configure SMTP credentials.

Reference:

- https://firebase.google.com/docs/extensions/official/firestore-send-email

## NPM Scripts

- `npm run prepare:env`: generate `src/environments/environment.ts` from `.env`
- `npm start`: generate env + run dev server
- `npm run build`: generate env + production build
- `npm run lint`: run ESLint
- `npm run test:ci`: generate env + headless unit tests
- `npm run format`: format all files with Prettier
- `npm run format:check`: verify formatting

## CI/CD

Two workflows are included:

- `.github/workflows/ci.yml`
- Runs on `push`/`pull_request`
- Gates: `format:check`, `lint`, `test:ci`, `build`

- `.github/workflows/deploy-gh-pages.yml`
- Runs on merge/push to `main`
- Re-runs quality gates
- Builds with repo-specific base-href
- Deploys `dist/forum-app/browser` to GitHub Pages

## Reusing This Repo For Another Project

1. Copy/fork repository.
2. Replace `.env` values with your Firebase project values.
3. Set your own project names in `FORUM_PROJECTS` and `FORUM_DEFAULT_PROJECT`.
4. Update `FORUM_ADMIN_EMAIL`.
5. Optionally customize theme and translations under `public/i18n/`.
6. Deploy Firestore rules/indexes and configure auth providers.

## Values You Must Replace

- Any `REPLACE_ME` placeholder values in `.env.example`.
- In `.env`, replace default/demo values if using your own Firebase project.
- Configure SMTP settings when installing Trigger Email extension.

## Notes

- Firebase Web config values are treated as environment config and are not hardcoded in app source.
- App behavior remains read-only for unauthenticated users by design.

## Icons

- When adding or refactoring components that require icons, prefer Heroicons: https://heroicons.com/.
- Copy the SVG you need from Heroicons and inline it in the component template, or add the SVG under `src/assets/icons/` and reference it from templates. Ensure icons include appropriate `aria-*` attributes for accessibility.
