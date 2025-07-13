# EIO Glasses Open Developer Platform

Welcome to the **EIO Glasses Open Developer Platform** — an early-access, community-driven project for building AR experiences on the EIO Glasses (480x320 monocular display, webOS-based).

> **Status:** Proof-of-concept, pre-production hardware. APIs and structure will evolve.  
> **Goal:** Attract developers, gather feedback, and build an open ecosystem for AR glasses.

---

## Vision

We believe in open innovation for AR wearables.  
This repo is the starting point for developers, hackers, and partners to explore, prototype, and shape the future of EIO Glasses.

---

## Hardware at a Glance

| Feature  | Spec                        |
|----------|-----------------------------|
| Display  | 480x320 monocular           |
| OS       | webOS OSE 2.23 (Android 9)  |
| Sensors  | Camera, Mic, IMU, Touchpad  |
| I/O      | BT/BLE, Wi-Fi               |

---

## Quick Start

1. **Clone this repository:**
    ```bash
    git clone https://github.com/eio-open/eio-open.git
    cd platforms/webos/hello-eio-glasses-webos
    ```

2. **Install prerequisites:**  
   - Node.js & npm  
   - Oracle VirtualBox  
   - webOS OSE Emulator  
   - webOS CLI tools (`ares-cli`)

   See: [webOS OSE Emulator User Guide](https://www.webosose.org/docs/tools/sdk/emulator/virtualbox-emulator/emulator-user-guide/)

3. **Package the app:**
    ```bash
    ares-package .
    ```

4. **Start the webOS Emulator:**  
   - Open VirtualBox, start the webOS OSE VM, wait for it to boot.

5. **Install the app:**
    ```bash
    ares-install -d emulator com.eio.demo.glasses_0.0.1_all.ipk
    ```

6. **Launch the app:**
    ```bash
    ares-launch -d emulator com.eio.demo.glasses
    ```

---

## Project Structure

```
/
├── README.md
├── docs/
│   ├── vendor_guide.md
│   └── api_reference.md
├── platforms/
│   └── webos/
│       ├── README.md
│       └── [demo files]
└── .github/
```

---

## How to Develop Your Own App

See [`platforms/webos/README.md`](platforms/webos/README.md) for:
- How to modify the demo
- How to add new features
- How to debug and deploy to the emulator

---

## Roadmap

| Milestone         | Target/Feature                  | ETA         |
|-------------------|---------------------------------|-------------|
| **MVP**           | Public demo, docs, onboarding   | ✔️ Now       |
| **Community**     | Accept issues, PRs, feedback    | Q3 2025     |
| **SDK/Tools**     | Add JS SDK, CLI helpers         | Q4 2025     |
| **Native Support**| Android/other OS support        | 2026+       |

---

## Contributing

- **Feedback:** Open an issue for bugs, questions, or feature requests.
- **Pull Requests:** PRs are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon).
- **Community:** Join our discussions to help shape the platform.

---

## License

This repository is released as-is, without an explicit open source license.  
By contributing, you agree to allow relicensing under an OSI-approved license in the future.

---

## More Information

- [webOS OSE Emulator User Guide](https://www.webosose.org/docs/tools/sdk/emulator/virtualbox-emulator/emulator-user-guide/)
- [Vendor documentation](docs/vendor_guide.md)
