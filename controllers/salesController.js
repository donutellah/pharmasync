const db = require('../database/db');

function getAllSales(req, res) {
  const sales = db.prepare(`
    SELECT s.*, u.name AS cashier_name
    FROM Sales s
    JOIN Users u ON s.cashier_id = u.id
    ORDER BY s.date DESC
  `).all();

  const salesWithItems = sales.map(sale => {
    const items = db.prepare(`
      SELECT si.*, p.name AS product_name
      FROM Sales_Items si
      JOIN Products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `).all(sale.id);
    return { ...sale, items };
  });

  res.json(salesWithItems);
}

function getSaleById(req, res) {
  const sale = db.prepare(`
    SELECT s.*, u.name AS cashier_name
    FROM Sales s
    JOIN Users u ON s.cashier_id = u.id
    WHERE s.id = ?
  `).get(req.params.id);

  if (!sale) {
    return res.status(404).json({ error: 'Sale not found.' });
  }

  const items = db.prepare(`
    SELECT si.*, p.name AS product_name
    FROM Sales_Items si
    JOIN Products p ON si.product_id = p.id
    WHERE si.sale_id = ?
  `).all(sale.id);

  res.json({ ...sale, items });
}

const createSale = db.transaction((cashier_id, items) => {
  // Validate and check stock for all items first
  const resolvedItems = items.map(item => {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      throw { status: 400, message: 'Each item must have a valid product_id and quantity.' };
    }

    const product = db.prepare('SELECT * FROM Products WHERE id = ?').get(item.product_id);
    if (!product) {
      throw { status: 404, message: `Product ID ${item.product_id} not found.` };
    }
    if (product.quantity < item.quantity) {
      throw {
        status: 400,
        message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${item.quantity}.`
      };
    }

    return { ...item, product };
  });

  // Calculate total
  const total_amount = resolvedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  // Insert sale
  const saleResult = db.prepare(`
    INSERT INTO Sales (cashier_id, total_amount) VALUES (?, ?)
  `).run(cashier_id, total_amount);

  const sale_id = saleResult.lastInsertRowid;

  // Insert sale items and deduct inventory
  for (const item of resolvedItems) {
    db.prepare(`
      INSERT INTO Sales_Items (sale_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `).run(sale_id, item.product_id, item.quantity, item.product.price);

    db.prepare(`
      UPDATE Products SET quantity = quantity - ? WHERE id = ?
    `).run(item.quantity, item.product_id);
  }

  // Record transaction
  db.prepare(`
    INSERT INTO Transactions (type, amount, reference_id)
    VALUES ('sale', ?, ?)
  `).run(total_amount, sale_id);

  return db.prepare(`
    SELECT s.*, u.name AS cashier_name FROM Sales s
    JOIN Users u ON s.cashier_id = u.id
    WHERE s.id = ?
  `).get(sale_id);
});

function processSale(req, res) {
  const { items } = req.body;
  const cashier_id = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Sale must include at least one item.' });
  }

  try {
    const sale = createSale(cashier_id, items);

    const saleItems = db.prepare(`
      SELECT si.*, p.name AS product_name
      FROM Sales_Items si
      JOIN Products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `).all(sale.id);

    res.status(201).json({ message: 'Sale processed successfully.', sale: { ...sale, items: saleItems } });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to process sale.' });
  }
}

function voidSale(req, res) {
  const { id } = req.params;

  const sale = db.prepare('SELECT * FROM Sales WHERE id = ?').get(id);
  if (!sale) {
    return res.status(404).json({ error: 'Sale not found.' });
  }
  if (sale.status === 'void') {
    return res.status(400).json({ error: 'Sale is already voided.' });
  }

  // Restore inventory and void the sale in one transaction
  const doVoid = db.transaction(() => {
    const items = db.prepare('SELECT * FROM Sales_Items WHERE sale_id = ?').all(id);
    for (const item of items) {
      db.prepare('UPDATE Products SET quantity = quantity + ? WHERE id = ?')
        .run(item.quantity, item.product_id);
    }
    db.prepare("UPDATE Sales SET status = 'void' WHERE id = ?").run(id);
  });

  doVoid();
  res.json({ message: 'Sale voided and inventory restored.' });
}

module.exports = { getAllSales, getSaleById, processSale, voidSale };
