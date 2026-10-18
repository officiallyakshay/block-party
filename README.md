# Block Party

A React + TypeScript browser puzzle game built with Vite, Tailwind CSS, native Pointer Events, Web Audio, and versioned LocalStorage. No backend, signup, live advertising, or purchases.

## Run

```sh
npm ci
npm run dev
```

## Verify and build

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Deploy `dist/` to Vercel or Cloudflare Pages. Build command: `npm run build`. Output directory: `dist`. There are no environment variables or server routes to configure.

## Included

- 8×8 Classic with a weighted, outcome-independent piece pool, simultaneous row/column clearing, combo scoring, game-over detection, instantaneous replay, and automatic run restoration.
- Mouse/touch dragging, finger offset, placement previews, pointer cancellation, tap selection/placement, and keyboard arrow navigation.
- UTC daily puzzle: deterministic starting board and piece stream, 25 placements, one local ranked attempt, unlimited practice, historical challenge URLs, streaks, and countdown.
- Haunted Party: cosmetic pumpkin markers, cumulative 100-pumpkin objective, unlockable Jack-o’-Glow skin, and year-round Halloween access.
- Original/Haunted themes, future theme definitions, pause/help/settings/results screens, five achievements, personal bests, reduced motion, sounds, and optional haptics.
- Share API, clipboard and visible-text fallbacks, challenge URLs, downloadable Canvas score cards, and social metadata.
- No-op analytics provider and disabled display/interstitial/rewarded advertising interfaces. No simulated ad views or rewards.

## Engine boundaries

`engine.ts` handles immutable placements, clears, game over, and dealing. `shapes.ts`, `scoring.ts`, `daily.ts`, and `themes.ts` are configuration/logic modules. `persistence.ts` validates and restores versioned saves, records streaks and unlocks. `audio.ts`, `sharing.ts`, `ads.tsx`, and `analytics.ts` isolate integrations. `App.tsx` owns UI and pointer interactions.

Scoring: 5 points per square, 100 per line, 50 for each additional simultaneously cleared line. Consecutive line-clearing placements multiply line points, capped at 5×. Placements without a clear reset the combo. The shape generator does not inspect the board or manipulate outcomes.

Ranked and practice attempts have separate storage keys. A daily run remains pinned to its original UTC date through midnight. Share links for prior dates open unranked practice. Scores are browser-local, editable, and not authoritative competition. Clearing browser data removes progress. No cross-device sync.

## Validation and limitations

Vitest covers engine invariants, deterministic daily sequences, corrupted saves, streaks, seasonal unlocks, and React interactions using simulated Pointer Events in JSDOM. Simulation includes 100 full games with restore checks. A real browser/device preview was unavailable in the build environment; mobile drag feel, visual layout, audio, vibration, and OS sharing still need hands-on device testing. The CSS includes responsive layouts down to 320px and short mobile viewport adjustments.

## Future integrations

- Configure a consent-aware, approved ad provider via `configureAds`. Ads stay disabled until then. Interstitials are permitted only after a run; reward only on a provider-confirmed completion. No provider is connected.
- Configure analytics via `configureAnalytics`; defaults transmit nothing. Events contain game metrics, not identity.
- Future cosmetic entitlements, subscription/pass models, and approved payments can use the entitlement interface in `themes.ts`. No checkout or shop is present.
- Harvest, Winter, Valentine, Spring, and Summer themes have palettes and descriptions, but are explicitly unavailable until released. Halloween remains available permanently.
- Native deployment starts private. Public access must be enabled before friends can open challenge links.

## Hosting

The `.openai/hosting.json` file configures the attached private Site. Source history is kept in its connected repository. The code is also a standard static Vite application suitable for independent hosting.
