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
  Alert,
} from '@mui/material';
import axios from 'axios';

function Deductions() {
  const [deductions, setDeductions] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState(null);
  const [formData, setFormData] = useState({
    payroll_id: '',
    type: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetchDeductions();
    fetchPayrolls();
  }, []);

  const fetchDeductions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/deductions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDeductions(response.data);
    } catch (error) {
      console.error('Error fetching deductions:', error);
      setError('Failed to fetch deductions');
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleOpen = (deduction) => {
    setSelectedDeduction(deduction);
    if (deduction) {
      setFormData({
        payroll_id: deduction.payroll_id,
        type: deduction.type,
        amount: deduction.amount,
        description: deduction.description,
      });
    } else {
      setFormData({
        payroll_id: '',
        type: '',
        amount: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDeduction(null);
    setFormData({
      payroll_id: '',
      type: '',
      amount: '',
      description: '',
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
      if (selectedDeduction) {
        await axios.put(
          `http://localhost:5000/api/deductions/${selectedDeduction.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/deductions',
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      fetchDeductions();
      handleClose();
    } catch (error) {
      console.error('Error saving deduction:', error);
      setError(error.response?.data?.message || 'Failed to save deduction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deduction?')) {
      try {
        await axios.delete(`http://localhost:5000/api/deductions/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchDeductions();
      } catch (error) {
        console.error('Error deleting deduction:', error);
        setError(error.response?.data?.message || 'Failed to delete deduction');
      }
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
          Deductions
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
          Add Deduction
        </Button>
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
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Payroll</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deductions.map((deduction) => (
              <TableRow key={deduction.id}>
                <TableCell>{deduction.id}</TableCell>
                <TableCell>{deduction.type}</TableCell>
                <TableCell>${deduction.amount}</TableCell>
                <TableCell>{deduction.description}</TableCell>
                <TableCell>
                  {payrolls.find(p => p.id === deduction.payroll_id)?.payment_date 
                    ? new Date(payrolls.find(p => p.id === deduction.payroll_id).payment_date).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                    onClick={() => handleOpen(deduction)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(deduction.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedDeduction ? 'Edit Deduction' : 'Add Deduction'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Payroll"
              name="payroll_id"
              value={formData.payroll_id}
              onChange={handleChange}
            >
              {payrolls.map((payroll) => (
                <MenuItem key={payroll.id} value={payroll.id}>
                  {new Date(payroll.payment_date).toLocaleDateString()} - {payroll.first_name} {payroll.last_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedDeduction ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Deductions; 