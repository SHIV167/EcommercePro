import express from 'express';
import { authenticateJWT, isAdmin } from '../middleware/auth';
import upload from '../utils/upload';
import {
  getCategories,
  getFeaturedCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/categories/featured', getFeaturedCategories);
router.get('/categories/:slug', getCategoryBySlug);

// Admin routes (protected)
router.post('/admin/categories', authenticateJWT, isAdmin, (req, res, next) => {
  upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
  ])(req as any, res as any, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, createCategory);

router.put('/admin/categories/:id', authenticateJWT, isAdmin, (req, res, next) => {
  upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
  ])(req as any, res as any, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, updateCategory);

router.delete('/admin/categories/:id', authenticateJWT, isAdmin, deleteCategory);

export default router;
