import express, { Request, Response, NextFunction } from 'express';
import { adminLogin, adminLogout, verifyAdminToken } from '../controllers/authController';

// Custom request interface with user property
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Middleware for authentication
const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const decoded = process.env.JWT_SECRET ? 
      require('jsonwebtoken').verify(token, process.env.JWT_SECRET) : 
      require('jsonwebtoken').verify(token, 'default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

// Middleware for admin check
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// Admin auth routes
router.post('/auth/login', adminLogin);
router.post('/admin/auth/logout', adminLogout);
router.get('/admin/auth/verify', verifyAdminToken);

export default router;
