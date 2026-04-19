const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'database/pharmasync.db'));
db.pragma('foreign_keys = ON');

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node import_products.js "path/to/file.csv"');
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`File not found: ${csvPath}`);
  process.exit(1);
}

// Parse CSV properly (handles quoted fields with commas inside)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseNum(val) {
  if (!val || val === '.' || val === '') return 0;
  const cleaned = val.replace(/,/g, '').replace(/"/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n');

// Skip first 2 rows (title row + column header row)
// Skip footer rows that start with "T." or are blank
const dataLines = lines.slice(2).filter(line => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('T.') || trimmed.startsWith('"T.')) return false;
  return true;
});

// --- Pass 1: collect all unique suppliers ---
const supplierMap = new Map(); // name -> id
const productRows = [];

for (const line of dataLines) {
  const cols = parseCSVLine(line);
  if (cols.length < 8) continue;

  const itemName = cols[2]?.trim();
  if (!itemName || itemName === 'ITEM NAME') continue;

  const supplierName = cols[13]?.trim();
  if (supplierName) supplierMap.set(supplierName, null);

  productRows.push(cols);
}

// --- Insert suppliers ---
const insertSupplier = db.prepare(`INSERT OR IGNORE INTO Suppliers (name) VALUES (?)`);
const getSupplier    = db.prepare(`SELECT id FROM Suppliers WHERE name = ?`);

for (const [name] of supplierMap) {
  insertSupplier.run(name);
  const row = getSupplier.get(name);
  if (row) supplierMap.set(name, row.id);
}

console.log(`Suppliers ready: ${supplierMap.size}`);

// --- Pass 2: insert products ---
const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO Products (name, category, quantity, price, supplier_id)
  VALUES (?, ?, ?, ?, ?)
`);

let inserted = 0;
let skipped  = 0;

const importAll = db.transaction(() => {
  for (const cols of productRows) {
    const itemName = cols[2]?.trim();
    if (!itemName) continue;

    // Quantity: BALANCE column (col 3). Clamp negatives to 0.
    const quantity = Math.max(0, Math.floor(parseNum(cols[3])));

    // Price: use RETAIL (col 7); fall back to U.COST (col 6) if retail is 0
    const retail   = parseNum(cols[7]);
    const unitCost = parseNum(cols[6]);
    const price    = retail > 0 ? retail : unitCost;

    const category     = cols[14]?.trim() || null;
    const supplierName = cols[13]?.trim() || '';
    const supplier_id  = supplierName ? (supplierMap.get(supplierName) ?? null) : null;

    const result = insertProduct.run(itemName, category, quantity, price, supplier_id);
    if (result.changes > 0) inserted++;
    else skipped++;
  }
});

importAll();

console.log(`\nImport complete!`);
console.log(`  Inserted : ${inserted} products`);
console.log(`  Skipped  : ${skipped} (already exist)`);
console.log(`  Total    : ${inserted + skipped} rows processed`);
