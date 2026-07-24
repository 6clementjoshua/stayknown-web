STAYKNOWN PLANS AND IP BILLING PACKAGE

Place:
- src/app/plans/page.tsx
- src/components/PlansExperience.tsx
- src/lib/stayknown-billing-types.ts
- src/lib/stayknown-billing-region.ts
- src/app/api/billing-region/route.ts
- src/components/StayKnownHomePage.tsx
- src/app/sitemap.ts

IP BILLING AUTHORITY
1. The page reads trusted hosting/network country headers on the server.
2. Supported header sources:
   - x-vercel-ip-country
   - cf-ipcountry
   - cloudfront-viewer-country
   - fastly-client-country
   - x-country-code
3. When no country header exists and IPINFO_TOKEN is configured, the server
   may resolve the forwarded public IP through IPinfo.
4. Nigeria resolves to:
   - NG
   - NGN
   - Paystack
5. Every other resolved country uses:
   - the real detected country label and flag
   - USD
   - Flutterwave
   It is never mislabeled as United States.
6. Unknown country falls back to:
   - GLOBAL
   - USD
   - Flutterwave
7. Device timezone is never used for currency selection.
8. The IP address is not returned to the browser.
9. The route is private/no-store so one visitor's country is not reused for
   another visitor.
10. The installed app remains authoritative before checkout.

OPTIONAL ENVIRONMENT VARIABLE
IPINFO_TOKEN=<your existing IPinfo token>

The Vercel country header normally resolves without the IPinfo fallback when
the site is deployed on Vercel.

NEW ROUTES
- /plans
- /api/billing-region

REQUIRED EXISTING ASSETS
- public/6logo.png
- public/hero/promax-shell.png
- public/hero/contact-approval.png
- public/hero/sos-activated.png
