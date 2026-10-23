---
name: FoxPassport Landing
description: The drawings for one night. A dark night canvas, Archivo display, Space Mono title blocks and one lime signal, extended below the hero into an event floor plan.
colors:
  accent: "#ccff00"
  accent-hover: "#b8e600"
  accent-text: "#ccff00"
  accent-text-light: "#4d7c0f"
  on-accent: "#000000"
  canvas: "#02040a"
  canvas-light: "#f4f5f9"
  surface: "#0f111a"
  surface-light: "#ffffff"
  ink: "#ffffff"
  ink-light: "#0e1018"
  stamp-red: "#ff6b5e"
  stamp-red-light: "#b3261e"
  stamp-blue: "#86a8ff"
  stamp-blue-light: "#1f3a8a"
  chart-line: "rgb(145 174 204 / 0.065)"
  chart-line-light: "rgb(53 78 101 / 0.07)"
  chart-dot: "rgb(145 174 204 / 0.11)"
  chart-dot-light: "rgb(53 78 101 / 0.12)"
typography:
  display:
    fontFamily: "Archivo, var(--font-display), system-ui, sans-serif"
    fontSize: "3.4rem"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, var(--font-display), system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo, var(--font-display), system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.333
    letterSpacing: "0.12em"
  action:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
rounded:
  zone: "3px"
  sheet: "18px"
  full: "9999px"
spacing:
  gutter-sm: "20px"
  gutter: "40px"
  section-sm: "64px"
  section: "96px"
  grid-gap: "16px"
  head-rule: "24px"
  cell-y: "10px"
  cell-x: "16px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.action}"
    rounded: "{rounded.full}"
    padding: "12px 20px 12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.on-accent}"
  action-panel:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sheet}"
    padding: "20px 24px"
  action-panel-hover:
    backgroundColor: "{colors.accent-hover}"
  event-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
  title-block-cell:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "10px 16px"
  sheet-book-bar:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.action}"
    padding: "10px 16px"
  zone-marker:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    size: "28px"
---

# Design System: FoxPassport Landing

Scope: the public landing at `/` (`src/features/landing/journey/`) and the signed-in bookings list at `/booking` (`src/features/booking/components/BookingListClient.tsx` and `bookings/`). The hero (`JourneyHero.tsx`) is the incumbent world; the sections under it extend that world as a set of production drawings, and `/booking` extends it again as the visitor's own schedule: a month strip over an agenda. The rest of the app shares the theme tokens but has its own legacy palette in `tailwind.config.ts` and is not described here.

## Overview

**Creative North Star: "The Drawings for One Night"**

The landing is a night canvas that reads as a drawing set. The hero shows the night itself: a dark field, a turning globe, Archivo set huge and uppercase, and one lime word. Everything below the hero is the paperwork for that night, drawn the way a production designer would draw it. Events are plan sheets with numbered title blocks (E-01 to E-05). The kinds of event are the sheet index and point back to those numbers. How a night is assembled is a floor plan on drafting paper, with five dashed zones and lime numbered markers. The people who supply it are a schedule of trades, and the footer is the set's last title block.

Density is architectural rather than decorative. Structure comes from linework: hairlines at 15% ink, 2px rules under section titles, 3px walls, 1.5px dashed zone boundaries. There are no gradients, no glows and no stacked shadows below the hero. Colour is nearly absent: ink on canvas, with lime used only as the signal for "this is bookable" and "do this next", and the two stamp inks used only as drafting colours on the plan.

The world is theme-agnostic by construction. Light mode swaps Tailwind's white and black (ink becomes `#0e1018`, paper becomes `#ffffff`), so every `text-white` and `border-white/15` on the landing turns into dark-on-light drafting paper without per-component overrides. The stamp inks and the lime text colour carry their own light values.

**Key Characteristics:**
- Ink on a near-black canvas; one lime signal; two drafting inks (stamp blue, stamp red) on the plan only.
- Archivo 900 uppercase for every drawing title, Space Mono bold uppercase for every annotation.
- Linework, not elevation: hairlines, heavy rules, walls and dashed zones.
- Sheets, title blocks, sheet numbers and cross-references link sections into one set.
- One motion signature per section at most, always skipped under reduced motion.

## Colors

A near-monochrome night palette with one acid-lime signal and two drafting inks.

### Primary
- **Signal Lime** (`accent`): the single action colour. Fills every primary action on the landing (the pill CTA, each sheet's Book bar, the "See all events" sheet, the "Book the whole plan" panel, the zone markers) and the text selection. Always carries black text (`on-accent`); in light mode a rule in `globals.css` pins black text on lime fills so the theme swap cannot turn it white.
- **Pressed Lime** (`accent-hover`): the hover and pressed shade of every lime fill. Same value in both themes.
- **Lime Text** (`accent-text`, `accent-text-light`): lime used as type, for the one highlighted word in each display heading ("bookable", "whole night", "first event", hero "night"), sheet numbers, the "Example" tag, general-notes markers, the Foxer count and focus outlines. In light mode it darkens to a legible olive, because bright lime on white fails contrast.

### Secondary
- **Stamp Blue** (`stamp-blue`, `stamp-blue-light`): drafting ink for supplier zones on the floor plan (Bar & kitchen, Sound & lights): their dashed outlines and their trade label in the legend.

### Tertiary
- **Stamp Red** (`stamp-red`, `stamp-red-light`): drafting ink for the stage, the one hatched zone on the plan. Red marks the performance area only.

### Neutral
- **Night Canvas** (`canvas`, `canvas-light`): the page. Also used to cut the doorway out of the plan's wall and as the empty photo well of a sheet.
- **Sheet Surface** (`surface`, `surface-light`): event and example sheets, and the hero's floating pickers.
- **Ink** (`ink`, `ink-light`): all type and linework, applied at fixed opacities: 100% for titles and heavy rules, 75% for body copy and title-block data, 70% for secondary lines and arrows, 60% for column heads, 55% for the plan's room outline and chairs and for "Price on request", 15% for hairlines, 6% and 3% for row hover and active fills.
- **Drafting Grid** (`chart-line`, `chart-dot`, and their `-light` pair): the two inks of the floor-plan paper. Both are slate-blue at a few percent opacity, so the grid reads as paper texture and never as content.

### Named Rules
**The One Signal Rule.** Lime means bookable or next. It fills actions and marks the single most important word or number in a block; it is never a background wash, a border colour at rest or a decorative tint. The one exception is a sheet's border, which turns lime on hover to show the whole sheet is the link.

**The Drafting Ink Rule.** Stamp blue and stamp red are drawing inks, used only for plan linework and the trade labels that key to it. They never fill a button, colour body text or appear outside a drawing.

**The Booking Ink Extension.** On `/booking` the same two inks mark status: stamp blue writes a completed booking's status and its marks on the month strip, and stamp red writes the status of a closed booking (Cancelled, Refunded, Refund Failed) and its Cancel action. Amber (`amber-700`, `amber-400` in dark) is the single warning ink, for a disputed booking or one whose date passed unpaid. Still never a button fill or body copy.

## Typography

**Display Font:** Archivo (weight 900, uppercase, -0.035em tracking), falling back to Space Grotesk, then system-ui
**Body Font:** Plus Jakarta Sans
**Label/Mono Font:** Space Mono (400 and 700)
**Action Font:** Space Grotesk, applied app-wide to bold and extrabold text by a base-layer rule

**Character:** A compressed, very heavy grotesk shouting drawing titles over a typewriter mono doing the annotation, with a soft humanist sans carrying the sentences in between. The display face is always uppercase and always tight; the mono is always uppercase and always tracked out.

### Hierarchy
- **Display** (Archivo 900, 3.4rem, then 4.5rem at sm and 6.2rem at lg, line-height 0.9): the hero headline only. It stays the biggest line on the page; the closing title is deliberately smaller.
- **Headline** (Archivo 900, 2.25rem, then 3.75rem at sm, line-height 0.92): section titles set at left, above a 2px ink rule, with a one-line description at right on wide screens. The earn block steps to 3rem at sm; the closing title block starts at 3rem with line-height 0.9.
- **Title** (Archivo 900, 1.5rem, line-height 0.95): an event sheet's name, the sub-heads "General notes" and "Schedule of trades", and the footer wordmark (1.875rem). The lead sheet's name rises to 1.875rem then 2.25rem; the kind index rows run 1.875rem, 2.25rem and 3rem; legend names and trade names drop to 1.125rem and 1.25rem.
- **Body** (Plus Jakarta Sans 400, 0.875rem rising to 1rem at sm, line-height 1.625): section descriptions and notes, capped at `max-w-md` (28rem). Legend and trade lines use 0.875rem at line-height 1.375.
- **Label** (Space Mono 700, 0.75rem, letter-spacing 0.12em, uppercase): title-block data (kind, city, price), sheet numbers, trade names on the plan, schedule column heads, footer column heads and the copyright line. Hero search field labels track wider (0.16em); the hero's own micro-labels run 10px to 11px.

### Named Rules
**The Drawing Title Rule.** Every heading in the landing world is Archivo 900 uppercase via `.font-landing-display`. Body copy is never set in it, and headings are never set in the body face.

**The Annotation Rule.** Any fact that would be written in a drawing's margin (a sheet number, a kind, a city, a price, a trade, a zone reference) is Space Mono bold uppercase at 0.75rem with 0.12em tracking. Prices use tabular figures.

## Layout

A single centred column of drawings. Every section caps at `max-w-6xl` (1152px), with side gutters of 20px rising to 40px at sm, and vertical padding of 64px rising to 96px at sm. Sections are separated by space or by a 2px ink rule along the top edge (the earn block), never by alternating background colours; only the floor plan changes the paper, to the drafting grid.

Section heads use a two-part grid: the title at left and a 22rem description rail at right from lg, aligned to the bottom and closed by a 2px ink rule with 24px below the text. The same 22rem rail is reused as the floor plan's legend column and the closing title block's action column, so the right edge of the set lines up section to section.

Event sheets sit in a grid of 1, then 2 (sm), then 3 (lg) columns with 16px gaps. The first sheet is a lead sheet that spans 2 columns and, at lg, 2 rows; the lime "See all events" sheet always closes the grid.

The floor plan is drawn twice and swapped at md: a 16:10 plan on wide screens and a 4:5 plan on phones, with every zone placed in percentages so it scales with its box. The legend follows the plan on phones and sits beside it from lg. The general notes run in 1 column, then 2 at md. The schedule of trades shows its column heads only from sm (11rem trade, flexible description, 7rem plan reference, 1.5rem arrow); below that, each row collapses to name over description with the arrow at right.

The drafting grid is a 24px minor square with a heavier 120px major square (every fifth line), 1px lines throughout.

## Elevation & Depth

The drawings are flat. Below the hero, nothing casts a shadow; depth and grouping come from linework and from the surface/canvas step (a sheet is `surface` on `canvas`). Hierarchy of line weight replaces elevation: 1px hairlines at 15% ink divide cells and rows, 2px full-ink rules close section heads and frame the closing title block, 3px full-ink walls bound the floor plan, and 1.5px dashed lines bound its zones. The only shadows in the landing world belong to the hero's floating layers (search bar, pickers, globe callouts), which genuinely float over a moving globe.

### Named Rules
**The Linework Rule.** A drawing never lifts off the page. If something needs separating, give it a line of the right weight, not a shadow.

**The Dashed Is Drawn Rule.** A dashed line marks something drawn but not yet real: a plan zone at rest, or an example sheet that cannot be booked. A zone turns solid when it is active, and a real event sheet is always solid.

## Shapes

Gently rounded sheets on a square drafting grid. Sheets, panels, the closing title block and the footer all share one corner (18px, `rounded-2xl`), with `overflow-hidden` so title-block hairlines run cleanly to the edge. Primary CTAs that stand alone are full pills; actions that are part of a sheet (the Book bar, the closing action cell) take the sheet's shape and stay square-edged inside it. Plan zones use a nearly square 3px corner so they read as architectural rooms. Zone markers and the plan's chairs are circles. Stage hatching is a 135-degree repeating line, 1px stroke on a 9px pitch, at 22% of the zone's ink.

## Components

### Buttons
Few, loud and lime.
- **Shape:** full pill (9999px) for standalone CTAs; sheet-shaped (18px) for the large action panels.
- **Primary:** lime fill, black text in the action face, 12px top and bottom, 24px left, 20px right, followed by a forward arrow that shifts 2px right on hover.
- **Hover / Focus:** fill steps to Pressed Lime with a colour transition; focus shows a 2px Lime Text outline offset 2px, set once for every link, button and select on the landing.
- **Action panel:** the "Book the whole plan" panel and the "See all events" sheet are lime blocks with a large display line, padded 20px by 24px (24px all round for the sheet), with the arrow at the trailing edge.

### Cards / Containers: the event sheet
A drawing sheet: the photo is the drawing, the title block is the sheet's data.
- **Corner Style:** 18px, clipped.
- **Background:** Sheet Surface, with the photo well on Night Canvas at 4:3 (the lead sheet's photo grows to fill from lg, at least 20rem tall).
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px ink at 15%, turning Lime Text on hover; the photo scales to 1.03 over 700ms.
- **Title block:** a two-column grid of hairline cells, each padded 10px by 16px. Row one: sheet number in Lime Text followed by the kind, then the city. Row two: the event name across both columns in the Title style. Row three: the from-price (tabular) or "Price on request" at 55% ink, then a lime Book bar.
- **Example sheet:** the same frame with a dashed 30% border, the photo at 60% opacity and 35% grayscale, "Example" in Lime Text where the city goes, "Not bookable yet" where the price goes, no Book bar and no link.

### Navigation: indexes and schedules
Lists in this world are drawing indexes, not card rows.
- **Style:** full-width rows between 15% hairlines, a large display name at left, a one-line description, a mono cross-reference, and a trailing arrow at 70% ink.
- **States:** row hover adds a 3% ink wash and turns the display name Lime Text; the arrow nudges 2px right.
- **Kind index:** each kind links to its results and, when a live sheet of that kind exists, adds "Open now, see sheet E-0n" with the number in Lime Text.
- **Schedule of trades:** columns Trade, Supplies, On the plan; the plan column references zones by number ("1 · Room").
- **Footer:** the set's last title block: cells separated by 1px gaps over a 15% ink ground (so the gaps read as hairlines), mono column heads, links at 75% ink that turn full ink and underline on hover.

### Floor Plan (signature component)
How a night is assembled, drawn as one plan on drafting paper.
- **Walls:** a 3px full-ink border with a canvas-coloured cut for the doorway on the right wall. On first reveal the walls draw in from the top-left corner with a clip-path over 1.2s on `cubic-bezier(0.16, 1, 0.3, 1)`, once; under reduced motion they appear already drawn.
- **Zones:** five rooms placed in percentages, each with a 1.5px dashed outline in its ink (room at 55% ink, bar and sound in stamp blue, stage in stamp red with hatching, door in Lime Text), a display-face label at bottom left and, from lg, the supplying trade in mono beneath it.
- **Markers:** a lime circle with the zone number in black Space Mono bold, 20px on phones and 28px from md on the plan, 28px in the legend.
- **Linked highlight:** hovering or focusing a legend row, or hovering a zone, makes that zone solid with a 16% wash of its ink and dims the other zones to 35% opacity over 300ms; the legend row gets a 6% ink wash. The plan itself is `aria-hidden`; the legend carries the same links for keyboard and assistive tech.
- **General notes:** a numbered mono list under a hairline, markers in bold Lime Text, each note led by its title in full ink.

### Bookings: month strip and agenda
`/booking` draws one visitor's bookings, using only what the list endpoints return (no images). Mine and Received ("My bookings" / "For my events") share the same form; Received adds "Booked by" to each row and drops Cancel and review.

**The Readable Agenda Rule.** Archivo uppercase is for the page title, the month name and section heads only. Booking names, facts, statuses and actions are sentence case in the body and action faces, because people scan them; Space Mono is kept for numbers (dates, totals, page numbers).

- **Title block:** the page title in Archivo at display scale with one lime word, a 22rem right rail holding the two-cell tab switch (active cell at 6% ink with Lime Text), a plain count ("12 bookings in total") and the lime "Find an event" pill, closed by a 2px full-ink rule. A refetch runs a lime line along that rule.
- **Month panel:** a hairline-bordered panel. Month name in Archivo with the year in mono, a one-line summary ("3 days with bookings. Select one to jump to it."), "This month" when away from it, prev/next. From lg every day is one strip; below lg the same days form a 7-column grid, so nothing scrolls sideways. Booked days are buttons on a 6% ink fill with up to three status dots; today is a lime disc with black numerals; the chosen day gets a lime inset ring. A key under it names only the dot colours present that month, and says which page the marks come from when there is more than one.
- **Signature interaction:** choosing a booked day scrolls the agenda to that day's first booking, moves focus to it, and washes its rows at 6% ink for about 1.6s; reduced motion jumps instead of scrolling. The page's only motion.
- **Agenda:** three sections (Needs attention, Coming up soonest first, Past most recent first), each under a drawing-title head with its count. Rows sit between hairlines: weekday, the day as a large mono numeral (amber when past-due unpaid) and month; the booking name bold as its link; a line of kind, city and guests; then the status tag and the total. Past-due rows add one plain sentence saying it will be cancelled automatically.
- **One main action per row:** a lime "Leave a review" pill when a review is owed, otherwise an outlined "View booking" pill; "View booking" drops to a text link beside the review pill. "Cancel booking" is a stamp-red text button, apart from both.
- **Status tag:** a dot in the status ink and the word in sentence case. One ink per meaning: Lime Text for confirmed or active, ink at 70% for pending, amber for disputed or past-due unpaid, stamp red for cancelled or refunded, stamp blue for completed. The month strip's dots use the same inks.
- **Paging:** "Page 1 of 3" at left and mono page numbers at right under a 2px rule, the current number in Lime Text underlined.

## Do's and Don'ts

### Do:
- **Do** set every heading in `.font-landing-display` (Archivo 900, uppercase, -0.035em) and highlight at most one word per heading in Lime Text.
- **Do** write annotations (sheet numbers, kinds, cities, prices, trades, column heads) in Space Mono bold uppercase at 0.75rem with 0.12em tracking.
- **Do** separate with linework: 15% ink hairlines for cells and rows, a 2px full-ink rule under a section head, 3px for walls.
- **Do** give every lime fill black text, and use `accent-text` (never `accent`) when lime is the type colour, so light mode stays legible.
- **Do** number things that cross-reference (E-01 to E-05, zones 1 to 5) and point back to those numbers from indexes and schedules.
- **Do** mark anything not bookable with a dashed border and a visible "Example" label, and keep it unlinked.
- **Do** run drawing motion once, on `cubic-bezier(0.16, 1, 0.3, 1)`, and skip it under `prefers-reduced-motion`.
- **Do** keep the 22rem right rail aligned across section heads, the plan legend and the closing title block.

### Don't:
- **Don't** add shadows, glows or gradients to anything below the hero; the drawings are flat.
- **Don't** use stamp blue or stamp red outside the floor plan's linework, the trade labels keyed to it, and the Booking Ink Extension on `/booking`.
- **Don't** use lime as a background wash, a resting border or a decorative tint.
- **Don't** repeat a heading-plus-row-of-equal-cards block per section; each section takes the drawing form that fits it (sheet grid, index, plan, schedule, title block).
- **Don't** hard-code white or black on landing surfaces outside photo overlays; use ink opacities so the theme swap keeps working.
- **Don't** make the closing or any section heading larger than the hero headline.
