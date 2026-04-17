import express from 'express';
import crypto from 'crypto';
import { put } from '@vercel/blob';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// File filter
const fileFilter = (req, res, next) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const extname = allowedTypes.test(req.file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(req.file.mimetype);

  if (mimetype && extname) {
    next();
  } else {
    res.status(400).json({ error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' });
  }
};

// Upload endpoint - protected by admin authentication
router.post('/', requireAdmin, async (req, res) => {
  try {
    if (!req.body || !req.body.file) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const { file, filename, contentType } = req.body;
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.length > maxSize) {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }

    // Generate cryptographically secure filename
    const randomName = crypto.randomBytes(32).toString('hex');
    const ext = contentType.split('/')[1] || 'jpg';
    const safeFilename = `img-${randomName}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(safeFilename, file, {
      access: 'public',
      contentType: contentType,
    });

    res.json({
      message: 'Image uploaded successfully',
      url: blob.url,
      filename: safeFilename,
      size: file.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
