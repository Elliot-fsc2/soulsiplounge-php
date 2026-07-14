# Client-Side Printing via Web Serial API

## Overview

This document describes the client-side printing architecture implemented for Soul Sips Lounge POS. Instead of server-side printing via the PHP `mike42/escpos-php` library (which requires the server to be physically connected to the printer), printing now happens entirely in the browser using the **Web Serial API**.

This enables cloud deployment — the server can be hosted anywhere (Laravel Cloud, VPS, etc.) while the local POS workstation communicates directly with the thermal printer via USB/serial (or Bluetooth appearing as a virtual COM port).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (POS Staff)                    │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │  CheckoutModal │───▶│  usePrinter   │───▶│  ESC/POS   │ │
│  │  (React)      │    │  (Web Serial) │    │  Builder   │ │
│  └──────┬───────┘    └──────┬───────┘    └──────┬─────┘ │
│         │                   │                    │        │
│         ▼                   ▼                    ▼        │
│  ┌──────────────────────────────────────────────────┐    │
│  │            navigator.serial API                   │    │
│  │            (USB / Virtual COM Port)               │    │
│  └──────────────────────┬───────────────────────────┘    │
└─────────────────────────┼────────────────────────────────┘
                          │ USB / Bluetooth (virtual COM)
                          ▼
                  ┌──────────────┐
                  │  Xprinter    │
                  │  XP-58H      │
                  │  Thermal     │
                  │  Printer     │
                  └──────────────┘

┌─────────────────────────────────────────────────────────┐
│                Laravel Server (Cloud)                    │
│                                                          │
│  OrderController                                         │
│  ├─ Creates order & invoice                              │
│  └─ Returns invoice data via session flash               │
│     (No printer communication!)                          │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. `resources/js/lib/escpos.ts` — ESC/POS Byte Builder

Builds raw ESC/POS byte arrays for:
- **Customer Receipt**: Full receipt with header, items, totals, payment breakdown, footer
- **Kitchen Chit**: Simplified order for kitchen staff (items with quantities, no prices)
- **Test Page**: Simple test print to verify printer connection

Uses `TextEncoder` for text-to-byte conversion and manual byte arrays for ESC/POS control sequences.

### 2. `resources/js/hooks/usePrinter.ts` — Web Serial React Hook

A React hook that wraps the `navigator.serial` API:

| Method | Description |
|---|---|
| `connect()` | Opens browser device picker, pairs and opens the serial port at 9600 baud |
| `disconnect()` | Closes the serial port |
| `print(data: Uint8Array)` | Writes raw bytes to the printer silently |
| `reconnect()` | Attempts to re-open a previously paired port (on page load) |

State: `status` — `'disconnected' | 'connecting' | 'connected'`

### 3. Inertia Print Data Flow

When an order is created:

1. `OrderController@store` creates the order + invoice
2. Server flashes `print_data` (invoice + metadata) via `session()->flash()`
3. `HandleInertiaRequests` middleware shares `printData` as an Inertia prop
4. POS page detects new `printData` via `useEffect`
5. Calls `buildReceipt()` to generate ESC/POS bytes
6. Sends bytes to printer via `usePrinter().print()`

### 4. UI Components

- **Printer Badge** in `pos.tsx`: Shows connection status (Connected/Disconnected/Unsupported)
- **Connect Button** in `pos.tsx`: Triggers `navigator.serial.requestPort()` device picker
- Auto-reconnect on page load via `navigator.serial.getPorts()`

## Data Flow: Complete Order & Print Cycle

```
1. Staff clicks "Pay & Print"
2. CheckoutModal submits payment via router.post()
3. Server:
   a. Creates order (CreateOrder action)
   b. Generates invoice (GenerateInvoice action)
   c. Flashes print_data to session
   d. Redirects back with success
4. POS page re-renders with printData prop
5. useEffect detects printData → calls buildReceipt()
6. usePrinter.print() writes bytes to serial port
7. Printer prints receipt silently
8. If order has product items → also prints kitchen chit
```

## Browser Support

Web Serial API is supported in:
- Google Chrome / Microsoft Edge (desktop) — v89+
- Opera — v75+
- Samsung Internet — v15+

Not supported in Firefox or Safari. If unavailable, the printer badge shows "Unsupported".

## ESC/POS Commands Used

| Command | Bytes | Description |
|---|---|---|
| Initialize | `1B 40` | Reset printer |
| Center justify | `1B 61 01` | Align text center |
| Left justify | `1B 61 00` | Align text left |
| Double height | `1B 21 08` | Double-height text mode |
| Normal mode | `1B 21 00` | Reset print mode |
| Bold on | `1B 45 01` | Enable emphasis |
| Bold off | `1B 45 00` | Disable emphasis |
| Line feed | `0A` | New line |
| Feed n lines | `1B 64 n` | Advance n lines |
| Cut paper | `1D 56 00` | Full paper cut |

## Receipt Layout (58mm / 32 columns)

```
        SOULSIPS LOUNGE
     An elevated social lounge

--------------------------------
POS-20260714-0001
Jul 14, 2026 10:30 AM
Staff: John Doe
Room: VIP Room (4 pax)
--------------------------------
Espresso                   70
  x2 @ 35
Croissant                 40
--------------------------------
TOTAL                     750
Cash: 800.00
Change: 50.00

       ------------------------
  THIS IS NOT AN OFFICIAL RECEIPT
       ------------------------

         Thank you!
        Visit again :)

---paper cut---
```

## Kitchen Chit Layout

```
      KITCHEN ORDER
POS-20260714-0001

Time: 10:30 AM
Room: VIP Room
--------------------------------
x2 Espresso
x1 Croissant

---paper cut---
```

## File Changes

### Created
| File | Purpose |
|---|---|
| `resources/js/lib/escpos.ts` | ESC/POS byte builder for receipts, kitchen chits, and test pages |
| `resources/js/hooks/usePrinter.ts` | React hook wrapping `navigator.serial` API with connect/disconnect/print |
| `docs/CLIENT_SIDE_PRINTING.md` | This document |

### Modified
| File | Change |
|---|---|
| `resources/js/pages/staff/pos.tsx` | Added printer badge, connect button, and auto-print `useEffect` |
| `app/Http/Controllers/Staff/OrderController.php` | Removed server-side `PrinterService`/`PrintDispatcher` calls; flashes `print_data` to session instead |
| `app/Http/Middleware/HandleInertiaRequests.php` | Shared `printData` prop via `session()->pull('print_data')` |
| `config/printer.php` | Simplified to only `print_kitchen_chit` boolean |
| `.env.example` | Simplified printer section for Web Serial API |
| `resources/js/types/global.d.ts` | Added `printData` type to Inertia `sharedPageProps` |

### Removed
| File | Reason |
|---|---|
| `app/Services/PrintDispatcher.php` | No longer needed — printing is client-side |
| `app/Services/PrinterService.php` | No longer needed — printing is client-side |
| `app/Jobs/PrintKitchenChit.php` | Replaced by client-side kitchen chit builder |
| `app/Jobs/PrintReceipt.php` | Replaced by client-side receipt builder |
| `print-server.php` | Standalone ReactPHP print agent (deprecated) |
| `print-server` | Binary for ReactPHP print agent (deprecated) |
| `print-agent/README.md` | Documentation for deprecated print agent |
| `server.js` | Standalone Express Web Serial utility (functionality integrated into app) |

## Testing

1. Open POS page in Chrome/Edge
2. Click "Connect Printer" button in the top-right → select Xprinter from device dialog
3. Verify badge turns green and shows text "Printer" (connected)
4. Create an order and process payment
5. Receipt should print automatically
6. Verify print status message appears briefly ("Printing receipt..." → "Print successful!")
7. To reprint: visit the order receipt URL

## Troubleshooting

- **"Web Serial not supported"**: Use Chrome or Edge (desktop)
- **Printer not found in device list**: Ensure printer is powered on and connected via USB
- **Garbled text**: Verify printer is set to 9600 baud (default for XP-58H)
- **Nothing prints**: Open browser console (`F12`) to check for errors
- **Bluetooth printer**: On Windows, Bluetooth printers appear as virtual COM ports — Web Serial API works with those too
