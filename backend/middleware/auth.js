import jwt from 'jsonwebtoken';
import pool from '../db/config.js';

export const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

export const requireAuth = verifyToken;

export const requireAdmin = async (req, res, next) => {
    try {
        verifyToken(req, res, async () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admin only.' });
            }
            
            // Verify user still exists and is admin in database
            const result = await pool.query(
                'SELECT role FROM users WHERE id = $1',
                [req.user.userId]
            );
            
            if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
                return res.status(403).json({ error: 'Admin access revoked.' });
            }
            
            next();
        });
    } catch (error) {
        return res.status(403).json({ error: 'Authentication failed.' });
    }
};

export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Invalid token, but continue as guest
        }
    }
    
    next();
};
