# EIO Glasses API Reference (WIP)

This file will contain API notes, usage examples, and integration tips for the EIO Glasses platform as it evolves.

## Key Event Codes

- Use the following codes to detect key events in your app:
  - `ArrowLeft`  → LEFT
  - `ArrowRight` → RIGHT
  - `Enter`      → OK
  - `Backspace`  → BACK

See `app.js` for usage.

## TTS Usage Example

```js
webOS.service.request('luna://com.webos.service.tts', {
  method: 'speak',
  parameters: { text: 'Hello from EIO Glasses!' },
  onSuccess: function ()  { /* handle success */ },
  onFailure: function (e) { /* handle error */ }
});
```

- See the demo app for a working implementation. 