import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { isCloudinaryConfigured } from './cloudinary';

// Provide __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory
const baseUploadDir = path.join(__dirname, '../../public/uploads');

// Ensure directories exist
const directories = {
  products: path.join(baseUploadDir, 'products'),
  banners: path.join(baseUploadDir, 'banners'),
  default: baseUploadDir
};

// Create directories if they don't exist
Object.values(directories).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper function to determine upload directory
const getUploadPath = (req: any) => {
  const pathLower = req.path.toLowerCase();
  if (pathLower.includes('/banners')) {
    return directories.banners;
  }
  // Map general image uploads to products folder
  if (pathLower.includes('/upload/images') || pathLower.includes('/products')) {
    return directories.products;
  }
  return directories.default;
};

// Configure storage based on environment
let storage: multer.StorageEngine;

// Remove debug logs

if (isCloudinaryConfigured) {
  // Use Cloudinary storage
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: (req: any, file: any): string => {
        return req.originalUrl.includes('/banners') ? 'banners' : 'products';
      },
      format: async (req: any, file: any): Promise<string> => {
        if (file.mimetype === 'image/jpeg') return 'jpg';
        if (file.mimetype === 'image/png') return 'png';
        if (file.mimetype === 'image/webp') return 'webp';
        return 'jpg'; // default format
      },
      public_id: (req: any, file: any): string => {
        return `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9]/g, '-')}`;
      },
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        { flags: 'progressive' },
        { dpr: 'auto' },
        { responsive: true },
        { crop: 'limit' }
      ],
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
      use_filename: true,
      unique_filename: true,
      overwrite: true
    }
  } as any); // Type assertion needed due to CloudinaryStorage types
} else {
  // Use local disk storage
  storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: (error: Error | null, destination: string) => void) {
      let uploadDir = path.join(__dirname, '../../public/uploads/products');
      if (req.originalUrl.includes('/banners')) {
        uploadDir = path.join(__dirname, '../../public/uploads/banners');
      }
      cb(null, uploadDir);
    },
    filename: function (req: any, file: any, cb: (error: Error | null, filename: string) => void) {
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
      cb(null, `${Date.now()}-${cleanName}`);
    }
  });
}

const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback): void => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
