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
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function EmployeeTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_salary: '',
    working_hours: '',
    benefits: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employee-types', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTypes(response.data);
    } catch (error) {
      console.error('Error fetching employee types:', error);
      setError('Failed to fetch employee types');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (type) => {
    setSelectedType(type);
    if (type) {
      setFormData({
        name: type.name,
        description: type.description,
        base_salary: type.base_salary,
        working_hours: type.working_hours,
        benefits: type.benefits,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        base_salary: '',
        working_hours: '',
        benefits: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedType(null);
    setFormData({
      name: '',
      description: '',
      base_salary: '',
      working_hours: '',
      benefits: '',
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
      if (selectedType) {
        await axios.put(
          `http://localhost:5000/api/employee-types/${selectedType.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/employee-types',
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      fetchTypes();
      handleClose();
    } catch (error) {
      console.error('Error saving employee type:', error);
      setError(error.response?.data?.message || 'Failed to save employee type');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee type?')) {
      try {
        await axios.delete(`http://localhost:5000/api/employee-types/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchTypes();
      } catch (error) {
        console.error('Error deleting employee type:', error);
        setError(error.response?.data?.message || 'Failed to delete employee type');
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
          Employee Types
        </Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
            Add Employee Type
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
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Base Salary</TableCell>
              <TableCell>Working Hours</TableCell>
              <TableCell>Benefits</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.description}</TableCell>
                <TableCell>${type.base_salary}</TableCell>
                <TableCell>{type.working_hours} hours</TableCell>
                <TableCell>{type.benefits}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(type)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(type.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedType ? 'Edit Employee Type' : 'Add Employee Type'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Base Salary"
              name="base_salary"
              type="number"
              value={formData.base_salary}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Working Hours"
              name="working_hours"
              type="number"
              value={formData.working_hours}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Benefits"
              name="benefits"
              multiline
              rows={2}
              value={formData.benefits}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedType ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EmployeeTypes; 