const db = require('../database/db');

// Ensure the inventory table exists (idempotent)
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code       TEXT    NOT NULL UNIQUE,
    name            TEXT    NOT NULL,
    generic_name    TEXT,
    category        TEXT,
    price_cents     INTEGER NOT NULL DEFAULT 0,
    wholesale_cents INTEGER NOT NULL DEFAULT 0,
    stock_level     INTEGER NOT NULL DEFAULT 0,
    expiry_date     TEXT,
    status          TEXT GENERATED ALWAYS AS (
      CASE
        WHEN stock_level = 0      THEN 'Out of Stock'
        WHEN stock_level <= 50    THEN 'Low Stock'
        ELSE                           'Healthy'
      END
    ) STORED
  );
`);

function getAllInventory(req, res) {
  try {
    const items = db.prepare('SELECT * FROM inventory ORDER BY name ASC').all();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

function getInventoryItem(req, res) {
  try {
    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

function createInventoryItem(req, res) {
  const { item_code, name, generic_name, category, price, wholesale_price, stock_level, expiry_date } = req.body;

  if (!item_code || !name) {
    return res.status(400).json({ success: false, message: 'item_code and name are required.' });
  }

  const price_cents     = Math.round((parseFloat(price)           || 0) * 100);
  const wholesale_cents = Math.round((parseFloat(wholesale_price) || 0) * 100);

  try {
    const result = db.prepare(`
      INSERT INTO inventory (item_code, name, generic_name, category, price_cents, wholesale_cents, stock_level, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(item_code, name, generic_name ?? null, category ?? null, price_cents, wholesale_cents, stock_level ?? 0, expiry_date ?? null);

    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: `Item code "${item_code}" already exists.` });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

function updateInventoryItem(req, res) {
  const { name, generic_name, category, price, wholesale_price, stock_level, expiry_date } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Item not found.' });

  const price_cents     = price           != null ? Math.round(parseFloat(price)           * 100) : existing.price_cents;
  const wholesale_cents = wholesale_price != null ? Math.round(parseFloat(wholesale_price) * 100) : existing.wholesale_cents;

  try {
    db.prepare(`
      UPDATE inventory SET
        name            = ?,
        generic_name    = ?,
        category        = ?,
        price_cents     = ?,
        wholesale_cents = ?,
        stock_level     = ?,
        expiry_date     = ?
      WHERE id = ?
    `).run(
      name            ?? existing.name,
      generic_name    ?? existing.generic_name,
      category        ?? existing.category,
      price_cents,
      wholesale_cents,
      stock_level     ?? existing.stock_level,
      expiry_date     ?? existing.expiry_date,
      id,
    );

    const updated = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

function deleteInventoryItem(req, res) {
  try {
    const existing = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Item not found.' });

    db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAllInventory, getInventoryItem, createInventoryItem, updateInventoryItem, deleteInventoryItem };
