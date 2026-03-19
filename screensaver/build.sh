#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# WizardingFrame — macOS Screensaver Builder
# Produces: WizardingFrame.saver  (double-click to install)
# Requires: Xcode Command Line Tools  (xcode-select --install)
# ─────────────────────────────────────────────────────────────────────────────
set -e

ARCH=$(uname -m)                          # arm64 or x86_64
SDK=$(xcrun --show-sdk-path --sdk macosx)
MIN_OS="13.0"
TARGET="${ARCH}-apple-macos${MIN_OS}"

BUNDLE="WizardingFrame.saver"
CONTENTS="$BUNDLE/Contents"
MACOS_DIR="$CONTENTS/MacOS"
RESOURCES_DIR="$CONTENTS/Resources"

echo "🪄 Building WizardingFrame Screensaver (${ARCH})..."

# Clean previous build
rm -rf "$BUNDLE"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR"

# Compile Swift → bundle (MH_BUNDLE, loaded by ScreenSaverEngine)
swiftc \
  -target "$TARGET" \
  -sdk "$SDK" \
  -framework ScreenSaver \
  -framework WebKit \
  -framework AppKit \
  -Xlinker -bundle \
  -module-name WizardingFrame \
  Sources/WizardingFrameView.swift \
  Sources/MediaSchemeHandler.swift \
  Sources/ConfigureSheet.swift \
  -o "$MACOS_DIR/WizardingFrame"

# Bundle metadata
cp Info.plist "$CONTENTS/Info.plist"

# Bundle the web player (HTML/CSS/JS/effects/modes)
cp -r ../player "$RESOURCES_DIR/player"
# Remove server-only files that aren't needed in the screensaver
rm -f "$RESOURCES_DIR/player/upload.html" \
      "$RESOURCES_DIR/player/manifest.json"

echo ""
echo "✅  $BUNDLE"
echo ""
echo "Install (double-click or run):"
echo "  open \"$BUNDLE\""
echo ""
echo "Or copy manually:"
echo "  cp -r \"$BUNDLE\" ~/Library/Screen\ Savers/"
echo "  open '/System/Library/PreferencePanes/ScreenSaver.prefPane'"
