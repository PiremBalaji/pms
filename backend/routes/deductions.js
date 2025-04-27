const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all deductions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM deductions');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching deductions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get deduction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM deductions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Deduction not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching deduction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new deduction (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { type, amount, description, payroll_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO deductions (type, amount, description, payroll_id) VALUES (?, ?, ?, ?)',
      [type, amount, description, payroll_id]
    );
    res.status(201).json({ id: result.insertId, type, amount, description, payroll_id });
  } catch (error) {
    console.error('Error creating deduction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update deduction (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { type, amount, description, payroll_id } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE deductions SET type = ?, amount = ?, description = ?, payroll_id = ? WHERE id = ?',
      [type, amount, description, payroll_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Deduction not found' });
    }
    res.json({ id: req.params.id, type, amount, description, payroll_id });
  } catch (error) {
    console.error('Error updating deduction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete deduction (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM deductions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Deduction not found' });
    }
    res.json({ message: 'Deduction deleted successfully' });
  } catch (error) {
    console.error('Error deleting deduction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 