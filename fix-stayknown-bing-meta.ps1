$ErrorActionPreference = "Stop"

$ProjectRoot = (Get-Location).Path

if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
  throw "Run this from the StayKnown project root (the folder containing package.json)."
}

if (-not (Test-Path (Join-Path $ProjectRoot "app\layout.tsx"))) {
  throw "app\layout.tsx was not found. Run this from C:\Users\suppo\stayknown-web."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$pages = @(
  @{
    Path = "app\contact-consent\layout.tsx"
    Title = "Contact Approval & Consent"
    OgTitle = "Contact Approval & Consent | StayKnown"
    Description = "Learn how StayKnown handles approved contacts, SOS responders, consent, removals and anti-stalking safeguards for trusted safety connections worldwide."
    Canonical = "/contact-consent"
  },
  @{
    Path = "app\acceptable-use\layout.tsx"
    Title = "Acceptable Use Policy"
    OgTitle = "Acceptable Use Policy | StayKnown"
    Description = "Read StayKnown rules for lawful, consent-based use of LIVE location, SOS, secure chat, minors, payments, anti-stalking, reporting and abuse prevention."
    Canonical = "/acceptable-use"
  },
  @{
    Path = "app\learn\get-safe-guidance\layout.tsx"
    Title = "GET SAFE Safety Guidance"
    OgTitle = "GET SAFE Safety Guidance | StayKnown"
    Description = "Explore StayKnown GET SAFE guidance for safer Visits, trusted contacts, check-ins, secure communication, location awareness and emergency preparation."
    Canonical = "/learn/get-safe-guidance"
  },
  @{
    Path = "app\submit-feature\layout.tsx"
    Title = "Submit a Feature"
    OgTitle = "Submit a Feature | StayKnown"
    Description = "Submit a StayKnown feature idea for safety, SOS, LIVE location, trusted contacts, chat, privacy, accessibility, wallet and future product improvements."
    Canonical = "/submit-feature"
  },
  @{
    Path = "app\learn\visit-live-sos\layout.tsx"
    Title = "Visit, LIVE & SOS Safety"
    OgTitle = "Visit, LIVE & SOS Safety | StayKnown"
    Description = "Learn how StayKnown combines active Visits, LIVE safety sharing and SOS escalation so trusted contacts receive clearer context when support is needed."
    Canonical = "/learn/visit-live-sos"
  }
)

foreach ($page in $pages) {
  $target = Join-Path $ProjectRoot $page.Path
  $dir = Split-Path $target -Parent

  New-Item -ItemType Directory -Force -Path $dir | Out-Null

  if (Test-Path $target) {
    Copy-Item $target "$target.bak-$stamp" -Force
    Write-Host "Backed up existing $($page.Path)" -ForegroundColor Yellow
  }

  $titleJson = $page.Title | ConvertTo-Json -Compress
  $ogTitleJson = $page.OgTitle | ConvertTo-Json -Compress
  $descJson = $page.Description | ConvertTo-Json -Compress
  $canonicalJson = $page.Canonical | ConvertTo-Json -Compress

  $content = @"
import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = $titleJson;
const OG_TITLE = $ogTitleJson;
const DESCRIPTION = $descJson;
const CANONICAL = $canonicalJson;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: CANONICAL,
  },

  openGraph: {
    type: "website",
    url: CANONICAL,
    title: OG_TITLE,
    description: DESCRIPTION,
    siteName: "StayKnown",
    locale: "en_NG",
  },

  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RouteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
"@

  Set-Content -Path $target -Value $content -Encoding utf8
  Write-Host "Fixed $($page.Path)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Running TypeScript/Next build check..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
  throw "Build failed. Existing route layouts were backed up with suffix .bak-$stamp where applicable."
}

Write-Host ""
Write-Host "SUCCESS: Bing server-rendered metadata fix installed for all 5 flagged URLs." -ForegroundColor Green
Write-Host "Next: deploy to Vercel, then re-inspect the URLs in Bing Webmaster Tools." -ForegroundColor Cyan
