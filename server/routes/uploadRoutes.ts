import express from 'express';
import { authenticateJWT, isAdmin } from '../middleware/auth';
import upload from '../utils/upload';

const router = express.Router();

// Debug: log incoming upload requests
router.use((req, res, next) => {
  console.log('[UPLOAD ROUTE] Received', req.method, req.originalUrl);
  next();
});

router.post('/api/upload/images', authenticateJWT, isAdmin, upload.array('images', 10), async (req, res) => {
  // Ensure JSON response
  res.setHeader('Content-Type', 'application/json');
  try {
    console.log('[UPLOAD ROUTE] req.files:', req.files);
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = (req.files as any[]).map(file => {
      // Determine URL: Cloudinary uses file.path, secure_url, or url
      const rawUrl = (file as any).path || (file as any).secure_url || (file as any).url;
      const url = typeof rawUrl === 'string' && /^https?:\/\//.test(rawUrl)
        ? rawUrl
        : `/uploads/products/${file.filename}`;
      return {
        filename: file.filename,
        path: url,
        size: file.size,
        mimetype: file.mimetype
      };
    });
    console.log('[UPLOAD ROUTE] Responding with uploadedFiles:', uploadedFiles);
    return res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Error uploading files'
    });
  }
});

export default router;
