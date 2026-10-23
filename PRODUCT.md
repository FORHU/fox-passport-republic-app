# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, served with equal weight on public surfaces (confirmed 2026-10-22):

- **Citizens**: people planning a wedding, birthday, corporate night, social or other private event. Their job: find a complete event (venue, gear, crew) in a city and date that suits them, see the price, and book it in one go. They can browse without an account; an account is asked for only at booking.
- **Foxers**: suppliers who want bookings. They list a venue, gear, talent or performance once, and Event Foxers bundle those listings into bookable packages. Roles: Event Foxer, Venue Foxer, Gear Foxer, Talent Foxer (code: serviceFoxer), Performer, Organizer, Partner (code: investor). Vocabulary follows [CONTEXT.md](CONTEXT.md).

## Product Purpose

FoxPassport is an event-booking marketplace: the venue, the gear and the crew for any event, in one booking. Success means a Citizen can go from "I'm planning something" to a booked package without stitching suppliers together, and a Foxer gets booked without selling.

## Positioning

Supply is listed once and assembled by Event Foxers into complete event packages (Event Templates). Venue Foxers don't sell standalone experiences; they earn when an Event Foxer selects their venue. Guests book the assembled night, not the parts. Every venue and supplier is ID-checked and reviewed by the team before taking bookings.

## Operating Context

- Booked events carry a QR code for check-in at the door.
- Each attended event adds a stamp to the Citizen's digital FoxPassport (stamps, badges, levels).
- A community layer ("Foxer Republic", beta) exists for signed-in users.
- Public browsing: `/packages` (package results), `/event/:id`, `/search` (Foxers), `/venues/map`, `/earn/<role>` (role docs).

## Capabilities and Constraints

- Next.js App Router web app (`fox-passport-republic-web`) against an Express API; the landing page's live data (events, venues, Foxer total, public Foxers) comes from that API and can be empty or unavailable.
- Light and dark themes are both supported.
- Supplier applications require sign-in; signed-out visitors are sent to sign in first.

## Evidence on Hand

- Live API data only: events (name, category, city/country, images, estimated total), venues with coordinates, verified Foxer count, public Foxer profiles.
- Destination photography with credits in `src/features/landing/journey/data.ts`.
- **Absent, must not be fabricated:** testimonials, customer names, press, partner logos, aggregate booking or revenue numbers. Where live data is missing, a placeholder is allowed only when it is visibly labelled as an example and is not bookable.

## Product Principles

1. Show the assembled night, not a catalogue of parts.
2. Both sides of the market are first-class: booking and supplying are presented with equal weight.
3. Browse first, account later: never put sign-up in front of looking.
4. Honest by default: real data or a labelled example, never an invented claim.

## Accessibility & Inclusion

Respect `prefers-reduced-motion` everywhere (already a convention in the landing code); keyboard focus must stay visible on the dark canvas.
