const db = require('../database/db');

const LOW_STOCK_THRESHOLD = 10;

function formatProduct(p) {
  return {
    ...p,
    product_id: p.id,
    stock_status: p.quantity === 0
      ? 'out_of_stock'
      : p.quantity < LOW_STOCK_THRESHOLD
        ? 'low_stock'
        : 'in_stock'
  };
}

function getAllProducts(req, res) {
  const products = db.prepare(`
    SELECT p.*, s.name AS supplier_name
    FROM Products p
    LEFT JOIN Suppliers s ON p.supplier_id = s.id
    ORDER BY p.name ASC
  `).all();

  res.json(products.map(formatProduct));
}

function getProductById(req, res) {
  const product = db.prepare(`
    SELECT p.*, s.name AS supplier_name
    FROM Products p
    LEFT JOIN Suppliers s ON p.supplier_id = s.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  res.json(formatProduct(product));
}

function createProduct(req, res) {
  const { name, generic_name, category, quantity, price, expiry_date, supplier_id } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number.' });
  }
  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
    return res.status(400).json({ error: 'Quantity must be a non-negative number.' });
  }

  const result = db.prepare(`
    INSERT INTO Products (name, generic_name, category, quantity, price, expiry_date, supplier_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, generic_name ?? null, category ?? null, quantity ?? 0, price, expiry_date ?? null, supplier_id ?? null);

  const product = db.prepare('SELECT * FROM Products WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({ message: 'Product created.', product: formatProduct(product) });
}

function updateProduct(req, res) {
  const { name, generic_name, category, quantity, price, expiry_date, supplier_id } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM Products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({ error: 'Price must be a non-negative number.' });
  }
  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
    return res.status(400).json({ error: 'Quantity must be a non-negative number.' });
  }

  db.prepare(`
    UPDATE Products
    SET name = ?, generic_name = ?, category = ?, quantity = ?, price = ?, expiry_date = ?, supplier_id = ?
    WHERE id = ?
  `).run(
    name ?? existing.name,
    generic_name !== undefined ? generic_name : existing.generic_name,
    category !== undefined ? category : existing.category,
    quantity ?? existing.quantity,
    price ?? existing.price,
    expiry_date !== undefined ? expiry_date : existing.expiry_date,
    supplier_id !== undefined ? supplier_id : existing.supplier_id,
    id
  );

  const updated = db.prepare('SELECT * FROM Products WHERE id = ?').get(id);
  res.json({ message: 'Product updated.', product: formatProduct(updated) });
}

function deleteProduct(req, res) {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM Products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  db.prepare('DELETE FROM Products WHERE id = ?').run(id);
  res.json({ message: 'Product deleted.' });
}

function getExpiringProducts(req, res) {
  // Default: products expiring within 30 days (or already expired)
  const days = parseInt(req.query.days) || 30;
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const products = db.prepare(`
    SELECT p.*, s.name AS supplier_name
    FROM Products p
    LEFT JOIN Suppliers s ON p.supplier_id = s.id
    WHERE p.expiry_date IS NOT NULL
      AND p.expiry_date <= ?
    ORDER BY p.expiry_date ASC
  `).all(future);

  const result = products.map(p => ({
    ...formatProduct(p),
    expiry_status: p.expiry_date < today ? 'expired' : 'expiring_soon'
  }));

  res.json({ days_threshold: days, products: result });
}

function getLowStockProducts(req, res) {
  const products = db.prepare(`
    SELECT p.*, s.name AS supplier_name
    FROM Products p
    LEFT JOIN Suppliers s ON p.supplier_id = s.id
    WHERE p.quantity < ?
    ORDER BY p.quantity ASC
  `).all(LOW_STOCK_THRESHOLD);

  res.json({ threshold: LOW_STOCK_THRESHOLD, products: products.map(formatProduct) });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getExpiringProducts
};
