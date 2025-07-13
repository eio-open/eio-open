# EIO Glasses webOS Demo — Developer Guide

This directory contains the webOS demo app for EIO Glasses.

## Feature Overview

- **Key Event Logging:** See which keys are pressed (LEFT, RIGHT, OK, BACK, etc.) in real time.
- **Text-to-Speech (TTS):** Enter text and hear it spoken aloud using the device speaker.
- **Branded UI:** EIO logo, welcome message, and developer instructions.

## How to Run

See the [main README](../../README.md#quick-start) for setup and packaging instructions.

## How to Extend

- **Add new key handling:**
  - Edit `app.js` and expand the `KEY_MAP` or add custom logic in `logKey()`.
- **Customize TTS:**
  - Change the default text, add more TTS options, or handle TTS events in `app.js`.
- **UI/UX:**
  - Edit `index.html` and CSS to change the look, add new controls, or display more info.
- **Add new features:**
  - Create new files in `views/` or add new scripts for advanced functionality.

## Tips

- Use the [webOS CLI tools](https://www.webosose.org/docs/tools/sdk/cli/cli-overview/) for packaging, installing, and debugging.
- For advanced features (camera, sensors), refer to the [vendor documentation](../../docs/vendor_guide.md).

## Quick Troubleshooting

- **Blank screen?**
  - Make sure your emulator is running and the app is installed.
  - Check for typos in HTML/JS or missing files (like `icon.png`).
- **TTS not working?**
  - Ensure the emulator supports TTS and the webOS service bridge is available.
- **Key events not detected?**
  - Try using the emulator’s keyboard mapping or physical device keys.

## Contribution

Feel free to fork, experiment, and submit PRs! 