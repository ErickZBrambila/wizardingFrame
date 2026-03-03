# ═══════════════════════════════════════════════════════════════════════════════
#  🪄  WizardingFrame — Setup Script (Windows)
#  Run from PowerShell: .\setup.ps1
#  If you see an execution policy error, first run:
#    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

# Colors
function Write-Gold   { param($msg) Write-Host "  $msg" -ForegroundColor Yellow }
function Write-Ok     { param($msg) Write-Host "  $([char]0x2713) $msg" -ForegroundColor Green }
function Write-Info   { param($msg) Write-Host "  -> $msg" -ForegroundColor Cyan }
function Write-Warn   { param($msg) Write-Host "  ! $msg" -ForegroundColor Yellow }
function Write-Step   { param($msg) Write-Host "`n$msg" -ForegroundColor Yellow }
function Write-Fail   {
  param($msg)
  Write-Host "  ERROR: $msg" -ForegroundColor Red
  exit 1
}

function Write-Banner {
  Write-Host ""
  Write-Host "  =============================================" -ForegroundColor Yellow
  Write-Host "         🪄  WizardingFrame Setup" -ForegroundColor Yellow
  Write-Host "  =============================================" -ForegroundColor Yellow
  Write-Host ""
}

# ─── Check Node.js ────────────────────────────────────────────────────────────

function Check-Node {
  Write-Step "▸ Checking Node.js"

  $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
  if ($nodeCmd) {
    $nodeVersion = (node --version).TrimStart('v')
    $nodeMajor   = [int]($nodeVersion.Split('.')[0])

    if ($nodeMajor -ge 18) {
      Write-Ok "Node.js v$nodeVersion found (v18+ required)"
    } else {
      Write-Warn "Node.js v$nodeVersion found but v18+ is required"
      Install-Node
    }
  } else {
    Write-Warn "Node.js not found — please install it"
    Install-Node
  }
}

function Install-Node {
  Write-Info "Opening Node.js download page..."
  Write-Info "Download the LTS version, install it, then re-run this script."
  Start-Process "https://nodejs.org/en/download"

  $response = Read-Host "  Press Enter after Node.js is installed, or Ctrl+C to cancel"

  # Re-check
  $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $nodeCmd) {
    Write-Fail "Node.js still not found. Please install from https://nodejs.org and re-run setup.ps1"
  }
  Write-Ok "Node.js found: $(node --version)"
}

# ─── Check winget / Chocolatey for ffmpeg ─────────────────────────────────────

function Check-Ffmpeg {
  Write-Step "▸ Checking ffmpeg (optional — needed for Live Photo conversion)"

  $ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($ffmpegCmd) {
    $ffVer = (ffmpeg -version 2>&1 | Select-Object -First 1) -replace "ffmpeg version ",""
    Write-Ok "ffmpeg found"
  } else {
    Write-Warn "ffmpeg not found — you can still use WizardingFrame without it."
    Write-Warn "To convert Apple Live Photos later, install ffmpeg:"
    Write-Host "       winget install ffmpeg" -ForegroundColor Gray
    Write-Host "       or: choco install ffmpeg  (if you use Chocolatey)" -ForegroundColor Gray
  }
}

# ─── npm install ──────────────────────────────────────────────────────────────

function Install-Deps {
  Write-Step "▸ Installing dependencies"
  Write-Info "Running npm install..."

  & npm install
  if ($LASTEXITCODE -ne 0) { Write-Fail "npm install failed" }

  Write-Ok "Dependencies installed"
}

# ─── Create media folder ──────────────────────────────────────────────────────

function Setup-Media {
  Write-Step "▸ Setting up media folder"

  if (-not (Test-Path "media")) {
    New-Item -ItemType Directory -Path "media" | Out-Null
  }

  $readmePath = "media\README.txt"
  if (-not (Test-Path $readmePath)) {
    @"
WizardingFrame — Media Folder
═══════════════════════════════

Drop your photos and videos here!

Supported formats:
  Images:  .jpg  .jpeg  .png  .webp  .gif
  Videos:  .mp4  .webm  .mov

Tips:
  - Videos loop automatically (great for Apple Live Photos!)
  - Mix images and videos freely
  - The frame watches this folder — add files anytime, no restart needed
  - Visit http://localhost:3000/upload.html to upload from your phone
"@ | Out-File -FilePath $readmePath -Encoding UTF8
    Write-Ok "Created media\ folder with README"
  } else {
    Write-Ok "media\ folder already exists"
  }
}

# ─── Create Windows launcher ─────────────────────────────────────────────────

function Create-Launcher {
  Write-Step "▸ Creating launcher"

  $launcherPath = "Start-WizardingFrame.bat"
  @"
@echo off
title WizardingFrame
cd /d "%~dp0"
echo.
echo  Wizarding Frame is starting...
echo  Open http://localhost:3000 in your browser
echo.
npm start
pause
"@ | Out-File -FilePath $launcherPath -Encoding ASCII

  Write-Ok "Created Start-WizardingFrame.bat (double-click to start)"
}

# ─── Print success ────────────────────────────────────────────────────────────

function Write-Success {
  $mediaPath = (Resolve-Path "media").Path
  Write-Host ""
  Write-Host "  ========================================================" -ForegroundColor Yellow
  Write-Host "     ✨  WizardingFrame is ready!" -ForegroundColor Yellow
  Write-Host "  ========================================================" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "  Next steps:" -ForegroundColor White
  Write-Host ""
  Write-Host "  1. Start the server:" -ForegroundColor White
  Write-Host "       Double-click: Start-WizardingFrame.bat" -ForegroundColor Cyan
  Write-Host "       Or run:       npm start" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  2. Drop media into:  $mediaPath" -ForegroundColor White
  Write-Host "     Or upload via:    http://localhost:3000/upload.html" -ForegroundColor White
  Write-Host ""
  Write-Host "  3. The browser opens automatically" -ForegroundColor White
  Write-Host ""
  Write-Host "  Docs:" -ForegroundColor White
  Write-Host "    iPad/tablet guide:  docs\ipad-tablet-setup.md" -ForegroundColor Gray
  Write-Host "    Pi guide:           docs\raspberry-pi-setup.md" -ForegroundColor Gray
  Write-Host ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────

Write-Banner
Check-Node
Check-Ffmpeg
Install-Deps
Setup-Media
Create-Launcher
Write-Success
