import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// Rate limiting configurations — production-safe values
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    skipSuccessfulRequests: true,
    message: { error: 'Too many login attempts, please try again later' },
});

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { error: 'API rate limit exceeded' },
});

export const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15,
    message: { error: 'Chat rate limit exceeded' },
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
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// Input sanitization helper
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>"']/g, '')
        .trim()
        .substring(0, 1000);
};

// Password strength validation
export const validatePassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) return false;
    return true;
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
    
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    res.status(err.status || 500).json({
        error: isDev ? err.message : 'An error occurred',
        ...(isDev && { stack: err.stack })
    });
};
