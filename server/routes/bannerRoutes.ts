import express from 'express';
import { authenticateJWT, isAdmin } from '../middleware/auth';
import upload from '../utils/upload';
import Banner from '../models/Banner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured } from '../utils/cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure banner upload directory exists
const bannerUploadDir = path.join(__dirname, '../../public/uploads/banners');
if (!fs.existsSync(bannerUploadDir)) {
    fs.mkdirSync(bannerUploadDir, { recursive: true });
}

const router = express.Router();

// Get all banners
router.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort('position');
    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create banner
router.post('/api/banners', authenticateJWT, isAdmin, upload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
  console.log('[BANNER] Creating new banner:', req.body);
  console.log('[BANNER] Cloudinary configured:', isCloudinaryConfigured);
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log('[BANNER] Uploaded files:', files);
    // Determine the correct image URL (Cloudinary or local)
    const getImageUrl = (file: Express.Multer.File) => {
      // Try Cloudinary props first
      if (isCloudinaryConfigured) {
        const anyFile = file as any;
        const remoteUrl = anyFile.secure_url || anyFile.url || anyFile.path;
        if (remoteUrl) {
          // Ensure HTTPS
          return remoteUrl.startsWith('http://')
            ? remoteUrl.replace('http://', 'https://')
            : remoteUrl;
        }
      }
      // Fallback to local path
      return `/uploads/banners/${file.filename}`;
    };

    const bannerData = {
      id: uuidv4(),
      title: req.body.title,
      subtitle: req.body.subtitle,
      alt: req.body.alt,
      linkUrl: req.body.linkUrl,
      enabled: req.body.enabled === 'true',
      position: parseInt(req.body.position) || 0,
      desktopImageUrl: files?.desktopImage ? getImageUrl(files.desktopImage[0]) : req.body.desktopImageUrl,
      mobileImageUrl: files?.mobileImage ? getImageUrl(files.mobileImage[0]) : req.body.mobileImageUrl
    };

    console.log('[BANNER] Processed banner data:', bannerData);

    const banner = new Banner(bannerData);
    await banner.save();
    res.status(201).json(banner);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update banner
router.put('/api/banners/:id', authenticateJWT, isAdmin, upload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      alt: req.body.alt,
      linkUrl: req.body.linkUrl,
      position: parseInt(req.body.position) || 0
    };

    if (req.body.enabled !== undefined) {
      updateData.enabled = req.body.enabled === 'true';
    }

    // Determine the correct image URL (Cloudinary or local)
    const getImageUrl = (file: Express.Multer.File) => {
      // Try Cloudinary props first
      if (isCloudinaryConfigured) {
        const anyFile = file as any;
        const remoteUrl = anyFile.secure_url || anyFile.url || anyFile.path;
        if (remoteUrl) {
          // Ensure HTTPS
          return remoteUrl.startsWith('http://')
            ? remoteUrl.replace('http://', 'https://')
            : remoteUrl;
        }
      }
      // Fallback to local path
      return `/uploads/banners/${file.filename}`;
    };

    // Only update desktopImageUrl when a new file is uploaded
    if (files?.desktopImage) {
      updateData.desktopImageUrl = getImageUrl(files.desktopImage[0]);
    }

    // Only update mobileImageUrl when a new file is uploaded
    if (files?.mobileImage) {
      updateData.mobileImageUrl = getImageUrl(files.mobileImage[0]);
    }

    console.log('[BANNER] Updating banner with data:', updateData);

    const banner = await Banner.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: req.params.id }] },
      updateData,
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json(banner);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete banner
router.delete('/api/banners/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const banner = await Banner.findOneAndDelete({
      $or: [{ id: req.params.id }, { _id: req.params.id }]
    });

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
