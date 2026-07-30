STAYKNOWN CHAT WEBSITE ADDITION — PUBLIC COPY CORRECTED
=========================================================

This package adds the interactive Chat experience without removing existing
homepage sections or public routes.

It includes:
  - the complete latest StayKnownHomePage.tsx with corrected visitor copy;
  - an animated interactive Chat demo on the homepage;
  - a dedicated /chat page;
  - Trusted Circle consent, roles, invitations and selected audiences;
  - translation, voice, media, files, stickers and deliberate location sharing;
  - canonical metadata, Open Graph, X/Twitter metadata and rich JSON-LD;
  - /chat in app/sitemap.ts.

The full replacement homepage is included at:

  FULL-REPLACEMENT/components/StayKnownHomePage.tsx

INSTALL FROM WINDOWS POWERSHELL
-------------------------------
Copy the ZIP into:

  C:\Users\suppo\stayknown-web

Then run:

  Expand-Archive .\stayknown-chat-website-public-copy-v2.zip -DestinationPath . -Force
  node .\apply-stayknown-chat-website.mjs
  npm run build

The installer creates timestamped backups, adds the Chat section and sitemap
entry, and replaces only the identified public-copy phrases. It leaves
unrelated homepage sections and routes untouched.

LOCAL PREVIEW
-------------
  npm run dev

Open:
  http://localhost:3000
  http://localhost:3000/chat
  http://localhost:3000/sitemap.xml

Confirm that no visitor-facing text says:
  - “the homepage now”;
  - “current app build”;
  - “staged rollout”;
  - “coordinated availability”;
  - “server-side audience rules”.

DEVICE-ADMISSION SQL
--------------------
The device-admission activation SQL is separate from this website package.
Do not enable it merely because the website builds. Enable it only after the
compatible Flutter app and Edge Function are released and tested for the users
who will be affected.
