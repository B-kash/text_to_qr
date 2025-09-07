# Text → QR

A tiny, offline-friendly Text to QR generator and scanner. No tracking, no backend. Works by generating QR codes locally and decoding them via your camera or uploaded images.

## Features

- Mode switch: Text → QR and QR → Text
- Generate QR from any text or URL
- Error correction control (Low/Medium/High/Very High)
- Download PNG and Copy PNG to clipboard
- Share QR image via the Web Share API (on supported devices)
- Scan via camera or decode from an image
- Templates: Wi‑Fi, vCard, Calendar (VCAL)
- Copy decoded text with visual feedback
- Keyboard shortcut: Cmd/Ctrl + Enter to Generate
- PWA install + offline caching (service worker)
- Accessible states for disabled buttons and focus

## Getting Started

Open `index.html` directly in your browser. No build step is required.

- For full functionality (Install as app, Share, Copy PNG), serve over HTTP(S) or localhost.
- Opening via file:// works for generation and scanning, but service worker and some APIs are restricted.

### Optional: Run a local server

- Python: `python3 -m http.server 5500`
- Node (serve): `npx serve` (or any static server)
- Then visit `http://localhost:5500/`

## File Structure

- `index.html`: App markup and CDN includes for `qrcodejs` and `jsQR`.
- `assets/styles.css`: All app styles (light/dark, buttons, ripple, tooltip).
- `assets/ui.js`: UI helpers (button ripple, copy tooltip) exposed as `window.UI`.
- `assets/generator.js`: Text → QR logic exposed as `window.Generator`.
- `assets/scanner.js`: Camera/image QR decoding exposed as `window.Scanner`.
- `assets/main.js`: Boots the app by calling `UI.attachButtonRipples()`, `Generator.initGenerator()`, and `Scanner.initScanner()`.

## Libraries

- QR generation: qrcodejs (CDN)
- QR scanning: jsQR (CDN)

These are included via `<script>` tags in `index.html` and used as globals.

## PWA

- Manifest: `assets/manifest.webmanifest`
- Service worker: `assets/sw.js` (caches core assets for offline use)
- Install from your browser menu when served over HTTP(S)

## Templates

- Wi‑Fi (WIFI:T:S:P:H format)
- Contact (vCard 3.0)
- Calendar (VCALENDAR/VEVENT)

## Accessibility

- Buttons show focus outlines (`:focus-visible`) and disable visually + logically when actions aren’t available.
- Copy shows a short‑lived tooltip (“Copied!!”). Respects `prefers-reduced-motion`.

## Privacy

- All generation and scanning runs locally in your browser. No data leaves your device.

## Troubleshooting

- Copy PNG not available / Share disabled:
  - These require a secure context (HTTPS or `http://localhost`). Use a local server.
- PWA install not offered / offline not working:
  - Service workers require HTTP(S). Use `python3 -m http.server` or any static server.
- Camera permission denied:
  - Serve over `http://` or `https://` and allow camera access, or use “Decode from image”.

## Notes

- Modern browsers recommended. Dark mode adapts via `prefers-color-scheme`.
- No build tooling required; just static files.
