# AR Shell - Development Guide

A minimal webOS AR Shell prototype with quick settings panel.

## Prerequisites

- Node.js (v16 or higher)
- npm
- webOS OSE SDK with ares-cli installed globally:
  ```bash
  npm install -g @webosose/ares-cli
  ```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building and Packaging

The app includes both a React/Vite version for development and a static version for webOS packaging.

### Development (React/Vite)
```bash
npm run dev
```

### Packaging for webOS
```bash
npm run package:webos
```

This creates an `.ipk` file in the `dist_ipk/` directory using the static version.

## Installation and Launch

**Note**: The emulator must be in Developer Mode for LS2 calls to succeed.

1. Start the webOS emulator:
   ```bash
   ares-launch -e
   ```

2. Install the app:
   ```bash
   ares-install -d emulator dist_ipk/com.example.arshell_0.0.5_all.ipk
   ```

3. Launch the app:
   ```bash
   ares-launch com.example.arshell
   ```

## Usage

- **Desktop Browser**: App is centered in a 480×320 viewport with dark background
- **Emulator**: App fills the entire screen (480×320)
- **Toggle Panel**: Press **F1** or tap anywhere on the status bar
- **Close Panel**: Tap the × button in the panel header
- **Wi-Fi Scan**: Automatically scans when panel opens, shows "No Wi-Fi adapter in emulator" on emulator
- **Language Change**: Tap language options in Locale section to change system language with live UI refresh
- **Rotary Input**: Use Up/Down arrows to navigate, Enter to activate, Esc to go back

## Features

- **480×320 Fixed Viewport**: Optimized for AR glasses display with centered layout
- **Status Bar**: 24px height with time (24h format), battery (85%), and Wi-Fi icons
- **Quick Settings Panel**: Full-screen overlay with Wi-Fi, Locale, and Status sections
- **Touch-Friendly Design**: 44×44px minimum touch targets throughout
- **Rotary Navigation**: Full rotary wheel support with focus management
- **Keyboard Shortcut**: F1 key toggles the panel (fallback)
- **Tap-to-Toggle**: Tap anywhere on status bar to open settings
- **Internationalization**: Supports English, Chinese, and French
- **Real LS2 Integration**: Production-grade service wrapper with timeout handling
- **Wi-Fi Network Scanning**: Real-time network discovery via LS2
- **System Locale Reading**: Reads current system locale via LS2
- **System Locale Writing**: Changes system locale via LS2 with live i18n refresh
- **Error Handling**: Timeout and error management with user feedback
- **Feature Flags**: Configuration for enabling/disabling real services

## Project Structure

```
src/                          # React/Vite development version
├── components/
│   └── QuickSettingsPanel.jsx # Settings panel component
├── services/
│   └── ls2.js                 # LS2 service wrapper stub
├── i18n/
│   ├── en.json                # English translations
│   ├── zh.json                # Chinese translations
│   └── fr.json                # French translations
├── config/
│   └── featureFlags.js        # Feature configuration
├── styles/
│   ├── global.css             # Global styles
│   └── panel.css              # Panel-specific styles
├── App.jsx                    # Main app component
└── main.jsx                   # App entry point

webos-static/                  # Static version for webOS packaging
├── index.html                 # Static HTML with inline styles
├── app.js                     # Vanilla JavaScript implementation
├── appinfo.json               # webOS app metadata
└── icon.png                   # App icon
```

## Changing Language

The app supports changing the system language with live i18n refresh:

1. **Open Quick Settings**: Press F1 or tap the status bar
2. **Select Language**: Tap any language option in the "Language" section
3. **Live Refresh**: UI text immediately switches to the selected language
4. **System Update**: LS2 call updates the system locale setting
5. **Error Handling**: If the change fails, the UI reverts to the previous language

**Emulator Note**: The emulator may accept the locale change but not propagate it system-wide. This is expected behavior - the in-app language will still change successfully.

**Permissions**: The app requires `settings.write` permission to change system locale.

## Rotary Input Mapping

The app supports rotary wheel input for touchless navigation:

### Hardware Mapping
- **Scroll Forward (KEY_UP)**: Move focus to next element
- **Scroll Back (KEY_DOWN)**: Move focus to previous element  
- **Single Click (KEY_ENTER)**: Activate focused element
- **Double Click (KEY_BACK)**: Go back/close panel

### Keyboard Testing
For testing on desktop/emulator, use these keys:
- **Up Arrow**: Scroll forward
- **Down Arrow**: Scroll back
- **Enter**: Single click
- **Esc**: Double click (back)

### Focus Management
- Focus follows visual order (top-to-bottom, left-to-right)
- Focus persists per view (status bar vs panel)
- 2px cyan outline highlights focused elements
- All interactive elements are focusable (44×44px minimum)

## Next Steps

This is Step K1 of the implementation plan. Future steps will include:
- Wi-Fi network connection functionality (L1)
- Real system status subscriptions (ST1)
- Enhanced error handling and toast notifications
- Sensor service integration 