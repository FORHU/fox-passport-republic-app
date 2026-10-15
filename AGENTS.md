<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FoxPassport Republic App Rules

## 1. Git Branching and Work Safety

### 1. Inspect Before Editing
- Before making any changes, inspect `git status`, the current branch, and `git diff`.
- Check for uncommitted changes and understand whether they belong to the current task.
- Never discard, reset, clean, stash, or commit existing work without explicit authorization.

### 2. Dedicated Branches Are Mandatory
- Before implementing a new feature, bug fix, refactor, optimization, or other code change, create or switch to a dedicated task branch.
- Never develop directly on `main`, `master`, or a shared integration branch.
- Use descriptive branch names:
  - `feat/<short-description>` — new features
  - `fix/<short-description>` — bug fixes
  - `perf/<short-description>` — performance improvements
  - `refactor/<short-description>` — refactoring
  - `docs/<short-description>` — documentation
  - `test/<short-description>` — tests

### 3. Preserve Existing Work
- If the current branch contains unrelated uncommitted changes, do not automatically commit, stash, or move them.
- If the task can be safely isolated, create the task branch while preserving the existing working tree.
- If existing changes overlap with the requested task or their ownership is unclear, stop and ask for clarification before editing.
- Before switching branches, check whether doing so could carry uncommitted changes into another task.

### 4. Branch Creation and Checkpoints
- Check whether the intended branch already exists before creating it.
- If it exists, inspect its status and history before deciding whether to reuse it.
- Never reset or overwrite an existing branch to make it match a preferred starting point.
- For risky or multi-step changes, establish a recoverable baseline when the working tree is clean and it is safe to do so. Do not commit unrelated changes to create a checkpoint.

### 5. Completion
- Report the branch used in the task completion summary.
- Do not merge into protected or shared branches, push changes, or open a pull request unless requested or authorized by the project's workflow.

---

## 2. Rendering, Caching & Performance
- **Safe Caching Boundaries (`publicServerFetch`)**:
  - **Revalidation Intervals**:
    - `revalidate: 300` (5 minutes): For slow-changing taxonomy and system metadata (categories, system constants).
    - `revalidate: 60` (1 minute): For dynamic public catalog data (venues, event templates, public foxer profiles).
  - **Cache Tags & Invalidation**: Every cached query must declare specific cache tags (e.g., `tags: ['venues']`, `tags: ['categories']`, `tags: ['templates']`). Mutations (create, update, delete) must invoke `revalidateTag(tag)` to purge stale caches immediately upon state changes.
- **Strictly Dynamic & Uncached Flows**:
  - Booking, checkout, payment status, user profile, notifications, and creator/admin dashboards must remain completely dynamic and un-cached (`cache: 'no-store'` or un-cached server fetches).
  - **Dynamic Route Caveat**: In Next.js, dynamic route segments (e.g., `[id]`) do NOT automatically opt nested `fetch` calls out of data caching. Always verify individual nested data fetchers use appropriate un-cached options.
- **Client vs. Server Component Boundaries**:
  - Keep data fetching on the server. Do not fetch public catalog data in client components when server components can pass data as props.
  - Keep client components (`"use client"`) at the leaves of the render tree (interactive controls, forms, modals).

---

## 3. Architecture & Code Quality
- **Feature Structure**: Code is organized under `src/features/<feature>/` (`components/`, `hooks/`, `api/`, `types/`) and `src/shared/`. Respect layer boundaries and avoid circular dependencies.
- **API Client & Authentication**: All authenticated requests must pass Better Auth session cookies/tokens via `getServerApi()` or client session hooks. Never invent custom JWT headers.

---

## 4. Proportional Pre-Completion Verification
Execute verification checks proportional to the scope of your changes:
1. `pnpm validate` — Clean architecture layer boundary validation (`tools/validate-architecture.mjs`)
2. `pnpm lint` — ESLint static code analysis
3. `pnpm type-check` — TypeScript compilation check (`tsc --noEmit`)
4. `pnpm test` — Vitest unit & component test suite
5. `pnpm build` — Full Next.js production build check (`next build --webpack`)

**Reporting Requirements**:
- **Substantial changes** (routing, caching architecture, core auth/shared libs): Run all 5 checks.
- **Localized changes** (single component styling, copy update, isolated hook): Run targeted checks (`pnpm type-check`, `pnpm lint`, and relevant test) and explicitly record any skipped checks with rationale.
- Categorize each check as:
  - **Passed**: Clean execution.
  - **Failed (Changes)**: Failed due to recent changes (must be fixed).
  - **Pre-existing Failure**: Unrelated failure that existed prior to this task.
  - **Skipped**: Deliberately skipped due to localized scope (reason required).
  - **Blocked**: Environment or external service unavailable.
*Never misrepresent a skipped or blocked check as passed.*

---

## 5. Mandatory Completion Report
Before concluding any task, provide a structured completion report:
- **Branch**: Dedicated branch used.
- **Changes**: Summary of what was implemented or resolved.
- **Files**: Key files created, modified, or removed.
- **Rendering & Caching**: Cache tags, revalidation intervals, or dynamic route implications.
- **Security & Auth**: Better Auth session or permission implications.
- **Verification**: Exact status of checks (`Passed`, `Failed`, `Pre-existing`, `Skipped`, or `Blocked`) with reasons for any skipped items.
- **Remaining Work**: Known limitations, follow-up tickets, or browser-specific considerations.

*Never declare a task complete when required verification remains unsuccessful or unperformed.*

