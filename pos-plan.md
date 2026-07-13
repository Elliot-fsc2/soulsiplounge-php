# SoulSips Lounge — POS & Inventory System Plan

## Overview

A staff-facing Point of Sale system with thermal receipt printing, inventory management, and order tracking built into the existing Laravel + Inertia React application.

---

## Products (18 items)

### Room Charges
| Item | Price | Behavior |
|------|-------|----------|
| Solo Room | 649/head | Quantity = guest count |
| Duo Room | 649/head | Quantity = guest count |
| Haven Room | Custom | Staff types price at POS |

### Beverages (all **207 pesos**)
**Iced:** Arigamatcha (Matcha Latte), Latte, Americano, Caramel Latte, White Chocolate Latte, Colonizer Latte (Spanish Latte), Matcha Latte — *7 items*

**Hot:** Arigamatcha (Matcha Latte), Latte, Caramel Latte, White Chocolate Latte, Colonizer Latte (Spanish Latte), Matcha Latte — *6 items*

### Snacks
| Item | Price |
|------|-------|
| Large Chocolate Cream Puff | 70 |
| Cookie | 70 |

---

## Inventory (9 items, simple count tracking)

| Item | Unit | Weekly Qty | Notes |
|------|------|-----------|-------|
| Coffee beans | pack (1kg) | 7 | — |
| Matcha powder | pack (200g) | 3 | Original matcha (not premix) |
| Whole milk (Conaprole) | case (12 × 1L) | 10 | — |
| Oat milk (Oatside) | box (6 × 1L) | 1 | — |
| Condensed milk | kg | 2 | 1kg × 2 orders |
| Caramel syrup | bottle (2L) | 2 | — |
| White choco syrup | bottle (2L) | 2 | — |
| Cookies | piece | 144 | Sunday delivery, 7-day shelf life |
| Cream puffs | piece | 144 total | Sun 24 / Tue 48 / Thu 48 / Sat 24 |

---

## Database Schema (6 new tables)

### products
| Column | Type | Notes |
|--------|------|-------|
| id | ulid | PK |
| name | string | e.g. "Iced Arigamatcha" |
| category | string | enum: beverage, snack, room |
| price | integer | cents (20700 = 207 pesos) |
| active | boolean | default true |
| sort_order | integer | — |

### orders
| Column | Type | Notes |
|--------|------|-------|
| id | ulid | PK |
| order_number | string | auto-generated "POS-20260710-0001" |
| user_id | foreignId | staff who took the order |
| booking_id | ulid, nullable | FK to bookings (optional) |
| room_id | ulid, nullable | FK to rooms (optional) |
| guest_count | integer, nullable | pax count for room charges |
| subtotal | integer | — |
| total | integer | — |
| status | string | enum: active, completed, cancelled |
| payment_method | string, nullable | cash, gcash, card, etc. |
| payment_status | string | enum: unpaid, paid, refunded |
| notes | text, nullable | — |

### order_items
| Column | Type | Notes |
|--------|------|-------|
| id | ulid | PK |
| order_id | ulid | FK to orders |
| product_id | ulid, nullable | FK to products (null for custom Haven) |
| product_name | string | snapshot name |
| product_price | integer | snapshot price |
| quantity | integer | — |
| subtotal | integer | quantity × price |
| item_type | string | enum: product, room_charge, custom |

### inventory_items
| Column | Type | Notes |
|--------|------|-------|
| id | ulid | PK |
| name | string | e.g. "Coffee beans" |
| unit | string | kg, L, case, piece, pack |
| current_stock | decimal | — |
| min_stock | decimal | alert threshold |
| weekly_delivery_day | string, nullable | e.g. "Sunday" |
| weekly_delivery_qty | decimal, nullable | — |
| shelf_life_days | integer, nullable | — |

### inventory_recipes
| Column | Type | Notes |
|--------|------|-------|
| id | ulid | PK |
| product_id | ulid | FK |
| inventory_item_id | ulid | FK |
| quantity_per_unit | decimal | e.g. 0.02 (20g matcha) |

### inventory_transactions
| Column | Type | Notes |
|--------|------|-------|
| id | ulid | PK |
| inventory_item_id | ulid | FK |
| type | string | in, out, adjustment |
| quantity | decimal | — |
| reference_type | string, nullable | order, delivery, manual |
| reference_id | string, nullable | order number or delivery note |
| notes | text, nullable | — |

---

## Architecture

### Backend Controllers
| Controller | Methods | Access |
|------------|---------|--------|
| `Staff\PosController` | `index()` (render POS) | admin, staff |
| `Staff\OrderController` | `store()`, `index()`, `show()`, `cancel()`, `pay()`, `receipt()` | admin, staff |
| `Admin\InventoryController` | `index()`, `addStock()`, `adjust()`, `weeklyRestock()` | admin |
| `Admin\ProductController` | `index()`, `store()`, `update()`, `destroy()` | admin |

### Action Classes
| Action | Purpose |
|--------|---------|
| `Actions\Order\CreateOrder` | Validate items, create order + items, deduct stock, trigger print |
| `Actions\Order\CancelOrder` | Cancel order, reverse stock deduction |
| `Actions\Inventory\DeductStock` | Decrement inventory per recipe BOM |
| `Actions\Inventory\AddStock` | Increment inventory (delivery / manual) |

### Service Layer
| Service | Purpose |
|---------|---------|
| `Services\PrinterService` | ESC/POS thermal printing via `mike42/escpos-php` |

### Routes
```
GET   /staff/pos                         → PosController@index
POST  /staff/orders                      → OrderController@store
GET   /staff/orders                      → OrderController@index
GET   /staff/orders/{order}              → OrderController@show
POST  /staff/orders/{order}/cancel       → OrderController@cancel
POST  /staff/orders/{order}/pay          → OrderController@pay
GET   /staff/orders/{order}/receipt      → OrderController@receipt
GET   /admin/inventory                   → InventoryController@index
POST  /admin/inventory/{item}/add-stock  → InventoryController@addStock
POST  /admin/inventory/{item}/adjust     → InventoryController@adjust
POST  /admin/inventory/weekly-restock    → InventoryController@weeklyRestock
GET   /admin/products                    → ProductController@index
POST  /admin/products                    → ProductController@store
PATCH /admin/products/{product}          → ProductController@update
DELETE /admin/products/{product}         → ProductController@destroy
```

---

## POS Frontend (React + Inertia)

### Layout — Three-panel at `/staff/pos`

```
┌─────────────────┬──────────────────────┬──────────────────────┐
│   Categories    │     Product Grid     │   Current Order      │
│                 │                      │                      │
│  ☕ Beverages   │ ┌────┐ ┌────┐ ┌────┐│ Room: Solo (2 pax)   │
│  🍪 Snacks      │ │Ice │ │Hot │ │Ice ││ [Change Room ▾]      │
│  🛏️ Rooms       │ │Mat │ │Lat │ │Ame ││                      │
│                 │ │cha │ │te  │ │ric ││ Iced Matcha x2  414  │
│                 │ └────┘ └────┘ └────┘│ Cookie x1         70  │
│                 │ ┌────┐ ┌────┐      │ Room x2        1,298 │
│                 │ │Car │ │Whi │      │                      │
│                 │ │amel│ │Choc│      │ Subtotal:  1,782     │
│                 │ └────┘ └────┘      │ Total:     1,782     │
│                 │   ...more...       │                      │
│                 │                    │ ┌──────────────┐     │
│                 │                    │ │  Pay & Print │     │
│                 │                    │ └──────────────┘     │
└─────────────────┴──────────────────────┴──────────────────────┘
```

### Components
| Component | Purpose |
|-----------|---------|
| `pos/index.tsx` | Page shell with three panels |
| `pos/CategoryTabs.tsx` | Filters product grid by category |
| `pos/ProductGrid.tsx` | Big touch-friendly product tiles with price |
| `pos/CartPanel.tsx` | Cart with +/-/remove controls |
| `pos/RoomSelector.tsx` | Room picker + guest count + optional booking link |
| `pos/CheckoutModal.tsx` | Payment method, amount tendered, change computation |
| `pos/OrderList.tsx` | Today's orders sidebar |

---

## Thermal Printing

### Library
`mike42/escpos-php` — PHP ESC/POS thermal printer driver

### Receipt Layout (58mm, 32 chars wide)

```
╔════════════════════════════╗
║     SOULSIPS LOUNGE       ║
║  An elevated social lounge ║
╠════════════════════════════╣
║ POS-20260710-0001         ║
║ Jul 10, 2026  2:30 PM     ║
║ Staff: Jane                ║
║ Room: Solo (2 pax)        ║
╠════════════════════════════╣
║ Iced Matcha Latte   414   ║
║   x2 @ 207                ║
║ Cookie               70   ║
║   x1 @ 70                 ║
║ Room Charge         1,298 ║
║   x2 @ 649                ║
╠════════════════════════════╣
║ SUBTOTAL         1,782    ║
║ TOTAL            1,782    ║
║ Payment: Cash    2,000    ║
║ Change:            218    ║
╠════════════════════════════╣
║   Thank you!               ║
║   Visit again :)           ║
╚════════════════════════════╝
```

### Print Types
| Type | Destination | Content |
|------|-------------|---------|
| Customer receipt | Front printer | Full order details, totals, payment |
| Kitchen chit | Bar/kitchen printer | Item names + quantities + room number only |

### Printer Configuration (stored in settings)
```json
{
    "connection_type": "usb",
    "port": "COM3",
    "interface": "windows",
    "character_encoding": "CP437",
    "paper_width": 58,
    "print_kitchen_chit": true
}
```

### Error Handling
- Print job dispatched as queued background job
- If printer offline → log error, show toast, receipt available for reprint
- Reprint button on order detail page

---

## Key Design Decisions

1. **Orders attachable to bookings** — optional `booking_id` links walk-in orders to existing reservations
2. **Haven Room = custom price** — staff types the per-person rate at POS
3. **Simple inventory tracking** — no batch/FIFO, total stock with manual adjustments when cream puffs expire
4. **Recipes (BOM)** stored for reference; auto-deduction uses simple 1:1 mapping where applicable
5. **Thermal printing queued** — background job, non-blocking to POS flow
6. **Existing auth reused** — `admin` and `staff` roles, no new role needed

---

## Implementation Order

| Step | What | Est. Files |
|------|------|------------|
| 1 | Migrations (6 tables) | 6 migration files |
| 2 | Models (6 models) | 6 PHP files |
| 3 | Enum files (OrderStatus, etc.) | 3 enum files |
| 4 | Seeder (products + inventory) | 1 seeder + data file |
| 5 | Printer config + service | `config/printer.php` + `Services/PrinterService.php` |
| 6 | Printer templates (receipt + chit) | `Printers/` |
| 7 | Action classes (Order + Inventory) | 5 action files |
| 8 | Controllers (POS, Order, Inventory, Product) | 4 PHP files |
| 9 | Web routes | additions to `routes/web.php` |
| 10 | POS frontend (6+ components) | `resources/js/pages/staff/pos.tsx` + components |
| 11 | Inventory admin frontend | `resources/js/pages/admin/inventory/index.tsx` |
| 12 | Product admin frontend | additions to existing admin |
| 13 | Analytics integration | update `Admin/AnalyticsController` |
| 14 | Pint format | `vendor/bin/pint --format agent` |
