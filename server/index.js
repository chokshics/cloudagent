const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const promotionRoutes = require('./routes/promotions');
const userRoutes = require('./routes/users');
const whatsappRoutes = require('./routes/whatsapp');
const subscriptionRoutes = require('./routes/subscriptions');
const reportsRoutes = require('./routes/reports');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

// Handle HTTPS redirects and force HTTP in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Force HTTP for all requests to prevent HTTPS redirects
    if (req.header('x-forwarded-proto') === 'https') {
      return res.redirect(`http://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Admin Portal API is running' });
});

// Debug endpoint to check static files
app.get('/api/debug/static', (req, res) => {
  const fs = require('fs');
  const buildPath = path.join(__dirname, '../client/build');
  const staticPath = path.join(buildPath, 'static/js');
  
  try {
    const files = fs.readdirSync(staticPath);
    const indexHtmlPath = path.join(buildPath, 'index.html');
    let indexHtmlContent = '';
    
    if (fs.existsSync(indexHtmlPath)) {
      indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    }
    
    res.json({ 
      buildPath,
      staticPath,
      files,
      buildExists: fs.existsSync(buildPath),
      indexHtmlExists: fs.existsSync(indexHtmlPath),
      indexHtmlContent: indexHtmlContent.substring(0, 500) + '...',
      env: process.env.NODE_ENV || 'development',
      protocol: req.protocol,
      headers: req.headers
    });
  } catch (error) {
    res.json({ error: error.message, buildPath, staticPath });
  }
});

// Force HTTP endpoint
app.get('/api/force-http', (req, res) => {
  res.setHeader('Strict-Transport-Security', 'max-age=0');
  res.json({ 
    message: 'HTTP forced',
    protocol: req.protocol,
    url: req.url
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  const buildPath = path.join(__dirname, '../client/build');
  console.log('📁 Serving static files from:', buildPath);
  
  // Serve static files with cache busting and force HTTP
  app.use(express.static(buildPath, {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Force HTTP and prevent HTTPS redirects
      res.setHeader('Strict-Transport-Security', 'max-age=0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    console.log('🔄 Serving React app for route:', req.path);
    // Force HTTP headers
    res.setHeader('Strict-Transport-Security', 'max-age=0');
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // In development, serve static files for debugging
  const buildPath = path.join(__dirname, '../client/build');
  console.log('📁 Serving static files from:', buildPath);
  app.use(express.static(buildPath, {
    maxAge: 0, // No caching in development
    etag: false
  }));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database first
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    // Start server after database is ready
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server accessible at: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer(); 