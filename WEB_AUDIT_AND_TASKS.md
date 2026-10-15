# FoxPassport Web App: Audit, Architecture & Task Tracker

> **Last Updated:** October 14, 2026  
> **Repository:** `fox-passport-republic-app`  
> **Backend Service:** `fox-passport-republic-api` (Port 6002)  
> **Web Client Port:** 6001  

---

## 1. Executive Summary

This tracker documents all recent code audits, bug fixes, theming system updates, and ongoing action items for the **FoxPassport Web Application**.

---

## 2. Completed Fixes & Hardening Log

### A. Partner Inventory Map ([`PartnerInventoryMap.tsx`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/features/investment/components/PartnerInventoryMap.tsx))
- [x] **SSR Lifecycle**: Replaced `useLayoutEffect` with `useEffect` to eliminate server-side rendering warnings.
- [x] **Location Interaction**: Wired `isLocationLoading` to disable the "Fly to My Location" button and show a spinner while GPS coordinates resolve.
- [x] **Mapbox Instance Lifecycle**: Added `alive` unmount guards and cached `mapboxglRef` to prevent runtime crashes during route transitions.
- [x] **Marker Cleanup**: Added explicit cleanup `markersRef.current.forEach(m => m.remove())` on component unmount.
- [x] **Monotonic Pin Fetching**: Unified bounding box and category queries with `requestIdRef` cancellation to prevent stale response overwrites.
- [x] **Reactive Gestures**: Dynamically toggles `map.dragPan.enable()` / `map.dragPan.disable()` when the `dragPan` prop changes.
- [x] **Mouse Panning Guard**: Restricted category pill drag-scrolling to primary left-clicks (`e.button !== 0`).
- [x] **Accessibility & Keyboard Navigation**: Added <kbd>Escape</kbd> listener to dismiss pin details, ARIA labels, and `role="region"` for category filters.
- [x] **TypeScript Strictness**: Removed loose `any` types in favor of `@types/mapbox-gl`.

### B. User Location Hook ([`useUserLocation.ts`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/shared/hooks/useUserLocation.ts))
- [x] **Dependency Stabilization**: Extracted primitive Zustand selectors (`userCountry`, `userCity`) and `userProfileRef`, preventing unrelated auth state changes from repeatedly re-triggering browser GPS prompts.
- [x] **Memory Leak Guard**: Added `isMountedRef` check across asynchronous geolocation callbacks and reverse geocode responses.
- [x] **Request Cancellation**: Added an `AbortController` to abort in-flight reverse geocode requests during rapid re-detection.
- [x] **Token Consistency**: Standardized Mapbox token access using `getEffectiveMapboxToken()`.
- [x] **Timeout & Cache Tuning**: Increased geolocation timeout to 10,000ms and added `maximumAge: 60000` to prevent premature timeouts when users take a few seconds to accept the browser prompt.
- [x] **Unit Test Coverage**: Added [`useUserLocation.test.ts`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/shared/hooks/__tests__/useUserLocation.test.ts) covering GPS success, denial fallbacks, empty token handling, and manual `locateMe()` triggers (4/4 passed).

### C. SSR Warning Cleanups ([`MapBoxViewImpl.tsx`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/shared/components/ui/MapBoxViewImpl.tsx), [`useHostVenueEdit.ts`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/features/venue/hooks/useHostVenueEdit.ts))
- [x] **Universal Map SSR Safety**: Converted `useLayoutEffect` to `useEffect` in generic map implementation `MapBoxViewImpl.tsx` and venue builder hook `useHostVenueEdit.ts`, eliminating Next.js SSR warnings during server pre-rendering.

### D. API Proxy & Gateway Resilience ([`route.ts`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/app/api/proxy/%5B...path%5D/route.ts))
- [x] **Upstream Error Guard**: Wrapped backend forward requests in `try/catch` to return clean `503 Service Unavailable` JSON responses with helpful debugging hints instead of uncaught Next.js 500 server crashes when the API is offline.
- [x] **Feed Error State & Retry Card**: Added connection error card with a "Retry" button on [src/app/republic/page.tsx](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/app/republic/page.tsx).

### D. Database & Backend Alignment ([`fox-passport-republic-api`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-api))
- [x] **Migration Applied**: Applied pending migration `20261005100000_add_user_district` (`ALTER TABLE "users" ADD COLUMN "district" TEXT;`).
- [x] **Prisma Client Synchronized**: Successfully re-generated Prisma Client without `EBUSY` locks.

### E. Investment Location Picker ([`InvestmentLocationPicker.tsx`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/features/investment/components/InvestmentLocationPicker.tsx))
- [x] **SSR Lifecycle**: Replaced `useLayoutEffect` with `useEffect`.
- [x] **Token Consistency**: Switched to `getEffectiveMapboxToken()` with graceful fallback handling when token is unavailable.
- [x] **Search Debounce & AbortController**: Added 300ms debounce and active request abortion to prevent race conditions and excessive Mapbox Geocoding API usage.
- [x] **Map & Marker Cleanup**: Explicitly cleared markers (`markerRef.current?.remove()`) and destroyed map instances on unmount.
- [x] **GPS State Feedback**: Bound `isLocationLoading` to disable the "Center on Me" button and render a loading spinner.
- [x] **Unit Test Suite**: Created [`InvestmentLocationPicker.test.tsx`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/features/investment/components/__tests__/InvestmentLocationPicker.test.tsx) (4/4 tests passed).

### G. Mobile Navigation & Viewport Safe Areas ([`MobileBottomNav.tsx`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/shared/components/layout/MobileBottomNav.tsx), [`MobileCreatorBottomNav.tsx`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/features/dashboard/components/MobileCreatorBottomNav.tsx))
- [x] **Safe Area Insets**: Enhanced mobile bottom navigators with `env(safe-area-inset-bottom)` dynamic calculation to prevent overlap with iPhone home indicator and Android gesture navigation bars.
- [x] **Aria Labeling & Contrast**: Added explicit `aria-label` tags and high-contrast glow states on active tabs.

---

## 3. Theming & CSS System Architecture

### Token & Aesthetic Standard
- **Brand Palette**:
  - **Background**: Deep Navy / Obsidian (`#02040a`, `oklch(0.145 0 0)`, `zinc-950`)
  - **Primary Accent (CTA)**: Neon Lime (`#ccff00`, `lime-400`)
  - **Secondary Accent**: Amber / Gold (`#f59e0b`, `amber-400`) for investments, hubs & supplies
  - **Gradients**: Subtle radial lighting (`rgba(124, 58, 237, 0.15)`, `rgba(219, 39, 119, 0.1)`, `rgba(204, 255, 0, 0.05)`)
- **Typography**:
  - Headings & Badges: **Space Grotesk**
  - Body & Form Elements: **Plus Jakarta Sans**
  - Monospace & Numbers: **Space Mono**

### CSS & Config Adjustments in [`globals.css`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/app/globals.css)
- [x] **Tailwind v4 Integration**: Added `@config "../../tailwind.config.ts";` so custom colors (`surface.highlight`, `primary.glow`, etc.) are recognized.
- [x] **Removed Contradictory Media Query**: Removed `@media (prefers-color-scheme: dark)` which was forcing `#ffffff` light mode variables.
- [x] **De-duplicated Utility Rules**: Kept single, canonical `.bg-gradient-dark` utility with `background-attachment: fixed`.

---

## 4. Priority Roadmap & Action Items

| Priority | Task | File(s) | Status |
|:---:|---|---|:---:|
| 🟢 P0 | Resolve SSR & Mapbox lifecycle in `PartnerInventoryMap` | `PartnerInventoryMap.tsx` | **Completed** |
| 🟢 P0 | Resolve unstable geolocation triggers in `useUserLocation` | `useUserLocation.ts` | **Completed** |
| 🟢 P0 | Fix uncaught 500 crashes on API proxy network disconnect | `proxy/[...path]/route.ts` | **Completed** |
| 🟢 P0 | Apply pending `district` database migration | `fox-passport-republic-api` | **Completed** |
| 🟢 P1 | Harden companion picker [`InvestmentLocationPicker.tsx`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/features/investment/components/InvestmentLocationPicker.tsx) (SSR warning, search debouncing, Mapbox marker cleanup) | `InvestmentLocationPicker.tsx` | **Completed** |
| 🟢 P1 | Audit [`CreateInvestmentWizard.tsx`](file:///c:/Users/devrm/Documents/GitHub/foxpassport/fox-passport-republic-app/src/features/investment/components/CreateInvestmentWizard.tsx) for form state retention & validation | `CreateInvestmentWizard.tsx` | **Completed** |
| 🟢 P2 | Audit responsive mobile layout and drawer menus (safe area bottom insets) | `MobileBottomNav.tsx`, `MobileCreatorBottomNav.tsx` | **Completed** |
| 🔵 P2 | Clean up hardcoded zinc color references vs. semantic design tokens | Core UI Components | **In Progress** |

---

## 5. Verification Commands

### Quality & Type Checks
```powershell
# Type checking (0 errors)
npx tsc --noEmit

# ESLint audit (0 errors, 0 warnings)
npm run lint

# Vitest test suite (35/35 test files passing, 260/260 tests passing)
npx vitest run
```

### Manual Development Server
```powershell
# In fox-passport-republic-api
npm run dev

# In fox-passport-republic-app
npm run dev
```
