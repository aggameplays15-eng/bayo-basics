import express from 'express';
import pool from '../db/config.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all delivery zones (public)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, price FROM delivery_zones ORDER BY price ASC`
        );
        
        const zones = result.rows.map(z => ({
            id: z.id.toString(),
            name: z.name,
            price: z.price
        }));
        
        res.json({ zones });
        
    } catch (error) {
        console.error('Get delivery zones error:', error);
        res.status(500).json({ error: 'Failed to get delivery zones' });
    }
});

// Add delivery zone (admin only)
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, price } = req.body;
        
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Name and price are required' });
        }
        
        const result = await pool.query(
            `INSERT INTO delivery_zones (name, price) VALUES ($1, $2) RETURNING *`,
            [name, price]
        );
        
        const zone = result.rows[0];
        res.status(201).json({
            message: 'Delivery zone created',
            zone: {
                id: zone.id.toString(),
                name: zone.name,
                price: zone.price
            }
        });
        
    } catch (error) {
        console.error('Create delivery zone error:', error);
        res.status(500).json({ error: 'Failed to create delivery zone' });
    }
});

// Update delivery zone (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { name, price } = req.body;
        const zoneId = req.params.id;
        
        const result = await pool.query(
            `UPDATE delivery_zones 
             SET name = COALESCE($1, name),
                 price = COALESCE($2, price)
             WHERE id = $3
             RETURNING *`,
            [name, price, zoneId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Delivery zone not found' });
        }
        
        const zone = result.rows[0];
        res.json({
            message: 'Delivery zone updated',
            zone: {
                id: zone.id.toString(),
                name: zone.name,
                price: zone.price
            }
        });
        
    } catch (error) {
        console.error('Update delivery zone error:', error);
        res.status(500).json({ error: 'Failed to update delivery zone' });
    }
});

// Delete delivery zone (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM delivery_zones WHERE id = $1 RETURNING id`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Delivery zone not found' });
        }
        
        res.json({ message: 'Delivery zone deleted' });
        
    } catch (error) {
        console.error('Delete delivery zone error:', error);
        res.status(500).json({ error: 'Failed to delete delivery zone' });
    }
});

export default router;
