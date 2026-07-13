# Soul Sips Print Agent — Electron Wrapper

A system-tray Electron app that bundles PHP + `mike42/escpos-php` to receive print jobs from the cloud VPS and send them to a locally connected thermal printer.

## Architecture

```
VPS (Laravel + Cloud DB)
┌──────────────────────────────────────┐
│  POST /staff/orders                  │
│    → OrderController@store           │
│      → PrintDispatcher               │
│        → POST /print (JSON)          │
│          Header: X-Print-Secret      │
└──────────┬───────────────────────────┘
           │  HTTP (internet / VPN)
           ▼
Venue Machine — Soul Sips Print Agent (Electron)
┌──────────────────────────────────────────────┐
│  System Tray App                              │
│                                              │
│  main.js                                      │
│  ├─ Spawns: php -S 0.0.0.0:8080              │
│  │          -t bundled/public                 │
│  │          bundled/app/print-server          │
│  ├─ Monitors PHP process (restart on crash)   │
│  ├─ Watches stdout/stderr for logging         │
│  └─ Tray icon: 🟢 Online / 🔴 Offline        │
│                                              │
│  bundled/ (extraResources, outside ASAR)     │
│  ├── php/              Portable PHP binary    │
│  │   └── php.exe                              │
│  ├── app/                                     │
│  │   ├── print-server     Router script       │
│  │   ├── vendor/          mike42/escpos-php   │
│  │   ├── composer.json                        │
│  │   └── .env                                │
│  └── public/             Doc root for php -S  │
│      └── index.html                           │
└──────────────────────────────────────────────┘
```

## Features

- **System tray** with online/offline status
- **Auto-start** with Windows (configurable)
- **Settings window** — printer port, interface, paper width, shared secret
- **Log viewer** — last 500 lines of output
- **Test print** button
- **Auto-restart** on PHP process crash
- **Secret auth** — `X-Print-Secret` header prevents unauthorized print jobs

## Prerequisites

- Node.js 18+
- Portable PHP for Windows (non-thread-safe ZIP) from https://windows.php.net/downloads/releases/

## Setup

```bash
# 1. Install dependencies
cd print-agent
npm install

# 2. Download portable PHP and extract into bundled/php/
#    (e.g., php-8.3.x-nts-Win32-vs16-x64.zip → bundled/php/)

# 3. Install Composer dependencies for the print server
cd bundled/app
composer install --no-dev
cd ../..

# 4. Copy .env.example to .env and configure
cp bundled/app/.env.example bundled/app/.env

# 5. Run in development mode
npm run dev
```

## Configuration (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PRINTER_PORT` | `ThermalPrinter` | Port name (COM3, USB001, ThermalPrinter, or IP:port) |
| `PRINTER_INTERFACE` | `windows` | `windows` for USB/serial, `network` for IP printers |
| `PRINTER_PAPER_WIDTH` | `58` | Paper width in mm (58 or 80) |
| `PRINT_SERVER_PORT` | `8080` | Local HTTP server port |
| `PRINT_SERVER_SECRET` | — | Shared secret with VPS (must match) |

## Building for Distribution

```bash
npm run dist
```

Output: `dist/SoulSips-Print-Agent-Setup-1.0.0.exe`

## VPS Environment Variables

Add to your Laravel `.env`:

```env
PRINT_SERVER_URL=http://venue-machine-ip:8080
PRINT_SERVER_SECRET=your-shared-secret-phrase
```

## File Structure

```
print-agent/
├── package.json
├── electron-builder.yml
├── main.js                    # Electron main process
├── preload.js                 # IPC bridge
├── settings/
│   ├── index.html             # Settings UI
│   ├── style.css
│   └── renderer.js
├── assets/
│   └── icon.png
├── bundled/
│   ├── php/                   # Portable PHP binary
│   │   └── php.exe
│   ├── app/
│   │   ├── print-server       # Router script
│   │   ├── composer.json
│   │   ├── composer.lock
│   │   ├── vendor/            # Composer dependencies
│   │   └── .env
│   └── public/
│       └── index.html
└── dist/                      # Build output
```
