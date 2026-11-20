# Order & Delivery Management System

A console application for managing orders, clients, couriers, and delivery strategies (OOP lab project, TypeScript).

## What it does

1. Creates and manages clients and couriers with contact details and availability tracking (`isBusy`).
2. Creates multi-item orders specifying destination country (`RUS`, `KAZ`, `BLR`), shipping address, and item weights.
3. Calculates delivery costs and estimated delivery times dynamically using the Strategy pattern (`Standard`, `Express`, `Pickup`).
4. Assigns available couriers to orders, updates order statuses, displays detailed order summaries, and deletes orders with automatic courier release.
5. Persists all system state automatically to a local JSON storage file.

Errors (invalid input, missing entities, busy couriers, non-existent IDs) are handled gracefully without crashing.  
The codebase is structured into decoupled layers and OOP abstractions: domain models (`Person` hierarchy, `Order`, `OrderItem`), delivery strategy interfaces, business logic (`OrderService`), persistence (`StorageService`), and an interactive terminal interface (`ConsoleUI`).

## Requirements

- Node.js 18 or newer
- pnpm (or npm)
- No third-party packages are needed at runtime (uses built-in `readline/promises`, `fs/promises`, and `process`). Dev dependencies: `typescript`, `tsx`, `@types/node`

## Running

If pnpm is not installed, enable it via corepack (bundled with Node.js) or install it with npm:

```bash
npm install -g pnpm
```

Install and run:

```bash
git clone <repository-url>
cd delivery-app
pnpm install
pnpm dev
```

The `Ignored build scripts: esbuild` warning during installation can be ignored.

Build and run the compiled version:

```bash
pnpm build      # compile to dist/
pnpm start      # build and run dist/main.js
```

With npm the same commands are: `npm install`, `npm run dev`, `npm start`.

All changes to clients, couriers, and orders are automatically saved to the local storage file and restored on the next launch.
