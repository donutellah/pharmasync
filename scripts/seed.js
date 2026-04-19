const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, '../pharmasync.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Ensure the inventory table exists before seeding
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

// Prices in centavos (Philippine Peso cents). e.g. ₱15.00 = 1500
const medicines = [
  {
    item_code:       'MED-001',
    name:            'Amoxicillin 500mg Capsule',
    generic_name:    'Amoxicillin',
    category:        'Antibiotic',
    price_cents:     1800,   // ₱18.00
    wholesale_cents: 1100,   // ₱11.00
    stock_level:     120,
    expiry_date:     '2026-08-31',
  },
  {
    item_code:       'MED-002',
    name:            'Paracetamol 500mg Tablet',
    generic_name:    'Paracetamol',
    category:        'Analgesic / Antipyretic',
    price_cents:     300,    // ₱3.00
    wholesale_cents: 150,    // ₱1.50
    stock_level:     300,
    expiry_date:     '2027-03-31',
  },
  {
    item_code:       'MED-003',
    name:            'Ibuprofen 400mg Tablet',
    generic_name:    'Ibuprofen',
    category:        'NSAID / Analgesic',
    price_cents:     950,    // ₱9.50
    wholesale_cents: 600,    // ₱6.00
    stock_level:     80,
    expiry_date:     '2026-11-30',
  },
  {
    item_code:       'MED-004',
    name:            'Cetirizine 10mg Tablet',
    generic_name:    'Cetirizine Hydrochloride',
    category:        'Antihistamine',
    price_cents:     850,    // ₱8.50
    wholesale_cents: 500,    // ₱5.00
    stock_level:     45,
    expiry_date:     '2026-09-30',
  },
  {
    item_code:       'MED-005',
    name:            'Losartan 50mg Tablet',
    generic_name:    'Losartan Potassium',
    category:        'Antihypertensive',
    price_cents:     1400,   // ₱14.00
    wholesale_cents: 900,    // ₱9.00
    stock_level:     60,
    expiry_date:     '2027-01-31',
  },
  {
    item_code:       'MED-006',
    name:            'Metformin 500mg Tablet',
    generic_name:    'Metformin Hydrochloride',
    category:        'Antidiabetic',
    price_cents:     700,    // ₱7.00
    wholesale_cents: 400,    // ₱4.00
    stock_level:     0,
    expiry_date:     '2026-12-31',
  },
  {
    item_code:       'MED-007',
    name:            'Omeprazole 20mg Capsule',
    generic_name:    'Omeprazole',
    category:        'Proton Pump Inhibitor',
    price_cents:     1200,   // ₱12.00
    wholesale_cents: 750,    // ₱7.50
    stock_level:     35,
    expiry_date:     '2026-07-31',
  },
  {
    item_code:       'MED-008',
    name:            'Amlodipine 5mg Tablet',
    generic_name:    'Amlodipine Besilate',
    category:        'Antihypertensive',
    price_cents:     1100,   // ₱11.00
    wholesale_cents: 650,    // ₱6.50
    stock_level:     90,
    expiry_date:     '2027-04-30',
  },
  {
    item_code:       'MED-009',
    name:            'Azithromycin 500mg Tablet',
    generic_name:    'Azithromycin',
    category:        'Antibiotic',
    price_cents:     5500,   // ₱55.00
    wholesale_cents: 3800,   // ₱38.00
    stock_level:     25,
    expiry_date:     '2026-10-31',
  },
  {
    item_code:       'MED-010',
    name:            'Mefenamic Acid 500mg Capsule',
    generic_name:    'Mefenamic Acid',
    category:        'NSAID / Analgesic',
    price_cents:     650,    // ₱6.50
    wholesale_cents: 380,    // ₱3.80
    stock_level:     15,
    expiry_date:     '2026-06-30',
  },
];

// Clear existing data and re-seed
const clearAndSeed = db.transaction(() => {
  db.prepare('DELETE FROM inventory').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name = 'inventory'").run();

  const insert = db.prepare(`
    INSERT INTO inventory
      (item_code, name, generic_name, category, price_cents, wholesale_cents, stock_level, expiry_date)
    VALUES
      (@item_code, @name, @generic_name, @category, @price_cents, @wholesale_cents, @stock_level, @expiry_date)
  `);

  for (const med of medicines) {
    insert.run(med);
  }
});

clearAndSeed();

const count = db.prepare('SELECT COUNT(*) AS total FROM inventory').get();
console.log(`✓ Seeded ${count.total} medicines into inventory.`);

// Preview seeded data
const preview = db.prepare('SELECT item_code, name, price_cents, stock_level, status FROM inventory').all();
console.table(preview);

db.close();
