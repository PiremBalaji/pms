const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const db = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const payrollRoutes = require('./routes/payroll');
const allowancesRoutes = require('./routes/allowances');
const deductionsRoutes = require('./routes/deductions');
const attendanceRoutes = require('./routes/attendance');
const taxSlabsRoutes = require('./routes/taxslabs');
const employeeTypesRoutes = require('./routes/employeeTypes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [results] = await db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [results] = await db.query(
      `SELECT e.*, u.username, u.role 
       FROM employees e 
       JOIN users u ON e.user_id = u.id 
       WHERE u.id = ?`,
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/allowances', allowancesRoutes);
app.use('/api/deductions', deductionsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tax-slabs', taxSlabsRoutes);
app.use('/api/employee-types', employeeTypesRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Payroll Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 