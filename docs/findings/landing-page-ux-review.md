# Landing Page — UX & Navigation Review

**Status:** Findings only (no code changed)
**Date:** 20 October 2026
**Scope:** The public landing page at `/`, as a signed-out visitor sees it
**Related Documents:**
* [`mobile-ux-consolidation-strategy.md`](./mobile-ux-consolidation-strategy.md)
* [`foxpassport-feature-audit.md`](./foxpassport-feature-audit.md)

---

## 1. Summary

The landing page looks impressive, but it is hard to move around and hard to understand on a first visit. On phones there is no menu at all. The animated globe tour takes about ten screens of scrolling before visitors reach any events. Buttons with the same name go to different pages. Some content says one thing while the buttons say another, for example "no account needed" next to "Create a free account".

**The four problems to fix first:**

1. Phones and tablets have no navigation for signed-out visitors.
2. The globe tour takes ~10 screens of scrolling before the first event appears.
3. "Find events" goes to two different pages, and neither section is labelled clearly.
4. The footer's "Become a Foxer" links send signed-out visitors to pages that need sign-in.

---

## 2. How This Was Reviewed

* We read the code for the landing page and every page it links to. We did not use screenshots.
* We checked three things: **what draws the eye first** (hierarchy), **what looks clickable and where it goes** (affordance), and **how much the page asks visitors to take in** (information density). We also reviewed the **wording**.
* **Not covered yet:** typography and colour, which need screenshots of the rendered page. Brand consistency is also not covered, because the project has no written brand guidelines to check against.

Main files reviewed:

| Part of the page | File |
|---|---|
| Page entry | `src/app/page.tsx` |
| Page layout | `src/features/landing/journey/JourneyLanding.tsx` |
| Header | `src/features/landing/components/sections/LandingHeader.tsx` |
| Mobile bottom bar | `src/shared/components/layout/MobileBottomNav.tsx` |
| Globe tour (hero) | `src/features/landing/journey/JourneyHero.tsx` |
| Tour content | `src/features/landing/journey/data.ts` |
| Search, event grid, event types | `src/features/landing/journey/booking.tsx` |
| How it works, Earn, closing CTA | `src/features/landing/journey/sections.tsx` |
| Footer | `src/features/landing/journey/JourneyFooter.tsx` |
| First-visit guide | `src/features/onboarding/components/WelcomeGuide.tsx` |

---

## 3. What Is on the Page Today

In the order a visitor meets it:

1. **Welcome guide** (first visit only): a 6-slide pop-up that blocks the page until it is closed.
2. **Header:** logo, two tabs ("Booking", "How It Works"; desktop only), and "Sign In".
3. **Globe tour (hero):** headline "Book the night, anywhere.", a search bar (What / Where / When), and a disabled "Install the app" button. Scrolling then flies a plane through 5 cities. Each city card presents one part of the product.
4. **"Open for booking":** up to 5 event cards and a "See all events" card.
5. **"What are you planning?":** 5 event-type cards (Wedding, Birthday, Corporate, Social, Other).
6. **"How it works":** 4 steps.
7. **Earn block:** "List your venue, gear or services…" with 7 role cards.
8. **Closing call to action:** "Book your first event." and "Create a free account".
9. **Footer:** Discover / Become a Foxer / Fine print links.

---

## 4. Problems and Recommended Fixes

Priority levels:

* **P1:** Breaks navigation or sends people to the wrong place. Fix first.
* **P2:** Confusing or misleading. Fix soon.
* **P3:** Polish.

### P1 — Breaks navigation

#### 1. No navigation on phones and tablets for signed-out visitors

> **✅ Fixed** on `fix/landing-platform`. Signed-out visitors on small screens now get a menu button in the header, which opens a side panel with the landing links and "Sign In".

* **What's wrong:** Below 1024px wide, signed-out visitors see only the logo and "Sign In". There is no menu.
* **Where:** The header tabs only show on large screens ([LandingHeader.tsx:86](../../src/features/landing/components/sections/LandingHeader.tsx#L86), `hidden lg:flex`). The mobile bottom bar hides itself for signed-out users ([MobileBottomNav.tsx:21](../../src/shared/components/layout/MobileBottomNav.tsx#L21)).
* **Why it matters:** Most first-time visitors arrive on a phone. Their only way around is to scroll, through a very long page (see #2).
* **Recommended fix:** Add a small mobile menu, such as a menu button in the header, with the same links as the desktop tabs (see #11).

#### 2. About 10 screens of scrolling before the first event

> **✅ Fixed** on `fix/landing-platform`. The tour now takes about 6 screens of scrolling (`VH_PER_STOP` 200 → 130). "Skip to events ↓" shows on the first screen. The floating "Find events" goes to `/packages`, which has its own search bar.

* **What's wrong:** The globe tour is 1,050% of the screen height (5 cities × 200% + 50%). The search bar fades away almost as soon as scrolling starts. The "Skip to events" button only appears after the visitor has started scrolling.
* **Where:** [JourneyHero.tsx:53](../../src/features/landing/journey/JourneyHero.tsx#L53) (`VH_PER_STOP = 200`), [:2247](../../src/features/landing/journey/JourneyHero.tsx#L2247) (section height), [:2143](../../src/features/landing/journey/JourneyHero.tsx#L2143) (search fades out), [:2240](../../src/features/landing/journey/JourneyHero.tsx#L2240) (skip button fades in).
* **Why it matters:** Visitors who came to find an event have to sit through a long animation first. Many will leave before they reach the events.
* **Recommended fix:**
  * Make the tour shorter, with less scroll per city or fewer cities.
  * Show "Skip to events" on the first screen.
  * Keep the search reachable throughout the tour.

#### 3. "Find events" goes to two different places

> **✅ Fixed** on `fix/landing-platform`. Every "find / see / browse events" link now goes to `/packages`: the hero search, the floating button, "See all events", the event-type cards, the closing "Find an event" buttons and both footers. The links that still go to `/search` are labelled "Find Foxers", or are about Foxers (header "Foxers" tab, Foxer feature cards). The empty state's "Search events" became "Find Foxers", because with no events, `/packages` would be empty too. The table below shows the problem as it was found.

* **What's wrong:** Buttons that sound the same lead to different pages:

  | Button | Goes to | What that page is |
  |---|---|---|
  | Hero search "Find events" | `/packages` | Event packages with prices |
  | Floating "Find events" (during the tour) | `/search` | The Foxer directory (Event Foxers, Events, Gear, Services) |
  | "See all events" / "Search events" | `/search` | The Foxer directory |
  | "See packages →" (tour cards) | `/packages` | Event packages |

* **Where:** [booking.tsx:352](../../src/features/landing/journey/booking.tsx#L352), [JourneyHero.tsx:2421](../../src/features/landing/journey/JourneyHero.tsx#L2421), [booking.tsx:571](../../src/features/landing/journey/booking.tsx#L571), [booking.tsx:587](../../src/features/landing/journey/booking.tsx#L587). The signed-in nav itself calls `/search` "Foxers" ([LandingHeader.tsx:35](../../src/features/landing/components/sections/LandingHeader.tsx#L35)).
* **Why it matters:** Visitors can't predict where a button will take them, and pressing "Find events" twice can land them on two different pages.
* **Recommended fix:** Pick one public page for finding events, most likely `/packages`, since it is open to everyone. Point every "Find events" or "See all events" button there. Label links to `/search` as "Find Foxers".

#### 4. Footer "Become a Foxer" links bounce signed-out visitors

> **✅ Fixed** on `fix/landing-platform`. The landing footer now links to "See the roles" (`#earn`), "Event Foxer" (`/earn/event`) and "Venue Foxer" (`/earn/venue`). "Other roles" was removed, because both "See the roles" and the role docs list every role. The shared footer (`LandingFooter`, used on `/packages`, `/earn`, `/privacy`, `/terms` and `/data-deletion`) had the same bug: its "Become a Foxer" went to `/onboarding`. It now goes to `/earn/event`.

* **What's wrong:** All four links under "Become a Foxer" go to pages that require sign-in. Signed-out visitors are redirected away.
* **Where:** [JourneyFooter.tsx:14-21](../../src/features/landing/journey/JourneyFooter.tsx#L14-L21). The linked pages all call `requireAuth()`: `/onboarding`, `/venue-foxer/apply`, `/creator-dashboard/apply`, `/foxer/apply`.
* **Why it matters:** People who want to list a business click, get bounced, and don't know why. The Earn block on the same page already had this bug and was fixed to use the public role pages ([sections.tsx:111-116](../../src/features/landing/journey/sections.tsx#L111-L116)). The footer was missed.
* **Recommended fix:** Point the footer links to the public `/earn/<role>` pages, the same ones the Earn block uses.

### P2 — Confusing or misleading

#### 5. Tour cards pair a city with an unrelated topic

> **✅ Fixed** on `fix/landing-platform`. Each card now reads "Step N of 5", then the step as its headline (e.g. "Book people you can trust"), with the city as a small label ("Paris · France"). The progress rail shows on every screen size once the tour starts: step names on extra-large screens, a row of 5 dots on smaller ones.

* **What's wrong:** Each tour card's big title is a city ("Paris, France"), but the card is actually about a product step ("Book people you can trust"). The progress bar along the bottom lists only city names, and only on extra-large screens.
* **Where:** [JourneyHero.tsx:1623](../../src/features/landing/journey/JourneyHero.tsx#L1623) (city as headline), [:1725](../../src/features/landing/journey/JourneyHero.tsx#L1725) (`xl:flex` rail), [data.ts:344](../../src/features/landing/journey/data.ts#L344) (city/topic pairs).
* **Why it matters:** Visitors may think features are tied to a city, for example that QR check-in is a Manila thing. They also can't tell how far through the explanation they are.
* **Recommended fix:** Lead each card with the step, such as "Step 2 of 5 · Book people you can trust", and show the city as a small label. Use step names in the progress bar and show it on all screen sizes.

#### 6. Feature cards look like links to the feature, but aren't

> **✅ Fixed** on `fix/landing-platform`. 9 cards stay links, to pages that show the feature:
> * packages (4 cards)
> * the venue map
> * the Foxer directory, unfiltered for "Verified Foxers", and filtered for "Gear" and "Talent"
> * Foxer Republic
>
> The other 11 are now plain info tiles with no link or hover effect. Each stop still has its "See packages" button.

* **What's wrong:** Each city has 4 feature cards, 20 in total. They look clickable and are named after a specific feature, but 13 go to `/packages` and 5 go to `/search`. For example, "QR check-in", "Passport stamps", "Reviews" and "Cancellation policy" all open the packages page.
* **Where:** The `href` values in [data.ts](../../src/features/landing/journey/data.ts#L344) (lines 344–630).
* **Why it matters:** A visitor who clicks "Reviews" expects to see reviews. Landing on a list of packages instead feels broken.
* **Recommended fix:** Either turn them into plain information tiles that aren't links, or link each one to a page that actually shows that feature.

#### 7. Mixed messages about needing an account

* **What's wrong:** The tour tells visitors "You only need an account when you book" and "See package prices before you sign up". The tour's final panel and the closing section then both lead with "Create a free account".
* **Where:** [data.ts:368](../../src/features/landing/journey/data.ts#L368), [data.ts:467](../../src/features/landing/journey/data.ts#L467), [JourneyHero.tsx:2390](../../src/features/landing/journey/JourneyHero.tsx#L2390), [sections.tsx:227](../../src/features/landing/journey/sections.tsx#L227).
* **Why it matters:** It contradicts the main promise (browse freely, sign up later) and asks for commitment before the visitor has seen anything.
* **Recommended fix:** Make the main button "Browse packages" and keep "Create a free account" as a smaller secondary option.

#### 8. Two event sections show nearly the same thing

> **Related change** on `fix/landing-ux-review`. When nothing is open to book, "Open for booking" now shows 5 example cards instead of an empty message. There is one per event type, dashed and faded, with an "Example" badge, and they aren't links. A sixth card reads "Plan it with a Foxer". Real events replace the examples as soon as there are any. A load error still shows its message. The duplication described below is still open.

* **What's wrong:** "Open for booking" shows one event per type. "What are you planning?" also shows one featured event per type, so the two often show the same events. Event-type cards also have two problems:
  * The card says "Wedding · 3 events" but opens a single event, not the list of weddings.
  * The count is taken from only the 40 events loaded for the page, so it can be lower than the real number.
* **Where:** [booking.tsx:455](../../src/features/landing/journey/booking.tsx#L455) (`oneOfEachKind`), [booking.tsx:473](../../src/features/landing/journey/booking.tsx#L473) (`featuredEventForKind`), [booking.tsx:614](../../src/features/landing/journey/booking.tsx#L614) (counts from 40 events), [booking.tsx:640-642](../../src/features/landing/journey/booking.tsx#L640-L642) (card link).
* **Why it matters:** Repeated content makes the page longer without adding anything, and the type cards don't do what their label suggests.
* **Recommended fix:** Merge the two sections. Or keep them separate, but make each type card open that type's results ("Browse weddings →") and drop the count, or use a real one.

#### 9. The page promises event types the search doesn't offer

* **What's wrong:** The hero text and the page description say "Concerts, weddings, festivals and private events", but the search only offers Wedding, Birthday, Corporate, Social and Other.
* **Where:** [JourneyHero.tsx:2342](../../src/features/landing/journey/JourneyHero.tsx#L2342), [JourneyHero.tsx:2081](../../src/features/landing/journey/JourneyHero.tsx#L2081), [page.tsx:7](../../src/app/page.tsx#L7), [booking.tsx:18](../../src/features/landing/journey/booking.tsx#L18).
* **Why it matters:** Visitors looking for a concert or festival find no matching option.
* **Recommended fix:** Change the copy to the five types that exist, or add the missing types.

#### 10. Unexplained words: "Foxer", "Republic" and others

* **What's wrong:** The page uses "Foxer", "Event Foxer", "Verified Foxers", "Foxer Republic", "Republic feed", "Partner" and "Beta Community" without ever saying what they mean. Only the first-visit pop-up explains "Foxer", and many visitors skip it.
* **Where:** Throughout the page, for example [data.ts:413](../../src/features/landing/journey/data.ts#L413), [sections.tsx:138](../../src/features/landing/journey/sections.tsx#L138), [JourneyFooter.tsx:10-14](../../src/features/landing/journey/JourneyFooter.tsx#L10-L14).
* **Why it matters:** New visitors have to guess what a Foxer is. That is the platform's core idea.
* **Recommended fix:** Add a one-line definition the first time the word appears, for example "Foxers are the verified venues, suppliers and performers you book." Use plain words ("community feed") where the brand term isn't needed.

#### 11. Desktop menu is short and vague

> **✅ Fixed** on `fix/landing-platform`. Both menus now show "Find events · How it works · List your business".

* **What's wrong:** Signed-out visitors see only two tabs: "Booking" and "How It Works". "Booking" sounds like "my bookings". There is no link to packages or to the "List your business" (Earn) section, even though the page has an `#earn` section.
* **Where:** [LandingHeader.tsx:29-32](../../src/features/landing/components/sections/LandingHeader.tsx#L29-L32).
* **Why it matters:** The menu doesn't reflect what visitors come for: finding an event, or listing their business.
* **Recommended fix:** Use "Find events · How it works · List your business". Use the same links in the new mobile menu (#1).

#### 12. The first-visit pop-up blocks the page

* **What's wrong:** First-time visitors get a 6-slide pop-up that stops the page from scrolling until it is closed. Most of it, such as stamps, the Republic and Foxers, repeats what the tour shows right behind it.
* **Where:** [WelcomeGuide.tsx:20-64](../../src/features/onboarding/components/WelcomeGuide.tsx#L20-L64) (slides), [WelcomeGuide.tsx:119](../../src/features/onboarding/components/WelcomeGuide.tsx#L119) (scroll lock).
* **Why it matters:** It is the first thing visitors see, and it stands between them and the page they came for.
* **Recommended fix:** Cut it to one or two slides, show it after the visitor has looked around, or remove it, since the tour already explains the product.

#### 13. A disabled "Install the app" button sits under the main search

* **What's wrong:** Directly under the hero search is an "Install the app" button that can't be pressed, marked "Coming soon".
* **Where:** [InstallAppButton.tsx](../../src/features/landing/journey/InstallAppButton.tsx), placed at [JourneyHero.tsx:2350](../../src/features/landing/journey/JourneyHero.tsx#L2350).
* **Why it matters:** The most valuable spot on the page goes to something visitors can't use, and it pulls attention away from the search.
* **Recommended fix:** Hide it until the app is available, or move it to the footer.

### P3 — Polish

| # | Issue | Where | Fix |
|---|---|---|---|
| 14 | On phones, the feature cards inside each tour card scroll sideways, inside a page that scrolls the tour vertically. The gestures fight each other. | [JourneyHero.tsx:1639](../../src/features/landing/journey/JourneyHero.tsx#L1639) | Stack them, or show only 2. |
| 15 | Small text adds noise: the photo credit under every tour card, and the "NASA VIIRS night lights" badge. Unsplash doesn't require credit. | [data.ts:316-320](../../src/features/landing/journey/data.ts#L316-L320), [JourneyHero.tsx:2266](../../src/features/landing/journey/JourneyHero.tsx#L2266) | Move credits to one line in the footer. |
| 16 | The Earn block lists 7 roles at the same size, so it's hard to find "mine". | [sections.tsx:167](../../src/features/landing/journey/sections.tsx#L167), [data.ts:678](../../src/features/landing/journey/data.ts#L678) | Group them, e.g. "Supply an event" (venue, gear, talent, performer) and "Run or back events" (event, organizer, partner). |
| 17 | The hero has two different intro paragraphs (one for mobile, one for desktop). The header logo is a heading (`<h2>`) that comes before the page's main heading. | [JourneyHero.tsx:2338-2348](../../src/features/landing/journey/JourneyHero.tsx#L2338-L2348), [LandingHeader.tsx:78](../../src/features/landing/components/sections/LandingHeader.tsx#L78) | Use one paragraph. Make the logo text plain text, not a heading. |

---

## 5. Quick Wins (wording and links only)

These need no design work:

* Point the footer "Become a Foxer" links to `/earn/<role>` (#4).
* Send every "Find events" / "See all events" button to the same page (#3).
* Rename the header tab "Booking" to "Find events" and add "List your business" (#11).
* Change "Concerts, weddings, festivals…" to the event types that exist (#9).
* Swap the closing buttons so "Browse packages" comes first and "Create a free account" second (#7).
* Add a one-line "What is a Foxer?" definition (#10).
* Hide the disabled "Install the app" button (#13).

---

## 6. Not Covered Yet / Next Steps

* **Screenshots:** take phone and desktop screenshots of the running page and review typography and colour (contrast, text size).
* **Real-device test:** scroll the tour on an actual phone to judge the length and the gestures in #2 and #14.
* **Brand check:** if brand guidelines are written down later, check the page against them.
* **Pick fixes:** decide which recommendations to take, then plan the code changes separately.
