import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/User';

// Helper to get cookie domain
function getCookieDomain(req: Request): string | undefined {
  const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
  if (COOKIE_DOMAIN) return COOKIE_DOMAIN;
  if (process.env.NODE_ENV === 'production') {
    const parts = req.hostname.split('.');
    const root = parts.slice(-2).join('.');
    return `.${root}`;
  }
  return undefined;
}

// Admin Login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the admin user by email
    const admin = await UserModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is admin
    if (!admin.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, isAdmin: admin.isAdmin, email: admin.email },
      (process.env.JWT_SECRET as Secret) || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    // Set token as cookie
    console.log('Setting cookie with domain:', process.env.COOKIE_DOMAIN || 'undefined');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000') // 7 days default
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = admin.toObject();
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// Admin Logout
export const adminLogout = (req: Request, res: Response) => {
  res.clearCookie('token', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'none', 
    domain: process.env.COOKIE_DOMAIN || undefined
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};

// Verify Admin Token
export const verifyAdminToken = (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated', isAuthenticated: false });
    }

    const decoded = jwt.verify(token, (process.env.JWT_SECRET as Secret) || 'default_secret');
    return res.status(200).json({ 
      message: 'Authenticated', 
      isAuthenticated: true, 
      user: decoded 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.clearCookie('token', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'none', 
      domain: process.env.COOKIE_DOMAIN || undefined
    });
    return res.status(401).json({ message: 'Invalid token', isAuthenticated: false });
  }
};
