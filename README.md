# Amr Kofta: Restaurant Website and Management System

An Arabic (RTL) website and back office for a restaurant. Customers see the menu; staff manage menu items, orders, expenses and daily totals.

## Parts
- `Frontend/`: React + TypeScript + Vite, Radix UI components, React Router. Pages: Home, Menu, About, Contact, Menu Management, Purchases and Expenses, Daily Orders, Daily Summary.
- `Backend/`: Node.js, Express, TypeScript, MongoDB (Mongoose), Cloudinary for image uploads. Dockerfile included.
- `ElectronApp/`: desktop window for the admin dashboard, loads the built frontend.

## API (summary)
- Menu: `GET/POST /api/menu`, `GET/PUT/DELETE /api/menu/:id`
- Orders: CRUD plus `GET /api/orders/today` and `PATCH /api/orders/:id/status`
- Expenses: expense tracking
- Daily summary: daily order totals (delivered, cancelled, and so on)

## Run locally
```bash
# backend
cd Backend && pnpm install && pnpm dev
# frontend
cd Frontend && pnpm install && pnpm dev
```
Backend needs a `.env` with the MongoDB connection string and Cloudinary keys. Never commit it.

## Desktop app
Build the frontend, then start `ElectronApp` with Electron.
