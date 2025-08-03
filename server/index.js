const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load environment variables
console.log('🔧 Loading environment variables...');
console.log('Current working directory:', process.cwd());
console.log('.env file exists:', fs.existsSync('.env'));

const dotenvResult = require('dotenv').config();
if (dotenvResult.error) {
  console.error('❌ Error loading .env file:', dotenvResult.error);
} else {
  console.log('✅ .env file loaded successfully');
  console.log('Environment variables found:', Object.keys(dotenvResult.parsed || {}));
}

// Check Twilio environment variables
console.log('🔍 Checking Twilio environment variables...');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'set' : 'not-set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'set' : 'not-set');
console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER || 'not-set');

const authRoutes = require('./routes/auth');
const promotionRoutes = require('./routes/promotions');
const userRoutes = require('./routes/users');
const whatsappRoutes = require('./routes/whatsapp');
const subscriptionRoutes = require('./routes/subscriptions');
const reportsRoutes = require('./routes/reports');
const contactRoutes = require('./routes/contact');
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

// Rate limiting - More lenient for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});

// Apply rate limiting only to API routes, not to static files
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Admin Portal API is running' });
});

// Favicon endpoint to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'image/x-icon');
  res.status(204).end(); // No content response
});

// Debug endpoint to check JWT_SECRET (remove in production)
app.get('/api/debug/jwt-secret', (req, res) => {
  const jwt = require('jsonwebtoken');
  const testSecret = 'your-super-secret-jwt-key-change-this-in-production';
  const testPayload = { test: 'data' };
  
  try {
    const token = jwt.sign(testPayload, testSecret);
    const decoded = jwt.verify(token, testSecret);
    res.json({ 
      message: 'JWT_SECRET test',
      testSecret,
      tokenGenerated: !!token,
      tokenVerified: !!decoded,
      envJWTSecret: process.env.JWT_SECRET ? 'set' : 'not-set'
    });
  } catch (error) {
    res.json({ 
      message: 'JWT_SECRET test failed',
      error: error.message,
      testSecret,
      envJWTSecret: process.env.JWT_SECRET ? 'set' : 'not-set'
    });
  }
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
  
  // Check if build directory exists
  if (fs.existsSync(buildPath)) {
    // Serve static files with cache busting and force HTTP
    app.use(express.static(buildPath, {
      maxAge: '1h',
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Force HTTP and prevent HTTPS redirects
        res.setHeader('Strict-Transport-Security', 'max-age=0');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Add CORS headers for favicon and other static assets
        if (path.endsWith('.ico') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.svg')) {
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
      }
    }));
  } else {
    console.log('⚠️  Build directory not found. Serving API only.');
    // Serve a simple message for non-API routes
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.json({ 
        message: 'Server is running in API-only mode. Please build the React app first.',
        instructions: 'Run "npm run build" in the client directory to build the React app.'
      });
    });
  }
} else {
  // In development, serve static files for debugging
  const buildPath = path.join(__dirname, '../client/build');
  console.log('📁 Serving static files from:', buildPath);
  
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath, {
      maxAge: 0, // No caching in development
      etag: false
    }));
  } else {
    console.log('⚠️  Build directory not found in development mode.');
  }
}

// Handle React routing for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  console.log('🔄 Serving React app for route:', req.path);
  const buildPath = path.join(__dirname, '../client/build');
  
  // Check if build directory and index.html exist
  if (fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, 'index.html'))) {
    // Force HTTP headers
    res.setHeader('Strict-Transport-Security', 'max-age=0');
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    // If build doesn't exist, return a helpful message
    res.json({ 
      message: 'React app not built yet. Please build the client app first.',
      instructions: 'Run "npm run build" in the client directory to build the React app.',
      currentPath: req.path,
      buildPath: buildPath
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
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