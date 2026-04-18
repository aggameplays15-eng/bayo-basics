import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// Rate limiting configurations
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per IP (increased for testing)
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts (increased for testing)
    skipSuccessfulRequests: true,
    message: { error: 'Too many login attempts, please try again later' },
});

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute for API endpoints (increased for testing)
    message: { error: 'API rate limit exceeded' },
});

// CORS configuration
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

export const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
};

// Helmet configuration
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://openrouter.ai"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disabled for compatibility
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// Input sanitization helper
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    // Remove potentially dangerous characters
    return input
        .replace(/[<>"']/g, '')
        .trim()
        .substring(0, 1000); // Limit length
};

// SQL injection pattern detection
export const detectSQLInjection = (input) => {
    if (typeof input !== 'string') return false;
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT)\b)/i,
        /(--|;|\/\*|\*\/)/,
        /(\b(WAITFOR|DELAY|SHUTDOWN)\b)/i,
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
};

// Error handler that doesn't expose sensitive info
export const secureErrorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    const isDev = process.env.NODE_ENV === 'development';
    
    // Don't expose internal errors in production
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    res.status(err.status || 500).json({
        error: isDev ? err.message : 'An error occurred',
        ...(isDev && { stack: err.stack })
    });
};
