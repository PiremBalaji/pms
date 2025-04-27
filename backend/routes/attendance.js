const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all attendance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, e.first_name, e.last_name 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      ORDER BY a.date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, e.first_name, e.last_name 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new attendance record (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { employee_id, date, check_in, check_out, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)',
      [employee_id, date, check_in, check_out, status]
    );
    
    const [newRecord] = await db.query(`
      SELECT a.*, e.first_name, e.last_name 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update attendance record (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { employee_id, date, check_in, check_out, status } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE attendance SET employee_id = ?, date = ?, check_in = ?, check_out = ?, status = ? WHERE id = ?',
      [employee_id, date, check_in, check_out, status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    const [updatedRecord] = await db.query(`
      SELECT a.*, e.first_name, e.last_name 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `, [req.params.id]);
    
    res.json(updatedRecord[0]);
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete attendance record (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance by employee ID
router.get('/employee/:employee_id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, e.first_name, e.last_name 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.employee_id = ?
      ORDER BY a.date DESC
    `, [req.params.employee_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 