import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

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

// Configure Cloudinary for production uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Control Cloudinary usage with explicit flag
// Set CLOUDINARY_ENABLED='true' in production env to enable
const isCloudinaryEnabled = process.env.CLOUDINARY_ENABLED === 'true';
const isCloudinaryConfigured =
  isCloudinaryEnabled &&
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

// Debug: log storage type
console.log('[UPLOAD] Storage type:', isCloudinaryConfigured ? 'cloudinary' : 'disk');

// Dynamic storage: use Cloudinary when configured, otherwise local disk
const storage = isCloudinaryConfigured
  ? new CloudinaryStorage(<any>{
      cloudinary,
      params: {
        folder: 'ecommerce',
        public_id: (req: any, file: any) =>
          `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`
      }
    })
  : multer.diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const uploadPath = getUploadPath(req);
        cb(null, uploadPath);
      },
      filename: (req: any, file: any, cb: any) => {
        const cleanName = file.originalname.toLowerCase().replace(/[^a-z0-9.]/g, '-');
        cb(null, `${Date.now()}-${cleanName}`);
      }
    });

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

export default upload;
