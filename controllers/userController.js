const db = require('../database/db');
const bcrypt = require('bcrypt');

function getAllUsers(req, res) {
  const users = db.prepare(`
    SELECT id, name, email, role, created_at FROM Users ORDER BY name ASC
  `).all();
  res.json(users);
}

function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['admin', 'pharmacist'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "admin" or "pharmacist".' });
  }

  const user = db.prepare('SELECT * FROM Users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Prevent demoting the last admin
  if (user.role === 'admin' && role === 'pharmacist') {
    const adminCount = db.prepare("SELECT COUNT(*) AS count FROM Users WHERE role = 'admin'").get();
    if (adminCount.count <= 1) {
      return res.status(400).json({ error: 'Cannot demote the last admin.' });
    }
  }

  db.prepare('UPDATE Users SET role = ? WHERE id = ?').run(role, id);

  const updated = db.prepare('SELECT id, name, email, role, created_at FROM Users WHERE id = ?').get(id);
  res.json({ message: 'User role updated.', user: updated });
}

function createUser(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }
  if (!['admin', 'pharmacist'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "admin" or "pharmacist".' });
  }

  const existing = db.prepare('SELECT id FROM Users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already in use.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare(`
    INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)
  `).run(name, email, hashed, role);

  const user = db.prepare('SELECT id, name, email, role, created_at FROM Users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'User created.', user });
}

function changePassword(req, res) {
  const { id } = req.params;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'current_password and new_password are required.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  // Only allow users to change their own password, or admins to change anyone's
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const user = db.prepare('SELECT * FROM Users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const valid = bcrypt.compareSync(current_password, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const hashed = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE Users SET password = ? WHERE id = ?').run(hashed, id);
  res.json({ message: 'Password updated successfully.' });
}

function deleteUser(req, res) {
  const { id } = req.params;

  const user = db.prepare('SELECT * FROM Users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Prevent deleting the last admin
  if (user.role === 'admin') {
    const adminCount = db.prepare("SELECT COUNT(*) AS count FROM Users WHERE role = 'admin'").get();
    if (adminCount.count <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin.' });
    }
  }

  db.prepare('DELETE FROM Users WHERE id = ?').run(id);
  res.json({ message: 'User deleted.' });
}

module.exports = { getAllUsers, updateUserRole, createUser, changePassword, deleteUser };
