const jwt = require('jsonwebtoken');

const roleAuth = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking user role' });
    }
  };
};

module.exports = roleAuth; 