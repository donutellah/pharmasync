const XLSX = require('xlsx');
const db   = require('../database/db');

// Expected column aliases — maps whatever the Excel header is → our field
const COL_MAP = {
  // item_code
  'item code':      'item_code',
  'item_code':      'item_code',
  'itemcode':       'item_code',
  'code':           'item_code',
  'sku':            'item_code',
  'product code':   'item_code',
  // name
  'name':           'name',
  'product name':   'name',
  'productname':    'name',
  'brand':          'name',
  'brand name':     'name',
  'description':    'name',
  // generic_name
  'generic name':   'generic_name',
  'generic_name':   'generic_name',
  'generic':        'generic_name',
  'genericname':    'generic_name',
  // category
  'category':       'category',
  'dept':           'category',
  'department':     'category',
  'type':           'category',
  // quantity / stock
  'quantity':       'quantity',
  'qty':            'quantity',
  'stock':          'quantity',
  'stock level':    'quantity',
  'stock_level':    'quantity',
  'on hand':        'quantity',
  'on_hand':        'quantity',
  'units':          'quantity',
  // price
  'price':          'price',
  'unit price':     'price',
  'unit_price':     'price',
  'selling price':  'price',
  'retail price':   'price',
  'srp':            'price',
  // wholesale_price
  'wholesale':      'wholesale_price',
  'wholesale price':'wholesale_price',
  'cost':           'wholesale_price',
  'cost price':     'wholesale_price',
  'purchase price': 'wholesale_price',
  // expiry_date
  'expiry':         'expiry_date',
  'expiry date':    'expiry_date',
  'expiry_date':    'expiry_date',
  'exp date':       'expiry_date',
  'exp':            'expiry_date',
  'expiration':     'expiry_date',
  'expiration date':'expiry_date',
  'best before':    'expiry_date',
  // supplier
  'supplier':       'supplier',
  'supplier name':  'supplier',
};

function normalizeHeader(h) {
  return String(h || '').trim().toLowerCase();
}

function parseExcelDate(val) {
  if (!val) return null;
  // Already a string date
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return null;
  }
  // Excel serial date number
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const month = String(d.m).padStart(2, '0');
      const day   = String(d.d).padStart(2, '0');
      return `${d.y}-${month}-${day}`;
    }
  }
  return null;
}

function getOrCreateSupplier(name) {
  if (!name) return null;
  const existing = db.prepare('SELECT id FROM Suppliers WHERE name = ?').get(name.trim());
  if (existing) return existing.id;
  const result = db.prepare('INSERT INTO Suppliers (name) VALUES (?)').run(name.trim());
  return result.lastInsertRowid;
}

function importRows(rows) {
  let inserted = 0, updated = 0, skipped = 0;
  const errors = [];

  const upsertProduct = db.transaction((row) => {
    const name     = (row.name || '').trim();
    const itemCode = (row.item_code || '').trim();

    if (!name) { skipped++; return; }

    const quantity        = parseInt(row.quantity)       || 0;
    const price           = parseFloat(row.price)        || 0;
    const wholesale_price = parseFloat(row.wholesale_price) || 0;
    const expiry_date     = parseExcelDate(row.expiry_date);
    const supplier_id     = row.supplier ? getOrCreateSupplier(row.supplier) : null;

    // Check if product already exists by item_code or name
    let existing = null;
    if (itemCode) {
      existing = db.prepare("SELECT id FROM Products WHERE name = ? OR (? IS NOT NULL AND name = ?)").get(name, itemCode, itemCode);
      // Try matching by name
      existing = db.prepare("SELECT id FROM Products WHERE name = ?").get(name);
    } else {
      existing = db.prepare("SELECT id FROM Products WHERE name = ?").get(name);
    }

    if (existing) {
      db.prepare(`
        UPDATE Products SET
          generic_name  = COALESCE(?, generic_name),
          category      = COALESCE(?, category),
          quantity      = ?,
          price         = ?,
          expiry_date   = COALESCE(?, expiry_date),
          supplier_id   = COALESCE(?, supplier_id)
        WHERE id = ?
      `).run(
        row.generic_name || null,
        row.category     || null,
        quantity,
        price,
        expiry_date,
        supplier_id,
        existing.id,
      );
      updated++;
    } else {
      db.prepare(`
        INSERT INTO Products (name, generic_name, category, quantity, price, expiry_date, supplier_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        name,
        row.generic_name || null,
        row.category     || null,
        quantity,
        price,
        expiry_date,
        supplier_id,
      );

      // Also insert into inventory table if item_code provided
      if (itemCode) {
        const price_cents     = Math.round(price           * 100);
        const wholesale_cents = Math.round(wholesale_price * 100);
        const invExists = db.prepare('SELECT id FROM inventory WHERE item_code = ?').get(itemCode);
        if (!invExists) {
          db.prepare(`
            INSERT OR IGNORE INTO inventory
              (item_code, name, generic_name, category, price_cents, wholesale_cents, stock_level, expiry_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            itemCode,
            name,
            row.generic_name || null,
            row.category     || null,
            price_cents,
            wholesale_cents,
            quantity,
            expiry_date,
          );
        }
      }

      inserted++;
    }
  });

  for (const row of rows) {
    try {
      upsertProduct(row);
    } catch (err) {
      errors.push({ row: row.name || '(unknown)', error: err.message });
      skipped++;
    }
  }

  return { inserted, updated, skipped, errors };
}

async function importExcel(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: false });
    const sheetName = workbook.SheetNames[0];
    const sheet     = workbook.Sheets[sheetName];
    const raw       = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (raw.length < 2) {
      return res.status(400).json({ error: 'File is empty or has no data rows.' });
    }

    // Map headers
    const headers = raw[0].map(normalizeHeader);
    const fieldMap = headers.map(h => COL_MAP[h] || null);

    // Build row objects
    const rows = [];
    for (let i = 1; i < raw.length; i++) {
      const cells = raw[i];
      // Skip completely empty rows
      if (cells.every(c => c === '' || c === null || c === undefined)) continue;

      const obj = {};
      fieldMap.forEach((field, idx) => {
        if (field) obj[field] = cells[idx];
      });
      rows.push(obj);
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No data rows found after the header row.' });
    }

    const result = importRows(rows);

    return res.json({
      message: `Import complete. ${result.inserted} added, ${result.updated} updated, ${result.skipped} skipped.`,
      ...result,
      total: rows.length,
      headers: headers.filter(Boolean),
    });
  } catch (err) {
    console.error('Import error:', err);
    return res.status(500).json({ error: 'Failed to parse file: ' + err.message });
  }
}

// Return a template Excel file with correct column headers
function downloadTemplate(req, res) {
  const wb  = XLSX.utils.book_new();
  const sample = [
    ['Item Code', 'Product Name', 'Generic Name', 'Category', 'Quantity', 'Price', 'Wholesale Price', 'Expiry Date', 'Supplier'],
    ['MED-001', 'Amoxicillin 500mg Cap', 'Amoxicillin', 'Antibiotics', 100, 12.50, 8.00, '2026-12-31', 'Unilab'],
    ['MED-002', 'Paracetamol 500mg Tab', 'Paracetamol', 'Analgesics',  250, 3.75,  2.00, '2027-06-30', 'Generika'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(sample);

  // Column widths
  ws['!cols'] = [16,28,22,16,10,10,16,14,16].map(w => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="pharmasync_import_template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
}

module.exports = { importExcel, downloadTemplate };
