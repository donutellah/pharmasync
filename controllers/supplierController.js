const db = require('../database/db');

function getAllSuppliers(req, res) {
  const suppliers = db.prepare('SELECT * FROM Suppliers ORDER BY name ASC').all();
  res.json(suppliers);
}

function getSupplierById(req, res) {
  const supplier = db.prepare('SELECT * FROM Suppliers WHERE id = ?').get(req.params.id);
  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found.' });
  }
  res.json(supplier);
}

function createSupplier(req, res) {
  const { name, contact_info } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Supplier name is required.' });
  }

  const result = db.prepare(`
    INSERT INTO Suppliers (name, contact_info)
    VALUES (?, ?)
  `).run(name, contact_info ?? null);

  const supplier = db.prepare('SELECT * FROM Suppliers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'Supplier created.', supplier });
}

function updateSupplier(req, res) {
  const { name, contact_info } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM Suppliers WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Supplier not found.' });
  }

  db.prepare(`
    UPDATE Suppliers SET name = ?, contact_info = ? WHERE id = ?
  `).run(
    name ?? existing.name,
    contact_info !== undefined ? contact_info : existing.contact_info,
    id
  );

  const updated = db.prepare('SELECT * FROM Suppliers WHERE id = ?').get(id);
  res.json({ message: 'Supplier updated.', supplier: updated });
}

function deleteSupplier(req, res) {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM Suppliers WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Supplier not found.' });
  }

  db.prepare('DELETE FROM Suppliers WHERE id = ?').run(id);
  res.json({ message: 'Supplier deleted.' });
}

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
