# StayKnown premium public-flow audit
# Run from the website project root after extracting the combined package.

$ErrorActionPreference = "Stop"
$Root = (Get-Location).Path

function Assert-File {
    param([string]$RelativePath)

    $absolute = Join-Path $Root $RelativePath
    if (-not (Test-Path -LiteralPath $absolute -PathType Leaf)) {
        throw "Required file is missing: $RelativePath"
    }

    Write-Host "OK  $RelativePath" -ForegroundColor Green
}

function Assert-DirectoryMissing {
    param([string]$RelativePath)

    $absolute = Join-Path $Root $RelativePath
    if (Test-Path -LiteralPath $absolute) {
        throw "Unexpected duplicate architecture remains: $RelativePath"
    }

    Write-Host "OK  No $RelativePath duplicate" -ForegroundColor Green
}

Write-Host ""
Write-Host "StayKnown premium-flow audit" -ForegroundColor Cyan
Write-Host "Project: $Root"
Write-Host ""

Assert-File "package.json"
Assert-File "tsconfig.json"
Assert-File "app\layout.tsx"
Assert-File "app\page.tsx"
Assert-File "app\globals.css"
Assert-File "app\sitemap.ts"

Assert-DirectoryMissing "src"

$RequiredRoutes = @(
    "app\how-it-works\page.tsx",
    "app\features\page.tsx",
    "app\watch\page.tsx",
    "app\plans\page.tsx",
    "app\trust-safety\page.tsx",
    "app\students\page.tsx",
    "app\travel-rides\page.tsx",
    "app\families-guardians\page.tsx",
    "app\accessibility\page.tsx",
    "app\status\page.tsx",
    "app\about\page.tsx",
    "app\press-updates\page.tsx"
)

Write-Host ""
Write-Host "Checking premium routes..." -ForegroundColor Cyan
foreach ($route in $RequiredRoutes) {
    Assert-File $route
}

$RequiredComponents = @(
    "components\StayKnownHomePage.tsx",
    "components\HowItWorksExperience.tsx",
    "components\FeaturesExperience.tsx",
    "components\WatchExperience.tsx",
    "components\PlansExperience.tsx",
    "components\TrustSafetyExperience.tsx",
    "components\AudienceExperience.tsx",
    "components\AccessibilityExperience.tsx",
    "components\StatusExperience.tsx",
    "components\AboutExperience.tsx",
    "components\PressUpdatesExperience.tsx"
)

Write-Host ""
Write-Host "Checking premium components..." -ForegroundColor Cyan
foreach ($component in $RequiredComponents) {
    Assert-File $component
}

$RequiredAssets = @(
    "public\6logo.png",
    "public\hero\stayknown-safe-journey-bus.png",
    "public\hero\stayknown-family-farewell.png",
    "public\hero\contact-approval.png",
    "public\hero\verification.png",
    "public\hero\visit-live-sos.png",
    "public\hero\visit-live.png",
    "public\hero\live-map.png",
    "public\hero\manual-capture.png",
    "public\hero\get-safe-hints.png",
    "public\hero\sos-activated.png",
    "public\hero\sos-active.png",
    "public\hero\end-sos-verify.png",
    "public\hero\end-visit-verify.png",
    "public\hero\secure-chat-biometric.png",
    "public\hero\chat-translation.png",
    "public\hero\promax-shell.png",
    "public\hero\stories-profile.png"
)

Write-Host ""
Write-Host "Checking required public assets..." -ForegroundColor Cyan
foreach ($asset in $RequiredAssets) {
    Assert-File $asset
}

Write-Host ""
Write-Host "Checking the root alias..." -ForegroundColor Cyan
$tsconfig = Get-Content (Join-Path $Root "tsconfig.json") -Raw
if ($tsconfig -notmatch '"@\s*/\*"\s*:\s*\[\s*"\./\*"\s*\]') {
    throw 'tsconfig.json must keep the root alias: "@/*": ["./*"]'
}
Write-Host 'OK  "@/*": ["./*"]' -ForegroundColor Green

Write-Host ""
Write-Host "Checking mint consistency..." -ForegroundColor Cyan
$PremiumFiles = $RequiredComponents |
    ForEach-Object { Join-Path $Root $_ }

$OldGreenMatches = Select-String `
    -Path $PremiumFiles `
    -Pattern '#18b88a|#0e8f70|rgba\(24,184,138|rgba\(14,143,112' `
    -CaseSensitive:$false

if ($OldGreenMatches) {
    $OldGreenMatches | ForEach-Object {
        Write-Host "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Red
    }
    throw "Old dark-green premium accents remain."
}
Write-Host "OK  Premium safety accents use mint" -ForegroundColor Green

Write-Host ""
Write-Host "Checking white-button readability rule..." -ForegroundColor Cyan
$globals = Get-Content (Join-Path $Root "app\globals.css") -Raw
if (
    $globals -notmatch ':where\(\s*a\[class~="bg-white"\]' -or
    $globals -notmatch 'color:\s*#000000'
) {
    throw "The global white-button black-text fallback is missing."
}
Write-Host "OK  White interactive surfaces begin with black text" -ForegroundColor Green

Write-Host ""
Write-Host "Checking sitemap routes..." -ForegroundColor Cyan
$sitemap = Get-Content (Join-Path $Root "app\sitemap.ts") -Raw
$PublicPaths = @(
    "/how-it-works",
    "/features",
    "/watch",
    "/plans",
    "/trust-safety",
    "/students",
    "/travel-rides",
    "/families-guardians",
    "/accessibility",
    "/status",
    "/about",
    "/press-updates"
)

foreach ($path in $PublicPaths) {
    $escaped = [Regex]::Escape("path: `"$path`"")
    $count = ([Regex]::Matches($sitemap, $escaped)).Count

    if ($count -ne 1) {
        throw "Sitemap route must appear exactly once: $path (found $count)"
    }

    Write-Host "OK  sitemap $path" -ForegroundColor Green
}

Write-Host ""
Write-Host "Clearing Next.js and TypeScript caches..." -ForegroundColor Cyan
Remove-Item -Recurse -Force (Join-Path $Root ".next") -ErrorAction SilentlyContinue
Remove-Item -Force (Join-Path $Root "tsconfig.tsbuildinfo") -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Running production build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    throw "npm run build failed with exit code $LASTEXITCODE"
}

Write-Host ""
Write-Host "StayKnown premium public flow passed the complete audit." -ForegroundColor Green
