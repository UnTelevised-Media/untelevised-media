# Clerk Roles & Metadata

All roles are stored in Clerk `publicMetadata.role` and are set **server-side only** via the admin API route (`POST /api/admin/set-role`). No client code can write roles.

---

## Available Roles

| Role | Value | Access Level |
|------|-------|-------------|
| Admin | `admin` | Full access to everything |
| Editor | `editor` | All author permissions + cross-author content management |
| Author | `author` | Own content only (articles, books, downloads) |
| Sales | `sales` | Orders dashboard only |

---

## Role Hierarchy

```
admin
  └── editor
        └── author

sales  ← isolated peer, cannot access content or portal dashboard
```

`hasRole(userRole, 'editor')` returns `true` for both `editor` and `admin`. It does **not** return `true` for `author` or `sales`. The hierarchy only flows upward.

---

## What Each Role Can Do

### `admin`
- All portal pages and API routes
- Set/change roles on other users via `POST /api/admin/set-role`
- See all orders, articles, books, and payouts across all authors
- Issue refunds on orders
- All order status transitions (including shipping and refund)
- Legacy: `publicMetadata.admin === true` is treated as `admin` for backward compatibility

### `editor`
- All author permissions (below)
- Create, edit, and publish any article (not just own)
- Access full editorial inbox (briefs, pitches from all authors)
- Manage sources for any article
- Cannot set roles on other users

### `author`
- Access author portal dashboard (own stats and payouts only)
- Create and edit own articles
- Manage own books
- Access own order history
- Submit pitches and briefs
- View and download own digital purchases
- Cannot see other authors' content or financials
- Cannot issue refunds; can only modify order status on orders that contain their own books

### `sales`
- Access `/portal/orders` only — all other portal routes redirect away
- View all orders (read-only)
- Update order shipping status
- Cannot issue refunds
- Cannot access articles, books, or any other portal section

---

## How to Set a Role

Roles can only be assigned by an existing `admin` user:

```http
POST /api/admin/set-role
Authorization: <clerk session>
Content-Type: application/json

{
  "targetUserId": "user_xxxxxxxxxxxx",
  "role": "author"
}
```

Valid values for `role`: `admin`, `editor`, `author`  
*(Sales is not currently assignable via this route — set it directly in the Clerk Dashboard under User → publicMetadata)*

---

## Setting Metadata in the Clerk Dashboard

Navigate to **Clerk Dashboard → Users → [user] → Metadata → Public**.

### Standard role assignment
```json
{
  "role": "author"
}
```

### Sales role (not in the API route's enum, set manually)
```json
{
  "role": "sales"
}
```

### Legacy admin flag (still supported, prefer `role` field)
```json
{
  "admin": true
}
```
> If both `role` and `admin` keys are present, `role` takes precedence.

---

## Metadata Fields Reference

| Field | Location | Type | Written By | Notes |
|-------|----------|------|------------|-------|
| `role` | `publicMetadata` | `"admin" \| "editor" \| "author" \| "sales"` | Admin API or Clerk Dashboard | Primary role field |
| `admin` | `publicMetadata` | `boolean` | Clerk Dashboard only | Legacy — treated as `admin` role |

`privateMetadata` and `unsafeMetadata` are not currently used by this application.

---

## Where Roles Are Enforced

| Layer | File | What It Does |
|-------|------|-------------|
| Edge middleware | `src/proxy.ts` | Blocks unauthenticated users; restricts sales to `/portal/orders/*` |
| Layout | `src/(portal)/layout.tsx` | Second gate — redirects if no portal role |
| Route handlers | `src/app/api/portal/**` | Per-endpoint role checks with `requireRole()` helpers |
| Server actions | `src/lib/portal/**-actions.ts` | `requireAdmin()`, `requireAuthor()` guards |
| Data queries | Portal pages | Authors scoped to own books/articles; editors/admins see all |

---

## Coral (Comments) Integration

The `/api/coral-token` route maps Clerk roles to Coral SSO roles:

| Clerk `publicMetadata.role` | Coral Role |
|-----------------------------|-----------|
| `admin` | `MODERATOR` |
| (legacy) `publicMetadata.admin === true` | `MODERATOR` |
| `editor`, `author`, `sales`, or none | `COMMENTER` |
