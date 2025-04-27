const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM employees');
    res.json(results);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single employee
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create employee
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    address,
    position,
    department,
    hire_date,
    salary,
    employee_type_id
  } = req.body;

  try {
    await db.query(
      'CALL add_employee(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, address, position, department, hire_date, salary, employee_type_id]
    );
    res.status(201).json({
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    address,
    position,
    department,
    salary,
    employee_type_id
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE employees 
       SET first_name = ?, last_name = ?, email = ?, phone = ?,
           address = ?, position = ?, department = ?, salary = ?,
           employee_type_id = ?
       WHERE id = ?`,
      [first_name, last_name, email, phone, address, position, department, salary, employee_type_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 