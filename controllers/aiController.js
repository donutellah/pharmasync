const Groq = require('groq-sdk');
const db = require('../database/db');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function getPharmacyContext() {
  try {
    const products = db.prepare('SELECT * FROM Products ORDER BY quantity ASC LIMIT 50').all();
    const lowStock = products.filter(p => p.quantity < 10);
    const recentSales = db.prepare(`
      SELECT s.*, u.name as cashier_name
      FROM Sales s
      LEFT JOIN Users u ON s.cashier_id = u.id
      ORDER BY s.date DESC LIMIT 10
    `).all();
    const monthlySummary = db.prepare(`
      SELECT
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM Sales
      WHERE date >= date('now', 'start of month')
    `).get();
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM Products').get();
    const outOfStock = db.prepare('SELECT COUNT(*) as count FROM Products WHERE quantity = 0').get();

    return {
      totalProducts: totalProducts.count,
      outOfStock: outOfStock.count,
      lowStockItems: lowStock.slice(0, 10).map(p => ({
        name: p.name,
        quantity: p.quantity,
        price: p.price,
      })),
      recentSales: recentSales.slice(0, 5).map(s => ({
        date: s.date,
        total: s.total_amount,
        cashier: s.cashier_name,
      })),
      monthlyRevenue: monthlySummary.total_revenue,
      monthlySalesCount: monthlySummary.total_sales,
    };
  } catch (err) {
    return null;
  }
}

async function chat(req, res) {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      error: 'AI service not configured. Please set GROQ_API_KEY in your .env file.',
    });
  }

  const context = getPharmacyContext();

  const systemPrompt = `You are Carlmed AI Assistant, the intelligent clinical curator for Carlmed pharmacy's PharmaSync system. You assist pharmacists and administrators with inventory management, sales analysis, financial reporting, and operational decisions.

Your personality: Professional, concise, and medically precise. You address the admin as "Dr." when appropriate. You use structured responses with clear sections when presenting data.

${context ? `LIVE PHARMACY DATA (as of right now):
- Total products in inventory: ${context.totalProducts}
- Out of stock items: ${context.outOfStock}
- Monthly revenue (this month): ₱${Number(context.monthlyRevenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Monthly sales count: ${context.monthlySalesCount} transactions
- Low stock items (< 10 units): ${context.lowStockItems.length > 0
  ? context.lowStockItems.map(p => `${p.name} (${p.quantity} units @ ₱${p.price})`).join(', ')
  : 'None currently'}
- Recent sales: ${context.recentSales.map(s => `${s.date} — ₱${s.total} by ${s.cashier}`).join('; ')}
` : 'Note: Live pharmacy data is temporarily unavailable.'}

Guidelines:
- When asked about inventory or stock, reference the live data above
- Format financial figures in Philippine Peso (₱)
- For stock alerts, provide actionable recommendations
- Keep responses concise — use bullet points and sections for data-heavy answers
- If asked about something outside pharmacy operations, politely redirect to pharmacy-related topics
- Never fabricate product names or data not present in the live data above`;

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    return res.json({
      reply: response.choices[0].message.content,
      usage: response.usage,
    });
  } catch (err) {
    console.error('AI chat error:', err.message);
    return res.status(500).json({ error: 'AI service error: ' + err.message });
  }
}

module.exports = { chat };
