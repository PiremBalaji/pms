const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all tax slabs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM tax_slabs ORDER BY min_amount');
    res.json(results);
  } catch (error) {
    console.error('Error fetching tax slabs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single tax slab
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM tax_slabs WHERE id = ?', [req.params.id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Tax slab not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching tax slab:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tax slab
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { min_amount, max_amount, tax_percentage } = req.body;

  try {
    // Validate tax slab ranges
    const [overlappingSlabs] = await db.query(`
      SELECT * FROM tax_slabs 
      WHERE (min_amount <= ? AND max_amount >= ?) 
      OR (min_amount <= ? AND max_amount >= ?)
    `, [max_amount, min_amount, max_amount, min_amount]);

    if (overlappingSlabs.length > 0) {
      return res.status(400).json({ message: 'Tax slab range overlaps with existing slabs' });
    }

    const [result] = await db.query(`
      INSERT INTO tax_slabs (min_amount, max_amount, tax_percentage)
      VALUES (?, ?, ?)
    `, [min_amount, max_amount, tax_percentage]);

    res.status(201).json({
      id: result.insertId,
      message: 'Tax slab created successfully'
    });
  } catch (error) {
    console.error('Error creating tax slab:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tax slab
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { min_amount, max_amount, tax_percentage } = req.body;

  try {
    // Validate tax slab ranges
    const [overlappingSlabs] = await db.query(`
      SELECT * FROM tax_slabs 
      WHERE id != ? AND ((min_amount <= ? AND max_amount >= ?) 
      OR (min_amount <= ? AND max_amount >= ?))
    `, [req.params.id, max_amount, min_amount, max_amount, min_amount]);

    if (overlappingSlabs.length > 0) {
      return res.status(400).json({ message: 'Tax slab range overlaps with existing slabs' });
    }

    const [result] = await db.query(`
      UPDATE tax_slabs 
      SET min_amount = ?, max_amount = ?, tax_percentage = ?
      WHERE id = ?
    `, [min_amount, max_amount, tax_percentage, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tax slab not found' });
    }
    res.json({ message: 'Tax slab updated successfully' });
  } catch (error) {
    console.error('Error updating tax slab:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tax slab
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tax_slabs WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tax slab not found' });
    }
    res.json({ message: 'Tax slab deleted successfully' });
  } catch (error) {
    console.error('Error deleting tax slab:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 