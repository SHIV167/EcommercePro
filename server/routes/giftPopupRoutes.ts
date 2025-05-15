import express from 'express';
import { getGiftPopupConfig, updateGiftPopupConfig, getGiftProducts } from '../controllers/giftPopupController';
import { authenticateJWT as authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes for client frontend
router.get('/gift-popup', getGiftPopupConfig);
router.get('/gift-products', getGiftProducts);

// Admin routes that require authentication
router.get('/admin/gift-popup', authenticateToken, isAdmin, getGiftPopupConfig);
router.post('/admin/gift-popup', authenticateToken, isAdmin, updateGiftPopupConfig);
router.get('/admin/gift-products', authenticateToken, isAdmin, getGiftProducts);

export default router;
