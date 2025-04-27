const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all payroll records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT p.*, e.first_name, e.last_name,
             calculate_total_salary(p.basic_salary, p.allowances, p.deductions, p.tax_amount) as total_salary
      FROM payroll p 
      JOIN employees e ON p.employee_id = e.id
    `);
    res.json(results);
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single payroll record
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT p.*, e.first_name, e.last_name,
             calculate_total_salary(p.basic_salary, p.allowances, p.deductions, p.tax_amount) as total_salary
      FROM payroll p 
      JOIN employees e ON p.employee_id = e.id 
      WHERE p.id = ?
    `, [req.params.id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching payroll record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payroll record
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const {
    employee_id,
    basic_salary,
    allowances,
    deductions,
    payment_date,
    status
  } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO payroll (
        employee_id, basic_salary, allowances, deductions,
        payment_date, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [employee_id, basic_salary, allowances, deductions, payment_date, status]);

    res.status(201).json({
      id: result.insertId,
      message: 'Payroll record created successfully'
    });
  } catch (error) {
    console.error('Error creating payroll record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payroll record
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const {
    basic_salary,
    allowances,
    deductions,
    payment_date,
    status
  } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE payroll 
      SET basic_salary = ?, allowances = ?, deductions = ?,
          payment_date = ?, status = ?
      WHERE id = ?
    `, [basic_salary, allowances, deductions, payment_date, status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    res.json({ message: 'Payroll record updated successfully' });
  } catch (error) {
    console.error('Error updating payroll record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete payroll record
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM payroll WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    res.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate monthly payroll
router.post('/generate', authenticateToken, isAdmin, async (req, res) => {
  const { month, year } = req.body;
  
  try {
    await db.query('CALL generate_monthly_payroll(?, ?)', [month, year]);
    res.json({ message: 'Monthly payroll generated successfully' });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 