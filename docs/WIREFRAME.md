# ProTac Security landing page: wireframe

Written before any code. The structure follows the Cybal template section for section. Each template slot is reassigned to a job this business needs done.

## The business and the page's one job

- **Who:** ProTac Security (Protac Inc.), a licensed California Private Patrol Operator in Santa Maria.
- **Who buys:** construction project managers, farm and ranch operators, HOA and property managers, event organizers, facility managers. Usually one person with a specific site, a date and a worry.
- **The job:** get that person to call (805) 938-9100 or send a site request.
- **What stands in the way, and where the page answers it:**

| Objection | Answered in |
| --- | --- |
| Are they licensed and legitimate? | Counter strip, Why ProTac, FAQ cards (with a link to check the license) |
| Do they work my kind of site? | Industries grid, CAR and COIN team cards |
| Do they cover my town? | Coverage map, FAQ cards, footer |
| Will the guards show up? | BBB reviews (including "never missed a scheduled shift") |
| Who is actually responsible? | Leadership cards |
| What will it cost? | Coverage options: what sets the quote, stated openly |

## Section map

```
+----------------------------------------------------------------+
| NAV   [logo on light plate]   Home About Services Industries   |  Find the page; CTA always visible
|                               Reviews Contact   [Request quote]|  Sticky on scroll
+----------------------------------------------------------------+
| HERO  800px, looping video, dark overlay                       |  State who, what, where in one line
|  H1  Licensed armed and unarmed security                       |
|      for the Central Coast                                     |
|  P   one sentence                                              |
|  [Request a quote]  (o) Call (805) 938-9100                    |  Template's "Video Tour" circle becomes call
+---+--------+--------+--------+--------+------------------------+
    | 2015   | 24/7   | #18072 | A+     |  overlaps hero -100px      Credibility before any scrolling
+---+--------+--------+--------+--------+------------------------+
| ABOUT   [site-plan plate]  | pill, H2                          |  Why a tailored program differs
|                            | [check] Direct executive oversight|
|                            | [check] A program built on your   |
|                            |         site                      |
+----------------------------------------------------------------+
| SERVICES  pill, H2                     [Request a quote]       |  The three most-requested services
|  [guards]        [mobile patrol]       [event security]        |
+----------------------------------------------------------------+
| MARQUEE  gold band, full service list                          |  Scannable service inventory
+----------------------------------------------------------------+
| ALSO    [fire/gate plate]  | pill, H2                          |  Remaining two services
|                            | [check] Fire watch                |
|                            | [check] Access control            |
+----------------------------------------------------------------+
| INDUSTRIES  centered pill, H2                                  |  "Do they do my kind of site?"
|  [agri 3] [construction  6 ] [industrial 3]                    |  Six sectors from their BBB listing
|  [residential 6 ] [healthcare 3] [gov/aero 3]                  |  Each tile pre-selects the form
+----------------------------------------------------------------+
| WHY  pill, H2, paragraph   | [Central Coast coverage map]      |  Proof and reach
|  0        2+ yrs     6     |  five named towns                 |
|  [Request quote] [Call]    |                                   |
+----------------------------------------------------------------+
| COVERAGE OPTIONS  pill, H2  (template's pricing table)         |  Handles the price question honestly
|  [One event]   [Project site]   [Ongoing property]             |  No invented prices: "what we'll ask"
|  each ends "Custom / quote" and a CTA that pre-selects the form|
+----------------------------------------------------------------+
| REVIEWS  pill, H2, 2-up slider with dots                       |  Three real BBB reviews, verbatim
+----------------------------------------------------------------+
| TEAM  pill, H2, P, [button]  | [Bruce T.] [Ben P.]             |  Named accountability
|                              | [COIN]     [CAR]                |  Two people + two named units
+----------------------------------------------------------------+
| CONTACT  card (template's newsletter card)                     |  Conversion point
|  H3, line, name / phone / email / site type / message / send   |
+----------------------------------------------------------------+
| FAQ  centered pill, H2, 3 cards  (template's blog cards)       |  Last objections
|  [Licensed?]   [Which towns?]   [Short notice?]                |
+----------------------------------------------------------------+
| FOOTER  logo + line | Company | Services | Talk to us          |  NAP, license, hours
|  (c) ProTac Security              BBB profile / Check license  |
+----------------------------------------------------------------+
```

CRO note: the template's newsletter becomes the lead form because a security buyer has no use for a newsletter and the template otherwise has no form. Every CTA points to it or to the phone.

## Design tokens

Layout, type scale, spacing and radii come from Cybal's stylesheet (Lexend, 64/74 hero, 800px hero, 80px section padding, 3px buttons, 10px cards, outline numerals).

| Token | Value | Source |
| --- | --- | --- |
| Page | `#14192D` | Cybal |
| Surface | `#1A2237` | Cybal |
| Gold bright (replaces Cybal cyan) | `#E8BC63` | Logo gold lifted for dark backgrounds |
| Gold logo | `#AB7A35` range | Sampled from the logo |
| Button gradient (replaces cyan/pink) | `#C8923C` to `#EBC46F` | Logo gold |
| Teal, only in plates | `#58D3C2` | Hero video glow |

**Logo:** the wordmark is near-black and vanishes on navy. It sits unchanged on a light plate in the header and footer. No recolor.

**Signature:** the template's stock photos are replaced by "patrol plates": line drawings of the actual kinds of sites, each crossed by a dashed patrol route with gold checkpoints. They read as one system, and the coverage map is real information.

## Facts used and where they came from

protacsecurity.com refused automated access (HTTP 403), as did the Wayback copy and the Santa Maria Chamber listing. Facts come from:

**BBB profile** (https://www.bbb.org/us/ca/santa-maria/profile/security/protac-security-1236-92096904): name, alternate name Protac Inc., website, (805) 938-9100, 127 W Clark Ave Ste 215 Santa Maria CA 93455, open 24 hours daily, PPO #18072 (BSIS, expires 11/30/2027), incorporated and started 2015, Bruce Thompson President, service areas, six listed sectors, service descriptions, A+ rating, accredited 7/21/2026, no complaints in 3 years, three customer reviews.

**Alignable profile** (https://www.alignable.com/orcutt-ca/protac-security): founders and background, tailored-program approach, CAR Team, COIN Officers, Residential Community Officers, cannabis/agriculture/rural naming.

## To confirm with the client

Marked `CONFIRM` in `src/_body.html`.

1. Founding year: BBB says 2015, Alignable says 2014. The page uses 2015.
2. Mention of the late Sonny Brasile in the founders' line: needs family/company approval.
3. Naming System of a Down and Linkin Park in Bruce Thompson's background.
4. Name on the Heart and Sugar review (BBB displays a truncated name).
5. Lead email for the static form. No address is published.
6. Real photos and headshots to replace the plates and monograms.
7. Terms, privacy and cookie pages. None exist in this build, so the template's links became BBB and license links.

## Version 2: interactive redesign

Section rhythm, top to bottom: full-bleed video hero; stepped stat tiles; About split with an expanding list (van photo pending); Services as vertical tabs and an animated stage; gold ticker; Industries bento; Why with an interactive radar map; How we quote with a drawn timeline and a horizontal selector; Reviews with a side heading and a single large slider; Leadership flip cards and unit cards; Contact split with an info card; FAQ with a sticky heading and accordion; closing call band; footer.

Additional source: BBB customer reviews page (full text, 5-star ratings, dates).

Tokens: navy `#0C1020` to `#2A3556`, logo bronze `#A67D35`, gold gradient to `#F3D78F`, teal `#58D3C2` for live indicators, radar and scan lines only. Chakra Petch, Hanken Grotesk, IBM Plex Mono. Radii 2 to 6px.
## Version 3: interactive tools

Added between existing sections so no two neighbors share a layout: hero site-diagram panel; centered one-question finder after Services; full-width posted-vs-patrol table after Industries; three-column quick check after Why; two-column coverage planner in place of the old quote section; three-step request form with contact panel. The planner counts officer-hours only because ProTac's prices are unknown.