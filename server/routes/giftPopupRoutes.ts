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
router.put('/admin/gift-popup', authenticateToken, isAdmin, updateGiftPopupConfig); // Add PUT method support
router.get('/admin/gift-products', authenticateToken, isAdmin, getGiftProducts);

// Development routes for testing without admin authentication
router.get('/dev/gift-popup', getGiftPopupConfig);
router.post('/dev/gift-popup', updateGiftPopupConfig);
router.put('/dev/gift-popup', updateGiftPopupConfig);
router.get('/dev/gift-products', getGiftProducts);

export default router;
