# E1evnn.com Production Development Guide

This repository is the master production source for **e1evnn.com**, representing
E1evnn and **11S IINFINITY LLC**.

The site is a responsive, static, one-page website. It has no application
framework, build step, database, server-side code, or CMS. Production behavior is
implemented with semantic HTML, CSS, browser-native JavaScript, Spotify's iFrame
API, and `mailto:` links.

## 1. Current Website Features

### Brand and presentation

- Dark, editorial visual system built around E1evnn's artist and studio identity.
- Responsive one-page layout with desktop, tablet, and mobile breakpoints.
- Sticky navigation linking to About, Music, Services, Licensing, and Contact.
- Mobile navigation with an animated menu toggle, body scroll lock, a solid
  body-level blackout backdrop, safe-area padding, a full-screen menu overlay,
  and dynamic viewport sizing for phone browsers.
- Header treatment changes after the visitor scrolls more than 24 pixels.
- Animated hero atmosphere, frequency visualization, and scroll-reveal effects.
- Reduced-motion support through `prefers-reduced-motion`.
- Google Fonts integration using Syne, Manrope, and DM Mono.
- 11S IINFINITY logo and artwork for four featured releases, plus one
  Spotify-only featured release card.

### Accessibility foundations

- Semantic landmarks: header, nav, main, sections, articles, form, and footer.
- Skip-to-content link.
- Section headings connected with `aria-labelledby`.
- Accessible mobile menu state through `aria-expanded`, `aria-controls`, and
  changing button labels.
- Descriptive release artwork alt text and accessible labels for Spotify credit
  links.
- Native `<details>` and `<summary>` controls for catalog, pricing, and policies.
- Form labels, required fields, autocomplete hints, native validation, and a
  polite live status region.
- Fallback behavior that reveals all animated content if `IntersectionObserver`
  is unavailable.

### Page sections

1. **Hero**: Brand statement, disciplines, music CTA, contact CTA, and visual
   identity.
2. **About**: E1evnn biography, 11S IINFINITY mark, and creative disciplines.
3. **Music**: Featured releases, full catalog, production and engineering
   credits, and an official Spotify playlist.
4. **Services**: High-level engineering capabilities, detailed pricing,
   deliverables, client requirements, and policies.
5. **Licensing**: Sync availability, catalog notes, and direct licensing contact.
6. **Contact**: Direct email link and structured project inquiry form.
7. **Footer**: 11S IINFINITY LLC copyright and back-to-top navigation.

### Music content

- Five hand-authored featured release cards:
  - `from me, to you..`
  - `somewhere stuck between death & sleep`
  - `Graceful Severance`
  - `Sanctioned`
  - `Latest Featured Release` using Spotify album ID
    `5iLSCerLEg7W5M2mH4W4ie`
- 20 official catalog entries generated from JavaScript data.
- 25 selected production and engineering credits generated from JavaScript data.
- External links to Spotify, Apple Music, and YouTube where supplied.
- Official Spotify catalog/credits playlist embed.

## 2. Current Folder Structure

```text
build-a-clean-modern-one-page/
├── assets/
│   ├── 11s-iinfinity-logo.png
│   ├── from-me-to-you-cover.jpg
│   ├── graceful-severance-cover.jpg
│   ├── sanctioned-cover.jpg
│   └── somewhere-stuck-cover.jpg
├── DEVELOPMENT.md
├── index.html
├── node_modules/          # Installed local development dependencies
├── node_modules.zip       # Archived dependency directory; not used at runtime
├── package-lock.json
├── package.json
├── script.js
└── styles.css
```

### File responsibilities

| File | Responsibility |
| --- | --- |
| `index.html` | All page structure, copy, featured releases, service/pricing content, policies, licensing content, and inquiry form markup. |
| `styles.css` | Design tokens, layout, component styling, animation, responsive behavior, and reduced-motion overrides. |
| `script.js` | Navigation behavior, Spotify coordination, music databases and rendering, linked detail opening, inquiry preselection, mailto form submission, and reveal animation. |
| `assets/` | Local brand and release artwork used by `index.html`. |
| `package.json` | Local development command and `live-server` dependency. |
| `package-lock.json` | Locked npm dependency graph. |
| `node_modules/` | Local installed packages. It is not required by the deployed static site. |
| `node_modules.zip` | Dependency archive. It is not referenced by the website. |

### Architecture and runtime

- **Frontend architecture:** static HTML/CSS/JavaScript.
- **Entry point:** `index.html`.
- **Data layer:** in-memory arrays in `script.js`; there is no external content
  API or CMS.
- **Third-party runtime services:** Google Fonts and Spotify's embed/iFrame API.
- **Development server:** `npm run dev`, serving the repository on port `3000`
  with `live-server`.
- **Production deployment:** all required runtime files are static. No production
  deployment configuration is currently stored in this repository.
- **Source control note:** this moved directory is not currently recognized as a
  Git working tree.

### Responsive viewport behavior

- The viewport meta tag uses `viewport-fit=cover` so CSS can account for mobile
  safe areas.
- Horizontal overflow is hidden at the document level to prevent accidental
  sideways scrolling from oversized decorative elements.
- On screens up to 760 pixels wide, the menu becomes a fixed full-screen solid
  overlay using `100svh`/`100dvh` with safe-area padding for phone status bars
  and browser UI.
- While the menu is open, `body.menu-open::before` adds a solid black fixed
  backdrop above all page content so release cards and section backgrounds
  cannot bleed through the menu on mobile browsers.
- The mobile close button is layered above the menu overlay; the page underneath
  is visually covered and scroll-locked while the menu is open.
- Narrow or short screens receive reduced navigation, hero, and section heading
  sizes so the homepage content does not crowd or overlap on smaller phones.

## 3. Existing Audio Preview System

The site does not host local MP3, WAV, M4A, or OGG files. All in-page audio
previews are delivered by Spotify.

### Embed definitions

Spotify placeholders are written as:

```html
<div
  class="spotify-embed-target"
  data-spotify-uri="spotify:track:TRACK_ID"
  data-height="152"
></div>
```

The current page defines:

- Two API-controlled album players at 352 pixels tall: `from me, to you..` and
  the latest featured release with album ID `5iLSCerLEg7W5M2mH4W4ie`.
- Three compact track players for the other featured releases at 152 pixels.
- One official playlist player at 500 pixels.
- The Spotify-only latest featured release spans the full featured grid row and
  uses the same `.spotify-embed-target` system as the other previews so playback
  remains mutually exclusive across all featured releases.

### Player initialization

When at least one `.spotify-embed-target` exists, `script.js`:

1. Defines `window.onSpotifyIframeApiReady`.
2. Loads `https://open.spotify.com/embed/iframe-api/v1` asynchronously.
3. Creates a Spotify controller for every target using its `data-spotify-uri`
   and `data-height`.
4. Applies Spotify's dark theme and full available width.

### Single-player coordination

`activeSpotifyController` and `activeSpotifyContainer` track the current player.
When a different player begins:

- The new player becomes active.
- The previous player is paused.
- The previous player is rewound to zero.
- The selected player is also rewound to zero on `playback_started` and on the
  first `playback_update` where that controller transitions from paused to
  playing. Short delayed retry seeks handle Spotify timing quirks so reselecting
  a preview starts it over from the beginning.
- The containing embed receives a `data-playback-state` value of `playing` or
  `paused`.

Both `playback_started` and `playback_update` are monitored because compact
Spotify players can report playback through either path.

### Music data maintenance

- Featured card text, artwork, links, URI, and embed height are edited directly
  in `index.html`.
- The complete catalog is maintained in the `officialCatalog` array in
  `script.js`.
- Selected credits are maintained in the `productionCredits` array in
  `script.js`.
- Catalog and credit markup is generated with template strings on page load.
- The visible “20 releases” count in `index.html` is static and must be updated
  manually when the catalog array changes.

### Current limitations

- Playback requires Spotify's external script and embed service.
- There is no local audio fallback or custom waveform/player.
- There is no user-facing error state when Spotify is blocked or unavailable.
- Apple Music and YouTube are outbound links, not embedded players.
- Catalog and credit rows link outward and do not receive their own inline
  preview controllers.

## 4. Existing Services Section

The services area has three layers:

1. A high-level capability list.
2. Expandable service and pricing details.
3. Expandable client policies.

### High-level capabilities

- Recording Sessions
- Vocal Mixing
- Full Mix & Master
- Creative Vocal Production
- Artist Development Support

The first four rows link to detailed pricing panels. JavaScript detects the URL
hash and automatically opens a targeted `<details>` element. Artist Development
Support goes directly to the inquiry form and selects `Other`.

### Published services and pricing

| Service | Price | Turnaround / terms |
| --- | --- | --- |
| Recording Session | $40/hour | 2-hour minimum; rush booking is +$25/hour and subject to availability. |
| Vocal Mix & Master | $200/song | 3-5 business days; 24-48 hour rush is +$100 and subject to availability; 2 revisions. |
| Recording + Mix Bundle | $250/song | Up to 2 recording hours; 3-5 business days; additional recording is $40/hour; 2 revisions. |
| Full Stem Mix & Master | $250-$450, then custom | $250 up to 20 stems, $350 for 21-40, $450 for 41-60, custom quote above 60; 3-7 business days; rush is +50%; 2 revisions. |
| Mastering Only | $50/song | 1-3 business days; rush is +$25 and subject to availability; 1 revision. |

Each detail panel documents included work, required client materials, delivery
formats, and service-specific notes. Its CTA scrolls to the inquiry form and
preselects the matching project type.

### Client policies

- A 50% non-refundable deposit is required before work begins.
- The remaining balance is due before final delivery.
- Turnaround starts after all required files and payment/deposit are received.
- Additional mix revisions are $25; additional mastering revisions are $15.
- WAV is preferred; AIFF and MP3 are accepted.
- Files should be labeled, synchronized to one start point, and free of
  unintended clipping.
- Disorganized or incorrectly exported files may require paid preparation.
- Project files are retained for up to 30 days after final delivery.
- Clients retain ownership of their music.
- 11S IINFINITY LLC reserves portfolio and promotional use unless otherwise
  agreed in writing.

## 5. Existing Licensing Section

The licensing section positions selected instrumental and piano works for:

- Film
- Television
- Trailers
- Commercials
- YouTube and creator content
- Games
- Documentaries
- Other visual media

The published catalog notes describe:

- One-take piano improvisations.
- Emotional cinematic instrumentals.
- Available stems.
- Alternate versions when prepared.
- Cleared catalog organization as work in progress.
- Current status: open for select opportunities.

The `Licensing Inquiry` button opens a new email to
`contact.e1evnn@gmail.com` with the subject `Sync Licensing Inquiry`. It does not
currently prefill the project inquiry form or collect placement details.

There is no searchable licensing catalog, cue metadata, rights database,
downloadable one-sheet, private listening room, or automated clearance request
workflow in the current codebase.

## 6. Existing Contact Workflow

### Entry points

- Hero contact button.
- Main navigation contact link.
- Large direct email link in the contact section.
- General `Book Engineering` CTA.
- Service-specific CTAs.
- Artist Development Support CTA.
- Licensing `mailto:` CTA.

### Project inquiry form

The form collects:

- Name
- Email
- Project type
- Song/project name
- Desired turnaround
- Message, including suggested song/stem details

Available project types are Recording Session, Vocal Mix & Master, Recording +
Mix Bundle, Full Stem Mix & Master, Mastering Only, Licensing Inquiry, and Other.

When a service CTA is clicked, its `data-project-type` value is copied into the
form's project selector.

### Submission behavior

The site has no form backend. On submit:

1. JavaScript prevents the browser's default form submission.
2. Native browser validation runs through `reportValidity()`.
3. A `FormData` object reads the fields.
4. JavaScript builds a subject in the form:
   `Project Inquiry — [Project Type] — [Name]`.
5. JavaScript creates a formatted plain-text message labeled
   `11S IINFINITY LLC — New Project Inquiry`.
6. The live status message tells the visitor that their email app is opening.
7. `window.location.href` navigates to an encoded `mailto:` URL addressed to
   `contact.e1evnn@gmail.com`.

The inquiry is not sent until the visitor reviews and sends it from their local
email application. No copy is stored by the website, no confirmation email is
sent, and no success/failure result can be verified by the page.

The HTML form retains a matching `mailto:` action as a declarative fallback, but
the JavaScript listener controls the normal submission path.

## 7. Future Improvements Backlog

### Priority 0: production integrity

- Reconnect this moved production directory to Git and establish the canonical
  repository, branch, deployment target, and rollback procedure.
- Document or add the actual e1evnn.com deployment configuration.
- Remove `node_modules/` and `node_modules.zip` from production source tracking;
  restore dependencies with `npm ci` instead.
- Add a `.gitignore` for dependencies, OS files, logs, and generated artifacts.
- Add automated checks for broken internal anchors, external streaming URLs,
  malformed HTML, and JavaScript errors.
- Add a lightweight production smoke test for navigation, details panels,
  Spotify initialization, CTA preselection, and form composition.

### Priority 1: inquiries and business operations

- Replace `mailto:` submission with a reliable form service or first-party
  endpoint.
- Add spam protection, server-side validation, delivery logging, and a clear
  success/error state.
- Send visitor confirmation and internal notification emails.
- Add consent/privacy language and publish a privacy policy before collecting or
  storing inquiry data.
- Support secure file-upload or transfer links for stems, mixes, and references.
- Route licensing inquiries through a dedicated form with usage, media, term,
  territory, budget, deadline, exclusivity, and requested track fields.
- Integrate inquiries with a CRM or project tracker while preserving an email
  fallback.

### Priority 2: music and licensing operations

- Move catalog, credits, featured releases, and visible counts to one structured
  source of truth to prevent duplicate edits.
- Add release dates, artwork, identifiers, roles, collaborators, and credits
  metadata to the catalog model.
- Build a rights-controlled licensing catalog with ISRC/ISWC, writers,
  publishers, splits, master ownership, clearance contacts, explicit status,
  moods, genres, BPM, key, duration, stems, and alternate versions.
- Replace “cleared organization in progress” with verified per-track clearance
  status before representing tracks as one-stop or pre-cleared.
- Add searchable/filterable catalog and credits views.
- Add a graceful Spotify failure state and optional self-hosted approved preview
  clips.
- Consider a private supervisor listening room and downloadable catalog
  one-sheet.

### Priority 3: discoverability and trust

- Add a canonical URL, favicon/app icons, Open Graph metadata, social preview
  image, and Twitter card metadata.
- Add structured data for Person/Organization, MusicGroup, MusicAlbum,
  MusicRecording, and ProfessionalService where accurate.
- Add `robots.txt` and `sitemap.xml`.
- Add service location/availability, booking expectations, accepted payment
  methods, and business contact details where appropriate.
- Add verified testimonials, selected case studies, or deeper credit context.
- Add legal review and version/effective dates for pricing, payment, revision,
  storage, portfolio, cancellation, rescheduling, and rights terms.

### Priority 4: accessibility, resilience, and performance

- Test with keyboard-only navigation and current screen readers.
- Add Escape-key handling, focus management, and focus containment for the open
  mobile navigation.
- Verify contrast and focus visibility across all interactive states.
- Add a no-JavaScript presentation for generated catalog and credit content, or
  render that content at build time.
- Self-host or provide fallbacks for critical third-party font and media
  dependencies.
- Add a Content Security Policy and other production security headers at the
  host/CDN layer.
- Optimize and generate responsive image formats and dimensions.
- Run repeatable Lighthouse/Core Web Vitals audits on production.

### Priority 5: maintainability

- Add formatting and linting for HTML, CSS, and JavaScript.
- Extract repeated contact address, service data, and music data into structured
  configuration.
- Derive release and credit counts automatically.
- Resolve naming/numbering differences between the high-level service list and
  detailed pricing list so each CTA maps unambiguously.
- Add a concise content update checklist for releases, credits, pricing, policy
  changes, and copyright year updates.
- Consider a small static-site generator or headless CMS only when update volume
  justifies the added deployment and maintenance complexity.

## Maintenance Quick Reference

### Run locally

```bash
npm ci
npm run dev
```

The development server is configured for `http://localhost:3000`.

### Add an official catalog release

1. Add an object to `officialCatalog` in `script.js`.
2. Include title, artist, roles, Spotify URL, and Apple Music URL when available.
3. Update the static catalog count in `index.html`.
4. Verify all external links and the mobile card layout.

### Add a production or engineering credit

1. Add an object to `productionCredits` in `script.js`.
2. Include title, artist, roles, and Spotify URL.
3. Confirm numbering, wrapping, and accessible link text in the rendered list.

### Change a featured release

1. Replace the card content in `index.html`.
2. Add or replace its artwork in `assets/`.
3. Update the artwork path and alt text.
4. Update all streaming links.
5. Update `data-spotify-uri` and choose the correct player height.

### Change a service or policy

1. Update the high-level service row when the public capability changes.
2. Update the matching detailed pricing panel and inquiry `data-project-type`.
3. Update the project type option in the contact form if needed.
4. Check prices, turnaround, inclusions, client requirements, revision terms,
   and policy language together.
5. Verify the service anchor opens the intended detail panel and preselects the
   intended inquiry type.
