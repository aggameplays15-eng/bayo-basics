import express from 'express';
import pool from '../db/config.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user's favorites
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const result = await pool.query(
            `SELECT p.id, p.name, p.description, p.price, p.category, p.image_url, p.stock, p.sizes, p.colors
             FROM favorites f
             JOIN products p ON f.product_id = p.id
             WHERE f.user_id = $1 AND p.is_active = true
             ORDER BY f.created_at DESC`,
            [userId]
        );
        
        const favorites = result.rows.map(p => ({
            id: p.id.toString(),
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            image: p.image_url,
            stock: p.stock,
            sizes: p.sizes,
            colors: p.colors
        }));
        
        res.json({ favorites });
        
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Failed to get favorites' });
    }
});

// Add to favorites
router.post('/', requireAuth, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.userId;
        
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        
        // Check if product exists
        const productResult = await pool.query(
            'SELECT id FROM products WHERE id = $1 AND is_active = true',
            [productId]
        );
        
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Add to favorites (ignore duplicate errors)
        await pool.query(
            `INSERT INTO favorites (user_id, product_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, product_id) DO NOTHING`,
            [userId, productId]
        );
        
        res.json({ message: 'Added to favorites' });
        
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
});

// Remove from favorites
router.delete('/:productId', requireAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;
        
        const result = await pool.query(
            `DELETE FROM favorites WHERE user_id = $1 AND product_id = $2 RETURNING id`,
            [userId, productId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }
        
        res.json({ message: 'Removed from favorites' });
        
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
});

// Check if product is in favorites
router.get('/check/:productId', requireAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;
        
        const result = await pool.query(
            `SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2`,
            [userId, productId]
        );
        
        res.json({ isFavorite: result.rows.length > 0 });
        
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ error: 'Failed to check favorite status' });
    }
});

export default router;
