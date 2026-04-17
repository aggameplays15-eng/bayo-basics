import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Security middleware
import {
    generalLimiter,
    authLimiter,
    apiLimiter,
    corsOptions,
    helmetConfig,
    secureErrorHandler
} from './middleware/security.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import favoriteRoutes from './routes/favorites.js';
import deliveryRoutes from './routes/delivery.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - Order matters!
app.use(helmetConfig); // Security headers
app.use(cors(corsOptions)); // CORS with strict origin checking
app.use(generalLimiter); // Rate limiting for all routes
app.use(express.json({ limit: '10mb' })); // Body parser with size limit

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Bayo Basics API'
    });
});

// Routes with specific rate limiting
app.use('/api/auth/login', authLimiter); // Stricter rate limit for login
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', apiLimiter); // Rate limit for chat API
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found'
    });
});

// Global error handler
app.use(secureErrorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║   🚀 Bayo Basics API Server              ║
║                                          ║
║   Running on port: ${PORT}                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║                                          ║
║   Endpoints:                             ║
║   • GET  /health                         ║
║   • POST /api/auth/register              ║
║   • POST /api/auth/login                 ║
║   • GET  /api/products                   ║
║   • GET  /api/orders/my-orders             ║
║   • GET  /api/favorites                  ║
║                                          ║
╚══════════════════════════════════════════╝
    `);
});

export default app;
