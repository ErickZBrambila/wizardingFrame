#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#  🪄  WizardingFrame — Setup Script (macOS / Linux / Raspberry Pi)
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; GOLD='\033[0;33m'; NC='\033[0m'; BOLD='\033[1m'

print_banner() {
  echo ""
  echo -e "${GOLD}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${GOLD}║                                           ║${NC}"
  echo -e "${GOLD}║       🪄  WizardingFrame Setup            ║${NC}"
  echo -e "${GOLD}║                                           ║${NC}"
  echo -e "${GOLD}╚═══════════════════════════════════════════╝${NC}"
  echo ""
}

ok()   { echo -e "${GREEN}  ✓${NC} $1"; }
info() { echo -e "${BLUE}  →${NC} $1"; }
warn() { echo -e "${YELLOW}  ⚠${NC} $1"; }
fail() { echo -e "${RED}  ✗ ERROR:${NC} $1"; exit 1; }
step() { echo -e "\n${BOLD}${GOLD}▸ $1${NC}"; }

# ─── Detect Platform ──────────────────────────────────────────────────────────

detect_platform() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macos"
  elif grep -qi "raspberry pi\|raspbian" /proc/cpuinfo 2>/dev/null || \
       grep -qi "raspbian" /etc/os-release 2>/dev/null; then
    PLATFORM="pi"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
  else
    PLATFORM="unknown"
  fi
  ok "Platform detected: $PLATFORM"
}

# ─── Check Node.js ────────────────────────────────────────────────────────────

check_node() {
  step "Checking Node.js"

  if command -v node &> /dev/null; then
    NODE_VER=$(node --version | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)

    if [[ "$NODE_MAJOR" -ge 18 ]]; then
      ok "Node.js v$NODE_VER found (✓ v18+ required)"
    else
      warn "Node.js v$NODE_VER found but v18+ is required"
      install_node
    fi
  else
    warn "Node.js not found — installing..."
    install_node
  fi
}

install_node() {
  if [[ "$PLATFORM" == "macos" ]]; then
    if command -v brew &> /dev/null; then
      info "Installing Node.js via Homebrew..."
      brew install node
    else
      fail "Homebrew not found. Install it from https://brew.sh then re-run this script."
    fi
  elif [[ "$PLATFORM" == "pi" ]] || [[ "$PLATFORM" == "linux" ]]; then
    info "Installing Node.js 20 via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    fail "Could not auto-install Node.js. Please install from https://nodejs.org (v18+)"
  fi
  ok "Node.js installed: $(node --version)"
}

# ─── Check ffmpeg (optional, for pipeline) ────────────────────────────────────

check_ffmpeg() {
  step "Checking ffmpeg (optional — needed for Live Photo conversion)"

  if command -v ffmpeg &> /dev/null; then
    ok "ffmpeg found: $(ffmpeg -version 2>&1 | head -1 | awk '{print $3}')"
  else
    warn "ffmpeg not found — you can still use WizardingFrame without it."
    warn "To convert Apple Live Photos, install ffmpeg:"
    if [[ "$PLATFORM" == "macos" ]]; then
      echo "       brew install ffmpeg"
    elif [[ "$PLATFORM" == "pi" ]] || [[ "$PLATFORM" == "linux" ]]; then
      echo "       sudo apt install ffmpeg"
    fi
  fi
}

# ─── Install npm dependencies ─────────────────────────────────────────────────

install_deps() {
  step "Installing dependencies"
  info "Running npm install..."
  npm install
  ok "Dependencies installed"
}

# ─── Create media folder with README ─────────────────────────────────────────

setup_media() {
  step "Setting up media folder"

  mkdir -p media

  if [[ ! -f "media/README.txt" ]]; then
    cat > media/README.txt << 'MEDIAEOF'
WizardingFrame — Media Folder
═══════════════════════════════

Drop your photos and videos here!

Supported formats:
  Images:  .jpg  .jpeg  .png  .webp  .gif
  Videos:  .mp4  .webm  .mov

Tips:
  • Videos loop automatically — great for Apple Live Photos
  • Mix images and videos freely
  • The frame watches this folder — add files anytime, no restart needed
  • Visit http://localhost:3000/upload.html to upload from your phone

To convert Apple Live Photos into looping videos, run:
  node pipeline/convert.js --input ~/path/to/livephotos --output ./media
MEDIAEOF
    ok "Created media/ folder with README"
  else
    ok "media/ folder already exists"
  fi
}

# ─── Platform-specific: create launcher ───────────────────────────────────────

create_launcher() {
  step "Creating launcher"

  if [[ "$PLATFORM" == "macos" ]]; then
    # Create a simple .command file (double-clickable on macOS)
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cat > start-wizardingframe.command << LAUNCHEOF
#!/bin/bash
cd "$(dirname "\$0")"
echo "🪄 Starting WizardingFrame..."
npm start
LAUNCHEOF
    chmod +x start-wizardingframe.command
    ok "Created start-wizardingframe.command (double-click to start)"

  elif [[ "$PLATFORM" == "pi" ]]; then
    # Systemd service for Pi always-on
    cat > /tmp/wizardingframe.service << SVCEOF
[Unit]
Description=WizardingFrame Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) server/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=NO_OPEN=1

[Install]
WantedBy=multi-user.target
SVCEOF
    sudo cp /tmp/wizardingframe.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable wizardingframe
    ok "Systemd service installed — WizardingFrame will start on boot"
    info "Start now with: sudo systemctl start wizardingframe"
  fi
}

# ─── Print success ────────────────────────────────────────────────────────────

print_success() {
  echo ""
  echo -e "${GOLD}╔═══════════════════════════════════════════════════╗${NC}"
  echo -e "${GOLD}║                                                   ║${NC}"
  echo -e "${GOLD}║   ✨  WizardingFrame is ready!                    ║${NC}"
  echo -e "${GOLD}║                                                   ║${NC}"
  echo -e "${GOLD}╚═══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BOLD}  Next steps:${NC}"
  echo ""

  if [[ "$PLATFORM" == "pi" ]]; then
    echo "  1. Start the server:"
    echo "     ${YELLOW}sudo systemctl start wizardingframe${NC}"
    echo ""
    echo "  2. Drop media into:  $(pwd)/media/"
    echo "  3. Open on your Pi:  http://localhost:3000"
    echo ""
    echo "  📖 Full Pi guide:  docs/raspberry-pi-setup.md"
  else
    echo "  1. Start the server:"
    echo "     ${YELLOW}npm start${NC}"
    if [[ "$PLATFORM" == "macos" ]]; then
      echo "     Or double-click: start-wizardingframe.command"
    fi
    echo ""
    echo "  2. Drop media into:  $(pwd)/media/"
    echo "     Or upload via:    http://localhost:3000/upload.html"
    echo ""
    echo "  3. The browser opens automatically 🪄"
  fi
  echo ""
  echo "  📖 iPad/tablet guide: docs/ipad-tablet-setup.md"
  echo "  📖 Pi guide:          docs/raspberry-pi-setup.md"
  echo ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
  print_banner
  detect_platform
  check_node
  check_ffmpeg
  install_deps
  setup_media
  create_launcher
  print_success
}

main
