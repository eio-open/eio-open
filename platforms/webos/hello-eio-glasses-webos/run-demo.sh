#!/bin/bash
# Run this script from the hello-eio-glasses-webos directory
# It will package, install, and launch the demo app on the webOS emulator

set -e

APP_ID="com.eio.demo.glasses"
PKG_FILE="${APP_ID}_0.0.1_all.ipk"

# Package the app
echo "[1/3] Packaging the app..."
ares-package .

# Install the app
echo "[2/3] Installing the app to emulator..."
ares-install -d emulator "$PKG_FILE"

# Launch the app
echo "[3/3] Launching the app on emulator..."
ares-launch -d emulator "$APP_ID"

echo "Done! Check your webOS emulator." 