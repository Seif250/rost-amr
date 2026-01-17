# 🍽️ Amr Kofta Restaurant - Backend Server

Backend server for the Arabic Restaurant website built with TypeScript, Express, and MongoDB.

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── index.ts          # Environment configuration
│   │   └── database.ts       # MongoDB connection
│   ├── controllers/
│   │   ├── index.ts
│   │   ├── menuController.ts # Menu items CRUD
│   │   ├── orderController.ts # Orders management
│   │   └── expenseController.ts # Expenses tracking
│   ├── middleware/
│   │   ├── index.ts
│   │   └── errorHandler.ts   # Error handling middleware
│   ├── models/
│   │   ├── index.ts
│   │   ├── MenuItem.ts       # Menu item schema
│   │   ├── Order.ts          # Order schema
│   │   └── Expense.ts        # Expense schema
│   ├── routes/
│   │   ├── index.ts
│   │   ├── menuRoutes.ts     # Menu endpoints
│   │   ├── orderRoutes.ts    # Order endpoints
│   │   └── expenseRoutes.ts  # Expense endpoints
│   └── index.ts              # Main entry point
├── .env                       # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

```bash
cd server
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start
```

## 📡 API Endpoints

### Menu Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu/:id` | Get single menu item |
| POST | `/api/menu` | Create menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/today` | Get today's orders |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| GET | `/api/expenses/summary` | Get expenses summary |
| GET | `/api/expenses/:id` | Get single expense |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## 🛠️ Technologies

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Package Manager:** pnpm
