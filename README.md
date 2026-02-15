# AL RABEE SUPERMARKET

A modern online grocery shopping application built with **Next.js 15**, featuring a customer-facing storefront and a password-protected admin dashboard. All prices are displayed in **Omani Riyal (OMR)**.

<img width="1467" height="835" alt="Screenshot 2026-02-16 at 12 49 26 AM" src="https://github.com/user-attachments/assets/fbd96b57-32d0-4ef9-9db6-11edc104ad01" />


## Features

### Storefront (Customer)

| Feature | Description |
|---|---|
| Product Catalog | 40+ products across 10 categories |
| Category Tabs | Horizontal filter tabs for quick browsing |
| Search & Filters | Full-text search, discount filter, top-seller filter |
| Product Details | Detailed view with inventory levels and aisle location |
| Shopping Cart | Persistent cart state via Zustand + localStorage |
| Store Selector | Choose between 2 branches (Muscat & Salalah) |
| Curbside Pickup | Car number (required) and driver name (optional) |
| Checkout | Card and cash payments with change calculation |
| Responsive UI | Mobile-first, 2-col mobile / 4-col desktop grid |

### Admin Dashboard (`/admin`)

| Feature | Description |
|---|---|
| Login Protection | Username/password auth with signed session cookies |
| Stock Management | Update store and warehouse inventory per product |
| Add / Edit / Delete | Full CRUD for the product catalog |
| Offer Management | Set or remove percentage discounts with price preview |
| Dashboard Stats | At-a-glance cards for total, out-of-stock, low-stock, active offers |
| Real-Time Sync | Admin changes instantly reflect on the customer storefront |
| Sort & Filter | Sortable table with category and stock-status filters |

> **Default credentials:** `admin` / `admin123` (override via `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives) |
| State | [Zustand](https://zustand.docs.pmnd.rs) (persist middleware) |
| Icons | [Lucide React](https://lucide.dev) |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** (or yarn / pnpm)

### Installation

```bash
git clone https://github.com/ashaheem32/AL-RABEE.git
cd AL-RABEE
cd "AL RABEE SUPERMARKET"
npm install
```

### Development

```bash
cd "AL RABEE SUPERMARKET"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
cd "AL RABEE SUPERMARKET"
npm run build
npm start
```

### Stop the Server

To kill the dev server running on localhost:3000:

```bash
# macOS / Linux
lsof -ti :3000 | xargs kill -9

# Or simply press Ctrl + C in the terminal running the server
```

### Environment Variables (optional)

| Variable | Default | Description |
|---|---|---|
| `ADMIN_USERNAME` | `admin` | Admin login username |
| `ADMIN_PASSWORD` | `admin123` | Admin login password |
| `ADMIN_SECRET` | (internal) | HMAC signing key for session tokens |

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login page
│   │   └── page.tsx                # Admin dashboard
│   ├── api/
│   │   ├── admin/
│   │   │   ├── auth/               # Login / logout / session check
│   │   │   └── products/           # CRUD endpoints (protected)
│   │   ├── products/               # Customer product endpoints
│   │   └── stores/                 # Store locations endpoint
│   ├── cart/page.tsx               # Shopping cart
│   ├── checkout/page.tsx           # Checkout flow
│   ├── product/[id]/page.tsx       # Product detail
│   ├── globals.css                 # Tailwind theme
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Homepage
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── header.tsx                  # App header
│   ├── product-card.tsx            # Product card
│   ├── product-filters.tsx         # Search & filter bar
│   └── store-selector.tsx          # Branch picker dialog
└── lib/
    ├── admin-auth.ts               # Auth utilities
    ├── cart-store.ts               # Zustand cart state
    ├── mock-data.ts                # Seed data (products & stores)
    ├── product-store.ts            # Server-side in-memory store
    ├── safe-storage.ts             # SSR-safe localStorage wrapper
    ├── types.ts                    # TypeScript interfaces
    └── utils.ts                    # Helpers (cn, formatOMR)
```

## API Reference

### Customer Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/products` | List products (supports `?search`, `?category`, `?discountOnly`, `?topSelling`, `?featured`) |
| `GET` | `/api/products/[id]` | Single product by ID |
| `GET` | `/api/stores` | List store branches |

### Admin Endpoints (require auth cookie)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/admin/auth/login` | Authenticate and receive session cookie |
| `POST` | `/api/admin/auth/logout` | Clear session |
| `GET` | `/api/admin/auth/check` | Verify current session |
| `GET` | `/api/admin/products` | List all products with dashboard stats |
| `POST` | `/api/admin/products` | Create a product |
| `PUT` | `/api/admin/products/[id]` | Update a product |
| `DELETE` | `/api/admin/products/[id]` | Delete a product |

> **Note:** Product data lives in an in-memory store. Changes persist while the server runs but reset on restart.

## License

This project is private and not licensed for public distribution.
