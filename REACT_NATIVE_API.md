# Soul Sips POS — React Native API Integration Guide

## Base URL

```
https://soulsip.test/api/v1
```

Update `BASE_URL` in your config/environment as needed.

---

## Authentication

- Token-based auth using **Laravel Sanctum**
- On login, response contains: `{ status: "success", data: { user, token } }`
- Store token securely (`expo-secure-store` or `react-native-keychain`)
- Attach header on **ALL** authenticated requests: `Authorization: Bearer {token}`
- On `401` response, redirect to login screen

---

## API Response Format

All endpoints return:

```
Success: { status: "success", data: { ... } }
Error:   { status: "error", message: "...", errors: { field: ["..."] } }
```

Some endpoints also include a `"message"` key for success messages.

---

## Monetary Values

All prices are stored in **cents** (integer). Each price field has a companion `_display` field in **pesos** (divided by 100).

- Use `_display` for UI
- Use raw value for sending back to API

```json
{ "total": 129800, "total_display": 1298.00 }
```

---

## Endpoints

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/login` | `{ email, password }` | Returns user + token |
| `POST` | `/logout` | — | Revokes current token |
| `GET` | `/user` | — | Returns authenticated user |

### Products

| Method | Endpoint | Query | Description |
|--------|----------|-------|-------------|
| `GET` | `/products` | `?category=beverage\|snack\|room` | List active products |
| `GET` | `/products/{id}` | — | Single product |

### Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/rooms` | List all rooms with pricing |

### Orders

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/orders` | — | Today's orders |
| `POST` | `/orders` | _(see below)_ | Create order |
| `GET` | `/orders/{id}` | — | Order detail |
| `POST` | `/orders/{id}/pay` | `{ payment_method, amount_tendered? }` | Pay order |
| `POST` | `/orders/{id}/cancel` | — | Cancel order |

#### POST /orders Body

```json
{
  "items": [
    { "product_id": "01HXYZ...", "quantity": 2 }
  ],
  "payment_method": "cash",
  "amount_tendered": 50000,
  "booking_id": "01HXYZ...",
  "room_id": "01HXYZ...",
  "guest_count": 5,
  "notes": "Extra ice"
}
```

- `items` — **required**, min 1 item
- `payment_method` — optional. If provided, order is created **AND** paid in one step
- `amount_tendered` — required for `cash`, optional for others
- Valid `payment_method` values: `cash`, `gcash`, `card`, `bank_transfer`

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/invoices/{id}` | Invoice detail with items |

---

## Data Shapes

### User

```json
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "role": "admin",
  "created_at": "2026-07-18T00:00:00.000000Z"
}
```

### Product

```json
{
  "id": "01HXYZ...",
  "name": "Iced Coffee",
  "category": "beverage",
  "price": 20700,
  "price_display": 207.00,
  "active": true,
  "sort_order": 1
}
```

### Room

```json
{
  "id": "01HXYZ...",
  "name": "VIP Room A",
  "image": "http://localhost:8000/storage/rooms/vip.jpg",
  "description": "Premium room",
  "min_group": 3,
  "max_group": 12,
  "pricing": {
    "1.5": { "3-5": 64900, "6-8": 59900, "9-12": 54900 },
    "2":   { "3-5": 74900, "6-8": 69900, "9-12": 64900 },
    "3":   { "3-5": 89900, "6-8": 84900, "9-12": 79900 }
  },
  "sort_order": 1
}
```

### Order

```json
{
  "id": "01HXYZ...",
  "order_number": "POS-20260718-0001",
  "user_id": 1,
  "staff_name": "Maria",
  "booking_id": null,
  "room_id": "01HXYZ...",
  "room_name": "VIP Room A",
  "guest_count": 5,
  "subtotal": 103500,
  "subtotal_display": 1035.00,
  "total": 103500,
  "total_display": 1035.00,
  "amount_tendered": 110000,
  "amount_tendered_display": 1100.00,
  "change": 6500,
  "change_display": 65.00,
  "status": "completed",
  "payment_method": "cash",
  "payment_status": "paid",
  "notes": null,
  "items": [ ... ],
  "created_at": "2026-07-18T14:30:00.000000Z",
  "updated_at": "2026-07-18T14:30:00.000000Z"
}
```

### OrderItem

```json
{
  "id": "01HXYZ...",
  "product_id": "01HXYZ...",
  "product_name": "Iced Coffee",
  "product_price": 20700,
  "product_price_display": 207.00,
  "quantity": 2,
  "subtotal": 41400,
  "subtotal_display": 414.00,
  "item_type": "product"
}
```

### Invoice

```json
{
  "id": "01HXYZ...",
  "invoice_number": "POS-20260718-0001",
  "order_id": "01HXYZ...",
  "staff_name": "Maria",
  "room_name": "VIP Room A",
  "guest_count": 5,
  "subtotal": 103500,
  "subtotal_display": 1035.00,
  "total": 103500,
  "total_display": 1035.00,
  "amount_tendered": 110000,
  "amount_tendered_display": 1100.00,
  "change": 6500,
  "change_display": 65.00,
  "payment_method": "cash",
  "payment_status": "paid",
  "notes": null,
  "items": [ ... ],
  "created_at": "2026-07-18T14:30:00.000000Z"
}
```

### InvoiceItem

```json
{
  "id": "01HXYZ...",
  "product_name": "Iced Coffee",
  "product_price": 20700,
  "product_price_display": 207.00,
  "quantity": 2,
  "subtotal": 41400,
  "subtotal_display": 414.00
}
```

---

## Typical POS Flow

```
1. APP LOADS
   └─ Check secure storage for token
      ├─ Token exists → GET /user → valid? → POS screen : Login screen
      └─ No token → Login screen

2. LOGIN
   └─ POST /login
      └─ Store token in secure storage → Navigate to POS screen

3. POS SCREEN
   ├─ GET /products (group by category for tabs: Beverages, Snacks, Room Charges)
   └─ GET /rooms (for optional room assignment)
   └─ Display products in grid/list with name + price_display

4. CART
   └─ User taps product to add
      └─ Cart state: { items: [{ product_id, product_name, quantity, subtotal }] }
      └─ Show running total using price_display values

5. CREATE ORDER
   ├─ Immediate payment → POST /orders (items + payment_method + amount_tendered)
   └─ Pay later        → POST /orders (items only, no payment_method)
      └─ Response includes order + invoice

6. PAY EXISTING ORDER
   └─ POST /orders/{id}/pay
      └─ Response includes updated order + invoice

7. CANCEL ORDER
   └─ POST /orders/{id}/cancel

8. VIEW TODAY'S ORDERS
   └─ GET /orders
      └─ Show order_number, total_display, status, created_at
```

---

## Important Notes

- Use **ULIDs** (strings) for all IDs except `user.id` (integer)
- All price calculations on the API side use **cents**. Send cents, receive cents.
- Products with `category: "room"` are room charges, not physical items
- The API handles **inventory deduction** automatically when orders are created
- **Cash** payments: `amount_tendered` is required, change is calculated server-side
- **Non-cash** payments (gcash, card, bank_transfer): `amount_tendered` can be `null`
- Order status values: `active`, `completed`, `cancelled`
- Payment status values: `pending`, `paid`
