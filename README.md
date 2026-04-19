# pharmasync
PharmaSync — A POS-integrated inventory and financial management system for community pharmacies. Built with React, Node.js, Express, and SQLite.

---

## Overview

Managing a community pharmacy involves dozens of moving parts — stock levels, expiring medicines, daily sales, and financial summaries. PharmaSync brings all of that into a single, easy-to-use system designed specifically for pharmacies like **Carlmed**.

Whether you're a pharmacist processing a sale or an admin reviewing monthly financials, PharmaSync gives you the right tools for the job.

---

## Features

| Feature | Description |
|---------|-------------|
| **Inventory Management** | Real-time stock tracking with low stock alerts and expiry date warnings |
| **POS / Sales Checkout** | Fast, accurate point-of-sale for walk-in customers |
| **Supplier Management** | Manage suppliers, purchase orders, and delivery records |
| **Financial Reports** | Daily, weekly, and monthly revenue and expense summaries |
| **User Management** | Role-based access with Admin and Pharmacist accounts |
| **AI Assistant** | Ask questions about your pharmacy in plain language — the AI knows your live data |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | SQLite via `better-sqlite3` |
| **Authentication** | JWT + bcrypt |
| **AI** | Built-in AI Assistant |

---

## Getting Started

### Prerequisites

Ensure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pharmasync.git
cd pharmasync
```

---

### 2. Set Up Environment Variables

Create a `.env` file in the **project root** (see [Environment Variables](#environment-variables) below).

---

### 3. Start the Backend

```bash
# From the project root
npm install
node server.js
```

> Backend runs at `http://localhost:3000` by default.

---

### 4. Start the Frontend

```bash
cd client
npm install
npm run dev
```

> Frontend dev server runs at `http://localhost:5173` by default.

---

## Environment Variables

Create a `.env` file in the **project root**:

```env
JWT_SECRET=your_jwt_secret_here
AI_API_KEY=your_ai_api_key_here
PORT=3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens. Use a long, random string. |
| `AI_API_KEY` | Yes | API key that powers the built-in AI assistant. |
| `PORT` | No | Port for the backend server. Defaults to `3000`. |

---

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pharmasync.com | `admin123` |

> **Change the default admin password immediately after your first login.**

---

## Project Structure

```
pharmasync/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level page views
│   │   └── main.jsx      # Application entry point
│   └── package.json
│
├── routes/               # Express API route handlers
├── db/                   # SQLite database and migrations
├── server.js             # Backend entry point
├── .env                  # Environment variables (not committed)
└── package.json
```

---

## User Roles

PharmaSync uses role-based access control to keep operations secure and organized.

| Role | Access Level |
|------|-------------|
| **Admin** | Full system access — manage users, view all reports, configure settings |
| **Pharmacist** | Operational access — POS checkout, inventory lookup, supplier orders |

---

## AI Assistant

PharmaSync comes with a built-in AI assistant that has live access to your pharmacy's real data. Instead of digging through reports, just ask:

```
"What medicines are running low?"
"How much did we earn this week?"
"Which supplier do we order Amoxicillin from?"
"What's expiring in the next 30 days?"
```

The assistant understands your inventory, sales, and supplier records — making it a powerful tool for quick insights without leaving the dashboard.

> To enable the AI assistant, make sure `AI_API_KEY` is set in your `.env` file.

---

## License

This system was developed as a **Final Course Output** in **System and Analysis Design**.
All rights reserved © Carlmed Pharmacy.

---

<div align="center">

*Built for Carlmed Pharmacy*

</div>
