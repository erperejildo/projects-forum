# Project Plan - Apps Forum

## Project Description

A mobile-responsive Angular web forum where users can ask questions or report issues about multiple projects.

Core behavior:

- Public users can browse/read posts.
- Authenticated users (Email/Password or Google via Firebase Auth) can create posts, vote/like, reply, and subscribe/unsubscribe to post updates.
- Firestore stores forum data (projects, posts, replies, tags, votes, subscriptions).
- Post creation includes: project, message, tags, and post type (`question` or `issue`).
- Home page includes filters (projects, popular tags, search) and ordering (date, popularity, likes).
- App supports i18n languages: English (default), Spanish, German, Italian, Portuguese, French.
- Language loads from browser by default and persists when user changes it.

## Tech Stack

- Angular (standalone)
- TypeScript
- SCSS
- Firebase (Auth + Firestore + optional notifications path)
- ESLint
- Prettier
- Angular CLI unit tests (Vitest runtime)
- GitHub Actions CI + GitHub Pages deployment

## Inputs and Known IDs

- Firebase project id: `projects-forum-6355a`
- Firebase web config details will be loaded from `.env` (not hardcoded in source templates).
- If any missing values are required, temporary placeholders will be used and documented in README and final handoff.

## Security and Reusability Constraints

- Do not hardcode personal or project-sensitive values in committed source files.
- Provide `.env.example` with placeholders and expected variable names.
- Include default project, projects list, and admin email in `.env`.
- Keep architecture reusable for other teams/projects.

## Execution Checklist

- [x] 1. Initialize Angular app structure and base tooling in this repository.
- [x] 2. Configure strict TypeScript, ESLint, Prettier, and npm scripts (`lint`, `format`, `format:check`, `test:ci`).
- [x] 3. Implement `.env` workflow for runtime/build-time configuration and add `.env.example`.
- [x] 4. Add Firebase setup (Auth + Firestore) using environment variables.
- [x] 5. Define Firestore data models (projects, posts, replies, tags, votes, subscriptions).
- [x] 6. Build auth flow (Email/Password + Google sign-in, sign-out, auth state).
- [x] 7. Build app shell layout and navigation with responsive/mobile behavior.
- [x] 8. Build post listing page (public read access) with project filter, tag filter, search, and ordering.
- [x] 9. Build post detail page with replies and subscription toggle.
- [x] 10. Build create post flow with project selector, post type, message, tags input.
- [x] 11. Restrict create/vote/reply/subscribe actions to authenticated users only.
- [x] 12. Implement likes/votes and popularity sorting.
- [x] 13. Implement subscribe/unsubscribe behavior; auto-subscribe post author only.
- [x] 14. Research and implement/document email notifications for subscribed users on post updates.
- [x] 15. Implement runtime i18n (EN, ES, DE, IT, PT, FR), browser language detection, and persisted language preference.
- [x] 16. Add reusable small standalone components (each with `.ts`, `.html`, `.scss`).
- [x] 17. Add/expand unit tests for all created components/services.
- [x] 18. Add/update Firestore security rules and indexes guidance (if needed).
- [x] 19. Finalize README with project overview, setup, env variables, and reusability guide.
- [x] 20. Verify GitHub Actions for CI and GitHub Pages deployment from `main`.
- [x] 21. Run lint, format check, unit tests, and production build; fix all issues.
- [x] 22. Manual app sanity check (run locally and inspect behavior).
- [ ] 23. Commit work in small logical commits with detailed messages.
- [ ] 24. Push branch to separate repository and open PR.
- [ ] 25. Handoff: list any placeholders/IDs the user must replace.

## Progress Log

- 2026-03-06: Plan file created.
- 2026-03-06: Angular forum scaffolded and full feature set implemented.
- 2026-03-06: Firebase auth + Firestore data flows + subscription hooks implemented.
- 2026-03-06: Runtime i18n (EN/ES/DE/IT/PT/FR) added with persisted language preference.
- 2026-03-06: CI gates validated (`format:check`, `lint`, `test:ci`, `build`).
- 2026-03-06: Local runtime sanity check completed on `http://localhost:4200`.
