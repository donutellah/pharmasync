const db = require('../database/db');

function buildReport(startDate, endDate) {
  const sales = db.prepare(`
    SELECT s.*, u.name AS cashier_name
    FROM Sales s
    JOIN Users u ON s.cashier_id = u.id
    WHERE s.date >= ? AND s.date < ?
    AND s.status = 'completed'
  `).all(startDate, endDate);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);

  const topProducts = db.prepare(`
    SELECT p.id, p.name,
           SUM(si.quantity) AS total_quantity_sold,
           SUM(si.quantity * si.price) AS total_revenue
    FROM Sales_Items si
    JOIN Products p ON si.product_id = p.id
    JOIN Sales s ON si.sale_id = s.id
    WHERE s.date >= ? AND s.date < ?
    AND s.status = 'completed'
    GROUP BY p.id, p.name
    ORDER BY total_quantity_sold DESC
    LIMIT 10
  `).all(startDate, endDate);

  return {
    period: { from: startDate, to: endDate },
    total_sales: sales.length,
    total_revenue: parseFloat(totalRevenue.toFixed(2)),
    top_products: topProducts,
    sales
  };
}

function getDailyReport(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const start = `${date} 00:00:00`;
  const end = `${date} 23:59:59`;

  res.json(buildReport(start, end));
}

function getWeeklyReport(req, res) {
  // Default: current week (Mon–Sun)
  const now = req.query.date ? new Date(req.query.date) : new Date();
  const day = now.getDay(); // 0 = Sun
  const diffToMonday = (day === 0 ? -6 : 1 - day);

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  res.json(buildReport(
    monday.toISOString().replace('T', ' ').slice(0, 19),
    sunday.toISOString().replace('T', ' ').slice(0, 19)
  ));
}

function getMonthlyReport(req, res) {
  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || now.getMonth() + 1; // 1-based

  if (month < 1 || month > 12) {
    return res.status(400).json({ error: 'Month must be between 1 and 12.' });
  }

  const start = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;

  res.json(buildReport(start, end));
}

module.exports = { getDailyReport, getWeeklyReport, getMonthlyReport };
