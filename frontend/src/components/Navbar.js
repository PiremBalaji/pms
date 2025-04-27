import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleMenu}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem component={RouterLink} to="/" onClick={handleClose}>
            Dashboard
          </MenuItem>
          <MenuItem component={RouterLink} to="/employees" onClick={handleClose}>
            Employees
          </MenuItem>
          <MenuItem component={RouterLink} to="/payroll" onClick={handleClose}>
            Payroll
          </MenuItem>
          <MenuItem component={RouterLink} to="/allowances" onClick={handleClose}>
            Allowances
          </MenuItem>
          <MenuItem component={RouterLink} to="/deductions" onClick={handleClose}>
            Deductions
          </MenuItem>
          <MenuItem component={RouterLink} to="/attendance" onClick={handleClose}>
            Attendance
          </MenuItem>
          <Divider />
          <MenuItem component={RouterLink} to="/employee-types" onClick={handleClose}>
            Employee Types
          </MenuItem>
          <MenuItem component={RouterLink} to="/tax-slabs" onClick={handleClose}>
            Tax Slabs
          </MenuItem>
        </Menu>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Payroll Management System
        </Typography>
        {isAuthenticated ? (
          <Box>
            <Button color="inherit" onClick={handleLogout} sx={{ mx: 1 }}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 