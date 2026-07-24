STAYKNOWN TURBOPACK CLASSNAME FINAL FIX

Extract into the confirmed root-based StayKnown website project.

REPLACE
components/StayKnownHomePage.tsx

CAUSE
The mobile navigation patch used a multiline quoted JSX attribute:

className="
  ...
"

Turbopack transformed that into an invalid JavaScript string and stopped with:
Expected ',', got 'ident'

FIX
All eight multiline quoted className attributes in the homepage were converted
to valid JSX template-literal attributes:

className={`
  ...
`}

This includes:
- Mobile homepage tab rail
- Vertical safety-tag stack
- Existing FAQ cards and controls

No route, text, plan, billing, metadata, or layout flow was otherwise changed.
No src/ folder is included.
