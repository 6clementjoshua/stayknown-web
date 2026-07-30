$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$HomePath = Join-Path $ProjectRoot "components\StayKnownHomePage.tsx"

if (-not (Test-Path $HomePath)) {
    throw "Missing components\StayKnownHomePage.tsx. Extract this package into the StayKnown website project root."
}

$RequiredFiles = @(
    "components\StayKnownRecognitionPill.tsx",
    "components\StayKnownSocialLinks.tsx",
    "components\GooglePlayRecognitionExperience.tsx",
    "app\recognition\google-play-indie-corner\page.tsx",
    "app\sitemap.ts"
)

foreach ($RelativePath in $RequiredFiles) {
    if (-not (Test-Path (Join-Path $ProjectRoot $RelativePath))) {
        throw "Recognition package is incomplete. Missing: $RelativePath"
    }
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $ProjectRoot ".stayknown-backups\recognition-$Timestamp"
$BackupHome = Join-Path $BackupRoot "components\StayKnownHomePage.tsx"

New-Item -ItemType Directory -Path (Split-Path $BackupHome -Parent) -Force | Out-Null
Copy-Item -Path $HomePath -Destination $BackupHome -Force

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$HomeText = [System.IO.File]::ReadAllText($HomePath)
$HomeText = $HomeText -replace "`r`n", "`n"

$ImportAnchor = 'import { HOME_FAQS } from "@/lib/stayknown-home-content";'
$ImportBlock = @'
import { HOME_FAQS } from "@/lib/stayknown-home-content";
import StayKnownRecognitionPill from "@/components/StayKnownRecognitionPill";
import StayKnownSocialLinks from "@/components/StayKnownSocialLinks";
'@

if (-not $HomeText.Contains('import StayKnownRecognitionPill from "@/components/StayKnownRecognitionPill";')) {
    if (-not $HomeText.Contains($ImportAnchor)) {
        throw "Could not find the StayKnown homepage import anchor."
    }

    $HomeText = $HomeText.Replace($ImportAnchor, $ImportBlock.TrimEnd())
}

$RecognitionFooterLink = '{ label: "Google Play Recognition", href: "/recognition/google-play-indie-corner" },'

if (-not $HomeText.Contains($RecognitionFooterLink)) {
    $PressLink = '{ label: "Press & Updates", href: "/press-updates" },'

    if ($HomeText.Contains($PressLink)) {
        $HomeText = $HomeText.Replace(
            $PressLink,
            "$PressLink`n      $RecognitionFooterLink"
        )
    }
}

if (-not $HomeText.Contains("<StayKnownSocialLinks")) {
    $FooterParagraph = @'
            <p className="mt-5 max-w-[34ch] text-[12px] font-semibold leading-relaxed text-white/42">
              StayKnown helps people share safety context with approved contacts during Visits, check-ins, SOS, and other intentional safety flows.
            </p>
'@

    if (-not $HomeText.Contains($FooterParagraph.TrimEnd())) {
        throw "Could not find the StayKnown footer introduction paragraph."
    }

    $FooterReplacement = $FooterParagraph.TrimEnd() + @'

            <StayKnownSocialLinks className="mt-5" />
'@

    $HomeText = $HomeText.Replace(
        $FooterParagraph.TrimEnd(),
        $FooterReplacement.TrimEnd()
    )
}

if (-not $HomeText.Contains("<StayKnownRecognitionPill")) {
    $HeaderStart = $HomeText.IndexOf('<header className="sticky top-0')

    if ($HeaderStart -lt 0) {
        throw "Could not find the sticky StayKnown homepage header."
    }

    $HeaderEnd = $HomeText.IndexOf("</header>", $HeaderStart)

    if ($HeaderEnd -lt 0) {
        throw "Could not find the closing homepage header tag."
    }

    $HomeText = $HomeText.Insert(
        $HeaderEnd,
        "        <StayKnownRecognitionPill />`n      "
    )
}

[System.IO.File]::WriteAllText($HomePath, $HomeText, $Utf8NoBom)

Write-Host ""
Write-Host "StayKnown recognition experience applied successfully." -ForegroundColor Green
Write-Host "Homepage updated: components\StayKnownHomePage.tsx" -ForegroundColor Green
Write-Host "Backup created: $BackupHome" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next command:" -ForegroundColor Cyan
Write-Host "npm run build" -ForegroundColor Cyan
