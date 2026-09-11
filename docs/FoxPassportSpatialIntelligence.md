# FoxPassport Spatial Intelligence

## God's Eye View–Inspired Geographic Intelligence System

### Status

Proposed architectural direction and implementation roadmap.

### Objective

Build a production-grade **Spatial Intelligence system for FoxPassport**, inspired by the architecture and interaction model of Bilawal Sidhu's God's Eye View project.

Reference:
https://github.com/bilawalsidhu/gods-eye-view

The goal is **not to clone God's Eye View** and not to turn FoxPassport into a surveillance application.

The goal is to create a geographic operating layer for FoxPassport that connects:

* Venues
* Gear
* Services
* Events
* Bookings
* Availability
* Supply
* Demand
* Geographic analytics
* Investor intelligence

The system should eventually provide an interactive 2D/3D map where geographic information becomes another interface for interacting with the FoxPassport ecosystem.

---

# 1. Core Architectural Principle

The Spatial system must remain a **separate modular capability**.

Business domains own their business data.

Spatial owns geographic projections, spatial queries, geographic analytics, and map-oriented representations.

The renderer owns visualization.

AI may interpret spatial information but must never bypass authorization.

Architecture:

```
Business Domains
      │
      ├── Venues
      ├── Events
      ├── Gear
      ├── Services
      ├── Bookings
      └── Users
              │
              ↓
      Spatial Projection
              │
              ↓
      Spatial Query Engine
              │
      ┌───────┴────────┐
      ↓                ↓
   Spatial API      Analytics
      │
      ↓
  Map Client
      │
      ↓
2D / CesiumJS 3D
```

Do NOT make Venue, Event, Gear, or Service depend directly on CesiumJS.

---

# 2. Technology Direction

Use the existing FoxPassport technology stack wherever possible.

Recommended:

Frontend:

* React
* Vite
* TypeScript
* TanStack Query
* Zustand

Map:

* Start with a 2D map implementation
* Introduce CesiumJS for the advanced 3D layer

Backend:

* Existing FoxPassport API
* Existing modular-monolith architecture
* Prisma
* PostgreSQL
* PostGIS

Infrastructure:

* Redis for spatial caching
* Existing RabbitMQ/event infrastructure for eventual realtime projection updates

Do not introduce additional infrastructure unless it is actually required.

---

# 3. Spatial Module

Create a dedicated Spatial module.

Recommended structure:

```
modules/
  spatial/
    domain/
    application/
    infrastructure/
    projections/
    queries/
    analytics/
```

Frontend:

```
apps/
  web/
    src/
      features/
        spatial/
```

Shared packages where useful:

```
packages/
  spatial-contracts/
  spatial-client/
  spatial-ui/
```

Documentation:

```
docs/
  spatial/
    architecture.md
    data-sources.md
    layers.md
    performance.md
    privacy.md
```

---

# 4. Canonical Spatial Entity

Create a canonical representation that the map consumes.

Example:

```
type SpatialEntityType =
  | 'venue'
  | 'event'
  | 'gear'
  | 'service'
  | 'booking'
  | 'zone';

interface SpatialEntity {
  id: string;
  type: SpatialEntityType;

  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };

  geometry?: GeoJSON.Geometry;

  properties: {
    name?: string;
    status?: string;
    category?: string;
  };

  visibility: {
    public: boolean;
    roles?: string[];
  };
}
```

The frontend must not consume arbitrary database models directly.

Business data must be transformed into spatial contracts.

---

# 5. Database / PostGIS

Use PostgreSQL + PostGIS for geographic functionality.

Do not rely exclusively on separate latitude/longitude columns.

Support:

* Point
* Polygon
* LineString
* Bounding boxes
* Radius searches
* Distance calculations
* Geographic containment
* Geographic intersections

Required spatial capabilities:

* Nearby entities
* Entities within radius
* Entities inside viewport
* Entities inside polygons
* Distance between entities
* Geographic clustering
* Density calculations
* Coverage calculations

Do not over-engineer the schema before the MVP.

Implement only what the first spatial use cases require.

---

# 6. Spatial API

Design APIs around geographic questions rather than business tables.

Preferred endpoints:

```
GET /spatial/entities
GET /spatial/nearby
GET /spatial/search
GET /spatial/viewport
GET /spatial/clusters
GET /spatial/heatmap
GET /spatial/routes
```

Example:

```
GET /spatial/viewport
```

Parameters:

* north
* south
* east
* west
* zoom
* layers

Example response:

```
{
  "entities": [
    {
      "id": "venue_123",
      "type": "venue",
      "location": {
        "latitude": 16.4023,
        "longitude": 120.5960
      },
      "properties": {
        "name": "Example Venue",
        "status": "active"
      }
    }
  ]
}
```

The API must enforce authorization.

Never rely on frontend filtering for access control.

---

# 7. Spatial Layer System

Implement the map as a collection of independent layers.

Initial layers:

* Venues
* Events
* Gear
* Services

Future layers:

* Bookings
* Availability
* Demand
* Supply
* Heatmap
* Routes
* Zones
* Market opportunities

Each layer must be independently enabled/disabled.

Example:

```
LAYERS

☑ Venues
☑ Events
☑ Gear
☑ Services

☐ Availability
☐ Bookings
☐ Demand
☐ Supply
☐ Heatmap
```

The layer system should be extensible.

Adding a new layer should not require rewriting the entire map.

---

# 8. Map Renderer Abstraction

Do not couple the spatial domain directly to CesiumJS.

Create a renderer abstraction.

Example:

```
interface SpatialRenderer {
  addEntity(entity: SpatialEntity): void;

  updateEntity(
    id: string,
    entity: SpatialEntity
  ): void;

  removeEntity(id: string): void;

  flyTo(id: string): void;

  select(id: string): void;

  clear(): void;
}
```

Implement:

```
CesiumRenderer
```

Potential future implementation:

```
OtherMapRenderer
```

This allows FoxPassport to change visualization technology without rewriting spatial business logic.

---

# 9. Phase 1 — 2D Spatial MVP

Do NOT begin with the full God's Eye View 3D experience.

Build a fast and useful 2D map first.

MVP requirements:

* Map
* Venue markers
* Event markers
* Gear markers
* Service markers
* Search
* Filters
* Layer toggles
* Marker clustering
* Entity selection
* Entity information panel
* Fly-to location
* Current user location
* Viewport-based loading

Example:

```
FOX MAP

┌────────────────────────────────────┐
│ Search             Layers      ⚙  │
│                                    │
│       ● Venue                      │
│                   ▲ Event          │
│                                    │
│             ■ Service              │
│                                    │
│       ◆ Gear                       │
│                                    │
└────────────────────────────────────┘
```

The goal is to validate the spatial architecture before introducing 3D complexity.

---

# 10. Marker Clustering

Clustering is mandatory before supporting large datasets.

Never render thousands of individual markers at once.

Example:

Zoomed out:

```
┌───────┐
│  248  │
└───────┘
```

Zoom in:

```
┌────┐     ┌────┐
│ 82 │     │ 61 │
└────┘     └────┘
```

Zoom further:

```
●   ●   ■   ◆
```

Use viewport and zoom level to determine the appropriate level of detail.

---

# 11. Entity Inspector

Selecting a spatial entity should open a contextual panel.

Example:

```
VENUE

Baguio Sports Center
─────────────────────

STATUS
Available

EVENTS
3 today

SERVICES
8 providers

GEAR
24 available

BOOKINGS
17 today

[View Venue]
[Book]
[Directions]
```

The map should provide context, not replace the existing FoxPassport workflows.

---

# 12. Phase 2 — Operational Spatial Intelligence

After the basic map works, add:

* Availability
* Booking state
* Supply density
* Demand density
* Service coverage
* Geographic heatmaps
* Redis caching
* Realtime updates

Example status system:

```
🟢 Available
🟡 Limited
🔴 Fully booked
⚫ Closed
```

The map should allow authorized users to understand operational conditions geographically.

---

# 13. Demand Intelligence

Create geographic demand calculations.

Potential metrics:

* Searches per area
* Booking requests per area
* Completed bookings per area
* Demand growth
* Event demand
* Gear demand
* Service demand

Example:

```
HIGH DEMAND
+
LOW SUPPLY
=
OPPORTUNITY
```

These calculations must be based on legitimate FoxPassport data.

Do not expose individual user activity.

Use aggregation.

---

# 14. Supply Intelligence

Calculate:

* Venues per km²
* Providers per km²
* Gear availability per area
* Service coverage
* Active inventory
* Booking capacity

Example:

```
Area A
Demand: 91
Supply: 32

Area B
Demand: 44
Supply: 79
```

This can eventually power opportunity scoring.

---

# 15. Opportunity Zones

Create a future geographic intelligence layer.

Example:

```
Opportunity Score =
  Demand
  × Growth
  × Supply Gap
  × Market Activity
```

Do not expose this formula as final business logic until validated.

Keep the scoring system configurable.

Example:

```
Opportunity Zones

🔥 Very High
🟠 High
🟡 Medium
⚪ Low
```

This should eventually be available to authorized admin/investor roles.

---

# 16. Investor Intelligence

Create a dedicated investor/admin view.

Example:

```
FOX PASSPORT
INVESTOR INTELLIGENCE

Market             Demand     Supply
─────────────────────────────────────
Baguio             HIGH       MEDIUM
La Trinidad        MEDIUM     LOW
Manila              VERY HIGH  HIGH

Demand Growth:     +24%
Supply Growth:     +11%

Underserved Areas: 7
High-Demand Areas: 14
```

The map should allow investors to visually identify:

* High-demand markets
* Low-supply markets
* Growing markets
* Underserved areas
* Market saturation
* Geographic expansion opportunities

All investor analytics must use authorized aggregated data.

---

# 17. Event Intelligence

Represent events spatially.

Event data:

```
event
  ├── location
  ├── start
  ├── end
  ├── capacity
  ├── bookings
  ├── availability
  └── organizer
```

Map representation:

```
🎟 Event
```

Selecting an event should show:

* Event information
* Venue
* Capacity
* Current bookings
* Availability
* Nearby gear
* Nearby services
* Related FoxPassport entities

---

# 18. Booking Intelligence

For authorized operational users, visualize booking states.

Example:

```
🟢 Available
🟡 Limited
🔴 Fully booked
```

Admin dashboard:

```
LIVE OPERATIONS

Bookings       183
Active          72
Pending         31
Completed       80
```

The map should allow operators to understand where operational activity is concentrated.

---

# 19. Realtime Architecture

Do not make every marker a WebSocket object initially.

Initial state:

```
REST
  ↓
Spatial API
  ↓
Map
```

Later:

```
REST
  ↓
Initial State
  ↓
WebSocket/SSE
  ↓
Incremental Updates
```

Potential architecture:

```
Domain Event
     ↓
  RabbitMQ
     ↓
Spatial Projection
     ↓
   Redis
     ↓
WebSocket/SSE
     ↓
   Map
```

Only implement this when realtime behavior is actually required.

---

# 20. Redis Spatial Cache

Use Redis for frequently repeated geographic queries.

Potential keys:

```
spatial:viewport:{hash}
spatial:nearby:{hash}
spatial:cluster:{tile}
spatial:heatmap:{tile}
```

Use short TTLs where appropriate.

Initial target:

```
5–30 seconds
```

Invalidate intelligently when domain events require it.

Do not cache everything blindly.

---

# 21. Viewport-Based Loading

The client should request only what is visible.

Do not load every FoxPassport entity globally.

Request:

```
north
south
east
west
zoom
active layers
```

Example:

```
Camera
   ↓
Viewport
   ↓
Spatial API
   ↓
Relevant entities
   ↓
Renderer
```

This is mandatory for scalability.

---

# 22. Tile-Oriented Scaling

As FoxPassport grows, introduce geographic tiles.

Conceptually:

```
┌───────┬───────┐
│ Tile  │ Tile  │
├───────┼───────┤
│ Tile  │ Tile  │
└───────┴───────┘
```

Only request the geographic tiles surrounding the current camera.

This allows the system to scale from:

```
Baguio
  ↓
Cordillera
  ↓
Philippines
  ↓
International
```

without loading the entire world into memory.

---

# 23. Phase 3 — CesiumJS / 3D

Only after the 2D system is stable should CesiumJS be introduced.

Goals:

* 3D globe
* 3D terrain
* 3D buildings
* Geographic boundaries
* 3D venue representation
* Camera navigation
* Fly-to
* Tracking
* Routes
* Geographic zones

Example:

```
Venue
  ↓
3D building/location

Event
  ↓
Event beacon

Route
  ↓
3D polyline

Coverage
  ↓
Geographic polygon
```

Use 3D selectively.

Do not turn every entity into a heavy 3D model.

---

# 24. Camera System

Implement:

* Fly to venue
* Fly to event
* Fly to service
* Follow route
* Track entity
* Reset camera
* Home location

Example behavior:

```
Select Venue
    ↓
Camera.flyTo()
    ↓
Entity selected
    ↓
Inspector opened
```

---

# 25. Trails

Only use trails for entities that legitimately move through space.

Potential future examples:

* Provider movement
* Authorized operational vehicles
* Delivery routes
* Event routes

Do not create fake movement simply because God's Eye View uses trails.

Never expose private individual location tracking.

---

# 26. Data Freshness

Every spatial data source should expose freshness metadata.

Example:

```
{
  "source": "foxpassport",
  "updatedAt": "...",
  "freshness": "live"
}
```

Supported states:

```
LIVE
RECENT
STALE
ESTIMATED
SIMULATED
UNAVAILABLE
```

Never present estimated or stale data as live.

The UI should make freshness visible where it matters.

---

# 27. Privacy

This system must NOT become an individual surveillance system.

Hard rule:

```
PUBLIC / AGGREGATED DATA
      ↓
Spatial Intelligence

PRIVATE INDIVIDUAL DATA
      ↓
NOT EXPOSED AS MAP INTELLIGENCE
```

Do not implement:

* Named-person tracking
* Private user location maps
* Face recognition
* Individual behavioral surveillance
* Unauthorized device tracking

Instead use:

* Aggregated demand
* Aggregated supply
* Geographic statistics
* Authorized operational data

---

# 28. RBAC Integration

Spatial visibility must integrate with FoxPassport's existing permission-based RBAC system.

Example:

BUYER:

* View public map
* View public venues
* View public events
* Search nearby entities

PROVIDER:

* View own venue
* View own services
* View own inventory

ADMIN:

* Operational map
* Demand
* Supply
* Booking intelligence
* Geographic analytics

INVESTOR:

* Market intelligence
* Demand heatmaps
* Supply analysis
* Opportunity zones

Never rely solely on frontend hiding.

Authorization must be enforced by the API.

---

# 29. AI Spatial Intelligence

AI should be introduced only after the spatial query system is stable.

The AI should translate natural language into authorized spatial queries.

Example:

User:

```
"Find me a venue near Baguio with available gear and services tonight."
```

AI converts this into:

```
location = Baguio
date = tonight
venue = required
gear = required
service = required
availability = true
```

Then:

```
AI
  ↓
Spatial Query
  ↓
FoxPassport API
  ↓
Authorization
  ↓
Results
  ↓
Map
```

AI must never directly query the database.

AI must never bypass RBAC.

---

# 30. Voice Interface

Future voice commands:

```
"Show me all available venues within 5 kilometers."

"Which area has the highest demand?"

"Show me underserved areas."

"Take me to the busiest venue."

"Which venues have available gear tonight?"
```

The voice system should call the same authorized spatial query APIs.

Do not create a second business logic implementation for voice.

---

# 31. AI Map Explanations

Eventually allow AI to explain geographic intelligence.

Example:

```
"Why is this area underserved?"
```

Possible response:

```
This area currently has high demand and
relatively low provider coverage.

Demand growth: +34%
Available providers: -21%
Booking growth: +18%
```

The AI should explain existing calculated metrics.

It should not invent metrics.

---

# 32. Performance Requirements

Track:

* Map initial load
* Spatial API latency
* Database query latency
* Redis hit rate
* Number of returned entities
* Number of rendered entities
* FPS
* Memory usage
* WebSocket connections
* Tile load time

Example target:

```
Spatial API       < 200ms
Cached queries    < 50ms
Initial map       < 2s
Normal rendering  50+ FPS
```

Targets are guidelines and should be measured rather than assumed.

---

# 33. Testing

Create tests for:

### Domain

* Spatial entity creation
* Geometry validation
* Visibility rules

### Database

* Nearby queries
* Radius queries
* Bounding box queries
* Polygon containment
* Distance calculations

### API

* Authentication
* Authorization
* Viewport queries
* Layer filtering
* Pagination
* Invalid coordinates

### Frontend

* Layer toggling
* Entity selection
* Clustering
* Viewport loading
* Camera actions

### Performance

* 100 entities
* 1,000 entities
* 10,000 entities
* Large viewport
* Rapid camera movement

---

# 34. Observability

Add structured logging around:

```
spatial.query
spatial.cache.hit
spatial.cache.miss
spatial.render
spatial.layer.load
spatial.entity.select
```

Monitor:

```
Query latency
Cache hit ratio
DB performance
Entity counts
Map rendering performance
```

---

# 35. Baguio-First Rollout

Start with Baguio as the initial geographic scope.

Initial dataset:

* Venues
* Events
* Services
* Gear
* Availability

Validate the system in a limited geographic region.

Then expand:

```
Baguio
  ↓
Cordillera
  ↓
Metro Manila
  ↓
Philippines
  ↓
International
```

Do not prematurely optimize for global geographic scale.

---

# 36. Implementation Phases

## Phase 0 — Architecture

Implement:

* Spatial module
* Spatial contracts
* Renderer abstraction
* Documentation
* Permission model

No fancy UI yet.

---

## Phase 1 — Spatial Foundation

Implement:

* PostGIS
* Spatial database fields
* Geographic indexes
* Spatial repository
* Nearby queries
* Bounding-box queries
* Distance queries

---

## Phase 2 — Spatial API

Implement:

* `/spatial/entities`
* `/spatial/nearby`
* `/spatial/search`
* `/spatial/viewport`

Add:

* Authentication
* RBAC
* Validation
* Pagination
* Error handling

---

## Phase 3 — 2D Map

Implement:

* Map
* Markers
* Layers
* Search
* Filters
* Clustering
* Entity inspector
* Fly-to

This is the first usable release.

---

## Phase 4 — Operations

Implement:

* Availability
* Booking state
* Supply
* Demand
* Heatmaps
* Redis caching

---

## Phase 5 — Realtime

Implement:

* Domain events
* Spatial projections
* Redis
* WebSocket/SSE
* Incremental map updates

Only if required.

---

## Phase 6 — Spatial Intelligence

Implement:

* Demand scoring
* Supply scoring
* Coverage
* Opportunity zones
* Geographic market analytics

---

## Phase 7 — CesiumJS

Implement:

* 3D globe
* Terrain
* 3D buildings
* 3D entities
* Camera controls
* Routes
* Geographic zones

---

## Phase 8 — AI

Implement:

* Natural-language spatial search
* AI map queries
* AI geographic explanations
* Voice commands

AI must use existing authorized APIs.

---

## Phase 9 — Investor Intelligence

Implement:

* Market comparison
* Demand growth
* Supply gaps
* Opportunity zones
* Geographic KPIs
* Exportable reports

---

# 37. MVP Definition

The first production MVP is complete when the following work:

```
☑ Map
☑ Venues
☑ Events
☑ Gear
☑ Services
☑ Search
☑ Filters
☑ Layers
☑ Clustering
☑ Viewport loading
☑ Entity inspector
☑ Fly-to
☑ RBAC
☑ PostGIS
☑ Spatial API
☑ Basic caching
```

Do NOT require 3D or AI for MVP completion.

---

# 38. Future Full System

The eventual architecture should look like:

```
                     FOX PASSPORT
                          │
                   Spatial Intelligence
                          │
          ┌───────────────┼───────────────┐
          │               │               │
       Discovery      Operations      Intelligence
          │               │               │
       Venues          Bookings          Demand
       Events          Availability      Supply
       Gear            Inventory         Markets
       Services        Providers         Opportunities
          │               │               │
          └───────────────┼───────────────┘
                          │
                   Spatial Query Engine
                          │
             ┌────────────┴────────────┐
             │                         │
          PostgreSQL                 Redis
          + PostGIS                    │
             │                         │
             └────────────┬────────────┘
                          │
                     Spatial API
                          │
                ┌─────────┴─────────┐
                │                   │
              2D Map            CesiumJS
                                  3D
                │                   │
                └─────────┬─────────┘
                          │
                     AI Interface
                          │
                Natural Language
                     + Voice
```

---

# 39. Critical Rules

1. Do not clone God's Eye View directly.

2. Do not couple FoxPassport business logic to CesiumJS.

3. Do not start with 3D.

4. Do not load the entire database into the browser.

5. Always use viewport-based queries.

6. Implement clustering before supporting large datasets.

7. Keep spatial projections separate from business entities.

8. Enforce RBAC on the backend.

9. Never expose private individual location data.

10. Never represent stale/estimated data as live.

11. AI must use authorized APIs.

12. AI must never bypass permissions.

13. Realtime should be added only when justified.

14. Start with Baguio and prove the architecture.

15. Optimize for business value, not visual spectacle.

---

# 40. Final Product Vision

FoxPassport should eventually have three major experiences:

### Consumer

```
"What's around me?"

↓

Fox Map

↓

Discover venues, events, gear and services.
```

### Operations

```
"What's happening across FoxPassport?"

↓

Operational Map

↓

Availability, bookings, supply and activity.
```

### Intelligence

```
"Where should FoxPassport expand?"

↓

Spatial Intelligence

↓

Demand + Supply + Growth + Opportunity.
```

The final system should feel inspired by the **God's Eye View concept**, but its purpose is completely FoxPassport-specific:

> **A geographic operating system for the FoxPassport ecosystem.**

Build the spatial foundation first, validate it with real FoxPassport data, then progressively add analytics, 3D, realtime functionality, AI, and investor intelligence.
