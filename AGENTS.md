<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FoxPassport Republic App Rules

## 1. Mandatory Branching & Checkpoints
- **Always Create a Branch for New Features/Tasks**: Before modifying or creating code for any new feature, bug fix, or optimization, **always create and checkout a dedicated Git branch** (e.g. `feat/<feature-name>`, `fix/<bug-name>`, `perf/<topic>`). Never develop directly on `main` or `master`.
- **Establish Baseline Checkpoints**: Always commit and/or tag a clean baseline checkpoint before starting risky or multi-step changes so work can be rolled back safely.

## 2. Rendering, Caching & Performance
- **Safe Caching Boundary**: Public catalog queries (venues, categories, templates, foxers) should use `publicServerFetch` with Next.js revalidation (`revalidate: 60/300`) and cache tags.
- **Strictly Dynamic Flows**: Booking, checkout, payment status, user profile, and creator dashboards must remain dynamic and un-cached.
