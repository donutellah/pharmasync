# PharmaSync — CLAUDE.md

## Project Overview
**PharmaSync** is a Unified Inventory and Financial Management System for a Community Pharmacy.
This is a college thesis project. Keep the system simple, functional, and well-structured.

## Tech Stack
- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3)
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Frontend:** Built separately in Stitch (connect via REST API)
- **Deploy:** Vercel

## Project Structure
```
pharmasync-backend/
├── server.js
├── database/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── supplierController.js
│   ├── salesController.js
│   ├── reportController.js
│   └── userController.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── suppliers.js
│   ├── sales.js
│   ├── reports.js
│   └── users.js
├── middleware/
│   └── auth.js
├── CLAUDE.md
└── package.json
```

## Database Schema
Tables: Users, Products, Suppliers, Sales, Sales_Items, Transactions

- Users: id, name, email, password (hashed), role (admin | cashier)
- Products: id, name, quantity, price, supplier_id (FK)
- Suppliers: id, name, contact_info
- Sales: id, date, cashier_id (FK), total_amount
- Sales_Items: id, sale_id (FK), product_id (FK), quantity, price
- Transactions: id, type, amount, date, reference_id (FK to sales)

## User Roles
- **admin** — full access (manage users, products, suppliers, view reports)
- **cashier** — can only process sales and view products

## Key Business Rules
1. Always check stock before processing a sale
2. If any item is out of stock, reject the entire sale with a clear error message
3. After a sale: deduct inventory, record in Sales + Sales_Items, record in Transactions
4. Low stock threshold = 10 units (alert when quantity < 10)
5. Never delete a sale — mark as void instead if needed

## API Endpoints Summary
- POST   /api/auth/login
- POST   /api/auth/logout
- GET    /api/products
- POST   /api/products         (admin only)
- PUT    /api/products/:id     (admin only)
- DELETE /api/products/:id     (admin only)
- GET    /api/products/low-stock
- GET    /api/suppliers
- POST   /api/suppliers
- PUT    /api/suppliers/:id
- POST   /api/sales
- GET    /api/sales
- GET    /api/reports/daily
- GET    /api/reports/weekly
- GET    /api/reports/monthly
- GET    /api/users            (admin only)
- PUT    /api/users/:id/role   (admin only)

## Setup & Run Commands
```bash
npm install
node server.js
```

## Dependencies
```bash
npm install express better-sqlite3 jsonwebtoken bcrypt cors
```

## Coding Conventions
- Use async/await where possible
- Always validate request body before processing
- Return clear error messages with proper HTTP status codes
  - 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
- Keep controllers thin — business logic goes in controller functions
- Protect all routes with JWT middleware except /api/auth/login

## What to Build Next (Priority Order)
1. server.js + database setup
2. Auth (login, JWT middleware)
3. Products CRUD
4. Suppliers CRUD
5. Sales (create sale with full business logic)
6. Reports (daily, weekly, monthly)
7. User management
8. Low stock alerts
9. Connect to Stitch frontend
10. Deploy to Vercel

## Thesis Notes
- Keep it simple but complete
- Every module should have at least basic error handling
- Reports should show: total sales, total revenue, top products
- This system is for a single community pharmacy (single branch)
