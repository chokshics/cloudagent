const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

// Get shared database connection
const db = getDatabase();

// Validation middleware
const validateRegistration = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please enter a valid email address'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'shopkeeper']).withMessage('Invalid role')
];

const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register new user (shopkeeper)
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { firstName, lastName, email, phoneNumber, username, password, role = 'shopkeeper' } = req.body;

    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Check if email already exists
      db.get('SELECT id FROM users WHERE email = ?', [email], async (err, emailRow) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        if (emailRow) {
          return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.run(
          'INSERT INTO users (username, email, password, first_name, last_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [username, email, hashedPassword, firstName, lastName, phoneNumber, role],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ message: 'Error creating user' });
            }

            res.status(201).json({ 
              message: 'User registered successfully',
              userId: this.lastID 
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', validateLogin, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    // Find user by username
    db.get(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username],
      async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.username, 
            role: user.role 
          },
          process.env.JWT_SECRET || '88620138d110da53ab9b68427d42cf5e517bdd303a97abd1dc0edce7dd909a1256c999e8259b8e1a89a6932e9dc7b4295100b9351848ead400d209488f5fc026',
          { expiresIn: '24h' }
        );

        // Return user data (without password) and token
        const { password: _, ...userWithoutPassword } = user;
        res.json({
          message: 'Login successful',
          token,
          user: userWithoutPassword
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    db.get(
      'SELECT id, username, email, first_name, last_name, phone_number, role, created_at FROM users WHERE id = ?',
      [req.user.userId],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
      }
    );
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  // For JWT tokens, logout is handled client-side by removing the token
  // This endpoint can be used for additional server-side cleanup if needed
  res.json({ message: 'Logout successful' });
});



module.exports = router; 