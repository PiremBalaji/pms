import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: '',
    allowances: '',
    deductions: '',
    payment_date: '',
    status: 'pending',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payroll', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      setError('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (payroll) => {
    setSelectedPayroll(payroll);
    if (payroll) {
      setFormData({
        employee_id: payroll.employee_id,
        basic_salary: payroll.basic_salary,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
        payment_date: payroll.payment_date.split('T')[0],
        status: payroll.status,
      });
    } else {
      setFormData({
        employee_id: '',
        basic_salary: '',
        allowances: '',
        deductions: '',
        payment_date: '',
        status: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPayroll(null);
    setFormData({
      employee_id: '',
      basic_salary: '',
      allowances: '',
      deductions: '',
      payment_date: '',
      status: 'pending',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPayroll) {
        await axios.put(
          `http://localhost:5000/api/payroll/${selectedPayroll.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/payroll',
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      fetchPayrolls();
      handleClose();
    } catch (error) {
      console.error('Error saving payroll:', error);
      setError(error.response?.data?.message || 'Failed to save payroll');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/payroll/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchPayrolls();
      } catch (error) {
        console.error('Error deleting payroll:', error);
        setError(error.response?.data?.message || 'Failed to delete payroll');
      }
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const month = prompt('Enter month (1-12):');
      const year = prompt('Enter year (YYYY):');
      
      if (!month || !year) {
        setError('Month and year are required');
        return;
      }

      if (month < 1 || month > 12) {
        setError('Month must be between 1 and 12');
        return;
      }

      if (year < 2000 || year > new Date().getFullYear()) {
        setError('Invalid year');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/payroll/generate',
        { month: parseInt(month), year: parseInt(year) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // Refresh payroll list
      fetchPayrolls();
    } catch (error) {
      console.error('Error generating payroll:', error);
      setError('Failed to generate payroll');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Payroll Management
        </Typography>
        {user?.role === 'admin' && (
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleGeneratePayroll}
              sx={{ mr: 2 }}
            >
              Generate Payroll
            </Button>
            <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
              Add Payroll
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Allowances</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Tax Amount</TableCell>
              <TableCell>Total Salary</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Status</TableCell>
              {user?.role === 'admin' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {payrolls.map((payroll) => (
              <TableRow key={payroll.id}>
                <TableCell>{payroll.id}</TableCell>
                <TableCell>{`${payroll.first_name} ${payroll.last_name}`}</TableCell>
                <TableCell>${payroll.basic_salary}</TableCell>
                <TableCell>${payroll.allowances}</TableCell>
                <TableCell>${payroll.deductions}</TableCell>
                <TableCell>${payroll.tax_amount}</TableCell>
                <TableCell>${payroll.total_salary}</TableCell>
                <TableCell>{new Date(payroll.payment_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={payroll.status}
                    color={getStatusColor(payroll.status)}
                    size="small"
                  />
                </TableCell>
                {user?.role === 'admin' && (
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpen(payroll)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(payroll.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedPayroll ? 'Edit Payroll' : 'Add Payroll'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Employee ID"
              name="employee_id"
              type="number"
              value={formData.employee_id}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Basic Salary"
              name="basic_salary"
              type="number"
              value={formData.basic_salary}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Allowances"
              name="allowances"
              type="number"
              value={formData.allowances}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Deductions"
              name="deductions"
              type="number"
              value={formData.deductions}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Payment Date"
              name="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedPayroll ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PayrollList; 