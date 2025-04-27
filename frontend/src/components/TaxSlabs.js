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
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function TaxSlabs() {
  const [taxSlabs, setTaxSlabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [formData, setFormData] = useState({
    min_amount: '',
    max_amount: '',
    tax_percentage: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTaxSlabs();
  }, []);

  const fetchTaxSlabs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tax-slabs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTaxSlabs(response.data);
    } catch (error) {
      console.error('Error fetching tax slabs:', error);
      setError('Failed to fetch tax slabs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (slab) => {
    setSelectedSlab(slab);
    if (slab) {
      setFormData({
        min_amount: slab.min_amount,
        max_amount: slab.max_amount,
        tax_percentage: slab.tax_percentage,
      });
    } else {
      setFormData({
        min_amount: '',
        max_amount: '',
        tax_percentage: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSlab(null);
    setFormData({
      min_amount: '',
      max_amount: '',
      tax_percentage: '',
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
      if (selectedSlab) {
        await axios.put(
          `http://localhost:5000/api/tax-slabs/${selectedSlab.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/tax-slabs',
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      fetchTaxSlabs();
      handleClose();
    } catch (error) {
      console.error('Error saving tax slab:', error);
      setError(error.response?.data?.message || 'Failed to save tax slab');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tax slab?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tax-slabs/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchTaxSlabs();
      } catch (error) {
        console.error('Error deleting tax slab:', error);
        setError(error.response?.data?.message || 'Failed to delete tax slab');
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
          Tax Slabs
        </Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
            Add Tax Slab
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
              <TableCell>Min Amount</TableCell>
              <TableCell>Max Amount</TableCell>
              <TableCell>Tax Percentage</TableCell>
              <TableCell>Description</TableCell>
              {user?.role === 'admin' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {taxSlabs.map((slab) => (
              <TableRow key={slab.id}>
                <TableCell>{slab.id}</TableCell>
                <TableCell>${slab.min_amount}</TableCell>
                <TableCell>{slab.max_amount ? `$${slab.max_amount}` : 'Above'}</TableCell>
                <TableCell>{slab.tax_percentage}%</TableCell>
                <TableCell>{slab.description}</TableCell>
                {user?.role === 'admin' && (
                  <TableCell>
                    <Button
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                      onClick={() => handleOpen(slab)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(slab.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedSlab ? 'Edit Tax Slab' : 'Add Tax Slab'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Min Amount"
              name="min_amount"
              type="number"
              value={formData.min_amount}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Max Amount"
              name="max_amount"
              type="number"
              value={formData.max_amount}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Tax Percentage"
              name="tax_percentage"
              type="number"
              value={formData.tax_percentage}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedSlab ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TaxSlabs; 