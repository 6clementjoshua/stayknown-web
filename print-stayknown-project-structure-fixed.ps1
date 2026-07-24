# Run this from the StayKnown website project root.
# It creates stayknown-project-structure.txt without exposing .env secrets.

$ErrorActionPreference = "Stop"
$Root = (Get-Location).Path
$Output = Join-Path $Root "stayknown-project-structure.txt"

$ExcludedDirectories = @(
    "node_modules",
    ".next",
    ".git",
    ".vercel",
    "dist",
    "build",
    "coverage"
)

function Is-ExcludedPath {
    param([string]$FullName)

    $relative = $FullName.Substring($Root.Length).TrimStart("\", "/")
    if ([string]::IsNullOrWhiteSpace($relative)) {
        return $false
    }

    $segments = $relative -split "[\\/]"
    foreach ($segment in $segments) {
        if ($ExcludedDirectories -contains $segment) {
            return $true
        }
    }

    return $false
}

function Write-Section {
    param(
        [string]$Title,
        [scriptblock]$Body
    )

    Add-Content -Path $Output -Value ""
    Add-Content -Path $Output -Value ("=" * 90)
    Add-Content -Path $Output -Value $Title
    Add-Content -Path $Output -Value ("=" * 90)
    & $Body
}

Set-Content -Path $Output -Value "StayKnown website project structure report"
Add-Content -Path $Output -Value "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add-Content -Path $Output -Value "Project root: $Root"

Write-Section "ROOT-LEVEL ITEMS" {
    Get-ChildItem -Force |
        Sort-Object @{Expression = { -not $_.PSIsContainer }}, Name |
        ForEach-Object {
            $kind = if ($_.PSIsContainer) { "[DIR] " } else { "[FILE]" }
            Add-Content -Path $Output -Value "$kind $($_.Name)"
        }
}

Write-Section "RELEVANT PROJECT TREE" {
    $RelevantRoots = @(
        "app",
        "src",
        "components",
        "lib",
        "public"
    )

    foreach ($relativeRoot in $RelevantRoots) {
        $absoluteRoot = Join-Path $Root $relativeRoot

        if (-not (Test-Path $absoluteRoot)) {
            Add-Content -Path $Output -Value "[MISSING] $relativeRoot"
            continue
        }

        Add-Content -Path $Output -Value ""
        Add-Content -Path $Output -Value "### $relativeRoot"

        Get-ChildItem -Path $absoluteRoot -Recurse -Force |
            Where-Object {
                -not (Is-ExcludedPath $_.FullName)
            } |
            Sort-Object FullName |
            ForEach-Object {
                $relative = $_.FullName.Substring($Root.Length).TrimStart("\", "/")

                # Keep public asset reporting useful but compact.
                if (
                    $relative -like "public\*" -and
                    -not $_.PSIsContainer -and
                    $relative -notlike "public\hero\*" -and
                    $relative -notmatch "^public\\(6logo|favicon|apple-touch-icon)"
                ) {
                    return
                }

                $depth = ($relative -split "[\\/]").Count - 1
                $indent = "  " * $depth
                $kind = if ($_.PSIsContainer) { "[DIR] " } else { "[FILE]" }
                Add-Content -Path $Output -Value "$indent$kind $relative"
            }
    }
}

Write-Section "IMPORTANT FILE LOCATIONS" {
    $Names = @(
        "page.tsx",
        "layout.tsx",
        "sitemap.ts",
        "manifest.ts",
        "route.ts",
        "StayKnownHomePage.tsx",
        "PlansExperience.tsx",
        "FeaturesExperience.tsx",
        "HowItWorksExperience.tsx",
        "TrustSafetyExperience.tsx",
        "StayKnownHowItWorks.tsx",
        "stayknown-billing-region.ts",
        "stayknown-billing-types.ts",
        "stayknown-home-content.ts",
        "stayknown-social-image.tsx",
        "stayknown-icon.tsx"
    )

    Get-ChildItem -Path $Root -Recurse -File -Force |
        Where-Object {
            -not (Is-ExcludedPath $_.FullName) -and
            $Names -contains $_.Name
        } |
        Sort-Object FullName |
        ForEach-Object {
            $relative = $_.FullName.Substring($Root.Length).TrimStart("\", "/")
            Add-Content -Path $Output -Value $relative
        }
}

Write-Section "APP DIRECTORY CHECK" {
    foreach ($candidate in @("app", "src\app")) {
        $path = Join-Path $Root $candidate
        Add-Content -Path $Output -Value "$candidate exists: $(Test-Path $path)"
    }

    foreach ($candidate in @("components", "src\components")) {
        $path = Join-Path $Root $candidate
        Add-Content -Path $Output -Value "$candidate exists: $(Test-Path $path)"
    }

    foreach ($candidate in @("lib", "src\lib")) {
        $path = Join-Path $Root $candidate
        Add-Content -Path $Output -Value "$candidate exists: $(Test-Path $path)"
    }
}

Write-Section "TSCONFIG.JSON" {
    $path = Join-Path $Root "tsconfig.json"
    if (Test-Path $path) {
        Get-Content $path | Add-Content -Path $Output
    } else {
        Add-Content -Path $Output -Value "[MISSING] tsconfig.json"
    }
}

Write-Section "PACKAGE.JSON" {
    $path = Join-Path $Root "package.json"
    if (Test-Path $path) {
        Get-Content $path | Add-Content -Path $Output
    } else {
        Add-Content -Path $Output -Value "[MISSING] package.json"
    }
}

Write-Section "NEXT CONFIG FILES" {
    $configs = Get-ChildItem -Path $Root -File -Force |
        Where-Object {
            $_.Name -in @(
                "next.config.js",
                "next.config.mjs",
                "next.config.ts"
            )
        }

    if (-not $configs) {
        Add-Content -Path $Output -Value "[NONE FOUND]"
    } else {
        foreach ($config in $configs) {
            Add-Content -Path $Output -Value ""
            Add-Content -Path $Output -Value "### $($config.Name)"
            Get-Content $config.FullName | Add-Content -Path $Output
        }
    }
}

Write-Section "ALIAS IMPORTS IN RELEVANT CODE" {
    $CodeRoots = @("app", "src", "components", "lib")

    foreach ($codeRoot in $CodeRoots) {
        $path = Join-Path $Root $codeRoot
        if (-not (Test-Path $path)) {
            continue
        }

        Get-ChildItem -Path $path -Recurse -File -Include *.ts,*.tsx |
            Select-String -Pattern 'from\s+["'']@/' |
            ForEach-Object {
                $relative = $_.Path.Substring($Root.Length).TrimStart("\", "/")
                Add-Content -Path $Output -Value (
                    "${relative}:$($_.LineNumber): $($_.Line.Trim())"
                )
            }
    }
}

Write-Host ""
Write-Host "Created:" -ForegroundColor Green
Write-Host $Output -ForegroundColor Cyan
Write-Host ""
Write-Host "Send stayknown-project-structure.txt in this chat." -ForegroundColor Yellow