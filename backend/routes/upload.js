import express from 'express';
import crypto from 'crypto';
import { put } from '@vercel/blob';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|gif|webp)$/i;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Upload endpoint - protected by admin authentication
router.post('/', requireAdmin, async (req, res) => {
  try {
    if (!req.body || !req.body.file) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const { file, filename, contentType } = req.body;

    // Validate contentType against whitelist (never trust client input)
    if (!contentType || !ALLOWED_MIME_TYPES.includes(contentType)) {
      return res.status(400).json({ error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' });
    }

    // Validate filename extension
    if (filename && !ALLOWED_EXTENSIONS.test(filename)) {
      return res.status(400).json({ error: 'Invalid file extension' });
    }

    // Calculate real byte size from base64 string
    const base64Data = file.replace(/^data:[^;]+;base64,/, '');
    const byteSize = Math.ceil((base64Data.length * 3) / 4);

    if (byteSize > MAX_SIZE_BYTES) {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }

    // Generate cryptographically secure filename — never use client-provided name
    const randomName = crypto.randomBytes(32).toString('hex');
    const ext = contentType.split('/')[1].replace('jpeg', 'jpg');
    const safeFilename = `img-${randomName}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(safeFilename, Buffer.from(base64Data, 'base64'), {
      access: 'public',
      contentType: contentType,
    });

    res.json({
      message: 'Image uploaded successfully',
      url: blob.url,
      filename: safeFilename,
      size: byteSize
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
