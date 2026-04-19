const db = require('../database/db');

const LOW_STOCK_THRESHOLD = 10;

function stockStatus(quantity) {
  if (quantity === 0) return 'out_of_stock';
  if (quantity < LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

const processCheckout = db.transaction((cashier_id, items) => {
  // Validate and check stock for all items
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

  // Record in Transactions
  db.prepare(`
    INSERT INTO Transactions (type, amount, reference_id) VALUES ('sale', ?, ?)
  `).run(total_amount, sale_id);

  // Log as income in Financial_Logs
  db.prepare(`
    INSERT INTO Financial_Logs (type, amount, description, reference_id)
    VALUES ('income', ?, ?, ?)
  `).run(total_amount, `Sale #${sale_id}`, sale_id);

  return sale_id;
});

function checkout(req, res) {
  const { items } = req.body;
  const cashier_id = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Checkout must include at least one item.' });
  }

  try {
    const sale_id = processCheckout(cashier_id, items);

    // Fetch full sale with Figma-formatted items
    const sale = db.prepare(`
      SELECT s.*, u.name AS cashier_name
      FROM Sales s JOIN Users u ON s.cashier_id = u.id
      WHERE s.id = ?
    `).get(sale_id);

    const saleItems = db.prepare(`
      SELECT
        si.id, si.quantity, si.price,
        p.id AS product_id,
        p.name,
        p.generic_name,
        p.category,
        p.expiry_date,
        CASE
          WHEN p.quantity = 0 THEN 'out_of_stock'
          WHEN p.quantity < ${LOW_STOCK_THRESHOLD} THEN 'low_stock'
          ELSE 'in_stock'
        END AS stock_status
      FROM Sales_Items si
      JOIN Products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `).all(sale_id);

    res.status(201).json({
      message: 'Checkout successful.',
      sale: {
        id: sale.id,
        date: sale.date,
        cashier_name: sale.cashier_name,
        total_amount: sale.total_amount,
        status: sale.status,
        items: saleItems
      }
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Checkout failed.' });
  }
}

module.exports = { checkout };
