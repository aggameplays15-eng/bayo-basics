import express from 'express';
import pool from '../db/config.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get site settings (public)
router.get('/', async (req, res) => {
    try {
        // Get site settings
        const settingsResult = await pool.query(
            `SELECT logo_text, logo_image, hero_title, hero_subtitle FROM site_settings WHERE id = 1`
        );
        
        // Get active banners
        const bannersResult = await pool.query(
            `SELECT id, image_url, title, subtitle, link, display_order 
             FROM banners 
             WHERE is_active = true 
             ORDER BY display_order ASC`
        );
        
        const settings = settingsResult.rows[0] || {
            logo_text: 'BAYO',
            hero_title: 'Le style Premium accessible.',
            hero_subtitle: 'Qualité garantie, paiement à la livraison.'
        };
        
        const banners = bannersResult.rows.map(b => ({
            id: b.id.toString(),
            image: b.image_url,
            title: b.title,
            subtitle: b.subtitle,
            link: b.link
        }));
        
        res.json({
            settings: {
                logoText: settings.logo_text,
                logoImage: settings.logo_image,
                heroTitle: settings.hero_title,
                heroSubtitle: settings.hero_subtitle,
                banners
            }
        });
        
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

// Update site settings (admin only)
router.put('/', requireAdmin, async (req, res) => {
    try {
        const { logoText, logoImage, heroTitle, heroSubtitle } = req.body;
        
        const result = await pool.query(
            `UPDATE site_settings 
             SET logo_text = COALESCE($1, logo_text),
                 logo_image = COALESCE($2, logo_image),
                 hero_title = COALESCE($3, hero_title),
                 hero_subtitle = COALESCE($4, hero_subtitle),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = 1
             RETURNING *`,
            [logoText, logoImage, heroTitle, heroSubtitle]
        );
        
        const settings = result.rows[0];
        
        res.json({
            message: 'Settings updated',
            settings: {
                logoText: settings.logo_text,
                logoImage: settings.logo_image,
                heroTitle: settings.hero_title,
                heroSubtitle: settings.hero_subtitle
            }
        });
        
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Add banner (admin only)
router.post('/banners', requireAdmin, async (req, res) => {
    try {
        const { image_url, title, subtitle, link, display_order } = req.body;
        
        if (!image_url || !title || !subtitle) {
            return res.status(400).json({ error: 'Image URL, title and subtitle are required' });
        }
        
        const result = await pool.query(
            `INSERT INTO banners (image_url, title, subtitle, link, display_order)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [image_url, title, subtitle, link || '/products', display_order || 0]
        );
        
        const banner = result.rows[0];
        res.status(201).json({
            message: 'Banner created',
            banner: {
                id: banner.id.toString(),
                image: banner.image_url,
                title: banner.title,
                subtitle: banner.subtitle,
                link: banner.link,
                displayOrder: banner.display_order
            }
        });
        
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({ error: 'Failed to create banner' });
    }
});

// Update banner (admin only)
router.put('/banners/:id', requireAdmin, async (req, res) => {
    try {
        const { image_url, title, subtitle, link, display_order, is_active } = req.body;
        const bannerId = req.params.id;
        
        const result = await pool.query(
            `UPDATE banners 
             SET image_url = COALESCE($1, image_url),
                 title = COALESCE($2, title),
                 subtitle = COALESCE($3, subtitle),
                 link = COALESCE($4, link),
                 display_order = COALESCE($5, display_order),
                 is_active = COALESCE($6, is_active)
             WHERE id = $7
             RETURNING *`,
            [image_url, title, subtitle, link, display_order, is_active, bannerId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Banner not found' });
        }
        
        const banner = result.rows[0];
        res.json({
            message: 'Banner updated',
            banner: {
                id: banner.id.toString(),
                image: banner.image_url,
                title: banner.title,
                subtitle: banner.subtitle,
                link: banner.link,
                displayOrder: banner.display_order,
                isActive: banner.is_active
            }
        });
        
    } catch (error) {
        console.error('Update banner error:', error);
        res.status(500).json({ error: 'Failed to update banner' });
    }
});

// Delete banner (admin only)
router.delete('/banners/:id', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM banners WHERE id = $1 RETURNING id`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Banner not found' });
        }
        
        res.json({ message: 'Banner deleted' });
        
    } catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({ error: 'Failed to delete banner' });
    }
});

export default router;
