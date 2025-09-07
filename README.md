# Note → QR

A tiny, offline-friendly Note to QR generator and scanner. No tracking, no backend. Works by generating QR codes locally and decoding them via your camera or uploaded images.

## Features

- Generate QR from any text or URL
- Choose size and error correction (ECC)
- Download PNG of the generated QR
- Scan via camera or decode from an image
- Copy decoded text with visual feedback
- Keyboard shortcut: Cmd/Ctrl + Enter to Generate
- Accessible states for disabled buttons and focus

## Getting Started

Open `index.html` directly in your browser. No build step is required.

- If you open via file://, everything works because the scripts are classic (non‑module) scripts.
- If you prefer ES modules, serve the folder over HTTP(S) to avoid browser CORS restrictions for `file://`.

### Optional: Run a local server

- Python: `python3 -m http.server 5500`
- Node (serve): `npx serve` (or any static server)
- Then visit `http://localhost:5500/`

## File Structure

- `index.html`: App markup and CDN includes for `qrcodejs` and `jsQR`.
- `styles.css`: All app styles (light/dark, buttons, ripple, tooltip).
- `ui.js`: UI helpers (button ripple, copy tooltip) exposed as `window.UI`.
- `generator.js`: Note → QR logic exposed as `window.Generator`.
- `scanner.js`: Camera/image QR decoding exposed as `window.Scanner`.
- `main.js`: Boots the app by calling `UI.attachButtonRipples()`, `Generator.initGenerator()`, and `Scanner.initScanner()`.

## Libraries

- QR generation: qrcodejs (CDN)
- QR scanning: jsQR (CDN)

These are included via `<script>` tags in `index.html` and used as globals.

## Accessibility

- Buttons show focus outlines (`:focus-visible`) and disable visually + logically when actions aren’t available.
- Copy shows a short‑lived tooltip (“Copied!!”). Respects `prefers-reduced-motion`.

## Privacy

- All generation and scanning runs locally in your browser. No data leaves your device.

## Troubleshooting

- “Access to script from origin 'null' has been blocked by CORS” when opening via `file://`:
  - Use the provided classic scripts (default) — they work off disk.
  - Or run a local server if switching back to ES modules.
- Camera permission denied:
  - Ensure the page is served over `http://` or `https://` and grant camera permissions, or use “Decode from image”.

## Notes

- Modern browsers recommended. Dark mode adapts via `prefers-color-scheme`.
- No build tooling required; just static files.

