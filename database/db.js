const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const db = new Database(path.join(__dirname, 'pharmasync.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  // Migrate Users table if it still has the old 'cashier' role constraint
  const usersSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='Users'").get();
  if (usersSchema && usersSchema.sql.includes("'admin', 'cashier'")) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      CREATE TABLE Users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'pharmacist')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO Users_new SELECT * FROM Users;
      DROP TABLE Users;
      ALTER TABLE Users_new RENAME TO Users;
    `);
    db.pragma('foreign_keys = ON');
    console.log('Migrated Users table: cashier → pharmacist role');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'pharmacist')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      generic_name TEXT,
      category TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL,
      expiry_date DATE,
      supplier_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES Suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS Sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      cashier_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed', 'void')),
      FOREIGN KEY (cashier_id) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Sales_Items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES Sales(id),
      FOREIGN KEY (product_id) REFERENCES Products(id)
    );

    CREATE TABLE IF NOT EXISTS Transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      reference_id INTEGER,
      FOREIGN KEY (reference_id) REFERENCES Sales(id)
    );

    CREATE TABLE IF NOT EXISTS Financial_Logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      reference_id INTEGER,
      FOREIGN KEY (reference_id) REFERENCES Sales(id)
    );
  `);

  // Add new columns to Products if upgrading an existing database
  const productCols = db.prepare("PRAGMA table_info(Products)").all().map(c => c.name);
  if (!productCols.includes('generic_name')) db.exec("ALTER TABLE Products ADD COLUMN generic_name TEXT");
  if (!productCols.includes('category'))     db.exec("ALTER TABLE Products ADD COLUMN category TEXT");
  if (!productCols.includes('expiry_date'))  db.exec("ALTER TABLE Products ADD COLUMN expiry_date DATE");

  // Seed default admin user if none exists
  const adminExists = db.prepare('SELECT id FROM Users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hashed = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO Users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run('Admin', 'admin@pharmasync.com', hashed, 'admin');
    console.log('Default admin created — email: admin@pharmasync.com, password: admin123');
  }
}

initializeDatabase();

module.exports = db;
