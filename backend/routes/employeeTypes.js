const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all employee types
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM employee_types ORDER BY name');
    res.json(results);
  } catch (error) {
    console.error('Error fetching employee types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get employee type by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM employee_types WHERE id = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Employee type not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching employee type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new employee type
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, description, base_salary, working_hours, benefits } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO employee_types (name, description, base_salary, working_hours, benefits) VALUES (?, ?, ?, ?, ?)',
      [name, description, base_salary, working_hours, benefits]
    );
    const [newType] = await db.query('SELECT * FROM employee_types WHERE id = ?', [result.insertId]);
    res.status(201).json(newType[0]);
  } catch (error) {
    console.error('Error creating employee type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update employee type
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { name, description, base_salary, working_hours, benefits } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE employee_types SET name = ?, description = ?, base_salary = ?, working_hours = ?, benefits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, base_salary, working_hours, benefits, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee type not found' });
    }
    
    const [updatedType] = await db.query('SELECT * FROM employee_types WHERE id = ?', [req.params.id]);
    res.json(updatedType[0]);
  } catch (error) {
    console.error('Error updating employee type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete employee type
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Check if any employees are using this type
    const [employeesResult] = await db.query(
      'SELECT COUNT(*) as count FROM employees WHERE employee_type_id = ?',
      [req.params.id]
    );
    
    if (employeesResult[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete employee type that is assigned to employees' 
      });
    }

    const [result] = await db.query(
      'DELETE FROM employee_types WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee type not found' });
    }
    
    res.json({ message: 'Employee type deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 