import express from 'express';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon
} from '../controllers/couponController';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware for authentication
const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

// Middleware for admin check
const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// Admin routes (protected)
router.get('/admin/coupons', isAuthenticated, isAdmin, getAllCoupons);
router.get('/admin/coupons/:id', isAuthenticated, isAdmin, getCouponById);
router.post('/admin/coupons', isAuthenticated, isAdmin, createCoupon);
router.put('/admin/coupons/:id', isAuthenticated, isAdmin, updateCoupon);
router.delete('/admin/coupons/:id', isAuthenticated, isAdmin, deleteCoupon);

// Public routes
router.post('/coupons/validate', validateCoupon);
router.post('/coupons/apply', isAuthenticated, applyCoupon);

export default router; 