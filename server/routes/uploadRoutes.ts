import express from 'express';
import { authenticateJWT, isAdmin } from '../middleware/auth';
import upload from '../utils/upload';

const router = express.Router();

router.post('/api/upload/images', authenticateJWT, isAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = (req.files as Express.Multer.File[]).map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
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
