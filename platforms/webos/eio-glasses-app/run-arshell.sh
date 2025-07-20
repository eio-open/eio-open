#!/bin/bash
# Run this script from the eio-glasses-app directory
# It will package, install, and launch the AR Shell app on the webOS emulator

set -e

APP_ID="com.example.arshell"
PKG_FILE="${APP_ID}_0.0.5_all.ipk"

# Package the app
echo "[1/3] Packaging the app..."
npm run package:webos

# Install the app
echo "[2/3] Installing the app to emulator..."
ares-install -d emulator "dist_ipk/$PKG_FILE"

# Launch the app
echo "[3/3] Launching the app on emulator..."
ares-launch -d emulator "$APP_ID"

echo "Done! Check your webOS emulator."
echo "Press F1 or click the settings button to open quick settings panel." 