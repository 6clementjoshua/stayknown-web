STAYKNOWN CHAT WEBSITE ADDITION
================================

PURPOSE
-------
This package adds to the existing StayKnown website without replacing existing
pages or removing existing homepage sections.

It adds:
  - an interactive animated Chat demo on the homepage;
  - a dedicated /chat page;
  - approved-contact direct Chat explanation;
  - Trusted Circle consent, roles, invitations and selective audiences;
  - translation, voice, media, files, stickers and deliberate location sharing;
  - explicit privacy, history and emergency limitations;
  - route metadata, canonical URL, Open Graph, X/Twitter metadata;
  - WebPage, SoftwareApplication, BreadcrumbList, ItemList, HowTo and FAQ JSON-LD;
  - dedicated generated social images;
  - /chat in app/sitemap.ts;
  - a homepage footer route to Chat & Trusted Circles.

FILES
-----
Brand-new files:
  components/StayKnownChatDemo.tsx
  components/StayKnownChatExperience.tsx
  lib/stayknown-chat-content.ts
  app/chat/page.tsx
  app/chat/opengraph-image.tsx
  app/chat/twitter-image.tsx
  apply-stayknown-chat-website.mjs

Existing files patched by the installer:
  components/StayKnownHomePage.tsx
  app/sitemap.ts

The installer creates timestamped backups under:
  .stayknown-backups/chat-website-<timestamp>/

INSTALL FROM WINDOWS POWERSHELL
-------------------------------
1. Copy the ZIP into the StayKnown website project root.
2. Open PowerShell in that project root.
3. Run:

   Expand-Archive .\stayknown-chat-website-addition.zip -DestinationPath . -Force
   node .\apply-stayknown-chat-website.mjs
   npm run build

LOCAL PREVIEW
-------------
Run:

   npm run dev

Open:

   http://localhost:3000
   http://localhost:3000/chat
   http://localhost:3000/sitemap.xml

DEPLOYMENT CHECK
----------------
After the production build passes, deploy through the same provider/workflow
already used by stay-known.com. Confirm:
  - the homepage demo renders on mobile and desktop;
  - /chat loads directly and after a refresh;
  - /sitemap.xml contains https://www.stay-known.com/chat;
  - the homepage footer contains Chat & Trusted Circles;
  - reduced-motion mode stops non-essential animations;
  - no existing public route was removed.

FLUTTER APK BUILD AFTER WEBSITE WORK
------------------------------------
From the StayKnown Flutter project root:

   flutter clean
   flutter pub get
   dart format lib
   flutter analyze
   flutter build apk --release

Release APK output:

   build\app\outputs\flutter-apk\app-release.apk

Install on a USB-connected Android device:

   adb devices
   adb install -r .\build\app\outputs\flutter-apk\app-release.apk

Remove the test app from the device after testing:

   adb uninstall com.stayknown.app

IMPORTANT: uninstalling removes the app and its local app data from that device.
Do not uninstall a Play Store build containing data you need to keep.
