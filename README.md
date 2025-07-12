# EIO OpenGlasses SDK

Welcome to the **EIO OpenGlasses SDK** — an early‑access software kit and documentation set for building Android 9–based AR experiences on the Star1s reference hardware (480 × 320 display).

> **Status:** proof‑of‑concept, pre‑production hardware; APIs and structure will change.

---

## Hardware at a Glance

| Feature | Spec                                 |
| ------- | ------------------------------------ |
| Display | 480 × 320 monocular screen              |
| OS      | webOS 2.23 (Android 9 AOSP base)      |
| Sensors | Camera, Mic, IMU, Touchpad/KeyEvents |
| I/O     | BT/BLE, Wi‑Fi                        |

*(Replace placeholders as the spec firms up.)*

---

## Quick Start (5 min)
```bash
git clone https://github.com/eio-open/eio-open.git
cd eio-open
./gradlew :demos:hello-glasses:installDebug
```

Connect the glasses in **ADB** mode, run the app, and you should see:

* Camera preview
* Key event logger
* Voice recording & TTS echo
  *(GIF in /docs/screenshots soon)*

---

## Repository Layout

```
/
├── README.md               ← you are here
├── docs/                   ← Markdown‑converted vendor docs
├── glasses-sdk/            ← Thin Kotlin/Java wrapper around vendor APIs
├── demos/
│   └── hello-glasses/      ← Minimal runnable demo
├── .github/                ← Issue & PR templates, CI workflows
└── build.gradle[.kts] etc.
```

A pristine copy of the vendor examples lives on the **`vendor-sdk` branch**.
Switch with:

```bash
git fetch origin vendor-sdk:vendor-sdk
git switch vendor-sdk
```

---

## Roadmap

| Milestone  | Target                                 | ETA        |
| ---------- | -------------------------------------- | ---------- |
| **Day 0**  | Repo skeleton, CI green                | ✔︎         |
| **Day 7**  | Wrapper v0, Hello‑Glasses demo         | 2025‑07‑19 |
| **Day 14** | Public announcement, draft release APK | 2025‑07‑26 |

---

## Contributing

We welcome early feedback via Issues & Discussions. PRs are accepted after 2025‑08‑01.

---

## License

The current repository is released *as‑is* without an explicit OSS license while hardware & legal reviews are in progress. By contributing you agree to allow relicensing under an OSI‑approved license in the future.
