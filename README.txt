STAYKNOWN BUTTON, MINT ACCENT, AND PLAN-CATALOGUE FIX

CONFIRMED PROJECT ARCHITECTURE
- app/
- components/
- lib/
- public/

There is no src/ folder in this package.

FILES
- app/globals.css
- components/HowItWorksExperience.tsx
- components/FeaturesExperience.tsx
- components/PlansExperience.tsx
- components/TrustSafetyExperience.tsx
- components/WatchExperience.tsx

FIX 1 — WHITE BUTTON LABELS
The original globals.css used:
a:visited { color: inherit; }

That selector was more specific than Tailwind text-black and caused visited
white links/buttons to inherit white text. The link rule now uses :where(),
which has zero specificity, so text-black and hover:text-white work correctly.

A low-specificity safety rule also makes any interactive element carrying the
exact bg-white class start with black text.

FIX 2 — PREMIUM MINT
The earlier darker green is replaced across all premium experiences with:
- Main mint: #8FF3D0
- Deep mint for white surfaces: #0B7A62
- Mint glow RGB: 143, 243, 208

Google Play's official multicolour icon is not modified.
SOS red is not modified.

FIX 3 — FEATURES PLAN LISTING
The Features page now uses the exact Starter, Pro, and Pro Max entitlements
shown on the authoritative Plans page, including:
- Contact capacity
- SOS contacts
- Responders
- Gallery capacity
- Visit and LIVE access
- SOS controls
- Chat and translation
- Stories
- Fonts and personalization
- Restrict and block controls
