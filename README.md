# EIO Glasses webOS Demo

Welcome to the **EIO OpenGlasses SDK** — an early‑access software kit and documentation set for building AR experiences on the Star1s reference hardware (480 × 320 display).

This repository contains a minimal demo web application for EIO Glasses, designed to run on the webOS OSE Emulator.

> **Status:** proof‑of‑concept, pre‑production hardware; APIs and structure will change.

---

## Prerequisites

Before you begin, you need to install:

- **Node.js** and **npm**
- **Oracle VirtualBox**
- **webOS OSE Emulator** (runs in VirtualBox)
- **webOS CLI tools** (`ares-cli`)

| Feature | Spec                                 |
| ------- | ------------------------------------ |
| Display | 480 × 320 monocular screen              |
| OS      | webOS 2.23 (Android 9 AOSP base)      |
| Sensors | Camera, Mic, IMU, Touchpad/KeyEvents |
| I/O     | BT/BLE, Wi‑Fi                        |

**For detailed installation instructions, see the official webOS OSE Emulator User Guide:**  
👉 [webOS OSE Emulator User Guide](https://www.webosose.org/docs/tools/sdk/emulator/virtualbox-emulator/emulator-user-guide/)

This guide covers:
- How to install VirtualBox
- How to download and import the webOS OSE Emulator
- How to install the webOS CLI tools (`ares-cli`)
- How to start and use the emulator

---

## Quick Start

1. **Clone this repository:**
    ```bash
    git clone <your-repo-url>
    cd eio-open/platforms/webos/hello-eio-glasses-webos
    ```

2. **Package the app:**
    ```bash
    ares-package .
    ```
    This will create a `.ipk` file in the current directory.

3. **Start the webOS Emulator:**
    - Open VirtualBox and start the imported webOS OSE VM.
    - Wait for the emulator to fully boot (you should see the webOS home screen).

4. **Install the app on the emulator:**
    ```bash
    ares-install -d emulator com.eio.demo.glasses_0.0.1_all.ipk
    ```

* Camera preview
* Key event logger
* Voice recording & TTS echo
  *(GIF in /docs/screenshots soon)*

5. **Launch the app:**
    ```bash
    ares-launch -d emulator com.eio.demo.glasses
    ```
---

## Project Structure

```
platforms/webos/hello-eio-glasses-webos/
├── appinfo.json      # App manifest
├── index.html        # Main HTML file
├── app.js            # Main JavaScript logic
├── icon.png          # App icon
└── views/
    └── MainPanel.jsx # Main view (if using Enact/React)
```

---

## Troubleshooting

- If you get a connection error (`ECONNREFUSED`), make sure the emulator is running and fully booted.
- If you have issues with packaging, check that all JSX files use the `.jsx` extension.

---

## More Information

For advanced usage, troubleshooting, and emulator tips, refer to:  
👉 [webOS OSE Emulator User Guide](https://www.webosose.org/docs/tools/sdk/emulator/virtualbox-emulator/emulator-user-guide/)

---

## License

The current repository is released *as‑is* without an explicit OSS license while hardware & legal reviews are in progress. By contributing you agree to allow relicensing under an OSI‑approved license in the future.
