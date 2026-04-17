import express from 'express';
import pool from '../db/config.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { category, search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT id, name, description, price, category, image_url, stock, sizes, colors, is_active, created_at
            FROM products 
            WHERE is_active = true
        `;
        const params = [];
        let paramIndex = 1;
        
        if (category && category !== 'Tous') {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        
        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await pool.query(query, params);
        
        // Format for frontend compatibility
        const products = result.rows.map(p => ({
            id: p.id.toString(),
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            image: p.image_url,
            stock: p.stock,
            sizes: p.sizes,
            colors: p.colors,
            isActive: p.is_active
        }));
        
        res.json({ products });
        
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, description, price, category, image_url, stock, sizes, colors, is_active, created_at
             FROM products WHERE id = $1 AND is_active = true`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const p = result.rows[0];
        res.json({
            product: {
                id: p.id.toString(),
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                image: p.image_url,
                stock: p.stock,
                sizes: p.sizes,
                colors: p.colors,
                isActive: p.is_active
            }
        });
        
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

// Create product (admin only)
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image_url, stock, sizes, colors } = req.body;
        
        // Validation
        if (!name || !price || !category) {
            return res.status(400).json({ 
                error: 'Name, price and category are required' 
            });
        }
        
        const result = await pool.query(
            `INSERT INTO products (name, description, price, category, image_url, stock, sizes, colors)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [name, description, price, category, image_url, stock || 0, sizes || null, colors || null]
        );
        
        const p = result.rows[0];
        res.status(201).json({
            message: 'Product created successfully',
            product: {
                id: p.id.toString(),
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                image: p.image_url,
                stock: p.stock,
                sizes: p.sizes,
                colors: p.colors,
                isActive: p.is_active
            }
        });
        
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image_url, stock, sizes, colors, is_active } = req.body;
        const productId = req.params.id;
        
        const result = await pool.query(
            `UPDATE products 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 price = COALESCE($3, price),
                 category = COALESCE($4, category),
                 image_url = COALESCE($5, image_url),
                 stock = COALESCE($6, stock),
                 sizes = COALESCE($7, sizes),
                 colors = COALESCE($8, colors),
                 is_active = COALESCE($9, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $10
             RETURNING *`,
            [name, description, price, category, image_url, stock, sizes, colors, is_active, productId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const p = result.rows[0];
        res.json({
            message: 'Product updated successfully',
            product: {
                id: p.id.toString(),
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                image: p.image_url,
                stock: p.stock,
                sizes: p.sizes,
                colors: p.colors,
                isActive: p.is_active
            }
        });
        
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product (admin only - soft delete)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 RETURNING id`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
        
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Get categories (public)
router.get('/meta/categories', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category`
        );
        
        res.json({ 
            categories: result.rows.map(r => r.category)
        });
        
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

export default router;
