# Projects Forum

Projects Forum is an Angular + Firebase discussion platform where users can read posts publicly and authenticate to create posts, vote, reply, and subscribe to updates.

## Features

- Public read access for posts, filters, and details.
- Firebase Authentication (Email/Password and Google).
- Firestore data model for projects, posts, replies, votes, and subscriptions.
- Post creation with project selection, post type (`question` or `issue`), and tags.
- Feed filters by project, popular tags, search term, and ordering (date/likes/popularity).
- Internationalization with `ngx-translate`:
  : English (default), Spanish, German, Italian, Portuguese, French.
  : Browser language detection and persisted language override.
- Standalone Angular components with isolated HTML and SCSS files.
- Unit tests (Vitest), ESLint, Prettier.
- CI checks and GitHub Pages deployment workflows.

## Tech Stack

- Angular 21 (standalone components)
- TypeScript + SCSS
- Firebase JS SDK (Auth + Firestore)
- `@ngx-translate/core` + `@ngx-translate/http-loader`
- ESLint + Prettier + Vitest

## Local Setup

1. Install dependencies.

```bash
npm ci
```

2. Configure environment variables.

```bash
copy .env.example .env
```

3. Fill `.env` with your Firebase Web App configuration values.

4. Start development server.

```bash
npm start
```

The app runs on `http://localhost:4200`.

## Environment and Secrets

- Runtime values are read from `public/env.js` (generated automatically before `start` and `build`).
- Generator script: `scripts/generate-env.mjs`.
- `.env` is gitignored.
- `.env.example` is committed with placeholders.

Required keys:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID` (optional)

## Firestore Collections

- `projects/{projectId}`
- `posts/{postId}`
- `posts/{postId}/replies/{replyId}`
- `posts/{postId}/votes/{uid}`
- `posts/{postId}/subscriptions/{uid}`

Sample `projects` documents are required for the post form project selector.

## Firestore Rules

- Rules file: `firestore.rules`
- Index file: `firestore.indexes.json`

The provided rules allow:

- Public reads for forum content.
- Authenticated creates for posts and replies.
- Authenticated vote/subscription documents scoped to current user id.
- Counter updates on posts for likes/replies/subscribers.

Review and harden these rules before production launch.

## Subscription Emails

The app stores post subscriptions in Firestore. Sending emails is optional and not hard-coded in the frontend.

Recommended production approach:

1. Install Firebase Extension `firestore-send-email`.
2. Trigger email writes to a `mail` collection from a backend function when new replies are created.

## Scripts

- `npm start` - runs env generation and starts dev server.
- `npm run build` - runs env generation and production build.
- `npm run lint` - ESLint.
- `npm run format:check` - Prettier check.
- `npm run format` - Prettier write.
- `npm run test:ci` - one-shot unit tests.

## CI and Deployment

Workflow files:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-gh-pages.yml`

### CI

On `pull_request` and `push` to `main`, CI runs:

1. `npm run format:check`
2. `npm run lint`
3. `npm run test:ci`
4. `npm run build`

### GitHub Pages

On merges/pushes to `main`, deployment workflow:

1. Re-runs quality checks.
2. Builds with `--base-href "/<repo-name>/"`.
3. Publishes `dist/forum-app/browser` to GitHub Pages.

To enable Pages:

1. Go to repository `Settings`.
2. Open `Pages`.
3. Set source to `GitHub Actions`.

## Translation Files

Translation dictionaries are under `public/assets/i18n/`:

- `en.json`
- `es.json`
- `de.json`
- `it.json`
- `pt.json`
- `fr.json`
