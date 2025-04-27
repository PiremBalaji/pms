import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Alert, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function AllowanceList() {
  const [allowances, setAllowances] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    payroll_id: '',
    type: '',
    amount: '',
    date: '',
  });

  useEffect(() => {
    fetchAllowances();
  }, []);

  const fetchAllowances = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/allowances', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAllowances(response.data);
    } catch (error) {
      console.error('Error fetching allowances:', error);
      setError('Failed to fetch allowances');
    }
  };

  const handleOpen = (allowance) => {
    setSelectedAllowance(allowance);
    if (allowance) {
      setFormData({
        employee_id: allowance.employee_id,
        payroll_id: allowance.payroll_id,
        type: allowance.type,
        amount: allowance.amount,
        date: allowance.date.split('T')[0],
      });
    } else {
      setFormData({
        employee_id: '',
        payroll_id: '',
        type: '',
        amount: '',
        date: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAllowance(null);
    setFormData({
      employee_id: '',
      payroll_id: '',
      type: '',
      amount: '',
      date: '',
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
      if (selectedAllowance) {
        await axios.put(
          `http://localhost:5000/api/allowances/${selectedAllowance.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/allowances',
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
      }
      fetchAllowances();
      handleClose();
    } catch (error) {
      console.error('Error saving allowance:', error);
      setError(error.response?.data?.message || 'Failed to save allowance');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this allowance?')) {
      try {
        await axios.delete(`http://localhost:5000/api/allowances/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchAllowances();
      } catch (error) {
        console.error('Error deleting allowance:', error);
        setError(error.response?.data?.message || 'Failed to delete allowance');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Allowance Management
        </Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
            Add Allowance
          </Button>
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
              <TableCell>Payroll ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              {user?.role === 'admin' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {allowances.map((allowance) => (
              <TableRow key={allowance.id}>
                <TableCell>{allowance.id}</TableCell>
                <TableCell>{`${allowance.first_name} ${allowance.last_name}`}</TableCell>
                <TableCell>{allowance.payroll_id}</TableCell>
                <TableCell>{allowance.type}</TableCell>
                <TableCell>${allowance.amount}</TableCell>
                <TableCell>{new Date(allowance.date).toLocaleDateString()}</TableCell>
                {user?.role === 'admin' && (
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpen(allowance)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(allowance.id)}
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
          {selectedAllowance ? 'Edit Allowance' : 'Add Allowance'}
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
              label="Payroll ID"
              name="payroll_id"
              type="number"
              value={formData.payroll_id}
              onChange={handleChange}
            />
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
              required
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedAllowance ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AllowanceList; 