STAYKNOWN SOCIAL IMAGE PACKAGE

Place these files in the website project:

src/lib/stayknown-social-image.tsx
src/app/opengraph-image.tsx
src/app/twitter-image.tsx
src/app/layout.tsx

Required existing public assets:

public/6logo.png
public/hero/visit-live-sos.png

The generated routes are controlled by Next.js metadata:
- Open Graph image
- Twitter/X image

The updated layout removes the previous static image declarations so the
file-based metadata images become authoritative.
