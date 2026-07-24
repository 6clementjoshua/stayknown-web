STAYKNOWN BILLING REGION BUILD FIX

Copy both files exactly:

src/lib/stayknown-billing-region.ts
src/lib/stayknown-billing-types.ts

Important:
- Keep the filenames entirely lowercase.
- Commit both files to the Git repository used by Vercel.
- Do not place them inside src/app/lib or src/app/api/lib.
- The correct folder is the project-level src/lib directory.

The existing imports remain valid:
@/lib/stayknown-billing-region
@/lib/stayknown-billing-types

After copying, verify from the project root:

Test-Path .\src\lib\stayknown-billing-region.ts
Test-Path .\src\lib\stayknown-billing-types.ts

Both commands must return True.
