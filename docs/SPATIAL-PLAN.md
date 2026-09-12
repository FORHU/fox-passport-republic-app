# Spatial Intelligence — evaluation and counter-plan

A review of `FoxPassportSpatialIntelligence.md` (1,584 lines, 40 sections,
10 phases), written 9 Sep 2026 against the code as it stands on `main` in both
repositories.

Everything asserted here was checked, not remembered. What was run is named, so
any of it can be re-run and disagreed with.

---

## Recommendation, first

**Adopt the document's principles. Reject its sequencing and its infrastructure
assumptions.**

The architectural instinct is right, and §39's rules are better than most
documents of this kind. But the plan is written as though spatial is a
greenfield capability, and it is not — five tables already carry coordinates, a
geometry utility already exists with tests, a bounding-box-plus-distance query
already ships, and the app already renders four maps against Mapbox. The work
that matters is **consolidating what exists into one module**, not building a
platform.

The proposed MVP (§37) requires PostGIS, clustering and viewport loading before
it is "complete". Against 128 venues, none of those three does anything a
`WHERE lat BETWEEN ... AND lng BETWEEN ...` does not already do, today, in the
investment module.

So: **three steps, roughly one to two weeks**, then let real usage decide the
rest. Each later phase from the original document becomes a decision with a
trigger attached, rather than a commitment made in advance.

---

## 1. What the document gets wrong about this codebase

Four claims are load-bearing and false. They matter because the plan is built on
them.

**"React, Vite" (§2).** The app is **Next.js 16** with React 19 and the App
Router. This is not cosmetic. Viewport-driven map loading, Cesium's bundle, and
where fetching lives are all materially different under RSC than in a Vite SPA.
A plan that assumes a client-only SPA will specify the wrong data path.

**"Existing RabbitMQ/event infrastructure" (§2).** There is none — no `amqplib`,
no Bull, no Kafka in `package.json`. Realtime today is **socket.io**
(`src/infrastructure/socket`), and Redis arrived last week for rate limiting and
caching. §19's realtime architecture rests on a queue that does not exist.

**"Use PostgreSQL + PostGIS" (§5), and PostGIS as an MVP checkbox (§37).**
PostGIS is **not installed**: `SELECT extname FROM pg_extension` returns
`plpgsql` and nothing else. Adopting it means a different Postgres image, a
migration, and a deployment change on every environment — a real cost, listed as
a tick-box.

**The premise that spatial does not exist yet.** It does, in pieces. See §2.

---

## 2. What already exists

This is the most important finding, and the document does not account for any of
it.

| Capability | Where | State |
| --- | --- | --- |
| Point geometry | `venues`, `assets`, `services`, `event_templates`, `partner_investments` — all carry `lat`/`lng` | **128/128 venues populated**, 43 cities |
| Polygon geometry | `api/src/utils/geo.ts` — validation, centroid, overlap, point-in-polygon | Written, with `tests/geo.spec.ts` |
| Viewport query | `investment.repository.ts` — `bounds: {minLat, maxLat, minLng, maxLng}` | Shipping |
| Distance ranking | same file — Haversine scoring | Shipping |
| Map renderer | `react-map-gl` + `mapbox-gl`, with `shared/lib/mapbox` (token, style, fallback) | Shipping |
| Map surfaces | `PartnerInventoryMap`, `MapboxLocationPicker`, `VenuePolygonMapPicker`, `InvestmentLocationPicker`, `SearchFilters` | Shipping |
| 3D engine | `cesium@1.136` in `package.json` | **Installed; only its CSS is imported.** Nothing uses it |
| Cache + invalidation | `utils/cache.util.ts` — `versionedCache`, retired at the write | Landed 9 Sep |

Two conclusions follow.

**The spatial layer is already built — in the wrong place.** It lives inside
feature modules, which is precisely the coupling §1 of the document warns
against. Consolidation is the deliverable, and it pays for itself immediately:
the app's architecture validator currently reports 20 violations, **all of them
cross-feature imports**, and map components reaching into other features are
part of that.

**Cesium is already paid for and unused.** Whatever is decided about 3D, that
dependency should either be used or removed; it is currently neither.

---

## 2b. Two gaps found after this review was written

Both were measured on 9 Sep, and both change Phase 1.

**`events` cannot be projected.** The `SpatialEntityType` union includes
`"event"`, but the `events` table has **no `lat`/`lng`** - only `targetCity`,
`targetState`, `targetCountry` and `templateId`. An event's point has to be
resolved through its template (`event_templates.lat/lng`) or through a booked
venue (`event_venue_transactions → venues`). That is a Phase 1 design decision,
not a detail: events are what an operational map most wants to show, and the
rule chosen determines whether an event without a template or a venue appears
at all.

**Baguio is 7 venues.** Nationwide there are 543 geo-bearing rows - 128 venues,
114 assets, 298 services, 3 investments - and Baguio holds a small slice. The
business questions in §18 of the original ("where is supply concentrated",
"where are the gaps") cannot be answered from 7 venues. Phase 3 as scoped
validates the *architecture*, not the insight. Either widen the pilot area or
say plainly that the first map is an architectural proof.

543 rows also settles the trigger decisions below: the entire national dataset
is one uncompressed response.

**One implementation note.** §11 of the master plan says business repositories
invalidate the spatial cache version. The pattern exists - `BookingRepo` and
`PaymentRepo` retire their namespace inside every write as of 9 Sep - but the
five repositories that own spatial rows (`venue`, `asset`, `service`,
`event-template`, `investment`) have **no invalidation at all** today. That is
five new wirings, each one line, in a shape that is already proven and tested.

---

## 3. Where the sequencing is wrong

The document specifies, for the MVP or shortly after: marker clustering (§10),
viewport-based loading (§21), tile-oriented scaling (§22), a Redis spatial cache
(§20), trails (§25), a camera system (§24), voice (§30) and AI explanations
(§31).

Current scale: **128 venues, 148 users, 19 bookings, 43 cities.**

Clustering exists to stop a browser drawing ten thousand markers. Tiling exists
to stop a server serving them. At 128 entities the entire national dataset fits
in one response, uncompressed, well under the size of the map tiles it would be
drawn on. Building either now means maintaining an abstraction whose behaviour
cannot be observed — the code path that matters (many entities) never runs, so
it is never exercised and quietly rots.

The same applies to PostGIS. Its value is `ST_DWithin` over an index at scale,
and geometry operations too awkward to write by hand. The awkward ones are
already written and tested in `geo.ts`, and the scale is not there.

**None of this argues against those pieces eventually.** It argues for a trigger
instead of a schedule — §5 below.

---

## 4. What to do instead

### Step 1 — one spatial read model (api, ~2–3 days)

A `spatial` module: one endpoint, one type, one test file.

```
GET /api/v1/spatial/entities?bounds=minLng,minLat,maxLng,maxLat&types=venue,asset,service
    → SpatialEntity[]  { id, type, name, lat, lng, status, ownerId }
```

- Projects the five tables that already carry coordinates into one shape.
- Bounds filtering in Prisma, as `investment.repository.ts` already does.
- Reuses `utils/geo.ts` for anything polygonal.
- Authorised with the existing `requirePermission`, on the backend, per §28.
- Cached with `versionedCache("spatial")`, retired by the repositories that own
  those rows — the mechanism landed on 9 Sep and is already pinned by tests.

No UI change. No PostGIS. No new infrastructure.

**Note added 12 Sep, after this step was written:** `GET /venues/near`
(point-in-polygon — "does any venue's drawn boundary cover this exact point,"
not a bounds/proximity query) shipped to a frontend caller three days after
this plan proposed consolidating spatial reads into one module. It isn't a
contradiction — it predates this plan being acted on — but it's exactly the
kind of venue-feature-local spatial endpoint Step 1 argues should live in the
consolidated module instead. Fold it in when Step 1 starts rather than
treating it as a second, already-done thing to leave alone: it answers a
different question than the bounds-filtered `SpatialEntity[]` shape above
(coverage vs. viewport), so it likely wants its own query param on the same
endpoint, not a separate route.

### Step 2 — move the existing maps onto it (app, ~3–4 days)

One `useSpatialEntities(bounds, types)` hook; the four existing map components
stop fetching their own way. Visually nothing changes, which is what makes it
safe to do.

This is where the architectural win is banked: fewer cross-feature imports, one
place where "what is on the map" is decided, and a single seam to put clustering
behind later.

### Step 3 — one screen that earns it (~1 week)

The Baguio operational map from §35: supply and demand for one city, on top of
Step 1. Pick it because it is the document's own business case and because 43
cities of real data make it meaningful. Ship it to an operator and watch them
use it.

**Stop there and look.** Steps 1–3 deliver the foundation the document wants,
in roughly the time §36's Phase 0 alone was scoped for.

---

## 5. Triggers, not phases

Each of these is a real capability with a real cost. Each gets built when its
trigger fires, and not before.

| Capability | Build it when |
| --- | --- |
| Marker clustering | a normal viewport returns **> ~500 entities** |
| Tile-oriented serving | clustering is no longer enough — i.e. the *query* is slow, not the draw |
| PostGIS | a query needs true geometry at scale: `ST_DWithin` over tens of thousands of rows, or containment the JS in `geo.ts` cannot do fast enough |
| Realtime spatial updates | an operator can name a decision they make in the seconds between a change and the next poll |
| CesiumJS / 3D | someone can name a decision a 3D view changes that a 2D view does not. Until then, remove the dependency |
| AI / voice (§29–31) | after the RBAC migration completes — see below |

---

## 6. The one risk worth naming — mostly closed, re-checked 12 Sep

§28 puts spatial layers behind roles, and §29–31 put an AI on top of them.

**This section was stale when it said the migration was "mid-flight" with
"Phase 1 partially done"** — `RBAC-PLAN.md`, re-audited 12 Sep, shows Phases
2, 3 (route conversion), 5 and 6 have all shipped, some of it before that
plan was even first committed. The one piece still genuinely open is Phase
4's missing-guard CI scan — not a blocker on *whether* the one-chokepoint
model (`can()` / `permissionsForUser()` in `api/src/types/permissions.ts`)
exists, only on whether CI catches a route that forgets to use it.

So the AI/voice trigger in the table above (§5: "after the RBAC migration
completes") is **much closer to satisfied than this section implied** — the
chokepoint this section asks spatial permissions to wait for already exists
and is in production use. Re-evaluate that trigger condition rather than
treating it as still blocked on a mid-flight migration.

The reasoning underneath still holds regardless of RBAC's exact phase: two
places deciding the same permission question independently is the identical
failure this codebase spent 9 Sep removing from its caching (invalidation
scattered across services, two writes that quietly missed it, a citizen shown
their own payment as unpaid). Spatial permissions should route through
`permissionsForUser()`, not grow a second decision surface — that part of
the argument doesn't depend on which RBAC phase is current.

---

## 7. What to keep from the original, unchanged

§39's rules, nearly all of them. In particular:

> 3. Do not start with 3D. 4. Do not load the entire database into the browser.
> 6. Implement clustering before supporting large datasets. 8. Enforce RBAC on
> the backend. 10. Never represent stale/estimated data as live.
> 15. Optimize for business value, not visual spectacle.

Rule 15 is the one that argues against the rest of the document's scope, and it
is the document's own rule.

Also keep §1's architecture — business domains own business data, spatial owns
projections, the renderer owns visualisation, AI never bypasses authorization —
and §35's Baguio-first rollout.

---

## 8. Before circulating the original

Three corrections, so nobody plans against facts that are not true: Vite →
Next.js 16; RabbitMQ → socket.io and Redis; PostGIS → not installed, and its
adoption is a deployment change. And an inventory section like §2 above, so
nobody builds `geo.ts` a second time.

---

## How this was checked

```
# stack
grep -E '"(next|vite|react|zustand|@tanstack/react-query|cesium|react-map-gl)"' app/package.json
grep -iE '"(amqplib|rabbit|bull|bullmq|kafkajs)"' api/package.json      # no matches

# database
psql -c "SELECT extname FROM pg_extension"                              # plpgsql only
psql -c "SELECT table_name FROM information_schema.columns
         WHERE column_name IN ('lat','lng')"                            # 5 tables
psql -c "SELECT count(*) FROM venues WHERE lat IS NOT NULL"             # 128 of 128

# existing spatial code
find api/src api/tests -iname "*geo*"                                   # utils/geo.ts + spec
grep -rn "bounds\|Haversine" api/src/modules/*/*.repository.ts          # investment
grep -rln "cesium" app/src                                              # layout.tsx, CSS only
```
