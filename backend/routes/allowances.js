const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all allowances
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM allowances');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching allowances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get allowance by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM allowances WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Allowance not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching allowance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new allowance (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { type, amount, description, payroll_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO allowances (type, amount, description, payroll_id) VALUES (?, ?, ?, ?)',
      [type, amount, description, payroll_id]
    );
    res.status(201).json({ id: result.insertId, type, amount, description, payroll_id });
  } catch (error) {
    console.error('Error creating allowance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update allowance (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { type, amount, description, payroll_id } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE allowances SET type = ?, amount = ?, description = ?, payroll_id = ? WHERE id = ?',
      [type, amount, description, payroll_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Allowance not found' });
    }
    res.json({ id: req.params.id, type, amount, description, payroll_id });
  } catch (error) {
    console.error('Error updating allowance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete allowance (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM allowances WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Allowance not found' });
    }
    res.json({ message: 'Allowance deleted successfully' });
  } catch (error) {
    console.error('Error deleting allowance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 