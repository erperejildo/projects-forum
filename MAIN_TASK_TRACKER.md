# Main Task Tracker

Last updated: 2026-03-05

This file tracks what is still pending from the original project prompt. Completed baseline work is intentionally omitted to keep focus on remaining tasks.

## Remaining Scope

- [x] Implement subscription email delivery for post updates using Firebase backend tooling.
- [x] Document exact setup steps for email delivery and what IDs/secrets must be replaced.
- [x] Run full quality gates again after changes (`format`, `lint`, `test:ci`, `build`).
- [x] Open, merge, and clean up a PR for these remaining tasks.

## Working Notes

- Current Firebase project id in use: `projects-forum-6355a`.
- App already supports subscribe/unsubscribe persistence in Firestore.
- Email queue trigger now exists in `functions/src/index.ts` and writes to `mail` for Trigger Email extension delivery.
- Validation run completed successfully on 2026-03-05 (`format`, `lint`, `test:ci`, `build`).
- Remaining-scope implementation PR merged: `#2`.
