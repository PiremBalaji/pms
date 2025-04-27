import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import PayrollList from './components/PayrollList';
import Allowances from './components/Allowances';
import Deductions from './components/Deductions';
import Attendance from './components/Attendance';
import EmployeeTypes from './components/EmployeeTypes';
import TaxSlabs from './components/TaxSlabs';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <PrivateRoute>
                  <EmployeeList />
                </PrivateRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <PrivateRoute>
                  <PayrollList />
                </PrivateRoute>
              }
            />
            <Route
              path="/allowances"
              element={
                <PrivateRoute>
                  <Allowances />
                </PrivateRoute>
              }
            />
            <Route
              path="/deductions"
              element={
                <PrivateRoute>
                  <Deductions />
                </PrivateRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <PrivateRoute>
                  <Attendance />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-types"
              element={
                <PrivateRoute>
                  <EmployeeTypes />
                </PrivateRoute>
              }
            />
            <Route
              path="/tax-slabs"
              element={
                <PrivateRoute>
                  <TaxSlabs />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 