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
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Allowances() {
  const [allowances, setAllowances] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState(null);
  const [formData, setFormData] = useState({
    payroll_id: '',
    type: '',
    amount: '',
    description: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchAllowances();
    fetchPayrolls();
  }, []);

  const fetchAllowances = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/allowances', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAllowances(response.data);
    } catch (error) {
      console.error('Error fetching allowances:', error);
      setError('Failed to fetch allowances');
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

  const handleOpen = (allowance) => {
    setSelectedAllowance(allowance);
    if (allowance) {
      setFormData({
        payroll_id: allowance.payroll_id,
        type: allowance.type,
        amount: allowance.amount,
        description: allowance.description,
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
    setSelectedAllowance(null);
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
      if (selectedAllowance) {
        await axios.put(
          `http://localhost:5000/api/allowances/${selectedAllowance.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/allowances',
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
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
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchAllowances();
      } catch (error) {
        console.error('Error deleting allowance:', error);
        setError(error.response?.data?.message || 'Failed to delete allowance');
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
          Allowances
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
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Payroll</TableCell>
              {user?.role === 'admin' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {allowances.map((allowance) => (
              <TableRow key={allowance.id}>
                <TableCell>{allowance.id}</TableCell>
                <TableCell>{allowance.type}</TableCell>
                <TableCell>${allowance.amount}</TableCell>
                <TableCell>{allowance.description}</TableCell>
                <TableCell>
                  {payrolls.find(p => p.id === allowance.payroll_id)?.payment_date 
                    ? new Date(payrolls.find(p => p.id === allowance.payroll_id).payment_date).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
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
            {selectedAllowance ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Allowances; 