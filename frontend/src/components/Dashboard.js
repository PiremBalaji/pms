import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    totalAttendance: 0,
    recentPayrolls: [],
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employees, payrolls, attendance] = await Promise.all([
        axios.get('http://localhost:5000/api/employees', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get('http://localhost:5000/api/payroll', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get('http://localhost:5000/api/attendance', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      const recentPayrolls = payrolls.data
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
        .slice(0, 5);

      const recentAttendance = attendance.data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setStats({
        totalEmployees: employees.data.length,
        totalPayroll: payrolls.data.length,
        totalAttendance: attendance.data.length,
        recentPayrolls,
        recentAttendance,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      await axios.post(
        'http://localhost:5000/api/payroll/generate',
        { month, year },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error generating payroll:', error);
      setError('Failed to generate payroll');
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Employees
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalEmployees}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Payroll Records
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalPayroll}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Attendance Records
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalAttendance}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Payrolls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Recent Payroll Records
                </Typography>
                {user?.role === 'admin' && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleGeneratePayroll}
                  >
                    Generate Payroll
                  </Button>
                )}
              </Box>
              <List>
                {stats.recentPayrolls.map((payroll) => (
                  <React.Fragment key={payroll.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${payroll.first_name} ${payroll.last_name} - ${new Date(payroll.payment_date).toLocaleDateString()}`}
                        secondary={`Total: $${payroll.total_salary} | Status: ${payroll.status}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Attendance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Attendance Records
              </Typography>
              <List>
                {stats.recentAttendance.map((record) => (
                  <React.Fragment key={record.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${record.first_name} ${record.last_name} - ${new Date(record.date).toLocaleDateString()}`}
                        secondary={`Status: ${record.status} | Check-in: ${record.check_in || 'N/A'} | Check-out: ${record.check_out || 'N/A'}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 