import express from 'express';
import pool from '../db/config.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create order (authenticated users)
router.post('/', requireAuth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { items, customer_name, customer_email, customer_phone, address, city, delivery_fee } = req.body;
        const userId = req.user.userId;
        
        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }
        
        if (!customer_name || !customer_phone || !address || !city) {
            return res.status(400).json({ error: 'Customer information is required' });
        }
        
        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (delivery_fee || 0);
        
        // Create order
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, address, city, delivery_fee, total)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userId, customer_name, customer_email || req.user.email, customer_phone, address, city, delivery_fee || 0, total]
        );
        
        const order = orderResult.rows[0];
        
        // Create order items
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, selected_size, selected_color)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [order.id, item.product_id, item.name, item.price, item.quantity, item.selectedSize || null, item.selectedColor || null]
            );
            
            // Update product stock
            await client.query(
                `UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({
            message: 'Order created successfully',
            order: {
                id: order.id.toString(),
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                address: order.address,
                city: order.city,
                deliveryFee: order.delivery_fee,
                total: order.total,
                status: order.status,
                createdAt: order.created_at
            }
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    } finally {
        client.release();
    }
});

// Get user's orders
router.get('/my-orders', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const ordersResult = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        
        const orders = [];
        
        for (const order of ordersResult.rows) {
            const itemsResult = await pool.query(
                `SELECT * FROM order_items WHERE order_id = $1`,
                [order.id]
            );
            
            orders.push({
                id: order.id.toString(),
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                address: order.address,
                city: order.city,
                deliveryFee: order.delivery_fee,
                total: order.total,
                status: order.status,
                createdAt: order.created_at,
                items: itemsResult.rows.map(item => ({
                    id: item.id.toString(),
                    productId: item.product_id?.toString(),
                    productName: item.product_name,
                    productPrice: item.product_price,
                    quantity: item.quantity,
                    selectedSize: item.selected_size,
                    selectedColor: item.selected_color
                }))
            });
        }
        
        res.json({ orders });
        
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get single order (user can only see their own, admin can see all)
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';
        
        // Build query based on role
        let orderQuery;
        let params;
        
        if (isAdmin) {
            orderQuery = `SELECT * FROM orders WHERE id = $1`;
            params = [orderId];
        } else {
            orderQuery = `SELECT * FROM orders WHERE id = $1 AND user_id = $2`;
            params = [orderId, userId];
        }
        
        const orderResult = await pool.query(orderQuery, params);
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = orderResult.rows[0];
        
        // Get order items
        const itemsResult = await pool.query(
            `SELECT * FROM order_items WHERE order_id = $1`,
            [orderId]
        );
        
        res.json({
            order: {
                id: order.id.toString(),
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                address: order.address,
                city: order.city,
                deliveryFee: order.delivery_fee,
                total: order.total,
                status: order.status,
                createdAt: order.created_at,
                items: itemsResult.rows.map(item => ({
                    id: item.id.toString(),
                    productId: item.product_id?.toString(),
                    productName: item.product_name,
                    productPrice: item.product_price,
                    quantity: item.quantity,
                    selectedSize: item.selected_size,
                    selectedColor: item.selected_color
                }))
            }
        });
        
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

// Get all orders (admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        
        let query = `SELECT * FROM orders WHERE 1=1`;
        const params = [];
        let paramIndex = 1;
        
        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const ordersResult = await pool.query(query, params);
        
        // Get items for each order
        const orders = [];
        for (const order of ordersResult.rows) {
            const itemsResult = await pool.query(
                `SELECT * FROM order_items WHERE order_id = $1`,
                [order.id]
            );
            
            orders.push({
                id: order.id.toString(),
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                address: order.address,
                city: order.city,
                deliveryFee: order.delivery_fee,
                total: order.total,
                status: order.status,
                createdAt: order.created_at,
                items: itemsResult.rows.map(item => ({
                    id: item.id.toString(),
                    productId: item.product_id?.toString(),
                    productName: item.product_name,
                    productPrice: item.product_price,
                    quantity: item.quantity,
                    selectedSize: item.selected_size,
                    selectedColor: item.selected_color
                }))
            });
        }
        
        res.json({ orders });
        
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Update order status (admin only)
router.put('/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        
        if (!['En attente', 'Livré', 'Annulé'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const result = await pool.query(
            `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [status, orderId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = result.rows[0];
        res.json({
            message: 'Order status updated',
            order: {
                id: order.id.toString(),
                status: order.status,
                updatedAt: order.updated_at
            }
        });
        
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

export default router;
