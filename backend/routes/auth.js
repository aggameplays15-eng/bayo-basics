import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/config.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Name, email and password are required' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters' 
            });
        }
        
        // Check if email exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ 
                error: 'Email already registered' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, phone, address) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, name, email, phone, address, role, created_at`,
            [name, email.toLowerCase(), hashedPassword, phone || null, address || null]
        );
        
        const user = result.rows[0];
        const token = generateToken(user);
        
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }
        
        // Find user
        const result = await pool.query(
            `SELECT id, name, email, password_hash, phone, address, role 
             FROM users WHERE email = $1`,
            [email.toLowerCase()]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Generate token
        const token = generateToken(user);
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, phone, address, role, created_at 
             FROM users WHERE id = $1`,
            [req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user: result.rows[0] });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const userId = req.user.userId;
        
        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 phone = COALESCE($2, phone),
                 address = COALESCE($3, address),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING id, name, email, phone, address, role`,
            [name, phone, address, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.put('/password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'New password must be at least 6 characters' 
            });
        }
        
        // Get current password hash
        const userResult = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        const isValid = await bcrypt.compare(
            currentPassword, 
            userResult.rows[0].password_hash
        );
        
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, userId]
        );
        
        res.json({ message: 'Password changed successfully' });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

export default router;
