# Admin & Staff Role Implementation

## Roles
- **Admin** (`admin@soulsips.com` / `password`) — full access
- **Staff** (`staff@soulsips.com` / `password`) — only Payments

## Backend

### Enum
`app/Enums/UserRole.php` — PHP enum: `Admin`, `Staff`

### Migration
`2026_07_08_030903_add_is_admin_to_users_table.php` — drops `is_admin`, adds nullable `role` string

### User Model
`app/Models/User.php` — `role` in `#[Fillable]`, cast as `UserRole::class`

### Middleware
`app/Http/Middleware/EnsureRole.php` — parameterized: `role:admin`, `role:staff`, `role:admin,staff`
Registered in `bootstrap/app.php` as `role` alias.

### Routes — `routes/web.php`

| Route Group | Middleware |
|---|---|
| `admin/*` (dashboard, bookings, contacts, rooms, vouchers, settings, analytics) | `auth, role:admin` |
| `admin/payments/*` | `auth, role:admin,staff` |

### Shared Data — `HandleInertiaRequests.php`
Shares `auth.role` with the frontend (admin/staff/null).

## Frontend

### Layout — `soul-sips-layout.tsx` (public)
- Brand header: "An elevated social lounge for every occasion" + "Soul Sips Lounge"
- Admin button visible only to users with `admin` or `staff` role
- Login button for guests; Dashboard link for regular users

### Admin Panel — `admin/index.tsx` (no layout)
- Brand header: "Sip. Gather. Celebrate." + "Soul Sips Lounge"
- Admin sidebar: all 7 tabs (Bookings, Contacts, Payments, Rooms, Vouchers, Analytics, Settings)
- Staff sidebar: only Payments tab (auto-redirect to it)

### Payments Panel (Staff view)
- Summary cards: Total, Confirmed, Pending
- Payment list with action buttons:
  - Confirm (green) — for Pending payments
  - Cancel (rose) — for Pending payments
  - Refund (cyan) — for Confirmed payments
  - Delete (admin only)

### Theme
- **Background**: `stone-950` / `stone-900`
- **Accent**: `amber-400` / `amber-500`
- **Text**: `stone-100` / `stone-400`
- **Cards**: `rounded-2xl border border-stone-800 bg-stone-900`
- **Typography**: Serif headings, sans-serif labels
- **Framer Motion**: Page transitions with `AnimatePresence`
