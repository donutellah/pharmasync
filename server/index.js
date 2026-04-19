require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Database Setup ───────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, '../pharmasync.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code      TEXT    NOT NULL UNIQUE,
    name           TEXT    NOT NULL,
    generic_name   TEXT,
    category       TEXT,
    price_cents    INTEGER NOT NULL DEFAULT 0,
    wholesale_cents INTEGER NOT NULL DEFAULT 0,
    stock_level    INTEGER NOT NULL DEFAULT 0,
    expiry_date    TEXT,
    status         TEXT GENERATED ALWAYS AS (
      CASE
        WHEN stock_level = 0      THEN 'Out of Stock'
        WHEN stock_level <= 50    THEN 'Low Stock'
        ELSE                           'Healthy'
      END
    ) STORED
  );
`);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/inventory — return all inventory items
app.get('/api/inventory', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM inventory ORDER BY name ASC').all();
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('GET /api/inventory error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory.' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'PharmaSync API is running.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`PharmaSync server running on port ${PORT}`);
});

module.exports = { app, db };
