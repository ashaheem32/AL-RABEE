# AL RABEE SUPERMARKET

A modern online grocery shopping web application for AL RABEE SUPERMARKET in Oman, built with Next.js 15. Features product browsing, real-time inventory tracking, category filtering, shopping cart management, curbside pickup with car details, admin dashboard for stock and offer management, and full checkout flow -- all priced in Omani Riyal (OMR).

## Features

### Customer-Facing

- **Product Catalog** -- 40+ products across 10 categories (Fruits, Vegetables, Dairy, Meat, Bakery, Beverages, Pantry, Snacks, Household)
- **Category Filter Tabs** -- Quick-access horizontal tabs to browse products by category
- **Search & Quick Filters** -- Search by name/description, filter by discount items and top sellers
- **Featured Products** -- Highlighted products displayed on the homepage
- **Product Detail Pages** -- View detailed product info including inventory levels and in-store location (aisle & section)
- **Shopping Cart** -- Add/remove items, update quantities with persistent cart state (via Zustand + localStorage)
- **Store Selector** -- Choose between 2 AL RABEE branches (Muscat & Salalah)
- **Curbside Pickup** -- Toggle curbside delivery with car number (required) and driver name (optional)
- **Checkout Flow** -- Supports card and cash payments with change calculation
- **Omani Riyal (OMR)** -- All prices displayed in OMR with 3 decimal places, 5% VAT
- **Responsive Design** -- Mobile-first UI with 2-column grid on mobile, 4-column on desktop

### Admin Dashboard (`/admin`)

- **Stock Management** -- View and update store & warehouse stock levels for every product
- **Out-of-Stock Toggle** -- One-click to mark items as out of stock or restock them
- **Add New Products** -- Full form to add products with name, price, category, image, stock, location, and flags
- **Edit Products** -- Update any product field (name, price, description, category, image, location, stock, featured/top-selling flags)
- **Offer / Discount Management** -- Set or remove percentage discounts on any product with live price preview
- **Delete Products** -- Remove products from the catalog
- **Dashboard Stats** -- At-a-glance cards for total products, out-of-stock, low-stock, and active offers
- **Real-Time Sync** -- All admin changes instantly reflect on the customer-facing pages (shared in-memory store)
- **Sortable Table** -- Sort products by name, category, price, stock, or discount
- **Filter & Search** -- Filter by category, stock status (all/out/low), and search by name

## Tech Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | [Next.js 15](https://nextjs.org) (App Router, Turbopack) |
| Language      | TypeScript                          |
| Styling       | Tailwind CSS v4                     |
| UI Components | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives) |
| State         | [Zustand](https://zustand.docs.pmnd.rs) (with persist middleware) |
| Icons         | [Lucide React](https://lucide.dev)  |
| Images        | Next.js Image (optimised remote images via Unsplash) |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** (or bun/yarn/pnpm)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "AL RABEE SUPERMARKET"

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin dashboard (stock, offers, CRUD products)
│   ├── api/
│   │   ├── admin/products/    # Admin API routes (GET, POST, PUT, DELETE)
│   │   ├── products/          # Customer product API routes (list, detail)
│   │   └── stores/            # Store locations API route
│   ├── cart/                  # Shopping cart page with car details form
│   ├── checkout/              # Checkout page (card/cash payments)
│   ├── product/[id]/          # Product detail page
│   ├── globals.css            # Tailwind CSS theme & variables
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Homepage (product catalog + category tabs)
├── components/
│   ├── ui/                    # shadcn/ui components (button, card, dialog, table, etc.)
│   ├── header.tsx             # App header with cart badge, admin link & store selector
│   ├── product-card.tsx       # Product card with OMR pricing
│   ├── product-filters.tsx    # Search bar + quick filter buttons
│   └── store-selector.tsx     # Store location picker dialog (2 branches)
├── lib/
│   ├── cart-store.ts          # Zustand cart state (items, car details, curbside)
│   ├── mock-data.ts           # 40+ seed products & 2 store locations
│   ├── product-store.ts       # Server-side in-memory product store (shared by admin & customer APIs)
│   ├── safe-storage.ts        # SSR-safe localStorage wrapper
│   ├── types.ts               # TypeScript interfaces (Product, Store, CarDetails, etc.)
│   └── utils.ts               # Utility functions (cn, formatOMR)
└── instrumentation.ts         # Node.js localStorage polyfill for SSR
```

## API Routes

### Customer APIs

| Method | Endpoint               | Description                       |
| ------ | ---------------------- | --------------------------------- |
| GET    | `/api/products`        | List products (with query filters)|
| GET    | `/api/products/[id]`   | Get a single product by ID        |
| GET    | `/api/stores`          | List all store locations           |

#### Product Query Parameters

| Parameter      | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| `search`       | string  | Search by product name or description|
| `category`     | string  | Filter by category name              |
| `discountOnly` | boolean | Show only discounted products        |
| `topSelling`   | boolean | Show only top-selling products       |
| `featured`     | boolean | Show only featured products          |

### Admin APIs

| Method | Endpoint                     | Description                                 |
| ------ | ---------------------------- | ------------------------------------------- |
| GET    | `/api/admin/products`        | List all products with dashboard stats      |
| POST   | `/api/admin/products`        | Add a new product                           |
| GET    | `/api/admin/products/[id]`   | Get a single product by ID                  |
| PUT    | `/api/admin/products/[id]`   | Update product (stock, price, discount, etc)|
| DELETE | `/api/admin/products/[id]`   | Remove a product from the catalog           |

> **Note:** Data is stored in an in-memory server-side store. Changes persist while the dev server is running but reset on restart.

## License

This project is private and not licensed for public distribution.
