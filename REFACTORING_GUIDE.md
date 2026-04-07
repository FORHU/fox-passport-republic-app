# Next.js Architecture Refactoring Guide

This document describes the architectural improvements made to the FoxPassport Republic App and best practices for future development.

## Overview of Changes

### Problem: Before Refactoring
- ❌ 25 hooks missing `"use client"` directives
- ❌ Zustand store making API calls (anti-pattern)
- ❌ Auth checks duplicated across client layouts
- ❌ No Zod validation for forms
- ❌ Manual `useState` + `useEffect` data fetching
- ❌ Mock data hiding API errors
- ❌ No type safety in auth store

### Solution: After Refactoring
- ✅ All hooks have `"use client"` directives
- ✅ Zustand stores only manage UI state
- ✅ Centralized auth routing in `middleware.ts`
- ✅ Comprehensive Zod schemas for all forms
- ✅ Consistent TanStack Query pattern
- ✅ Real errors surface properly
- ✅ Type-safe auth throughout

---

## File Structure

```
lib/
├── server/                    # NEW: Server-side utilities
│   ├── auth.ts               # Auth helpers & permission checks
│   ├── dashboard.ts          # Server-side data fetching
│   └── index.ts              # Barrel exports
├── schema.ts                 # Zod validation (EXPANDED)
├── api/                      # Axios calls
├── mappers/                  # Data transformation
└── ...existing files

middleware.ts                 # NEW: Root-level auth routing
```

---

## Key Refactoring Patterns

### 1. Using Server-Side Auth Utilities

**In server components or server actions:**

```typescript
import { requireHost, isAdmin, fetchHostVenues } from "@/lib/server";

// Check permissions
if (!isHostUser(user)) {
  throw new Error("Host access required");
}

// Fetch data on the server
const venues = await fetchHostVenues(userId);

// Or use the requirement functions which throw on failure
const authenticatedUser = requireHost(user); // Throws if not host
```

### 2. Client-Side Auth Checks

**Middleware handles redirects automatically.** Your client component only needs to show conditional UI:

```typescript
"use client";
import { useAuthStore } from "@/store/useAuthStore";

export function HostDashboard() {
  const user = useAuthStore((state) => state.user);

  // If middleware let us here, user is authenticated and is a host
  // But still safe to check in case auth state resets
  if (!user?.isHost) {
    return <div>Redirecting...</div>;
  }

  return <div>Host dashboard content</div>;
}
```

### 3. Form Validation

**Use Zod schemas consistently:**

```typescript
import { createEventSchema } from "@/lib/schema";

// Validate before submit
const parsed = createEventSchema.safeParse(formData);

if (!parsed.success) {
  // Handle validation errors
  console.error(parsed.error.errors);
  return;
}

// Submit with validated data
const response = await api.post("/v1/events", parsed.data);
```

### 4. Data Fetching Pattern

**Always use TanStack Query for client-side fetching:**

```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useEventsByCategory(categoryName: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["events", categoryName],
    queryFn: async () => {
      if (!categoryName) return [];
      const res = await api.get(`/v1/events/by-category/${categoryName}`);
      return res.data.data;
    },
    enabled: !!categoryName, // Don't fetch until category is set
  });

  return { data: data ?? [], isLoading, error };
}
```

### 5. Hook Requirements

**All hooks must declare their runtime environment:**

```typescript
"use client";  // ← Always required if hook uses:
               // - useState, useEffect
               // - useCallback, useMemo
               // - useRouter, useParams
               // - useQuery (TanStack)
               // - useRef, useContext
               // - Any browser APIs

export function useMyHook() {
  // ... hook code
}
```

---

## Migration Path: Client Pages → Server Components

### Current State
Most pages are `"use client"` with data fetching inside them (suboptimal).

### Target State
- **Root layouts**: Server components (mostly are already)
- **Pages with data**: Fetch in server component, pass to client children
- **Pages with forms**: Client component (forms need `useState`, events, etc.)

---

## Zod Validation Reference

### Available Schemas

```typescript
import {
  loginSchema,
  signupSchema,
  createAssetSchema,
  createServiceSchema,
  createEventSchema,
  createVenueSchema,
  createReviewSchema,
} from "@/lib/schema";

// Usage
const result = createEventSchema.safeParse(eventFormData);
if (!result.success) {
  // Handle validation errors
}
```

---

## Middleware Rules

### Protected Routes
```
/host/*                   → Requires: host role
/admin/*                  → Requires: admin role
/mayor/create-venue       → Requires: mayor role
/foxer/create-event       → Requires: authentication
/foxer/create-listing     → Requires: authentication
/reviews/write/*          → Requires: authentication
```

### Redirect Behavior
1. **No auth token** → Redirect to `/` + signal login modal
2. **Invalid role** → Redirect to `/`
3. **Valid auth + role** → Proceed

---

## Error Handling

### Before (Problematic)
Mock data hid failures. Users saw fake stats when API failed.

### After (Better)
```typescript
const { stats, error, loading } = useAdminDashboard();

if (error) {
  return <div className="error">Failed to load stats: {error}</div>;
}
if (loading) return <Skeleton />;

return <AdminStats {...stats} />;
```

---

## Checklist for New Features

- [ ] Add Zod schema in `lib/schema.ts` for validation
- [ ] Create API client function in `lib/api/`
- [ ] If client-side fetch: use TanStack Query
- [ ] If server-side fetch: add to `lib/server/`
- [ ] All hooks have `"use client"` directive
- [ ] Protected routes added to `middleware.ts` if needed
- [ ] Error handling with try/catch or error boundaries
- [ ] Auth checks use `lib/server` utilities, not inline logic

---

## Files Modified This Session

| File | Change | Type |
|------|--------|------|
| `types/auth.ts` | Added `userId?` field for type safety | Fix |
| `middleware.ts` | Created centralized auth routing | NEW |
| `lib/server/auth.ts` | Server-side auth utilities | NEW |
| `lib/server/dashboard.ts` | Server-side data fetching | NEW |
| `lib/server/index.ts` | Barrel exports | NEW |
| `lib/schema.ts` | Expanded Zod schemas | Enhanced |
| `app/host/layout.tsx` | Removed redundant auth checks | Cleanup |
| All hooks in `hooks/**/*.ts` | Added `"use client"` directives | Fix |

---

## Resources

- [Next.js Server/Client Components](https://nextjs.org/docs/app/building-your-application/rendering)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
