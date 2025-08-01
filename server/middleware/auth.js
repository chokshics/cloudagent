const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || '88620138d110da53ab9b68427d42cf5e517bdd303a97abd1dc0edce7dd909a1256c999e8259b8e1a89a6932e9dc7b4295100b9351848ead400d209488f5fc026';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

// Middleware to check if user is admin or shopkeeper
const requireShopkeeperOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'shopkeeper')) {
    return res.status(403).json({ error: 'Access denied. Admin or shopkeeper access required.' });
  }
  next();
};

// Middleware to verify user exists in database
const verifyUser = (req, res, next) => {
  const db = getDatabase();
  
  db.get('SELECT id, username, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
  requireShopkeeperOrAdmin,
  verifyUser,
  JWT_SECRET
}; 