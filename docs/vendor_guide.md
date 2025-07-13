# Vendor Documentation

This file summarizes key hardware integration points for EIO Glasses (webOS-based).

## Key Event Codes (Reference)

| Key Name | Android KeyCode | Typical webOS Code |
|----------|-----------------|--------------------|
| LEFT     | 105             | ArrowLeft          |
| RIGHT    | 106             | ArrowRight         |
| OK       | 352             | Enter              |
| BACK     | 158             | Backspace          |
| POWER    | 164             | (N/A)              |

- Use these codes to detect hardware button presses in your app.
- See `app.js` for example key event handling.

## Speaker / TTS Usage

- The demo uses the webOS TTS service:
  - Service: `luna://com.webos.service.tts`
  - Method: `speak`
  - Example parameters: `{ text: 'Hello from EIO Glasses!' }`
- See `app.js` for a working example.

For more advanced integration, consult your vendor’s full documentation. 