STAYKNOWN FINAL MOBILE NAVIGATION AND SAFETY-TAG FIX

Extract into the confirmed root-based StayKnown website project.

FILE
components/StayKnownHomePage.tsx

FIXES
1. Mobile homepage tabs
   - How it works
   - Watch
   - Features
   - Plans
   - Trust
   - FAQ

   All six now display below the main mobile header in a compact two-row grid.
   On small tablets they display in a single six-column row.

2. FAQ mobile anchor
   The FAQ section now uses responsive scroll margin so its heading does not
   disappear behind the taller sticky mobile header.

3. Safety tags below the first hero slide
   - Approved contacts only
   - User-started sessions
   - No hidden tracking
   - Access ends with the flow
   - Emergency-ready context

   These now stack vertically on mobile with a connected flow line, matching
   the vertical progression used by the How StayKnown Works presentation.
   The five-column desktop presentation remains intact.

NO OTHER CHANGES
- No routes were removed.
- No text was changed.
- No plan or billing logic was changed.
- No desktop navigation was removed.
- No src/ directory is included.
